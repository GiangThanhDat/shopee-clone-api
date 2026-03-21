import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { buildPaginationMeta } from '../../../common/utils/pagination';
import type { IOrderRepository } from './interfaces/order-repository.interface';
import { ORDER_REPOSITORY } from './interfaces/order-repository.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderPriceVerifier } from './order-price-verifier.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly priceVerifier: OrderPriceVerifier,
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

  async create(userId: number, dto: CreateOrderDto) {
    const { total, subtotals } = await this.priceVerifier.verify(dto);
    const order = await this.orderRepository.save({
      userId,
      orderCode: Date.now(),
      totalAmount: total,
      deliveryAddress: dto.deliveryAddress,
      orderStatus: 0,
      orderedAt: new Date(),
    });
    await this.saveDetails(order.id, userId, dto, subtotals);
    const saved = await this.orderRepository.findById(order.id);
    if (!saved) {
      throw new NotFoundException(`Order ${order.id} not found`);
    }
    return { order: saved };
  }

  async updateStatus(id: number, userId: number, dto: UpdateOrderStatusDto) {
    await this.findById(id, userId);
    const timestamps = this.resolveStatusTimestamp(dto.orderStatus);
    const updated = await this.orderRepository.update(id, {
      orderStatus: dto.orderStatus,
      ...timestamps,
    });
    if (!updated) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return { order: updated };
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
      discountPercent: item.discountPercent ?? 0,
      shippingFee: item.shippingFee ?? 0,
      subtotal: subtotals.get(item.skuId) ?? 0,
    }));
    await this.orderRepository.saveDetails(details);
  }

  private resolveStatusTimestamp(
    status: number,
  ): Partial<Record<string, Date>> {
    const now = new Date();
    const map: Record<number, string> = {
      1: 'paidAt',
      2: 'shippedAt',
      3: 'completedAt',
    };
    const field = map[status];
    if (!field) {
      return {};
    }
    return { [field]: now };
  }
}
