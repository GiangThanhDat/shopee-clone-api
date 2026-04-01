import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IProductDetailQueryRepository,
  IProductDetailCommandRepository,
} from './interfaces/product-detail-repository.interface';
import {
  PRODUCT_DETAIL_QUERY_REPOSITORY,
  PRODUCT_DETAIL_COMMAND_REPOSITORY,
} from './interfaces/product-detail-repository.interface';
import type { IProductSpecCommandRepository } from './interfaces/product-spec-repository.interface';
import { PRODUCT_SPEC_COMMAND_REPOSITORY } from './interfaces/product-spec-repository.interface';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';

@Injectable()
export class ProductDetailService {
  constructor(
    @Inject(PRODUCT_DETAIL_QUERY_REPOSITORY)
    private readonly detailQueryRepository: IProductDetailQueryRepository,
    @Inject(PRODUCT_DETAIL_COMMAND_REPOSITORY)
    private readonly detailCommandRepository: IProductDetailCommandRepository,
    @Inject(PRODUCT_SPEC_COMMAND_REPOSITORY)
    private readonly specCommandRepository: IProductSpecCommandRepository,
  ) {}

  async findByProductId(productId: number) {
    const details = await this.detailQueryRepository.findByProductId(productId);
    return { details };
  }

  async findById(detailId: number) {
    const detail = await this.detailQueryRepository.findById(detailId);
    if (!detail) {
      throw new NotFoundException(`Detail ${detailId} not found`);
    }
    return { detail };
  }

  async addDetail(productId: number, dto: CreateProductDetailDto) {
    const spec = await this.specCommandRepository.findOrCreate(
      dto.specName,
      dto.specValue,
    );
    const saved = await this.detailCommandRepository.save({
      productId,
      fieldId: spec.id,
    });
    return this.findById(saved.id);
  }

  async updateDetail(detailId: number, dto: UpdateProductDetailDto) {
    const { detail: existing } = await this.findById(detailId);
    if (!dto.specName && !dto.specValue) {
      return { detail: existing };
    }
    const name = dto.specName ?? existing.spec.name;
    const value = dto.specValue ?? existing.spec.value ?? '';
    const spec = await this.specCommandRepository.findOrCreate(name, value);
    const updated = await this.detailCommandRepository.update(detailId, {
      fieldId: spec.id,
    });
    return { detail: updated };
  }

  async removeDetail(detailId: number) {
    const { detail } = await this.findById(detailId);
    await this.detailCommandRepository.remove(detailId);
    return { detail };
  }
}
