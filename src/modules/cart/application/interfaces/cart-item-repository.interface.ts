import { CartItemEntity } from '../../domain/cart-item.entity';

export const CART_ITEM_QUERY_REPOSITORY = Symbol('CART_ITEM_QUERY_REPOSITORY');
export const CART_ITEM_COMMAND_REPOSITORY = Symbol(
  'CART_ITEM_COMMAND_REPOSITORY',
);

export interface ICartItemQueryRepository {
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
}

export interface ICartItemCommandRepository {
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
