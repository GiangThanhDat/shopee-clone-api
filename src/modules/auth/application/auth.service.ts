import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../users/domain/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import type { IUsersRepository } from './interfaces/users-repository.interface';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';

@Injectable()
export class AuthService {
  private readonly bcryptRounds = 12;

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const [, , passwordHash] = await Promise.all([
      this.ensureEmailNotTaken(dto.email),
      this.ensureUsernameNotTaken(dto.username),
      bcrypt.hash(dto.password, this.bcryptRounds),
    ]);
    const user = await this.usersRepository.save({ ...dto, passwordHash });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.verifyPassword(dto.password, user.passwordHash);
    return this.buildAuthResponse(user);
  }

  async refreshToken(token: string): Promise<RefreshTokenResponseDto> {
    const payload = this.verifyRefreshToken(token);
    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user.id, user.email);
  }

  private verifyRefreshToken(token: string): { sub: number; email: string } {
    try {
      const secret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'default-refresh-secret',
      );
      return this.jwtService.verify<{ sub: number; email: string }>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  private async ensureUsernameNotTaken(username: string): Promise<void> {
    const existing = await this.usersRepository.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already in use');
    }
  }

  private async verifyPassword(plain: string, hash: string): Promise<void> {
    const isValid = await bcrypt.compare(plain, hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  private buildAuthResponse(user: UserEntity): AuthResponseDto {
    const tokens = this.generateTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
      auth: tokens,
    };
  }

  private generateTokens(
    userId: number,
    email: string,
  ): { accessToken: string; refreshToken: string } {
    const payload = { sub: userId, email };
    const accessToken = this.generateAccessToken(userId, email);
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'default-refresh-secret',
    );
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email }, { expiresIn: '1h' });
  }
}
