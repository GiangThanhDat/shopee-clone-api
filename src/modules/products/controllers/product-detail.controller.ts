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
import { ProductDetailService } from '../application/product-detail.service';
import { CreateProductDetailDto } from '../application/dto/create-product-detail.dto';
import { UpdateProductDetailDto } from '../application/dto/update-product-detail.dto';
import {
  ProductDetailDataDto,
  ProductDetailListDataDto,
} from '../application/dto/sub-entity-response.dto';

@ApiTags('Product Details')
@ApiBearerAuth()
@Controller('products/:productId/details')
export class ProductDetailController {
  constructor(private readonly detailService: ProductDetailService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List product specifications' })
  @ApiResponse({ status: 200, type: ProductDetailListDataDto })
  @ResponseMessage('Details retrieved successfully')
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.detailService.findByProductId(productId);
  }

  @Get(':detailId')
  @Public()
  @ApiOperation({ summary: 'Get product specification detail' })
  @ApiResponse({ status: 200, type: ProductDetailDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Detail retrieved successfully')
  findOne(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.detailService.findById(detailId);
  }

  @Post()
  @ApiOperation({ summary: 'Add specification to product' })
  @ApiResponse({ status: 201, type: ProductDetailDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ResponseMessage('Detail added successfully')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductDetailDto,
  ) {
    return this.detailService.addDetail(productId, dto);
  }

  @Patch(':detailId')
  @ApiOperation({ summary: 'Update product specification' })
  @ApiResponse({ status: 200, type: ProductDetailDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Detail updated successfully')
  update(
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() dto: UpdateProductDetailDto,
  ) {
    return this.detailService.updateDetail(detailId, dto);
  }

  @Delete(':detailId')
  @ApiOperation({ summary: 'Remove product specification' })
  @ApiResponse({ status: 200, type: ProductDetailDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Detail deleted successfully')
  remove(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.detailService.removeDetail(detailId);
  }
}
