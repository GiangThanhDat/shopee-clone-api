import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Email } from '../../users/domain/value-objects/email.vo';
import { UserEntity } from '../../users/domain/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import type {
  IUsersQueryRepository,
  IUsersCommandRepository,
} from '../../users/application/interfaces/users-repository.interface';
import {
  USERS_QUERY_REPOSITORY,
  USERS_COMMAND_REPOSITORY,
} from '../../users/application/interfaces/users-repository.interface';

@Injectable()
export class AuthService {
  private readonly bcryptRounds = 12;

  constructor(
    @Inject(USERS_QUERY_REPOSITORY)
    private readonly usersQueryRepository: IUsersQueryRepository,
    @Inject(USERS_COMMAND_REPOSITORY)
    private readonly usersCommandRepository: IUsersCommandRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = Email.of(dto.email);
    const [, , passwordHash] = await Promise.all([
      this.ensureEmailNotTaken(email.toString()),
      this.ensureUsernameNotTaken(dto.username),
      bcrypt.hash(dto.password, this.bcryptRounds),
    ]);
    const user = await this.usersCommandRepository.save({
      ...dto,
      email: email.toString(),
      passwordHash,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = Email.of(dto.email);
    const user = await this.usersQueryRepository.findByEmail(email.toString());
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.verifyPassword(dto.password, user.passwordHash);
    return this.buildAuthResponse(user);
  }

  async refreshToken(token: string): Promise<RefreshTokenResponseDto> {
    const payload = this.verifyRefreshToken(token);
    const user = await this.usersQueryRepository.findById(payload.sub);
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
    const existing = await this.usersQueryRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  private async ensureUsernameNotTaken(username: string): Promise<void> {
    const existing = await this.usersQueryRepository.findByUsername(username);
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
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  private generateAccessToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email }, { expiresIn: '1h' });
  }

  private generateRefreshToken(userId: number, email: string): string {
    const secret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'default-refresh-secret',
    );
    return this.jwtService.sign({ sub: userId, email }, { secret, expiresIn: '7d' });
  }
}
