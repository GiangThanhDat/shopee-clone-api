import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionValueDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing option value ID (for update)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @ApiProperty({ example: 'Red', description: 'Option value' })
  @ValidateIf((o: CreateOptionValueDto) => !o.id)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @ApiProperty({
    example: 'https://cdn.example.com/red.png',
    description: 'Image URL for option value',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;
}
