import { DeepPartial } from 'typeorm';
import { ProductDetailEntity } from '../../domain/product-detail.entity';

export const PRODUCT_DETAIL_REPOSITORY = Symbol('PRODUCT_DETAIL_REPOSITORY');

export interface IProductDetailRepository {
  findByProductId(productId: number): Promise<ProductDetailEntity[]>;
  findById(id: number): Promise<ProductDetailEntity | null>;
  save(detail: DeepPartial<ProductDetailEntity>): Promise<ProductDetailEntity>;
  saveMany(
    details: DeepPartial<ProductDetailEntity>[],
  ): Promise<ProductDetailEntity[]>;
  update(
    id: number,
    data: DeepPartial<ProductDetailEntity>,
  ): Promise<ProductDetailEntity | null>;
  updateMany(items: DeepPartial<ProductDetailEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
}
