import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductDetailDto {
  @ApiProperty({ example: 'Screen Size', description: 'Spec name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specName: string;

  @ApiProperty({ example: '6.7 inches', description: 'Spec value' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specValue: string;
}
