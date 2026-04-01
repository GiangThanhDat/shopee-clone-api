import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IMediaQueryRepository,
  IMediaCommandRepository,
} from './interfaces/media-repository.interface';
import {
  MEDIA_QUERY_REPOSITORY,
  MEDIA_COMMAND_REPOSITORY,
} from './interfaces/media-repository.interface';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_QUERY_REPOSITORY)
    private readonly mediaQueryRepository: IMediaQueryRepository,
    @Inject(MEDIA_COMMAND_REPOSITORY)
    private readonly mediaCommandRepository: IMediaCommandRepository,
  ) {}

  async findAll() {
    const mediaList = await this.mediaQueryRepository.findAll();
    return { mediaList };
  }

  async findById(mediaId: number) {
    const media = await this.mediaQueryRepository.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media ${mediaId} not found`);
    }
    return { media };
  }

  async create(dto: CreateMediaDto) {
    const media = await this.mediaCommandRepository.save(dto);
    return { media };
  }

  async remove(mediaId: number) {
    const { media } = await this.findById(mediaId);
    await this.mediaCommandRepository.remove(mediaId);
    return { media };
  }
}
