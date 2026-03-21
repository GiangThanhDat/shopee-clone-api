import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductMediaRepository } from './interfaces/product-media-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import type { IMediaRepository } from './interfaces/media-repository.interface';
import { MEDIA_REPOSITORY } from './interfaces/media-repository.interface';
import { CreateProductMediaDto } from './dto/create-product-media.dto';

@Injectable()
export class ProductMediaService {
  constructor(
    @Inject(PRODUCT_MEDIA_REPOSITORY)
    private readonly productMediaRepository: IProductMediaRepository,
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: IMediaRepository,
  ) {}

  async addMedia(productId: number, dto: CreateProductMediaDto) {
    const media = await this.mediaRepository.save({
      url: dto.url,
      size: dto.size,
      fileName: dto.fileName,
    });
    const productMedia = await this.productMediaRepository.save({
      productId,
      mediaId: media.id,
    });
    return { productMedia };
  }

  async removeMedia(productMediaId: number): Promise<void> {
    const productMedia =
      await this.productMediaRepository.findById(productMediaId);
    if (!productMedia) {
      throw new NotFoundException(`Product media ${productMediaId} not found`);
    }
    await this.productMediaRepository.remove(productMediaId);
  }
}
