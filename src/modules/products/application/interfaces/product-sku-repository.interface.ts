import { ProductSkuEntity } from '../../domain/product-sku.entity';
import { SkuValueEntity } from '../../domain/sku-value.entity';

export const PRODUCT_SKU_REPOSITORY = Symbol('PRODUCT_SKU_REPOSITORY');

export interface IProductSkuRepository {
  findByProductId(productId: number): Promise<ProductSkuEntity[]>;
  findById(id: number): Promise<ProductSkuEntity | null>;
  save(sku: Partial<ProductSkuEntity>): Promise<ProductSkuEntity>;
  saveWithValues(
    sku: Partial<ProductSkuEntity>,
    values: Partial<SkuValueEntity>[],
  ): Promise<ProductSkuEntity>;
  update(
    id: number,
    data: Partial<ProductSkuEntity>,
  ): Promise<ProductSkuEntity | null>;
  remove(id: number): Promise<void>;
}
