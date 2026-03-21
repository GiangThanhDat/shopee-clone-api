import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../common/dto/api-response.dto';

export class OrderDetailResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 150000 })
  price: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 15000 })
  shippingFee: number;

  @ApiProperty({ example: 0 })
  discountPercent: number;

  @ApiProperty({ example: 1 })
  skuId: number;
}

export class OrderResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1711234567890 })
  orderCode: number;

  @ApiProperty({ example: 315000 })
  totalAmount: number;

  @ApiProperty({ example: '123 Main St, District 1, HCMC' })
  deliveryAddress: string;

  @ApiProperty({ example: 0 })
  orderStatus: number;

  @ApiProperty({ type: [OrderDetailResponse] })
  details: OrderDetailResponse[];

  @ApiProperty({ example: '2026-03-20T00:00:00.000Z' })
  createdAt: Date;
}

export class OrderListMetadataDto {
  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}

export class OrderListDataDto {
  @ApiProperty({ type: [OrderResponse] })
  orders: OrderResponse[];

  @ApiPropertyOptional({ type: OrderListMetadataDto })
  metadata?: OrderListMetadataDto;
}

export class OrderDetailDataDto {
  @ApiProperty({ type: OrderResponse })
  order: OrderResponse;
}
