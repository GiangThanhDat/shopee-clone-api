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

  async saveMany(medias: Partial<MediaEntity>[]): Promise<MediaEntity[]> {
    const entities = medias.map((m) => this.repository.create(m));
    return this.repository.save(entities);
  }

  async updateMany(items: Partial<MediaEntity>[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await this.repository.save(items);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
