import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsPositive,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProductDetailDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing spec ID (skip creation, link directly)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  fieldId?: number;

  @ApiProperty({ example: 'Screen Size', description: 'Spec name' })
  @ValidateIf((o: CreateProductDetailDto) => !o.fieldId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specName: string;

  @ApiProperty({ example: '6.7 inches', description: 'Spec value' })
  @ValidateIf((o: CreateProductDetailDto) => !o.fieldId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specValue: string;
}
