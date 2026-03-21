import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDetailEntity } from '../domain/product-detail.entity';
import type { IProductDetailRepository } from '../application/interfaces/product-detail-repository.interface';

@Injectable()
export class ProductDetailRepository implements IProductDetailRepository {
  constructor(
    @InjectRepository(ProductDetailEntity)
    private readonly repository: Repository<ProductDetailEntity>,
  ) {}

  async findByProductId(productId: number): Promise<ProductDetailEntity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['spec'],
    });
  }

  async findById(id: number): Promise<ProductDetailEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['spec'],
    });
  }

  async save(
    detail: Partial<ProductDetailEntity>,
  ): Promise<ProductDetailEntity> {
    const entity = this.repository.create(detail);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<ProductDetailEntity>,
  ): Promise<ProductDetailEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
