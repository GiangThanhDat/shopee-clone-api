import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsArray,
  IsOptional,
  ArrayMinSize,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductSkuDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing SKU ID (skip creation, link directly)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiProperty({ example: 150000, description: 'SKU price' })
  @ValidateIf((o: CreateProductSkuDto) => !o.id)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100, description: 'Stock quantity' })
  @ValidateIf((o: CreateProductSkuDto) => !o.id)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'PHONE-RED-128GB', description: 'SKU code' })
  @ValidateIf((o: CreateProductSkuDto) => !o.id)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  skuCode: string;

  @ApiProperty({
    example: 'https://cdn.example.com/thumb.png',
    description: 'Thumbnail URL',
  })
  @ValidateIf((o: CreateProductSkuDto) => !o.id)
  @IsString()
  @MaxLength(255)
  thumbUrl: string;

  @ApiProperty({
    example: [1, 3],
    description: 'Option value IDs that define this variant',
  })
  @ValidateIf((o: CreateProductSkuDto) => !o.id)
  @IsArray()
  @ArrayMinSize(0)
  @IsInt({ each: true })
  optionValueIds: number[];
}
