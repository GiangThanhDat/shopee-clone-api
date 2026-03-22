import {
  Controller,
  Get,
  Post,
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
import { ProductMediaService } from '../application/product-media.service';
import { CreateProductMediaDto } from '../application/dto/create-product-media.dto';
import {
  ProductMediaDataDto,
  ProductMediaListDataDto,
} from '../application/dto/sub-entity-response.dto';

@ApiTags('Product Media')
@ApiBearerAuth()
@Controller('products/:productId/media')
export class ProductMediaController {
  constructor(private readonly mediaService: ProductMediaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List product media' })
  @ApiResponse({ status: 200, type: ProductMediaListDataDto })
  @ResponseMessage('Media retrieved successfully')
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.mediaService.findByProductId(productId);
  }

  @Get(':mediaId')
  @Public()
  @ApiOperation({ summary: 'Get product media detail' })
  @ApiResponse({ status: 200, type: ProductMediaDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Media retrieved successfully')
  findOne(@Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.mediaService.findById(mediaId);
  }

  @Post()
  @ApiOperation({ summary: 'Add media to product' })
  @ApiResponse({ status: 201, type: ProductMediaDataDto })
  @ResponseMessage('Media added successfully')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductMediaDto,
  ) {
    return this.mediaService.addMedia(productId, dto);
  }

  @Delete(':mediaId')
  @ApiOperation({ summary: 'Remove media from product' })
  @ApiResponse({ status: 200, type: ProductMediaDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Media removed successfully')
  remove(@Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.mediaService.removeMedia(mediaId);
  }
}
