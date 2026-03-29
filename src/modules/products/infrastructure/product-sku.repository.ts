import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { ProductSkuEntity } from '../domain/product-sku.entity';
import { SkuValueEntity } from '../domain/sku-value.entity';
import type { IProductSkuRepository } from '../application/interfaces/product-sku-repository.interface';

@Injectable()
export class ProductSkuRepository implements IProductSkuRepository {
  constructor(
    @InjectRepository(ProductSkuEntity)
    private readonly repository: Repository<ProductSkuEntity>,
    @InjectRepository(SkuValueEntity)
    private readonly skuValueRepository: Repository<SkuValueEntity>,
  ) {}

  async findByProductId(productId: number): Promise<ProductSkuEntity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['skuValues', 'skuValues.optionValue'],
    });
  }

  async findById(id: number): Promise<ProductSkuEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['skuValues', 'skuValues.optionValue'],
    });
  }

  async saveMany(
    skus: DeepPartial<ProductSkuEntity>[],
  ): Promise<ProductSkuEntity[]> {
    return this.repository.save(skus);
  }

  async saveWithValues(
    sku: Partial<ProductSkuEntity>,
    values: Partial<SkuValueEntity>[],
  ): Promise<ProductSkuEntity> {
    const saved = await this.repository.save(sku);
    const skuValues = values.map((v) =>
      this.skuValueRepository.create({ ...v, skuId: saved.id }),
    );
    await this.skuValueRepository.save(skuValues);
    return this.findById(saved.id) as Promise<ProductSkuEntity>;
  }

  async update(
    id: number,
    data: Partial<ProductSkuEntity>,
  ): Promise<ProductSkuEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateMany(skus: DeepPartial<ProductSkuEntity>[]): Promise<void> {
    await Promise.all(
      skus.map((sku) => {
        const { id, ...data } = sku;
        return this.repository.update(Number(id), data);
      }),
    );
  }

  async remove(id: number): Promise<void> {
    await this.skuValueRepository.delete({ skuId: id });
    await this.repository.delete(id);
  }

  async softRemoveByIds(ids: number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.repository.softDelete({ id: In(ids) });
  }

  async syncSkuValues(
    entries: { skuId: number; optionValueIds: number[] }[],
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }
    const skuIds = entries.map((e) => e.skuId);
    await this.skuValueRepository.delete({ skuId: In(skuIds) });

    const newValues = entries.flatMap((entry) =>
      entry.optionValueIds.map((optionValueId) =>
        this.skuValueRepository.create({
          skuId: entry.skuId,
          optionValueId,
        }),
      ),
    );
    if (newValues.length > 0) {
      await this.skuValueRepository.save(newValues);
    }
  }
}
