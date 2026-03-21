import { ApiProperty } from '@nestjs/swagger';
import {
  ProductOptionResponse,
  ProductSkuResponse,
  ProductMediaResponse,
  ProductDetailResponse,
  OptionValueResponse,
} from './product-response.dto';

export class ProductOptionDataDto {
  @ApiProperty({ type: ProductOptionResponse })
  option: ProductOptionResponse;
}

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

export class OptionValueDataDto {
  @ApiProperty({ type: OptionValueResponse })
  value: OptionValueResponse;
}
