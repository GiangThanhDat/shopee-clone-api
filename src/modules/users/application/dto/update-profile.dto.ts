import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Full name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'Hello, I love shopping!',
    description: 'User bio',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @ApiPropertyOptional({
    example: '2000-01-15',
    description: 'Date of birth (ISO date string)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'Sex (0: female, 1: male, 2: other)',
  })
  @IsOptional()
  @IsInt()
  sex?: number;

  @ApiPropertyOptional({
    example: '0901234567',
    description: 'Phone number',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar.jpg',
    description: 'Avatar URL',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}
