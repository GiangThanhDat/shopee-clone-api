import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductSkuDto } from './create-product-sku.dto';
import { CreateProductMediaDto } from './create-product-media.dto';
import { CreateProductDetailDto } from './create-product-detail.dto';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro Max',
    description: 'Product name',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Apple smartphone with A17 Pro chip',
    description: 'Product description',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    type: [CreateProductSkuDto],
    description: 'Product SKUs',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSkuDto)
  skus?: CreateProductSkuDto[];

  @ApiPropertyOptional({
    type: [CreateProductMediaDto],
    description: 'Product media files',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaDto)
  media?: CreateProductMediaDto[];

  @ApiPropertyOptional({
    type: [CreateProductDetailDto],
    description: 'Product specifications',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDetailDto)
  details?: CreateProductDetailDto[];
}
