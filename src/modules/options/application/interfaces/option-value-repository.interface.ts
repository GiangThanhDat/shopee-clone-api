import { OptionValueEntity } from '../../domain/option-value.entity';

export const OPTION_VALUE_QUERY_REPOSITORY = Symbol(
  'OPTION_VALUE_QUERY_REPOSITORY',
);
export const OPTION_VALUE_COMMAND_REPOSITORY = Symbol(
  'OPTION_VALUE_COMMAND_REPOSITORY',
);

export interface IOptionValueQueryRepository {
  findByOptionId(optionId: number): Promise<OptionValueEntity[]>;
  findById(id: number): Promise<OptionValueEntity | null>;
  findByIds(ids: number[]): Promise<OptionValueEntity[]>;
}

export interface IOptionValueCommandRepository {
  save(value: Partial<OptionValueEntity>): Promise<OptionValueEntity>;
  saveMany(
    values: Partial<OptionValueEntity>[],
  ): Promise<OptionValueEntity[]>;
  update(
    id: number,
    data: Partial<OptionValueEntity>,
  ): Promise<OptionValueEntity | null>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
}
