import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsArray,
  ArrayMinSize,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductSkuDto {
  @ApiProperty({ example: 150000, description: 'SKU price' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100, description: 'Stock quantity' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'PHONE-RED-128GB', description: 'SKU code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  skuCode: string;

  @ApiProperty({
    example: 'https://cdn.example.com/thumb.png',
    description: 'Thumbnail URL',
  })
  @IsString()
  @MaxLength(255)
  thumbUrl: string;

  @ApiProperty({
    example: [1, 3],
    description: 'Option value IDs that define this variant',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  optionValueIds: number[];
}
