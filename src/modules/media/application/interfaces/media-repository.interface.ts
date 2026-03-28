import { MediaEntity } from '../../domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface IMediaRepository {
  findAll(): Promise<MediaEntity[]>;
  findById(id: number): Promise<MediaEntity | null>;
  save(media: Partial<MediaEntity>): Promise<MediaEntity>;
  saveMany(medias: Partial<MediaEntity>[]): Promise<MediaEntity[]>;
  update(id: number, data: Partial<MediaEntity>): Promise<MediaEntity | null>;
  updateMany(items: Partial<MediaEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
}
