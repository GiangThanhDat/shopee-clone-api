import { CartEntity } from '../../domain/cart.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface ICartRepository {
  findByUserId(userId: number): Promise<CartEntity[]>;
  findByUserAndSku(userId: number, skuId: number): Promise<CartEntity | null>;
  findByIdAndUser(id: number, userId: number): Promise<CartEntity | null>;
  save(cart: Partial<CartEntity>): Promise<CartEntity>;
  update(id: number, cart: Partial<CartEntity>): Promise<CartEntity | null>;
  remove(id: number): Promise<void>;
  clearByUserId(userId: number): Promise<void>;
}
