import { UserEntity } from '../../domain/user.entity';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface IUsersRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  save(user: Partial<UserEntity>): Promise<UserEntity>;
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity | null>;
}
