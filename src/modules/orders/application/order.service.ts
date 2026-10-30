import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { buildPaginationMeta } from '../../../common/utils/pagination';
import {
  ORDER_REPOSITORY,
  type IOrderRepository,
} from './interfaces/order-repository.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderPriceVerifier } from './order-price-verifier.service';
import { OrderStockReservation } from './order-stock-reservation.service';
import { OrderEntity } from '../domain/order.entity';
import { OrderStatus, canCustomerTransition } from '../domain/order-status';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly priceVerifier: OrderPriceVerifier,
    private readonly stockReservation: OrderStockReservation,
  ) {}

  async findAll(userId: number, filterDto: OrderFilterDto) {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;
    const [orders, totalItems] = await this.orderRepository.findAll({
      userId,
      page,
      limit,
      status: filterDto.status,
    });
    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { orders, metadata: { pagination } };
  }

  async findById(id: number, userId: number) {
    const order = await this.orderRepository.findByIdAndUser(id, userId);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return { order };
  }

  @Transactional()
  async create(userId: number, dto: CreateOrderDto) {
    const { total, subtotals } = await this.priceVerifier.verify(dto);
    await this.stockReservation.reserve(dto.items);
    const order = await this.orderRepository.save({
      userId,
      orderCode: Date.now(),
      totalAmount: total,
      deliveryAddress: dto.deliveryAddress,
      orderStatus: OrderStatus.Pending,
      orderedAt: new Date(),
    });
    await this.saveDetails(order.id, userId, dto, subtotals);
    return this.reload(order.id);
  }

  @Transactional()
  async updateStatus(id: number, userId: number, dto: UpdateOrderStatusDto) {
    const { order } = await this.findById(id, userId);
    this.assertCustomerTransition(order.orderStatus, dto.orderStatus);
    const changed = await this.orderRepository.changeStatus(
      id,
      order.orderStatus,
      dto.orderStatus,
    );
    if (!changed) {
      throw new ConflictException(`Order ${id} was changed by another request`);
    }
    await this.releaseStockOnCancel(order, dto.orderStatus);
    return this.reload(id);
  }

  private assertCustomerTransition(from: OrderStatus, to: OrderStatus): void {
    if (!canCustomerTransition(from, to)) {
      throw new BadRequestException(
        `Order status cannot change from ${OrderStatus[from]} to ${OrderStatus[to]}`,
      );
    }
  }

  private async releaseStockOnCancel(
    order: OrderEntity,
    target: OrderStatus,
  ): Promise<void> {
    if (target !== OrderStatus.Cancelled) {
      return;
    }
    await this.stockReservation.release(order.details);
  }

  private async reload(id: number): Promise<{ order: OrderEntity }> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return { order };
  }

  private async saveDetails(
    orderId: number,
    userId: number,
    dto: CreateOrderDto,
    subtotals: Map<number, number>,
  ): Promise<void> {
    const details = dto.items.map((item) => ({
      orderId,
      userId,
      skuId: item.skuId,
      price: item.price,
      quantity: item.quantity,
      discountPercent: 0,
      shippingFee: 0,
      subtotal: subtotals.get(item.skuId) ?? 0,
    }));
    await this.orderRepository.saveDetails(details);
  }
}
