import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity } from '../domain/media.entity';
import type { IMediaRepository } from '../application/interfaces/media-repository.interface';

@Injectable()
export class MediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly repository: Repository<MediaEntity>,
  ) {}

  async findById(id: number): Promise<MediaEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(media: Partial<MediaEntity>): Promise<MediaEntity> {
    const entity = this.repository.create(media);
    return this.repository.save(entity);
  }
}
