import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/api-response.dto';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductSkuService } from '../application/product-sku.service';
import { CreateProductSkuDto } from '../application/dto/create-product-sku.dto';
import { UpdateProductSkuDto } from '../application/dto/update-product-sku.dto';
import {
  ProductSkuDataDto,
  ProductSkuListDataDto,
} from '../application/dto/sub-entity-response.dto';

@ApiTags('Product SKUs')
@ApiBearerAuth()
@Controller('products/:productId/skus')
export class ProductSkuController {
  constructor(private readonly skuService: ProductSkuService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List product SKUs' })
  @ApiResponse({ status: 200, type: ProductSkuListDataDto })
  @ResponseMessage('SKUs retrieved successfully')
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.skuService.findByProductId(productId);
  }

  @Get(':skuId')
  @Public()
  @ApiOperation({ summary: 'Get SKU detail' })
  @ApiResponse({ status: 200, type: ProductSkuDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('SKU retrieved successfully')
  findOne(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuService.findById(skuId);
  }

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
  @ApiOperation({ summary: 'Delete product SKU' })
  @ApiResponse({ status: 200, type: ProductSkuDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('SKU deleted successfully')
  remove(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuService.removeSku(skuId);
  }
}
