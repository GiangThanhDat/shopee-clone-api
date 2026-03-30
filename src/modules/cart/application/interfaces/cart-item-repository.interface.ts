import { CartItemEntity } from '../../domain/cart-item.entity';

export const CART_ITEM_REPOSITORY = Symbol('CART_ITEM_REPOSITORY');

export interface ICartItemRepository {
  findByCartId(cartId: number): Promise<CartItemEntity[]>;
  findByCartAndSku(
    cartId: number,
    skuId: number,
  ): Promise<CartItemEntity | null>;
  findDeletedByCartAndSku(
    cartId: number,
    skuId: number,
  ): Promise<CartItemEntity | null>;
  findByIdAndCart(id: number, cartId: number): Promise<CartItemEntity | null>;
  save(item: Partial<CartItemEntity>): Promise<CartItemEntity>;
  update(
    id: number,
    item: Partial<CartItemEntity>,
  ): Promise<CartItemEntity | null>;
  updateMany(
    items: Array<{ id: number } & Partial<CartItemEntity>>,
  ): Promise<void>;
  saveMany(items: Partial<CartItemEntity>[]): Promise<CartItemEntity[]>;
  restore(
    id: number,
    item: Partial<CartItemEntity>,
  ): Promise<CartItemEntity | null>;
  softRemoveByIds(ids: number[]): Promise<void>;
  softRemoveAllByCartId(cartId: number): Promise<void>;
}
