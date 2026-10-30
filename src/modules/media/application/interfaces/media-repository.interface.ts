import { MediaEntity } from '../../domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface IMediaRepository {
  findAll(): Promise<MediaEntity[]>;
  findById(id: number): Promise<MediaEntity | null>;
  save(media: Partial<MediaEntity>): Promise<MediaEntity>;
  saveMany(medias: Partial<MediaEntity>[]): Promise<MediaEntity[]>;
  updateMany(items: Partial<MediaEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
}
