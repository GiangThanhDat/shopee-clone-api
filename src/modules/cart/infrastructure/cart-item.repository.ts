import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartItemEntity } from '../domain/cart-item.entity';
import type { ICartItemRepository } from '../application/interfaces/cart-item-repository.interface';

@Injectable()
export class CartItemRepository implements ICartItemRepository {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly repository: Repository<CartItemEntity>,
  ) {}

  async findByCartId(cartId: number): Promise<CartItemEntity[]> {
    return this.repository.find({
      where: { cartId },
      relations: ['sku', 'sku.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCartAndSku(
    cartId: number,
    skuId: number,
  ): Promise<CartItemEntity | null> {
    return this.repository.findOne({ where: { cartId, skuId } });
  }

  async findDeletedByCartAndSku(
    cartId: number,
    skuId: number,
  ): Promise<CartItemEntity | null> {
    return this.repository.findOne({
      where: { cartId, skuId },
      withDeleted: true,
    });
  }

  async findByIdAndCart(
    id: number,
    cartId: number,
  ): Promise<CartItemEntity | null> {
    return this.repository.findOne({
      where: { id, cartId },
      relations: ['sku', 'sku.product'],
    });
  }

  async save(item: Partial<CartItemEntity>): Promise<CartItemEntity> {
    const entity = this.repository.create(item);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    item: Partial<CartItemEntity>,
  ): Promise<CartItemEntity | null> {
    await this.repository.update(id, item);
    return this.repository.findOne({
      where: { id },
      relations: ['sku', 'sku.product'],
    });
  }

  async updateMany(
    items: Array<{ id: number } & Partial<CartItemEntity>>,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await Promise.all(
      items.map(({ id, ...rest }) => this.repository.update(id, rest)),
    );
  }

  async saveMany(items: Partial<CartItemEntity>[]): Promise<CartItemEntity[]> {
    if (items.length === 0) {
      return [];
    }
    const entities = items.map((i) => this.repository.create(i));
    return this.repository.save(entities);
  }

  async restore(
    id: number,
    item: Partial<CartItemEntity>,
  ): Promise<CartItemEntity | null> {
    await this.repository.update(id, item);
    await this.repository.restore(id);
    return this.repository.findOne({
      where: { id },
      relations: ['sku', 'sku.product'],
    });
  }

  async softRemoveByIds(ids: number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.repository.softDelete({ id: In(ids) });
  }

  async softRemoveAllByCartId(cartId: number): Promise<void> {
    await this.repository.softDelete({ cartId });
  }
}
