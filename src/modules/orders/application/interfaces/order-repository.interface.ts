import { OrderDetailEntity } from '../../domain/order-detail.entity';
import { OrderEntity } from '../../domain/order.entity';

export const ORDER_QUERY_REPOSITORY = Symbol('ORDER_QUERY_REPOSITORY');
export const ORDER_COMMAND_REPOSITORY = Symbol('ORDER_COMMAND_REPOSITORY');

export interface OrderFilterQuery {
  userId: number;
  page: number;
  limit: number;
  status?: number;
}

export interface IOrderQueryRepository {
  findAll(query: OrderFilterQuery): Promise<[OrderEntity[], number]>;
  findById(id: number): Promise<OrderEntity | null>;
  findByIdAndUser(id: number, userId: number): Promise<OrderEntity | null>;
}

export interface IOrderCommandRepository {
  save(order: Partial<OrderEntity>): Promise<OrderEntity>;
  update(id: number, order: Partial<OrderEntity>): Promise<OrderEntity | null>;
  saveDetails(details: Partial<OrderDetailEntity>[]): Promise<void>;
}
