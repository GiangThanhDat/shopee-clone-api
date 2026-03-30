import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductMediaRepository } from './interfaces/product-media-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import type { IMediaRepository } from '../../media/application/interfaces/media-repository.interface';
import { MEDIA_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';
import { CreateProductMediaDto } from './dto/create-product-media.dto';

@Injectable()
export class ProductMediaService {
  constructor(
    @Inject(PRODUCT_MEDIA_REPOSITORY)
    private readonly productMediaRepository: IProductMediaRepository,
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: IMediaRepository,
  ) {}

  async findByProductId(productId: number) {
    const productMedia =
      await this.productMediaRepository.findByProductId(productId);
    return { productMedia };
  }

  async findById(productMediaId: number) {
    const productMedia =
      await this.productMediaRepository.findById(productMediaId);
    if (!productMedia) {
      throw new NotFoundException(`Product media ${productMediaId} not found`);
    }
    return { productMedia };
  }

  async addMedia(productId: number, dto: CreateProductMediaDto) {
    const media = await this.mediaRepository.save({
      url: dto.url,
      size: dto.size,
      fileName: dto.fileName,
    });
    const saved = await this.productMediaRepository.save({
      productId,
      mediaId: media.id,
    });
    return this.findById(saved.id);
  }

  async removeMedia(productMediaId: number) {
    const { productMedia } = await this.findById(productMediaId);
    await this.productMediaRepository.remove(productMediaId);
    return { productMedia };
  }
}
