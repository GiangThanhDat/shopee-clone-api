import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { USERS_REPOSITORY } from './application/interfaces/users-repository.interface';
import { UserProfileService } from './application/user-profile.service';
import { UserProfileController } from './user-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserProfileController],
  providers: [
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
    UserProfileService,
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
