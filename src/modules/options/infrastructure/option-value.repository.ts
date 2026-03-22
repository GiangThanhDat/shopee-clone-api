import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OptionValueEntity } from '../domain/option-value.entity';
import type { IOptionValueRepository } from '../application/interfaces/option-value-repository.interface';

@Injectable()
export class OptionValueRepository implements IOptionValueRepository {
  constructor(
    @InjectRepository(OptionValueEntity)
    private readonly repository: Repository<OptionValueEntity>,
  ) {}

  async findByOptionId(optionId: number): Promise<OptionValueEntity[]> {
    return this.repository.find({
      where: { optionId },
    });
  }

  async findById(id: number): Promise<OptionValueEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<OptionValueEntity[]> {
    return this.repository.findBy({ id: In(ids) });
  }

  async save(value: Partial<OptionValueEntity>): Promise<OptionValueEntity> {
    const entity = this.repository.create(value);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<OptionValueEntity>,
  ): Promise<OptionValueEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
