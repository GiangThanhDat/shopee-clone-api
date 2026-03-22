import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductSkuRepository } from './interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './interfaces/product-sku-repository.interface';
import type { IOptionValueRepository } from '../../options/application/interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';
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

  async findByProductId(productId: number) {
    const skus = await this.skuRepository.findByProductId(productId);
    return { skus };
  }

  async findById(skuId: number) {
    const sku = await this.skuRepository.findById(skuId);
    if (!sku) {
      throw new NotFoundException(`SKU ${skuId} not found`);
    }
    return { sku };
  }

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
    const { sku: existing } = await this.findById(skuId);
    const sku = await this.skuRepository.update(existing.id, dto);
    return { sku };
  }

  async removeSku(skuId: number) {
    const { sku } = await this.findById(skuId);
    await this.skuRepository.remove(skuId);
    return { sku };
  }

  private async validateOptionValues(ids: number[]): Promise<void> {
    const values = await this.valueRepository.findByIds(ids);
    if (values.length !== ids.length) {
      throw new BadRequestException('Some option value IDs are invalid');
    }
  }
}
