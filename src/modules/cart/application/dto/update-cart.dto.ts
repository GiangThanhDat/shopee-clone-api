import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ example: 3, description: 'New quantity' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
