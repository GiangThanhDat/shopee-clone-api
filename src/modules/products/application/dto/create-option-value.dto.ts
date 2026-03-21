import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOptionValueDto {
  @ApiProperty({ example: 'Red', description: 'Option value' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @ApiProperty({
    example: 'https://cdn.example.com/red.png',
    description: 'Image URL for option value',
  })
  @IsString()
  @MaxLength(255)
  imageUrl: string;
}
