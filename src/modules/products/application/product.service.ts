import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PaginationMeta } from '../../../common/interfaces/api-response.interface';
import { ProductEntity } from '../domain/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async findAll(filterDto: ProductFilterDto) {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;
    const [products, totalItems] = await this.productRepository.findAll({
      ...filterDto,
      page,
      limit,
    });
    const pagination = this.buildPaginationMeta(totalItems, page, limit);
    return { products, metadata: { pagination } };
  }

  async findById(id: number): Promise<{ product: ProductEntity }> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { product };
  }

  async create(dto: CreateProductDto): Promise<{ product: ProductEntity }> {
    const product = await this.productRepository.create(dto);
    return { product };
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<{ product: ProductEntity }> {
    await this.findById(id);
    const updated = await this.productRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { product: updated };
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.productRepository.remove(id);
  }

  private buildPaginationMeta(
    totalItems: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    return {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}
