import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../domain/cart.entity';
import type { ICartRepository } from '../application/interfaces/cart-repository.interface';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
  ) {}

  async findByUserId(userId: number): Promise<CartEntity | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async findByUserIdWithItems(userId: number): Promise<CartEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['items', 'items.sku', 'items.sku.product'],
      order: { items: { createdAt: 'DESC' } },
    });
  }

  async save(cart: Partial<CartEntity>): Promise<CartEntity> {
    const entity = this.repository.create(cart);
    return this.repository.save(entity);
  }
}
