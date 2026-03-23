import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpecEntity } from '../domain/product-spec.entity';
import type { IProductSpecRepository } from '../application/interfaces/product-spec-repository.interface';

@Injectable()
export class ProductSpecRepository implements IProductSpecRepository {
  constructor(
    @InjectRepository(ProductSpecEntity)
    private readonly repository: Repository<ProductSpecEntity>,
  ) {}

  async findById(id: number): Promise<ProductSpecEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(spec: Partial<ProductSpecEntity>): Promise<ProductSpecEntity> {
    const entity = this.repository.create(spec);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<ProductSpecEntity>,
  ): Promise<ProductSpecEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async findOrCreate(name: string, value: string): Promise<ProductSpecEntity> {
    const existing = await this.repository.findOne({
      where: { name, value },
    });
    if (existing) {
      return existing;
    }
    return this.save({ name, value });
  }
}
