import { DeepPartial } from 'typeorm';
import { ProductEntity } from '../../domain/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findAll(query: ProductFilterQuery): Promise<[ProductEntity[], number]>;
  findById(id: number): Promise<ProductEntity | null>;
  create(product: DeepPartial<ProductEntity>): Promise<ProductEntity>;
  update(
    id: number,
    product: DeepPartial<ProductEntity>,
  ): Promise<ProductEntity | null>;
  remove(id: number): Promise<void>;
}

export interface ProductFilterQuery {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
