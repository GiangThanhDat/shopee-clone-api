import { Inject, Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ProductEntity } from '../domain/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type {
  IProductQueryRepository,
  IProductCommandRepository,
} from './interfaces/product-repository.interface';
import {
  PRODUCT_QUERY_REPOSITORY,
  PRODUCT_COMMAND_REPOSITORY,
} from './interfaces/product-repository.interface';
import { SkuSyncService } from './sku-sync.service';
import { MediaSyncService } from './media-sync.service';
import { DetailSyncService } from './detail-sync.service';

@Injectable()
export class ProductOrchestrator {
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepository: IProductQueryRepository,
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepository: IProductCommandRepository,
    private readonly skuSync: SkuSyncService,
    private readonly mediaSync: MediaSyncService,
    private readonly detailSync: DetailSyncService,
  ) {}

  @Transactional()
  async create(dto: CreateProductDto): Promise<ProductEntity | null> {
    await this.skuSync.validate(dto.skus);
    const graph = this.buildGraph(dto);
    const product = await this.productCommandRepository.create(graph);
    return this.productQueryRepository.findById(product.id);
  }

  @Transactional()
  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductEntity | null> {
    await this.skuSync.validate(dto.skus);
    await this.updateProductFields(id, dto);
    await this.syncSubEntities(id, dto);
    return this.productQueryRepository.findById(id);
  }

  private buildGraph(dto: CreateProductDto): DeepPartial<ProductEntity> {
    return {
      name: dto.name,
      description: dto.description,
      skus: this.mapSkus(dto.skus),
      productMedia: this.mapMedia(dto.media),
      details: this.mapDetails(dto.details),
    };
  }

  private mapSkus(skus: CreateProductDto['skus']) {
    if (!skus) {
      return [];
    }
    return skus.map((s) => ({
      id: s.id,
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
      skuValues: s.optionValueIds?.map((id) => ({ optionValueId: id })),
    }));
  }

  private mapMedia(media: CreateProductDto['media']) {
    if (!media) {
      return [];
    }
    return media.map((m) => ({
      id: m.id,
      mediaId: m.mediaId,
      media: {
        id: m.mediaId,
        url: m.url,
        size: m.size,
        fileName: m.fileName,
      },
    }));
  }

  private mapDetails(details: CreateProductDto['details']) {
    if (!details) {
      return [];
    }
    return details.map((d) => ({
      id: d.id,
      fieldId: d.fieldId,
      spec: {
        id: d.fieldId,
        name: d.specName,
        value: d.specValue,
      },
    }));
  }

  private async updateProductFields(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    const { name, description } = dto;
    if (name === undefined && description === undefined) {
      return;
    }
    await this.productCommandRepository.update(id, { name, description });
  }

  private async syncSubEntities(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    if (dto.skus) {
      await this.skuSync.sync(id, dto.skus);
    }
    if (dto.media) {
      await this.mediaSync.sync(id, dto.media);
    }
    if (dto.details) {
      await this.detailSync.sync(id, dto.details);
    }
  }
}
