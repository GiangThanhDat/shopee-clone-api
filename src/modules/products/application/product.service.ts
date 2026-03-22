import {
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { buildPaginationMeta } from '../../../common/utils/pagination';
import { ProductEntity } from '../domain/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';
import { ProductOrchestrator } from './product-orchestrator.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly orchestrator: ProductOrchestrator,
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

  async create(dto: CreateProductDto): Promise<{ product: ProductEntity }> {
    const product = await this.orchestrator.create(dto);
    if (!product) {
      throw new PreconditionFailedException();
    }
    return { product };
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<{ product: ProductEntity }> {
    await this.findById(id);
    const product = await this.orchestrator.update(id, dto);
    if (!product) {
      throw new PreconditionFailedException();
    }
    return { product };
  }

  async remove(id: number) {
    const { product } = await this.findById(id);
    await this.productRepository.remove(id);
    return { product };
  }
}
