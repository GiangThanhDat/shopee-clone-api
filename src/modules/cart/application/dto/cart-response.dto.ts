import { ApiProperty } from '@nestjs/swagger';

export class CartSkuResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 150000 })
  price: number;

  @ApiProperty({ example: 'SKU-001' })
  skuCode: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg' })
  thumbUrl: string;
}

export class CartItemResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1 })
  skuId: number;

  @ApiProperty({ type: CartSkuResponse })
  sku: CartSkuResponse;

  @ApiProperty({ example: '2026-03-20T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-20T00:00:00.000Z' })
  updatedAt: Date;
}

export class CartResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: [CartItemResponse] })
  items: CartItemResponse[];

  @ApiProperty({ example: '2026-03-20T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-20T00:00:00.000Z' })
  updatedAt: Date;
}

export class CartDataDto {
  @ApiProperty({ type: CartResponse })
  cart: CartResponse;
}

export class CartItemDataDto {
  @ApiProperty({ type: CartItemResponse })
  item: CartItemResponse;
}

export class CartItemListDataDto {
  @ApiProperty({ type: [CartItemResponse] })
  items: CartItemResponse[];
}
