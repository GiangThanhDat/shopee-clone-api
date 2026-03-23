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

  async findAll(): Promise<MediaEntity[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<MediaEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(media: Partial<MediaEntity>): Promise<MediaEntity> {
    const entity = this.repository.create(media);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<MediaEntity>,
  ): Promise<MediaEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
