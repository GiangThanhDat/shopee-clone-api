import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOptionEntity } from '../domain/product-option.entity';
import type { IProductOptionRepository } from '../application/interfaces/product-option-repository.interface';

@Injectable()
export class ProductOptionRepository implements IProductOptionRepository {
  constructor(
    @InjectRepository(ProductOptionEntity)
    private readonly repository: Repository<ProductOptionEntity>,
  ) {}

  async findByProductId(productId: number): Promise<ProductOptionEntity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['values'],
    });
  }

  async findById(id: number): Promise<ProductOptionEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['values'],
    });
  }

  async save(
    option: Partial<ProductOptionEntity>,
  ): Promise<ProductOptionEntity> {
    const entity = this.repository.create(option);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<ProductOptionEntity>,
  ): Promise<ProductOptionEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
