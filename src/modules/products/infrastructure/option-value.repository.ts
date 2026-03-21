import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductOptionValueEntity } from '../domain/product-option-value.entity';
import type { IOptionValueRepository } from '../application/interfaces/option-value-repository.interface';

@Injectable()
export class OptionValueRepository implements IOptionValueRepository {
  constructor(
    @InjectRepository(ProductOptionValueEntity)
    private readonly repository: Repository<ProductOptionValueEntity>,
  ) {}

  async findByOptionId(optionId: number): Promise<ProductOptionValueEntity[]> {
    return this.repository.find({
      where: { productOptionId: optionId },
    });
  }

  async findById(id: number): Promise<ProductOptionValueEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<ProductOptionValueEntity[]> {
    return this.repository.findBy({ id: In(ids) });
  }

  async save(
    value: Partial<ProductOptionValueEntity>,
  ): Promise<ProductOptionValueEntity> {
    const entity = this.repository.create(value);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<ProductOptionValueEntity>,
  ): Promise<ProductOptionValueEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
