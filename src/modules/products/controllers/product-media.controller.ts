import {
  Controller,
  Post,
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
import { ProductMediaService } from '../application/product-media.service';
import { CreateProductMediaDto } from '../application/dto/create-product-media.dto';
import { ProductMediaDataDto } from '../application/dto/sub-entity-response.dto';

@ApiTags('Product Media')
@ApiBearerAuth()
@Controller('products/:productId/media')
export class ProductMediaController {
  constructor(private readonly mediaService: ProductMediaService) {}

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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove media from product' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  remove(@Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.mediaService.removeMedia(mediaId);
  }
}
