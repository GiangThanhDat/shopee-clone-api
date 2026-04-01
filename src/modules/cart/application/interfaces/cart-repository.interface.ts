import { CartEntity } from '../../domain/cart.entity';

export const CART_QUERY_REPOSITORY = Symbol('CART_QUERY_REPOSITORY');
export const CART_COMMAND_REPOSITORY = Symbol('CART_COMMAND_REPOSITORY');

export interface ICartQueryRepository {
  findByUserId(userId: number): Promise<CartEntity | null>;
  findByUserIdWithItems(userId: number): Promise<CartEntity | null>;
}

export interface ICartCommandRepository {
  save(cart: Partial<CartEntity>): Promise<CartEntity>;
}
