import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../domain/user.entity';
import type { IUsersRepository } from '../application/interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.repository.create(user);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
