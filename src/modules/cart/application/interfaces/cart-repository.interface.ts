import { CartEntity } from '../../domain/cart.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface ICartRepository {
  findByUserId(userId: number): Promise<CartEntity | null>;
  findByUserIdWithItems(userId: number): Promise<CartEntity | null>;
  save(cart: Partial<CartEntity>): Promise<CartEntity>;
}
