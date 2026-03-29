import { ProductSpecEntity } from '../../domain/product-spec.entity';

export const PRODUCT_SPEC_REPOSITORY = Symbol('PRODUCT_SPEC_REPOSITORY');

export interface IProductSpecRepository {
  findOrCreate(name: string, value: string): Promise<ProductSpecEntity>;
  findOrCreateMany(
    specs: { name: string; value: string }[],
  ): Promise<ProductSpecEntity[]>;
  updateMany(specs: Partial<ProductSpecEntity>[]): Promise<void>;
}
