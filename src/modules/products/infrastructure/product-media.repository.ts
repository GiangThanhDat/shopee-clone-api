import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductMediaEntity } from '../domain/product-media.entity';
import type { IProductMediaRepository } from '../application/interfaces/product-media-repository.interface';

@Injectable()
export class ProductMediaRepository implements IProductMediaRepository {
  constructor(
    @InjectRepository(ProductMediaEntity)
    private readonly repository: Repository<ProductMediaEntity>,
  ) {}

  async findByProductId(productId: number): Promise<ProductMediaEntity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['media'],
    });
  }

  async findById(id: number): Promise<ProductMediaEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['media'],
    });
  }

  async save(media: Partial<ProductMediaEntity>): Promise<ProductMediaEntity> {
    const entity = this.repository.create(media);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
