import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OptionValueResponse } from '../../../options/application/dto/option-response.dto';
import { MediaResponse } from '../../../media/application/dto/media-response.dto';

export class ProductMediaResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: MediaResponse })
  media: MediaResponse;
}

export class SkuValueResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: OptionValueResponse })
  optionValue: OptionValueResponse;
}

export class ProductSkuResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 29990000 })
  price: number;

  @ApiProperty({ example: 150 })
  stock: number;

  @ApiProperty({ example: 'IP15PM-RED-256' })
  skuCode: string;

  @ApiProperty({ example: 'https://cdn.example.com/thumb.jpg' })
  thumbUrl: string;

  @ApiProperty({ type: [SkuValueResponse] })
  skuValues: SkuValueResponse[];
}

export class SpecResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Screen Size' })
  name: string;

  @ApiPropertyOptional({ example: '6.7 inches' })
  value: string | null;
}

export class ProductDetailResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: SpecResponse })
  spec: SpecResponse;
}

export class ProductResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Apple smartphone with A17 Pro chip',
  })
  description: string | null;

  @ApiProperty({ type: [ProductSkuResponse] })
  skus: ProductSkuResponse[];

  @ApiProperty({ type: [ProductMediaResponse] })
  productMedia: ProductMediaResponse[];

  @ApiProperty({ type: [ProductDetailResponse] })
  details: ProductDetailResponse[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class ProductSingleDataDto {
  @ApiProperty({ type: ProductResponse })
  product: ProductResponse;
}
