import { ProductSpecEntity } from '../../domain/product-spec.entity';

export const PRODUCT_SPEC_REPOSITORY = Symbol('PRODUCT_SPEC_REPOSITORY');

export interface IProductSpecRepository {
  findById(id: number): Promise<ProductSpecEntity | null>;
  save(spec: Partial<ProductSpecEntity>): Promise<ProductSpecEntity>;
  update(
    id: number,
    data: Partial<ProductSpecEntity>,
  ): Promise<ProductSpecEntity | null>;
  findOrCreate(name: string, value: string): Promise<ProductSpecEntity>;
  findOrCreateMany(
    specs: { name: string; value: string }[],
  ): Promise<ProductSpecEntity[]>;
  updateMany(specs: Partial<ProductSpecEntity>[]): Promise<void>;
}
