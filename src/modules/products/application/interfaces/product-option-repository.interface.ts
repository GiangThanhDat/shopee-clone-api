import { ProductOptionEntity } from '../../domain/product-option.entity';

export const PRODUCT_OPTION_REPOSITORY = Symbol('PRODUCT_OPTION_REPOSITORY');

export interface IProductOptionRepository {
  findByProductId(productId: number): Promise<ProductOptionEntity[]>;
  findById(id: number): Promise<ProductOptionEntity | null>;
  save(option: Partial<ProductOptionEntity>): Promise<ProductOptionEntity>;
  update(
    id: number,
    data: Partial<ProductOptionEntity>,
  ): Promise<ProductOptionEntity | null>;
  remove(id: number): Promise<void>;
}
