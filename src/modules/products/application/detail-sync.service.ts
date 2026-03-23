import { Inject, Injectable } from '@nestjs/common';
import type { IProductDetailRepository } from './interfaces/product-detail-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from './interfaces/product-detail-repository.interface';
import type { IProductSpecRepository } from './interfaces/product-spec-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './interfaces/product-spec-repository.interface';
import type { UpdateProductDto } from './dto/update-product.dto';
import { findIdsToRemove } from './sync-utils';

type DetailInput = NonNullable<UpdateProductDto['details']>[number];

@Injectable()
export class DetailSyncService {
  constructor(
    @Inject(PRODUCT_DETAIL_REPOSITORY)
    private readonly detailRepository: IProductDetailRepository,
    @Inject(PRODUCT_SPEC_REPOSITORY)
    private readonly specRepository: IProductSpecRepository,
  ) {}

  async sync(
    productId: number,
    incoming: NonNullable<UpdateProductDto['details']>,
  ): Promise<void> {
    const existing = await this.detailRepository.findByProductId(productId);
    const idsToRemove = findIdsToRemove(existing, incoming);
    await this.detailRepository.softRemoveByIds(idsToRemove);
    for (const d of incoming) {
      if (d.id) {
        await this.update(Number(d.id), d);
        continue;
      }
      await this.create(productId, d);
    }
  }

  private async update(detailId: number, d: DetailInput): Promise<void> {
    if (d.fieldId) {
      await this.updateExistingSpec(detailId, d);
      return;
    }
    await this.createAndLinkSpec(detailId, d);
  }

  private async updateExistingSpec(
    detailId: number,
    d: DetailInput,
  ): Promise<void> {
    await this.detailRepository.update(detailId, {
      fieldId: d.fieldId,
    });
    await this.specRepository.update(Number(d.fieldId), {
      name: d.specName,
      value: d.specValue,
    });
  }

  private async createAndLinkSpec(
    detailId: number,
    d: DetailInput,
  ): Promise<void> {
    const spec = await this.specRepository.findOrCreate(
      d.specName,
      d.specValue,
    );
    await this.detailRepository.update(detailId, {
      fieldId: spec.id,
    });
  }

  private async create(productId: number, d: DetailInput): Promise<void> {
    const fieldId = await this.resolveFieldId(d);
    await this.detailRepository.save({ productId, fieldId });
  }

  private async resolveFieldId(d: DetailInput): Promise<number> {
    if (d.fieldId) {
      return d.fieldId;
    }
    const spec = await this.specRepository.findOrCreate(
      d.specName,
      d.specValue,
    );
    return spec.id;
  }
}
