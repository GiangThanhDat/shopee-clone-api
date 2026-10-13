import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../domain/order-status';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: OrderStatus.Cancelled,
    enum: OrderStatus,
    description:
      'Target status. Customers may only cancel (4) a pending order; other transitions belong to payment and fulfilment flows',
  })
  @IsEnum(OrderStatus)
  orderStatus!: OrderStatus;
}
