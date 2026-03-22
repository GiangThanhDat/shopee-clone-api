import { OptionValueEntity } from '../../domain/option-value.entity';

export const OPTION_VALUE_REPOSITORY = Symbol('OPTION_VALUE_REPOSITORY');

export interface IOptionValueRepository {
  findByOptionId(optionId: number): Promise<OptionValueEntity[]>;
  findById(id: number): Promise<OptionValueEntity | null>;
  findByIds(ids: number[]): Promise<OptionValueEntity[]>;
  save(value: Partial<OptionValueEntity>): Promise<OptionValueEntity>;
  saveMany(values: Partial<OptionValueEntity>[]): Promise<OptionValueEntity[]>;
  update(
    id: number,
    data: Partial<OptionValueEntity>,
  ): Promise<OptionValueEntity | null>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
}
