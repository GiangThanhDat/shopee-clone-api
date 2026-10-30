import { OrderDetailEntity } from '../../domain/order-detail.entity';
import { OrderEntity } from '../../domain/order.entity';
import { OrderStatus } from '../../domain/order-status';

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
  changeStatus(
    id: number,
    from: OrderStatus,
    to: OrderStatus,
  ): Promise<boolean>;
  saveDetails(details: Partial<OrderDetailEntity>[]): Promise<void>;
}
