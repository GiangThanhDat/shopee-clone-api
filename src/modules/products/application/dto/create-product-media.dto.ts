import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductMediaDto {
  @ApiProperty({
    example: 'https://cdn.example.com/product.png',
    description: 'Media URL',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @ApiProperty({ example: 1024000, description: 'File size in bytes' })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'product.png', description: 'File name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;
}
