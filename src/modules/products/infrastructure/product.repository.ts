import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { applyPagination } from '../../../common/utils/pagination';
import { ProductEntity } from '../domain/product.entity';
import {
  IProductRepository,
  ProductFilterQuery,
} from '../application/interfaces/product-repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findAll(query: ProductFilterQuery): Promise<[ProductEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('product');
    this.applySearchFilter(queryBuilder, query.search);
    this.applyPriceFilter(queryBuilder, query.minPrice, query.maxPrice);
    this.applySorting(queryBuilder, query.sortBy, query.sortOrder);
    applyPagination(queryBuilder, query.page, query.limit);
    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'skus',
        'skus.skuValues',
        'skus.skuValues.optionValue',
        'productMedia',
        'productMedia.media',
        'details',
        'details.spec',
      ],
    });
  }

  async create(product: DeepPartial<ProductEntity>): Promise<ProductEntity> {
    const entity = this.repository.create(product);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    product: DeepPartial<ProductEntity>,
  ): Promise<ProductEntity | null> {
    await this.repository.update(id, product);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  private applySearchFilter(
    queryBuilder: SelectQueryBuilder<ProductEntity>,
    search?: string,
  ): void {
    if (!search) {
      return;
    }
    queryBuilder.andWhere('product.name ILIKE :search', {
      search: `%${search}%`,
    });
  }

  private applyPriceFilter(
    queryBuilder: SelectQueryBuilder<ProductEntity>,
    minPrice?: number,
    maxPrice?: number,
  ): void {
    if (!minPrice && !maxPrice) {
      return;
    }
    queryBuilder.innerJoin('product.skus', 'sku');
    if (minPrice) {
      queryBuilder.andWhere('sku.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('sku.price <= :maxPrice', { maxPrice });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<ProductEntity>,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): void {
    const order = sortOrder ?? 'DESC';
    if (sortBy === 'price') {
      this.applySortByPrice(queryBuilder, order);
      return;
    }
    const column = sortBy === 'name' ? 'product.name' : 'product.createdAt';
    queryBuilder.orderBy(column, order);
  }

  private applySortByPrice(
    queryBuilder: SelectQueryBuilder<ProductEntity>,
    order: 'ASC' | 'DESC',
  ): void {
    queryBuilder
      .addSelect('MIN(priceSku.price)', 'min_price')
      .leftJoin('product.skus', 'priceSku')
      .groupBy('product.id')
      .orderBy('min_price', order);
  }
}
