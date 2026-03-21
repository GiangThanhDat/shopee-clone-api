import { MediaEntity } from '../../domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface IMediaRepository {
  findById(id: number): Promise<MediaEntity | null>;
  save(media: Partial<MediaEntity>): Promise<MediaEntity>;
}
