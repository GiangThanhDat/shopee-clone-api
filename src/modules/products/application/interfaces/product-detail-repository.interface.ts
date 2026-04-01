import { DeepPartial } from 'typeorm';
import { ProductDetailEntity } from '../../domain/product-detail.entity';

export const PRODUCT_DETAIL_QUERY_REPOSITORY = Symbol(
  'PRODUCT_DETAIL_QUERY_REPOSITORY',
);
export const PRODUCT_DETAIL_COMMAND_REPOSITORY = Symbol(
  'PRODUCT_DETAIL_COMMAND_REPOSITORY',
);

export interface IProductDetailQueryRepository {
  findByProductId(productId: number): Promise<ProductDetailEntity[]>;
  findById(id: number): Promise<ProductDetailEntity | null>;
}

export interface IProductDetailCommandRepository {
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
