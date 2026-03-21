import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductSkuRepository } from './interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './interfaces/product-sku-repository.interface';
import type { IOptionValueRepository } from './interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from './interfaces/option-value-repository.interface';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';

@Injectable()
export class ProductSkuService {
  constructor(
    @Inject(PRODUCT_SKU_REPOSITORY)
    private readonly skuRepository: IProductSkuRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly valueRepository: IOptionValueRepository,
  ) {}

  async createSku(productId: number, dto: CreateProductSkuDto) {
    await this.validateOptionValues(dto.optionValueIds);
    const skuValues = dto.optionValueIds.map((id) => ({
      optionValueId: id,
    }));
    const sku = await this.skuRepository.saveWithValues(
      {
        productId,
        price: dto.price,
        stock: dto.stock,
        skuCode: dto.skuCode,
        thumbUrl: dto.thumbUrl,
      },
      skuValues,
    );
    return { sku };
  }

  async updateSku(skuId: number, dto: UpdateProductSkuDto) {
    const sku = await this.skuRepository.update(skuId, dto);
    if (!sku) {
      throw new NotFoundException(`SKU ${skuId} not found`);
    }
    return { sku };
  }

  async removeSku(skuId: number): Promise<void> {
    const sku = await this.skuRepository.findById(skuId);
    if (!sku) {
      throw new NotFoundException(`SKU ${skuId} not found`);
    }
    await this.skuRepository.remove(skuId);
  }

  private async validateOptionValues(ids: number[]): Promise<void> {
    const values = await this.valueRepository.findByIds(ids);
    if (values.length !== ids.length) {
      throw new BadRequestException('Some option value IDs are invalid');
    }
  }
}
