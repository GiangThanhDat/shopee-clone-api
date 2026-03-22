import { ApiProperty } from '@nestjs/swagger';
import {
  ProductSkuResponse,
  ProductMediaResponse,
  ProductDetailResponse,
} from './product-response.dto';

export class ProductSkuDataDto {
  @ApiProperty({ type: ProductSkuResponse })
  sku: ProductSkuResponse;
}

export class ProductMediaDataDto {
  @ApiProperty({ type: ProductMediaResponse })
  productMedia: ProductMediaResponse;
}

export class ProductDetailDataDto {
  @ApiProperty({ type: ProductDetailResponse })
  detail: ProductDetailResponse;
}

export class ProductSkuListDataDto {
  @ApiProperty({ type: [ProductSkuResponse] })
  skus: ProductSkuResponse[];
}

export class ProductMediaListDataDto {
  @ApiProperty({ type: [ProductMediaResponse] })
  productMedia: ProductMediaResponse[];
}

export class ProductDetailListDataDto {
  @ApiProperty({ type: [ProductDetailResponse] })
  details: ProductDetailResponse[];
}
