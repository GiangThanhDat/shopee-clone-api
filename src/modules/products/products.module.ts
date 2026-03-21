import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './domain/product.entity';
import { ProductSpecEntity } from './domain/product-spec.entity';
import { ProductDetailEntity } from './domain/product-detail.entity';
import { MediaEntity } from './domain/media.entity';
import { ProductMediaEntity } from './domain/product-media.entity';
import { ProductOptionEntity } from './domain/product-option.entity';
import { ProductOptionValueEntity } from './domain/product-option-value.entity';
import { ProductSkuEntity } from './domain/product-sku.entity';
import { SkuValueEntity } from './domain/sku-value.entity';
import { PRODUCT_REPOSITORY } from './application/interfaces/product-repository.interface';
import { ProductRepository } from './infrastructure/product.repository';
import { ProductService } from './application/product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductSpecEntity,
      ProductDetailEntity,
      MediaEntity,
      ProductMediaEntity,
      ProductOptionEntity,
      ProductOptionValueEntity,
      ProductSkuEntity,
      SkuValueEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    ProductService,
  ],
  exports: [TypeOrmModule, ProductService],
})
export class ProductsModule {}
