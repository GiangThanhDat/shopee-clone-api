import { MediaEntity } from '../../domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface IMediaRepository {
  findAll(): Promise<MediaEntity[]>;
  findById(id: number): Promise<MediaEntity | null>;
  save(media: Partial<MediaEntity>): Promise<MediaEntity>;
  remove(id: number): Promise<void>;
}
