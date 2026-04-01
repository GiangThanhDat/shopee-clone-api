import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './domain/media.entity';
import {
  MEDIA_QUERY_REPOSITORY,
  MEDIA_COMMAND_REPOSITORY,
} from './application/interfaces/media-repository.interface';
import { MediaRepository } from './infrastructure/media.repository';
import { MediaService } from './application/media.service';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [
    { provide: MEDIA_QUERY_REPOSITORY, useClass: MediaRepository },
    { provide: MEDIA_COMMAND_REPOSITORY, useClass: MediaRepository },
    MediaService,
  ],
  exports: [TypeOrmModule, MEDIA_QUERY_REPOSITORY, MEDIA_COMMAND_REPOSITORY],
})
export class MediaModule {}
