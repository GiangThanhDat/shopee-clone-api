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

    const toUpdate = incoming.filter((d) => d.id);
    const toCreate = incoming.filter((d) => !d.id);

    await this.detailRepository.softRemoveByIds(idsToRemove);

    const specsToResolve = [...toUpdate, ...toCreate].filter((d) => !d.fieldId);
    const resolvedSpecs = await this.resolveSpecs(specsToResolve);

    await this.bulkUpdate(toUpdate, resolvedSpecs);
    await this.bulkCreate(productId, toCreate, resolvedSpecs);
  }

  private async resolveSpecs(
    items: DetailInput[],
  ): Promise<Map<string, number>> {
    if (items.length === 0) {
      return new Map();
    }
    const specInputs = items.map((d) => ({
      name: d.specName,
      value: d.specValue,
    }));
    const specs = await this.specRepository.findOrCreateMany(specInputs);

    const specMap = new Map<string, number>();
    for (const spec of specs) {
      specMap.set(`${spec.name}::${spec.value}`, spec.id);
    }
    return specMap;
  }

  private getFieldId(
    detail: DetailInput,
    resolvedSpecs: Map<string, number>,
  ): number {
    if (detail.fieldId) {
      return detail.fieldId;
    }
    const key = `${detail.specName}::${detail.specValue}`;
    return resolvedSpecs.get(key)!;
  }

  private async bulkUpdate(
    items: DetailInput[],
    resolvedSpecs: Map<string, number>,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const withExistingSpec = items.filter((d) => d.fieldId);
    const withNewSpec = items.filter((d) => !d.fieldId);

    const updates = [
      ...withExistingSpec.map((d) => ({
        id: Number(d.id),
        fieldId: d.fieldId,
      })),
      ...withNewSpec.map((d) => ({
        id: Number(d.id),
        fieldId: this.getFieldId(d, resolvedSpecs),
      })),
    ];
    await this.detailRepository.updateMany(updates);

    const specUpdates = withExistingSpec.map((d) => ({
      id: Number(d.fieldId),
      name: d.specName,
      value: d.specValue,
    }));
    if (specUpdates.length > 0) {
      await this.specRepository.updateMany(specUpdates);
    }
  }

  private async bulkCreate(
    productId: number,
    items: DetailInput[],
    resolvedSpecs: Map<string, number>,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const mapped = items.map((d) => ({
      productId,
      fieldId: this.getFieldId(d, resolvedSpecs),
    }));
    await this.detailRepository.saveMany(mapped);
  }
}
