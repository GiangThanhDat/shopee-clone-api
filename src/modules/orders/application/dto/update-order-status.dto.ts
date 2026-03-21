import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 1,
    description:
      'Order status: 0=pending, 1=paid, 2=shipped, 3=completed, 4=cancelled',
  })
  @IsInt()
  @Min(0)
  @Max(4)
  orderStatus: number;
}
