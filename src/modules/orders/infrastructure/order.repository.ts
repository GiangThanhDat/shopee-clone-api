import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyPagination } from '../../../common/utils/pagination';
import { OrderDetailEntity } from '../domain/order-detail.entity';
import { OrderEntity } from '../domain/order.entity';
import type {
  IOrderRepository,
  OrderFilterQuery,
} from '../application/interfaces/order-repository.interface';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailEntity)
    private readonly detailRepository: Repository<OrderDetailEntity>,
  ) {}

  async findAll(query: OrderFilterQuery): Promise<[OrderEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('order');
    queryBuilder.where('order.user_id = :userId', { userId: query.userId });
    this.applyStatusFilter(queryBuilder, query.status);
    queryBuilder.orderBy('order.createdAt', 'DESC');
    applyPagination(queryBuilder, query.page, query.limit);
    queryBuilder.leftJoinAndSelect('order.details', 'detail');
    queryBuilder.leftJoinAndSelect('detail.sku', 'sku');
    queryBuilder.leftJoinAndSelect('sku.product', 'product');
    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['details', 'details.sku', 'details.sku.product'],
    });
  }

  async findByIdAndUser(
    id: number,
    userId: number,
  ): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['details', 'details.sku', 'details.sku.product'],
    });
  }

  async save(order: Partial<OrderEntity>): Promise<OrderEntity> {
    const entity = this.repository.create(order);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    order: Partial<OrderEntity>,
  ): Promise<OrderEntity | null> {
    await this.repository.update(id, order);
    return this.findById(id);
  }

  async saveDetails(details: Partial<OrderDetailEntity>[]): Promise<void> {
    const entities = details.map((d) => this.detailRepository.create(d));
    await this.detailRepository.save(entities);
  }

  private applyStatusFilter(
    queryBuilder: ReturnType<Repository<OrderEntity>['createQueryBuilder']>,
    status?: number,
  ): void {
    if (status === undefined) {
      return;
    }
    queryBuilder.andWhere('order.order_status = :status', { status });
  }
}
