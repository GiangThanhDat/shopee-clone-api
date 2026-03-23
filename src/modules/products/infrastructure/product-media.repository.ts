import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
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

  async save(
    media: DeepPartial<ProductMediaEntity>,
  ): Promise<ProductMediaEntity> {
    return this.repository.save(media);
  }

  async update(
    id: number,
    data: DeepPartial<ProductMediaEntity>,
  ): Promise<ProductMediaEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async softRemoveByIds(ids: number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.repository.softDelete({ id: In(ids) });
  }
}
