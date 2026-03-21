import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { USERS_REPOSITORY } from '../auth/application/interfaces/users-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [{ provide: USERS_REPOSITORY, useClass: UsersRepository }],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
