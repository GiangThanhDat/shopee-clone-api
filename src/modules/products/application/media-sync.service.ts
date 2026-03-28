import { Inject, Injectable } from '@nestjs/common';
import type { IProductMediaRepository } from './interfaces/product-media-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import type { IMediaRepository } from '../../media/application/interfaces/media-repository.interface';
import { MEDIA_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';
import type { UpdateProductDto } from './dto/update-product.dto';
import { findIdsToRemove } from './sync-utils';

type MediaInput = NonNullable<UpdateProductDto['media']>[number];

@Injectable()
export class MediaSyncService {
  constructor(
    @Inject(PRODUCT_MEDIA_REPOSITORY)
    private readonly productMediaRepository: IProductMediaRepository,
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: IMediaRepository,
  ) {}

  async sync(
    productId: number,
    incoming: NonNullable<UpdateProductDto['media']>,
  ): Promise<void> {
    const existing =
      await this.productMediaRepository.findByProductId(productId);
    const idsToRemove = findIdsToRemove(existing, incoming);

    const toUpdate = incoming.filter((m) => m.id);
    const toCreate = incoming.filter((m) => !m.id);

    await this.productMediaRepository.softRemoveByIds(idsToRemove);
    await Promise.all([
      this.bulkUpdate(toUpdate),
      this.bulkCreate(productId, toCreate),
    ]);
  }

  private async bulkUpdate(items: MediaInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const withExistingMedia = items.filter((m) => m.mediaId);
    const withNewMedia = items.filter((m) => !m.mediaId);

    await Promise.all([
      this.updateExistingMediaBatch(withExistingMedia),
      this.createAndLinkMediaBatch(withNewMedia),
    ]);
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
    await Promise.all([
      this.productMediaRepository.updateMany(productMediaUpdates),
      this.mediaRepository.updateMany(mediaUpdates),
    ]);
  }

  private async createAndLinkMediaBatch(items: MediaInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const newMedias = await this.mediaRepository.saveMany(
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
    await this.productMediaRepository.updateMany(linkUpdates);
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
    await this.productMediaRepository.saveMany(mapped);
  }
}
