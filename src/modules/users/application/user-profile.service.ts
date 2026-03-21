import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponse } from './dto/user-profile-response.dto';
import type { IUsersRepository } from './interfaces/users-repository.interface';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';

@Injectable()
export class UserProfileService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async getProfile(userId: number): Promise<{ profile: UserProfileResponse }> {
    const user = await this.findUserOrFail(userId);
    return { profile: user };
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<{ profile: UserProfileResponse }> {
    await this.findUserOrFail(userId);
    const updated = await this.usersRepository.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return { profile: updated };
  }

  private async findUserOrFail(userId: number): Promise<UserEntity> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
