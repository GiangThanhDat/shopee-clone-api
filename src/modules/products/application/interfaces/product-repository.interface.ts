import { DeepPartial } from 'typeorm';
import { ProductEntity } from '../../domain/product.entity';

export const PRODUCT_QUERY_REPOSITORY = Symbol('PRODUCT_QUERY_REPOSITORY');
export const PRODUCT_COMMAND_REPOSITORY = Symbol('PRODUCT_COMMAND_REPOSITORY');

export interface IProductQueryRepository {
  findAll(query: ProductFilterQuery): Promise<[ProductEntity[], number]>;
  findById(id: number): Promise<ProductEntity | null>;
}

export interface IProductCommandRepository {
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
