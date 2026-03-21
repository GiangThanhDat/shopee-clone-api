import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'Product SKU id' })
  @IsInt()
  @IsPositive()
  skuId: number;

  @ApiProperty({ example: 2, description: 'Quantity to add' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
