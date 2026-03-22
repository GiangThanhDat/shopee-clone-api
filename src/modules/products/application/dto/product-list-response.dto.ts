import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../common/dto/api-response.dto';
import { ProductResponse } from './product-response.dto';

export class ProductListMetadataDto {
  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}

export class ProductListDataDto {
  @ApiProperty({ type: [ProductResponse] })
  products: ProductResponse[];

  @ApiPropertyOptional({ type: ProductListMetadataDto })
  metadata?: ProductListMetadataDto;
}
