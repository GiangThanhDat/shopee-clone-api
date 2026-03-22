import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../domain/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { CreateProductMediaDto } from './dto/create-product-media.dto';
import type { CreateProductDetailDto } from './dto/create-product-detail.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';
import { ProductSkuService } from './product-sku.service';

@Injectable()
export class ProductOrchestrator {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly skuService: ProductSkuService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity | null> {
    return this.dataSource.transaction(async () => {
      const graph = this.buildCascadeGraph(dto);
      const product = await this.productRepository.create(graph);
      await this.createSkus(product.id, dto);
      return this.productRepository.findById(product.id);
    });
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductEntity | null> {
    return this.dataSource.transaction(async () => {
      await this.updateProductFields(id, dto);
      await this.appendCascadeEntities(id, dto);
      await this.createSkus(id, dto);
      return this.productRepository.findById(id);
    });
  }

  private buildCascadeGraph(dto: CreateProductDto): Partial<ProductEntity> {
    const graph: Partial<ProductEntity> = {
      name: dto.name,
      description: dto.description,
    };
    this.applyMedia(graph, dto.media);
    this.applyDetails(graph, dto.details);
    return graph;
  }

  private applyMedia(
    graph: Partial<ProductEntity>,
    media?: CreateProductMediaDto[],
    productId?: number,
  ): void {
    if (!media) {
      return;
    }
    graph.productMedia = media.map((m) => {
      if (m.mediaId) {
        return {
          mediaId: m.mediaId,
          ...(productId ? { productId } : {}),
        } as ProductEntity['productMedia'][number];
      }
      return {
        ...(productId ? { productId } : {}),
        media: { url: m.url, size: m.size, fileName: m.fileName },
      } as ProductEntity['productMedia'][number];
    });
  }

  private applyDetails(
    graph: Partial<ProductEntity>,
    details?: CreateProductDetailDto[],
    productId?: number,
  ): void {
    if (!details) {
      return;
    }
    graph.details = details.map((d) => {
      if (d.fieldId) {
        return {
          fieldId: d.fieldId,
          ...(productId ? { productId } : {}),
        } as ProductEntity['details'][number];
      }
      return {
        ...(productId ? { productId } : {}),
        spec: { name: d.specName, value: d.specValue },
      } as ProductEntity['details'][number];
    });
  }

  private async createSkus(
    productId: number,
    dto: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    if (!dto.skus) {
      return;
    }
    for (const skuDto of dto.skus) {
      if (skuDto.id) {
        continue;
      }
      await this.skuService.createSku(productId, skuDto);
    }
  }

  private async updateProductFields(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    const { name, description } = dto;
    if (name !== undefined || description !== undefined) {
      await this.productRepository.update(id, { name, description });
    }
  }

  private async appendCascadeEntities(
    id: number,
    dto: UpdateProductDto,
  ): Promise<void> {
    if (!dto.media && !dto.details) {
      return;
    }
    const graph: Partial<ProductEntity> = {};
    this.applyMedia(graph, dto.media, id);
    this.applyDetails(graph, dto.details, id);
    await this.productRepository.create({
      ...graph,
      id,
    } as Partial<ProductEntity>);
  }
}
