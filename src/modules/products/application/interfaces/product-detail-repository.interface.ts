import { ProductDetailEntity } from '../../domain/product-detail.entity';

export const PRODUCT_DETAIL_REPOSITORY = Symbol('PRODUCT_DETAIL_REPOSITORY');

export interface IProductDetailRepository {
  findByProductId(productId: number): Promise<ProductDetailEntity[]>;
  findById(id: number): Promise<ProductDetailEntity | null>;
  save(detail: Partial<ProductDetailEntity>): Promise<ProductDetailEntity>;
  update(
    id: number,
    data: Partial<ProductDetailEntity>,
  ): Promise<ProductDetailEntity | null>;
  remove(id: number): Promise<void>;
}
