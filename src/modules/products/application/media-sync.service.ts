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
    await this.productMediaRepository.softRemoveByIds(idsToRemove);
    for (const m of incoming) {
      if (m.id) {
        await this.update(Number(m.id), m);
        continue;
      }
      await this.create(productId, m);
    }
  }

  private async update(productMediaId: number, m: MediaInput): Promise<void> {
    if (m.mediaId) {
      await this.updateExistingMedia(productMediaId, m);
      return;
    }
    await this.createAndLinkMedia(productMediaId, m);
  }

  private async updateExistingMedia(
    productMediaId: number,
    m: MediaInput,
  ): Promise<void> {
    await this.productMediaRepository.update(productMediaId, {
      mediaId: m.mediaId,
    });
    await this.mediaRepository.update(Number(m.mediaId), {
      url: m.url,
      size: m.size,
      fileName: m.fileName,
    });
  }

  private async createAndLinkMedia(
    productMediaId: number,
    m: MediaInput,
  ): Promise<void> {
    const media = await this.mediaRepository.save({
      url: m.url,
      size: m.size,
      fileName: m.fileName,
    });
    await this.productMediaRepository.update(productMediaId, {
      mediaId: media.id,
    });
  }

  private async create(productId: number, m: MediaInput): Promise<void> {
    await this.productMediaRepository.save({
      productId,
      mediaId: m.mediaId,
      media: {
        id: m.mediaId,
        url: m.url,
        size: m.size,
        fileName: m.fileName,
      },
    });
  }
}
