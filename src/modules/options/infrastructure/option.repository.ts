import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptionEntity } from '../domain/option.entity';
import type { IOptionRepository } from '../application/interfaces/option-repository.interface';

@Injectable()
export class OptionRepository implements IOptionRepository {
  constructor(
    @InjectRepository(OptionEntity)
    private readonly repository: Repository<OptionEntity>,
  ) {}

  async findAll(): Promise<OptionEntity[]> {
    return this.repository.find({
      relations: ['values'],
    });
  }

  async findById(id: number): Promise<OptionEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['values'],
    });
  }

  async save(option: Partial<OptionEntity>): Promise<OptionEntity> {
    const entity = this.repository.create(option);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<OptionEntity>,
  ): Promise<OptionEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
