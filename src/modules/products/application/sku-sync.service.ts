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

    const toUpdate = incoming.filter((s) => s.id);
    const toCreate = incoming.filter((s) => !s.id);

    await this.skuRepository.softRemoveByIds(idsToRemove);
    await Promise.all([
      this.bulkUpdate(toUpdate),
      this.bulkCreate(productId, toCreate),
    ]);
  }

  private async bulkUpdate(items: SkuInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const mapped = items.map((s) => ({
      id: Number(s.id),
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
    }));
    await this.skuRepository.updateMany(mapped);
  }

  private async bulkCreate(
    productId: number,
    items: SkuInput[],
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const mapped = items.map((s) => ({
      productId,
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
      skuValues: s.optionValueIds?.map((id) => ({
        optionValueId: id,
      })),
    }));
    await this.skuRepository.saveMany(mapped);
  }
}
