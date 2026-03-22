import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOptionValueDto } from './create-option-value.dto';

export class CreateOptionDto {
  @ApiProperty({ example: 'Color', description: 'Option name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    type: [CreateOptionValueDto],
    description: 'Option values to create along with the option',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionValueDto)
  values?: CreateOptionValueDto[];
}
