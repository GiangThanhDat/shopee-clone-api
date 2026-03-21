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

  async findByUserId(userId: number): Promise<CartEntity[]> {
    return this.repository.find({
      where: { userId },
      relations: ['sku', 'sku.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndSku(
    userId: number,
    skuId: number,
  ): Promise<CartEntity | null> {
    return this.repository.findOne({
      where: { userId, skuId },
    });
  }

  async findByIdAndUser(
    id: number,
    userId: number,
  ): Promise<CartEntity | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['sku', 'sku.product'],
    });
  }

  async save(cart: Partial<CartEntity>): Promise<CartEntity> {
    const entity = this.repository.create(cart);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    cart: Partial<CartEntity>,
  ): Promise<CartEntity | null> {
    await this.repository.update(id, cart);
    return this.repository.findOne({
      where: { id },
      relations: ['sku', 'sku.product'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async clearByUserId(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
