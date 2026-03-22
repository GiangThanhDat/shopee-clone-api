import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, DeepPartial } from 'typeorm';
import { ProductEntity } from '../domain/product.entity';
import { ProductSkuEntity } from '../domain/product-sku.entity';
import { ProductMediaEntity } from '../domain/product-media.entity';
import { ProductDetailEntity } from '../domain/product-detail.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';
import type { IProductSkuRepository } from './interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './interfaces/product-sku-repository.interface';
import type { IProductMediaRepository } from './interfaces/product-media-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import type { IProductDetailRepository } from './interfaces/product-detail-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from './interfaces/product-detail-repository.interface';
import type { IOptionValueRepository } from '../../options/application/interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';

@Injectable()
export class ProductOrchestrator {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SKU_REPOSITORY)
    private readonly skuRepository: IProductSkuRepository,
    @Inject(PRODUCT_MEDIA_REPOSITORY)
    private readonly mediaRepository: IProductMediaRepository,
    @Inject(PRODUCT_DETAIL_REPOSITORY)
    private readonly detailRepository: IProductDetailRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly optionValueRepository: IOptionValueRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity | null> {
    return this.dataSource.transaction(async () => {
      await this.validateSkuOptionValues(dto);
      const graph = this.buildGraph(dto);
      const product = await this.productRepository.create(graph);
      return this.productRepository.findById(product.id);
    });
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductEntity | null> {
    return this.dataSource.transaction(async () => {
      await this.validateSkuOptionValues(dto);
      await this.updateProductFields(id, dto);
      await this.syncSubEntities(id, dto);
      return this.productRepository.findById(id);
    });
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

  private mapSkus(
    skus: CreateProductDto['skus'],
    productId?: number,
  ): DeepPartial<ProductSkuEntity>[] {
    if (!skus) {
      return [];
    }
    return skus.map((s) => ({
      id: s.id,
      productId,
      price: s.price,
      stock: s.stock,
      skuCode: s.skuCode,
      thumbUrl: s.thumbUrl,
      skuValues: s.optionValueIds?.map((id) => ({ optionValueId: id })),
    }));
  }

  private mapMedia(
    media: CreateProductDto['media'],
    productId?: number,
  ): DeepPartial<ProductMediaEntity>[] {
    if (!media) {
      return [];
    }
    return media.map((m) => ({
      id: m.id,
      productId,
      mediaId: m.mediaId,
      media: {
        id: m.mediaId,
        url: m.url,
        size: m.size,
        fileName: m.fileName,
      },
    }));
  }

  private mapDetails(
    details: CreateProductDto['details'],
    productId?: number,
  ): DeepPartial<ProductDetailEntity>[] {
    if (!details) {
      return [];
    }
    return details.map((d) => ({
      id: d.id,
      productId,
      fieldId: d.fieldId,
      spec: {
        id: d.fieldId,
        name: d.specName,
        value: d.specValue,
      },
    }));
  }

  private findIdsToRemove(
    existing: { id: number }[],
    incoming: { id?: number }[],
  ): number[] {
    const existingIds = existing.map((e) => Number(e.id));
    const incomingIds = incoming.filter((i) => i.id).map((i) => Number(i.id));
    return existingIds.filter((id) => !incomingIds.includes(id));
  }

  private async validateSkuOptionValues(
    dto: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    if (!dto.skus) {
      return;
    }
    const allIds = dto.skus
      .filter((s) => !s.id)
      .flatMap((s) => s.optionValueIds);
    if (allIds.length === 0) {
      return;
    }
    const uniqueIds = [...new Set(allIds)];
    const found = await this.optionValueRepository.findByIds(uniqueIds);
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Some option value IDs are invalid');
    }
  }

  private async updateProductFields(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    const { name, description } = dto;
    if (name === undefined && description === undefined) {
      return;
    }
    await this.productRepository.update(id, { name, description });
  }

  private async syncSubEntities(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    if (dto.skus) {
      await this.syncSkus(id, dto.skus);
    }
    if (dto.media) {
      await this.syncMedia(id, dto.media);
    }
    if (dto.details) {
      await this.syncDetails(id, dto.details);
    }
  }

  private async syncSkus(
    productId: number,
    incoming: NonNullable<UpdateProductDto['skus']>,
  ): Promise<void> {
    const existing = await this.skuRepository.findByProductId(productId);
    const idsToRemove = this.findIdsToRemove(existing, incoming);

    await this.skuRepository.softRemoveByIds(idsToRemove);
    for (const s of incoming) {
      if (s.id) {
        await this.skuRepository.update(Number(s.id), {
          price: s.price,
          stock: s.stock,
          skuCode: s.skuCode,
          thumbUrl: s.thumbUrl,
        });
        continue;
      }
      await this.skuRepository.save({
        productId,
        price: s.price,
        stock: s.stock,
        skuCode: s.skuCode,
        thumbUrl: s.thumbUrl,
        skuValues: s.optionValueIds?.map((id) => ({ optionValueId: id })),
      });
    }
  }

  private async syncMedia(
    productId: number,
    incoming: NonNullable<UpdateProductDto['media']>,
  ): Promise<void> {
    const existing = await this.mediaRepository.findByProductId(productId);
    const idsToRemove = this.findIdsToRemove(existing, incoming);

    await this.mediaRepository.softRemoveByIds(idsToRemove);
    for (const m of incoming) {
      if (m.id) {
        await this.mediaRepository.save({
          id: Number(m.id),
          mediaId: m.mediaId,
        });
        continue;
      }
      await this.mediaRepository.save({
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

  private async syncDetails(
    productId: number,
    incoming: NonNullable<UpdateProductDto['details']>,
  ): Promise<void> {
    const existing = await this.detailRepository.findByProductId(productId);
    const idsToRemove = this.findIdsToRemove(existing, incoming);

    await this.detailRepository.softRemoveByIds(idsToRemove);
    for (const d of incoming) {
      if (d.id) {
        await this.detailRepository.update(Number(d.id), {
          fieldId: d.fieldId,
        });
        continue;
      }
      await this.detailRepository.save({
        productId,
        fieldId: d.fieldId,
        spec: {
          id: d.fieldId,
          name: d.specName,
          value: d.specValue,
        },
      });
    }
  }
}
