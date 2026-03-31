import { ApiProperty } from '@nestjs/swagger';
import {
  ProductSkuResponse,
  ProductMediaResponse,
  ProductDetailResponse,
} from './product-response.dto';

export class ProductSkuSingleResponse {
  @ApiProperty({ type: ProductSkuResponse })
  sku: ProductSkuResponse;
}

export class ProductMediaSingleResponse {
  @ApiProperty({ type: ProductMediaResponse })
  productMedia: ProductMediaResponse;
}

export class ProductDetailSingleResponse {
  @ApiProperty({ type: ProductDetailResponse })
  detail: ProductDetailResponse;
}

export class ProductSkuListResponse {
  @ApiProperty({ type: [ProductSkuResponse] })
  skus: ProductSkuResponse[];
}

export class ProductMediaListResponse {
  @ApiProperty({ type: [ProductMediaResponse] })
  productMedia: ProductMediaResponse[];
}

export class ProductDetailListResponse {
  @ApiProperty({ type: [ProductDetailResponse] })
  details: ProductDetailResponse[];
}
