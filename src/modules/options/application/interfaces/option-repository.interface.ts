import { OptionEntity } from '../../domain/option.entity';

export const OPTION_QUERY_REPOSITORY = Symbol('OPTION_QUERY_REPOSITORY');
export const OPTION_COMMAND_REPOSITORY = Symbol('OPTION_COMMAND_REPOSITORY');

export interface IOptionQueryRepository {
  findAll(): Promise<OptionEntity[]>;
  findById(id: number): Promise<OptionEntity | null>;
}

export interface IOptionCommandRepository {
  save(option: Partial<OptionEntity>): Promise<OptionEntity>;
  update(id: number, data: Partial<OptionEntity>): Promise<OptionEntity | null>;
  remove(id: number): Promise<void>;
}
