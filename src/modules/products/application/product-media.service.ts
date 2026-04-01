import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { CreateProductMediaDto } from './dto/create-product-media.dto';

@Injectable()
export class ProductMediaService {
  constructor(
    @Inject(PRODUCT_MEDIA_QUERY_REPOSITORY)
    private readonly productMediaQueryRepository: IProductMediaQueryRepository,
    @Inject(PRODUCT_MEDIA_COMMAND_REPOSITORY)
    private readonly productMediaCommandRepository: IProductMediaCommandRepository,
    @Inject(MEDIA_COMMAND_REPOSITORY)
    private readonly mediaCommandRepository: IMediaCommandRepository,
  ) {}

  async findByProductId(productId: number) {
    const productMedia =
      await this.productMediaQueryRepository.findByProductId(productId);
    return { productMedia };
  }

  async findById(productMediaId: number) {
    const productMedia =
      await this.productMediaQueryRepository.findById(productMediaId);
    if (!productMedia) {
      throw new NotFoundException(`Product media ${productMediaId} not found`);
    }
    return { productMedia };
  }

  async addMedia(productId: number, dto: CreateProductMediaDto) {
    const media = await this.mediaCommandRepository.save({
      url: dto.url,
      size: dto.size,
      fileName: dto.fileName,
    });
    const saved = await this.productMediaCommandRepository.save({
      productId,
      mediaId: media.id,
    });
    return this.findById(saved.id);
  }

  async removeMedia(productMediaId: number) {
    const { productMedia } = await this.findById(productMediaId);
    await this.productMediaCommandRepository.remove(productMediaId);
    return { productMedia };
  }
}
