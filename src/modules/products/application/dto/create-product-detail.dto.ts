import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProductDetailDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing ProductDetail ID (update existing link)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Existing Spec ID (link to existing spec)',
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
