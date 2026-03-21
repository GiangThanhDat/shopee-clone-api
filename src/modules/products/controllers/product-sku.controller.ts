import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/api-response.dto';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ProductSkuService } from '../application/product-sku.service';
import { CreateProductSkuDto } from '../application/dto/create-product-sku.dto';
import { UpdateProductSkuDto } from '../application/dto/update-product-sku.dto';
import { ProductSkuDataDto } from '../application/dto/sub-entity-response.dto';

@ApiTags('Product SKUs')
@ApiBearerAuth()
@Controller('products/:productId/skus')
export class ProductSkuController {
  constructor(private readonly skuService: ProductSkuService) {}

  @Post()
  @ApiOperation({ summary: 'Create product SKU' })
  @ApiResponse({ status: 201, type: ProductSkuDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ResponseMessage('SKU created successfully')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductSkuDto,
  ) {
    return this.skuService.createSku(productId, dto);
  }

  @Patch(':skuId')
  @ApiOperation({ summary: 'Update product SKU' })
  @ApiResponse({ status: 200, type: ProductSkuDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('SKU updated successfully')
  update(
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() dto: UpdateProductSkuDto,
  ) {
    return this.skuService.updateSku(skuId, dto);
  }

  @Delete(':skuId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product SKU' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  remove(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuService.removeSku(skuId);
  }
}
