import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  IsPositive,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductMediaDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing ProductMedia ID (update existing link)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Existing Media ID (link to existing media)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  mediaId?: number;

  @ApiProperty({
    example: 'https://cdn.example.com/product.png',
    description: 'Media URL',
  })
  @ValidateIf((o: CreateProductMediaDto) => !o.mediaId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @ApiProperty({ example: 1024000, description: 'File size in bytes' })
  @ValidateIf((o: CreateProductMediaDto) => !o.mediaId)
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'product.png', description: 'File name' })
  @ValidateIf((o: CreateProductMediaDto) => !o.mediaId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;
}
