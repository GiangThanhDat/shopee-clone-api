import { ProductOptionValueEntity } from '../../domain/product-option-value.entity';

export const OPTION_VALUE_REPOSITORY = Symbol('OPTION_VALUE_REPOSITORY');

export interface IOptionValueRepository {
  findByOptionId(optionId: number): Promise<ProductOptionValueEntity[]>;
  findById(id: number): Promise<ProductOptionValueEntity | null>;
  findByIds(ids: number[]): Promise<ProductOptionValueEntity[]>;
  save(
    value: Partial<ProductOptionValueEntity>,
  ): Promise<ProductOptionValueEntity>;
  update(
    id: number,
    data: Partial<ProductOptionValueEntity>,
  ): Promise<ProductOptionValueEntity | null>;
  remove(id: number): Promise<void>;
}
