import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IProductSkuRepository } from './interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './interfaces/product-sku-repository.interface';
import type { IOptionValueRepository } from '../../options/application/interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';
import type { UpdateProductDto } from './dto/update-product.dto';
import { findIdsToRemove } from './sync-utils';

type SkuInput = NonNullable<UpdateProductDto['skus']>[number];

@Injectable()
export class SkuSyncService {
  constructor(
    @Inject(PRODUCT_SKU_REPOSITORY)
    private readonly skuRepository: IProductSkuRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly optionValueRepository: IOptionValueRepository,
  ) {}

  async validate(skus?: UpdateProductDto['skus']): Promise<void> {
    if (!skus) {
      return;
    }
    const allIds = skus.filter((s) => !s.id).flatMap((s) => s.optionValueIds);
    if (allIds.length === 0) {
      return;
    }
    const uniqueIds = [...new Set(allIds)];
    const found = await this.optionValueRepository.findByIds(uniqueIds);
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Some option value IDs are invalid');
    }
  }

  async sync(
    productId: number,
    incoming: NonNullable<UpdateProductDto['skus']>,
  ): Promise<void> {
    const existing = await this.skuRepository.findByProductId(productId);
    const idsToRemove = findIdsToRemove(existing, incoming);
    await this.skuRepository.softRemoveByIds(idsToRemove);
    for (const s of incoming) {
      if (s.id) {
        await this.updateSku(s);
        continue;
      }
      await this.createSku(productId, s);
    }
  }

  private async updateSku(s: SkuInput): Promise<void> {
    await this.skuRepository.update(Number(s.id), {
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
    });
  }

  private async createSku(productId: number, s: SkuInput): Promise<void> {
    const skuValues = s.optionValueIds?.map((id) => ({
      optionValueId: id,
    }));
    await this.skuRepository.save({
      productId,
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
      skuValues,
    });
  }
}
