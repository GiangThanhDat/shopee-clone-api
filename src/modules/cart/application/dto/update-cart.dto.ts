import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 1,
    description:
      'Cart item id. If provided, updates existing item. If omitted, creates new item.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiProperty({
    example: 1,
    description:
      'Product SKU id. Required when creating a new item (id not provided).',
  })
  @ValidateIf((o: UpdateCartItemDto) => !o.id)
  @IsInt()
  @IsPositive()
  skuId: number;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty({
    type: [UpdateCartItemDto],
    description: 'Cart items. Omitted items will be soft-deleted.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items: UpdateCartItemDto[];
}
