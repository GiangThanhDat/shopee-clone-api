import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  fullName: string;

  @ApiProperty({ example: 'nguyenvana', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'nguyenvana@example.com', description: 'Email' })
  email: string;

  @ApiPropertyOptional({ example: 'Hello, I love shopping!' })
  bio: string | null;

  @ApiPropertyOptional({ example: '2000-01-15' })
  dateOfBirth: Date | null;

  @ApiPropertyOptional({
    example: 1,
    description: '0: female, 1: male, 2: other',
  })
  sex: number | null;

  @ApiPropertyOptional({ example: '0901234567' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  avatar: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class UserProfileDataDto {
  @ApiProperty({ type: UserProfileResponse })
  profile: UserProfileResponse;
}
