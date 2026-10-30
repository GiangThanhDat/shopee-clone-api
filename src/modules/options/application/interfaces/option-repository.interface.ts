import { OptionEntity } from '../../domain/option.entity';

export const OPTION_REPOSITORY = Symbol('OPTION_REPOSITORY');

export interface IOptionRepository {
  findAll(): Promise<OptionEntity[]>;
  findById(id: number): Promise<OptionEntity | null>;
  save(option: Partial<OptionEntity>): Promise<OptionEntity>;
  update(id: number, data: Partial<OptionEntity>): Promise<OptionEntity | null>;
  remove(id: number): Promise<void>;
}
