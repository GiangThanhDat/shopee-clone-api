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
import { PRODUCT_OPTION_REPOSITORY } from './application/interfaces/product-option-repository.interface';
import { OPTION_VALUE_REPOSITORY } from './application/interfaces/option-value-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './application/interfaces/product-sku-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './application/interfaces/product-media-repository.interface';
import { MEDIA_REPOSITORY } from './application/interfaces/media-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from './application/interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './application/interfaces/product-spec-repository.interface';
import { ProductRepository } from './infrastructure/product.repository';
import { ProductOptionRepository } from './infrastructure/product-option.repository';
import { OptionValueRepository } from './infrastructure/option-value.repository';
import { ProductSkuRepository } from './infrastructure/product-sku.repository';
import { ProductMediaRepository } from './infrastructure/product-media.repository';
import { MediaRepository } from './infrastructure/media.repository';
import { ProductDetailRepository } from './infrastructure/product-detail.repository';
import { ProductSpecRepository } from './infrastructure/product-spec.repository';
import { ProductService } from './application/product.service';
import { ProductOptionService } from './application/product-option.service';
import { ProductSkuService } from './application/product-sku.service';
import { ProductMediaService } from './application/product-media.service';
import { ProductDetailService } from './application/product-detail.service';
import { ProductController } from './product.controller';
import { ProductOptionController } from './controllers/product-option.controller';
import { ProductSkuController } from './controllers/product-sku.controller';
import { ProductMediaController } from './controllers/product-media.controller';
import { ProductDetailController } from './controllers/product-detail.controller';

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
  controllers: [
    ProductController,
    ProductOptionController,
    ProductSkuController,
    ProductMediaController,
    ProductDetailController,
  ],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    { provide: PRODUCT_OPTION_REPOSITORY, useClass: ProductOptionRepository },
    { provide: OPTION_VALUE_REPOSITORY, useClass: OptionValueRepository },
    { provide: PRODUCT_SKU_REPOSITORY, useClass: ProductSkuRepository },
    { provide: PRODUCT_MEDIA_REPOSITORY, useClass: ProductMediaRepository },
    { provide: MEDIA_REPOSITORY, useClass: MediaRepository },
    { provide: PRODUCT_DETAIL_REPOSITORY, useClass: ProductDetailRepository },
    { provide: PRODUCT_SPEC_REPOSITORY, useClass: ProductSpecRepository },
    ProductService,
    ProductOptionService,
    ProductSkuService,
    ProductMediaService,
    ProductDetailService,
  ],
  exports: [TypeOrmModule, ProductService],
})
export class ProductsModule {}
