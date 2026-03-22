import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './domain/media.entity';
import { MEDIA_REPOSITORY } from './application/interfaces/media-repository.interface';
import { MediaRepository } from './infrastructure/media.repository';
import { MediaService } from './application/media.service';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [
    { provide: MEDIA_REPOSITORY, useClass: MediaRepository },
    MediaService,
  ],
  exports: [TypeOrmModule, MEDIA_REPOSITORY],
})
export class MediaModule {}
