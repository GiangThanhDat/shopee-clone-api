import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMediaRepository } from './interfaces/media-repository.interface';
import { MEDIA_REPOSITORY } from './interfaces/media-repository.interface';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: IMediaRepository,
  ) {}

  async findAll() {
    const mediaList = await this.mediaRepository.findAll();
    return { mediaList };
  }

  async findById(mediaId: number) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media ${mediaId} not found`);
    }
    return { media };
  }

  async create(dto: CreateMediaDto) {
    const media = await this.mediaRepository.save(dto);
    return { media };
  }

  async remove(mediaId: number) {
    const { media } = await this.findById(mediaId);
    await this.mediaRepository.remove(mediaId);
    return { media };
  }
}
