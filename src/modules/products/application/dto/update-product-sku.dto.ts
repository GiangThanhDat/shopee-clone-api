import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductSkuDto {
  @ApiPropertyOptional({ example: 150000, description: 'SKU price' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 100, description: 'Stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'PHONE-RED-128GB', description: 'SKU code' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  skuCode?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/thumb.png',
    description: 'Thumbnail URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbUrl?: string;
}
