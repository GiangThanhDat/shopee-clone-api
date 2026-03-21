import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class OrderFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 0,
    description:
      'Filter by status: 0=pending, 1=paid, 2=shipped, 3=completed, 4=cancelled',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  status?: number;
}
