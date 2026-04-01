import { ProductSpecEntity } from '../../domain/product-spec.entity';

export const PRODUCT_SPEC_COMMAND_REPOSITORY = Symbol(
  'PRODUCT_SPEC_COMMAND_REPOSITORY',
);

// All spec operations are upserts — no pure query interface needed
export interface IProductSpecCommandRepository {
  findOrCreate(name: string, value: string): Promise<ProductSpecEntity>;
  findOrCreateMany(
    specs: { name: string; value: string }[],
  ): Promise<ProductSpecEntity[]>;
  updateMany(specs: Partial<ProductSpecEntity>[]): Promise<void>;
}
