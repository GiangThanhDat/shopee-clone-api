import { UserEntity } from '../../domain/user.entity';

export const USERS_QUERY_REPOSITORY = Symbol('USERS_QUERY_REPOSITORY');
export const USERS_COMMAND_REPOSITORY = Symbol('USERS_COMMAND_REPOSITORY');

export interface IUsersQueryRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
}

export interface IUsersCommandRepository {
  save(user: Partial<UserEntity>): Promise<UserEntity>;
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity | null>;
}
