import { Inject, Injectable } from '@nestjs/common';
import type {
  IProductMediaQueryRepository,
  IProductMediaCommandRepository,
} from './interfaces/product-media-repository.interface';
import {
  PRODUCT_MEDIA_QUERY_REPOSITORY,
  PRODUCT_MEDIA_COMMAND_REPOSITORY,
} from './interfaces/product-media-repository.interface';
import type { IMediaCommandRepository } from '../../media/application/interfaces/media-repository.interface';
import { MEDIA_COMMAND_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';
import type { UpdateProductDto } from './dto/update-product.dto';
import { findIdsToRemove } from './sync-utils';

type MediaInput = NonNullable<UpdateProductDto['media']>[number];

@Injectable()
export class MediaSyncService {
  constructor(
    @Inject(PRODUCT_MEDIA_QUERY_REPOSITORY)
    private readonly productMediaQueryRepository: IProductMediaQueryRepository,
    @Inject(PRODUCT_MEDIA_COMMAND_REPOSITORY)
    private readonly productMediaCommandRepository: IProductMediaCommandRepository,
    @Inject(MEDIA_COMMAND_REPOSITORY)
    private readonly mediaCommandRepository: IMediaCommandRepository,
  ) {}

  async sync(
    productId: number,
    incoming: NonNullable<UpdateProductDto['media']>,
  ): Promise<void> {
    const existing =
      await this.productMediaQueryRepository.findByProductId(productId);
    const idsToRemove = findIdsToRemove(existing, incoming);

    const toUpdate = incoming.filter((m) => m.id);
    const toCreate = incoming.filter((m) => !m.id);

    await this.productMediaCommandRepository.softRemoveByIds(idsToRemove);
    await this.bulkUpdate(toUpdate);
    await this.bulkCreate(productId, toCreate);
  }

  private async bulkUpdate(items: MediaInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const withExistingMedia = items.filter((m) => m.mediaId);
    const withNewMedia = items.filter((m) => !m.mediaId);

    await this.updateExistingMediaBatch(withExistingMedia);
    await this.createAndLinkMediaBatch(withNewMedia);
  }

  private async updateExistingMediaBatch(items: MediaInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const productMediaUpdates = items.map((m) => ({
      id: Number(m.id),
      mediaId: m.mediaId,
    }));
    const mediaUpdates = items.map((m) => ({
      id: Number(m.mediaId),
      url: m.url,
      size: m.size,
      fileName: m.fileName,
    }));
    await this.productMediaCommandRepository.updateMany(productMediaUpdates);
    await this.mediaCommandRepository.updateMany(mediaUpdates);
  }

  private async createAndLinkMediaBatch(items: MediaInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const newMedias = await this.mediaCommandRepository.saveMany(
      items.map((m) => ({
        url: m.url,
        size: m.size,
        fileName: m.fileName,
      })),
    );
    const linkUpdates = items.map((m, index) => ({
      id: Number(m.id),
      mediaId: newMedias[index].id,
    }));
    await this.productMediaCommandRepository.updateMany(linkUpdates);
  }

  private async bulkCreate(
    productId: number,
    items: MediaInput[],
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const mapped = items.map((m) => ({
      productId,
      mediaId: m.mediaId,
      media: {
        id: m.mediaId,
        url: m.url,
        size: m.size,
        fileName: m.fileName,
      },
    }));
    await this.productMediaCommandRepository.saveMany(mapped);
  }
}
