import { MediaEntity } from '../../domain/media.entity';

export const MEDIA_QUERY_REPOSITORY = Symbol('MEDIA_QUERY_REPOSITORY');
export const MEDIA_COMMAND_REPOSITORY = Symbol('MEDIA_COMMAND_REPOSITORY');

export interface IMediaQueryRepository {
  findAll(): Promise<MediaEntity[]>;
  findById(id: number): Promise<MediaEntity | null>;
}

export interface IMediaCommandRepository {
  save(media: Partial<MediaEntity>): Promise<MediaEntity>;
  saveMany(medias: Partial<MediaEntity>[]): Promise<MediaEntity[]>;
  updateMany(items: Partial<MediaEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
}
