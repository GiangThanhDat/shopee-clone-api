import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  fullName: string;

  @ApiProperty({ example: 'nguyenvana@example.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'nguyenvana', description: 'Username' })
  username: string;
}

class AuthDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
  @ApiProperty({ type: AuthDto })
  auth: AuthDto;
}
