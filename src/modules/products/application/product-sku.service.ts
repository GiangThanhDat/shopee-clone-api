import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IProductSkuQueryRepository,
  IProductSkuCommandRepository,
} from './interfaces/product-sku-repository.interface';
import {
  PRODUCT_SKU_QUERY_REPOSITORY,
  PRODUCT_SKU_COMMAND_REPOSITORY,
} from './interfaces/product-sku-repository.interface';
import type { IOptionValueQueryRepository } from '../../options/application/interfaces/option-value-repository.interface';
import { OPTION_VALUE_QUERY_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';

@Injectable()
export class ProductSkuService {
  constructor(
    @Inject(PRODUCT_SKU_QUERY_REPOSITORY)
    private readonly skuQueryRepository: IProductSkuQueryRepository,
    @Inject(PRODUCT_SKU_COMMAND_REPOSITORY)
    private readonly skuCommandRepository: IProductSkuCommandRepository,
    @Inject(OPTION_VALUE_QUERY_REPOSITORY)
    private readonly valueQueryRepository: IOptionValueQueryRepository,
  ) {}

  async findByProductId(productId: number) {
    const skus = await this.skuQueryRepository.findByProductId(productId);
    return { skus };
  }

  async findById(skuId: number) {
    const sku = await this.skuQueryRepository.findById(skuId);
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
    const sku = await this.skuCommandRepository.saveWithValues(
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
    const sku = await this.skuCommandRepository.update(existing.id, dto);
    return { sku };
  }

  async removeSku(skuId: number) {
    const { sku } = await this.findById(skuId);
    await this.skuCommandRepository.remove(skuId);
    return { sku };
  }

  private async validateOptionValues(ids: number[]): Promise<void> {
    const values = await this.valueQueryRepository.findByIds(ids);
    if (values.length !== ids.length) {
      throw new BadRequestException('Some option value IDs are invalid');
    }
  }
}
