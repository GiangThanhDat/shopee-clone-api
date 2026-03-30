import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './domain/product.entity';
import { ProductSpecEntity } from './domain/product-spec.entity';
import { ProductDetailEntity } from './domain/product-detail.entity';
import { ProductMediaEntity } from './domain/product-media.entity';
import { ProductSkuEntity } from './domain/product-sku.entity';
import { SkuValueEntity } from './domain/sku-value.entity';
import { OptionsModule } from '../options/options.module';
import { MediaModule } from '../media/media.module';
import { PRODUCT_REPOSITORY } from './application/interfaces/product-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from './application/interfaces/product-sku-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from './application/interfaces/product-media-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from './application/interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './application/interfaces/product-spec-repository.interface';
import { ProductRepository } from './infrastructure/product.repository';
import { ProductSkuRepository } from './infrastructure/product-sku.repository';
import { ProductMediaRepository } from './infrastructure/product-media.repository';
import { ProductDetailRepository } from './infrastructure/product-detail.repository';
import { ProductSpecRepository } from './infrastructure/product-spec.repository';
import { ProductService } from './application/product.service';
import { ProductSkuService } from './application/product-sku.service';
import { ProductMediaService } from './application/product-media.service';
import { ProductDetailService } from './application/product-detail.service';
import { ProductOrchestrator } from './application/product-orchestrator.service';
import { SkuSyncService } from './application/sku-sync.service';
import { MediaSyncService } from './application/media-sync.service';
import { DetailSyncService } from './application/detail-sync.service';
import { ProductController } from './product.controller';
import { ProductSkuController } from './controllers/product-sku.controller';
import { ProductMediaController } from './controllers/product-media.controller';
import { ProductDetailController } from './controllers/product-detail.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductSpecEntity,
      ProductDetailEntity,
      ProductMediaEntity,
      ProductSkuEntity,
      SkuValueEntity,
    ]),
    OptionsModule,
    MediaModule,
  ],
  controllers: [
    ProductController,
    ProductSkuController,
    ProductMediaController,
    ProductDetailController,
  ],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    { provide: PRODUCT_SKU_REPOSITORY, useClass: ProductSkuRepository },
    { provide: PRODUCT_MEDIA_REPOSITORY, useClass: ProductMediaRepository },
    { provide: PRODUCT_DETAIL_REPOSITORY, useClass: ProductDetailRepository },
    { provide: PRODUCT_SPEC_REPOSITORY, useClass: ProductSpecRepository },
    SkuSyncService,
    MediaSyncService,
    DetailSyncService,
    ProductOrchestrator,
    ProductService,
    ProductSkuService,
    ProductMediaService,
    ProductDetailService,
  ],
  exports: [TypeOrmModule, ProductService, PRODUCT_SKU_REPOSITORY],
})
export class ProductsModule {}
