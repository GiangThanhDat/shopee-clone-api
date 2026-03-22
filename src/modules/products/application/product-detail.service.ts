import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductDetailRepository } from './interfaces/product-detail-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from './interfaces/product-detail-repository.interface';
import type { IProductSpecRepository } from './interfaces/product-spec-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './interfaces/product-spec-repository.interface';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';

@Injectable()
export class ProductDetailService {
  constructor(
    @Inject(PRODUCT_DETAIL_REPOSITORY)
    private readonly detailRepository: IProductDetailRepository,
    @Inject(PRODUCT_SPEC_REPOSITORY)
    private readonly specRepository: IProductSpecRepository,
  ) {}

  async findByProductId(productId: number) {
    const details = await this.detailRepository.findByProductId(productId);
    return { details };
  }

  async findById(detailId: number) {
    const detail = await this.detailRepository.findById(detailId);
    if (!detail) {
      throw new NotFoundException(`Detail ${detailId} not found`);
    }
    return { detail };
  }

  async addDetail(productId: number, dto: CreateProductDetailDto) {
    const spec = await this.specRepository.findOrCreate(
      dto.specName,
      dto.specValue,
    );
    const detail = await this.detailRepository.save({
      productId,
      fieldId: spec.id,
    });
    return { detail };
  }

  async updateDetail(detailId: number, dto: UpdateProductDetailDto) {
    const { detail: existing } = await this.findById(detailId);
    if (!dto.specName && !dto.specValue) {
      return { detail: existing };
    }
    const name = dto.specName ?? existing.spec.name;
    const value = dto.specValue ?? existing.spec.value ?? '';
    const spec = await this.specRepository.findOrCreate(name, value);
    const updated = await this.detailRepository.update(detailId, {
      fieldId: spec.id,
    });
    return { detail: updated };
  }

  async removeDetail(detailId: number) {
    const { detail } = await this.findById(detailId);
    await this.detailRepository.remove(detailId);
    return { detail };
  }
}
