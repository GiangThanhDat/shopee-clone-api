import { DeepPartial } from 'typeorm';
import { ProductSkuEntity } from '../../domain/product-sku.entity';
import { SkuValueEntity } from '../../domain/sku-value.entity';

export const PRODUCT_SKU_QUERY_REPOSITORY = Symbol(
  'PRODUCT_SKU_QUERY_REPOSITORY',
);
export const PRODUCT_SKU_COMMAND_REPOSITORY = Symbol(
  'PRODUCT_SKU_COMMAND_REPOSITORY',
);

export interface IProductSkuQueryRepository {
  findByProductId(productId: number): Promise<ProductSkuEntity[]>;
  findById(id: number): Promise<ProductSkuEntity | null>;
  findByIds(ids: number[]): Promise<ProductSkuEntity[]>;
}

export interface IProductSkuCommandRepository {
  saveMany(skus: DeepPartial<ProductSkuEntity>[]): Promise<ProductSkuEntity[]>;
  saveWithValues(
    sku: Partial<ProductSkuEntity>,
    values: Partial<SkuValueEntity>[],
  ): Promise<ProductSkuEntity>;
  update(
    id: number,
    data: Partial<ProductSkuEntity>,
  ): Promise<ProductSkuEntity | null>;
  updateMany(skus: DeepPartial<ProductSkuEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
  syncSkuValues(
    entries: { skuId: number; optionValueIds: number[] }[],
  ): Promise<void>;
}
