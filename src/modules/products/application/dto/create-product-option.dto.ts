import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOptionValueDto } from './create-option-value.dto';

export class CreateProductOptionDto {
  @ApiProperty({ example: 'Color', description: 'Option name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

export class CreateProductOptionWithValuesDto extends CreateProductOptionDto {
  @ApiPropertyOptional({
    type: [CreateOptionValueDto],
    description: 'Option values',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionValueDto)
  values?: CreateOptionValueDto[];
}
