import { OrderDetailEntity } from '../../domain/order-detail.entity';
import { OrderEntity } from '../../domain/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderFilterQuery {
  userId: number;
  page: number;
  limit: number;
  status?: number;
}

export interface IOrderRepository {
  findAll(query: OrderFilterQuery): Promise<[OrderEntity[], number]>;
  findById(id: number): Promise<OrderEntity | null>;
  findByIdAndUser(id: number, userId: number): Promise<OrderEntity | null>;
  save(order: Partial<OrderEntity>): Promise<OrderEntity>;
  update(id: number, order: Partial<OrderEntity>): Promise<OrderEntity | null>;
  saveDetails(details: Partial<OrderDetailEntity>[]): Promise<void>;
}
