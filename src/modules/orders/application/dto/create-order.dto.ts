import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Product SKU id' })
  @IsInt()
  @IsPositive()
  skuId!: number;

  @ApiProperty({
    example: 150000,
    description: 'Unit price shown to user on client',
  })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: '123 Main St, District 1, HCMC',
    description: 'Delivery address',
  })
  @IsString()
  deliveryAddress!: string;

  @ApiProperty({
    example: 300000,
    description:
      'Total amount calculated by client. Server will verify against actual prices.',
  })
  @IsNumber()
  @IsPositive()
  totalAmount!: number;

  @ApiProperty({ type: [OrderItemDto], description: 'List of items to order' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
