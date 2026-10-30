import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { buildPaginationMeta } from '../../../common/utils/pagination';
import { ProductEntity } from '../domain/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from './interfaces/product-repository.interface';
import { SkuSyncService } from './sku-sync.service';
import { MediaSyncService } from './media-sync.service';
import { DetailSyncService } from './detail-sync.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly skuSync: SkuSyncService,
    private readonly mediaSync: MediaSyncService,
    private readonly detailSync: DetailSyncService,
  ) {}

  async findAll(filterDto: ProductFilterDto) {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;
    const [products, totalItems] = await this.productRepository.findAll({
      ...filterDto,
      page,
      limit,
    });
    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { products, metadata: { pagination } };
  }

  async findById(id: number): Promise<{ product: ProductEntity }> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { product };
  }

  @Transactional()
  async create(dto: CreateProductDto): Promise<{ product: ProductEntity }> {
    await this.skuSync.validate(dto.skus);
    const product = await this.productRepository.create(this.buildGraph(dto));
    return this.findById(product.id);
  }

  @Transactional()
  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<{ product: ProductEntity }> {
    await this.findById(id);
    await this.skuSync.validate(dto.skus);
    await this.updateProductFields(id, dto);
    await this.syncSubEntities(id, dto);
    return this.findById(id);
  }

  async remove(id: number) {
    const { product } = await this.findById(id);
    await this.productRepository.remove(id);
    return { product };
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
    await this.productRepository.update(id, { name, description });
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
