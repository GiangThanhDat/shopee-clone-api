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
import { ProductOptionService } from '../application/product-option.service';
import { CreateProductOptionDto } from '../application/dto/create-product-option.dto';
import { UpdateProductOptionDto } from '../application/dto/update-product-option.dto';
import { CreateOptionValueDto } from '../application/dto/create-option-value.dto';
import { UpdateOptionValueDto } from '../application/dto/update-option-value.dto';
import {
  ProductOptionDataDto,
  OptionValueDataDto,
} from '../application/dto/sub-entity-response.dto';

@ApiTags('Product Options')
@ApiBearerAuth()
@Controller('products/:productId/options')
export class ProductOptionController {
  constructor(private readonly optionService: ProductOptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create product option' })
  @ApiResponse({ status: 201, type: ProductOptionDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option created successfully')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductOptionDto,
  ) {
    return this.optionService.createOption(productId, dto);
  }

  @Patch(':optionId')
  @ApiOperation({ summary: 'Update product option' })
  @ApiResponse({ status: 200, type: ProductOptionDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option updated successfully')
  update(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Body() dto: UpdateProductOptionDto,
  ) {
    return this.optionService.updateOption(optionId, dto);
  }

  @Delete(':optionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product option' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  remove(@Param('optionId', ParseIntPipe) optionId: number) {
    return this.optionService.removeOption(optionId);
  }

  @Post(':optionId/values')
  @ApiOperation({ summary: 'Add option value' })
  @ApiResponse({ status: 201, type: OptionValueDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option value created successfully')
  createValue(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Body() dto: CreateOptionValueDto,
  ) {
    return this.optionService.createValue(optionId, dto);
  }

  @Patch(':optionId/values/:valueId')
  @ApiOperation({ summary: 'Update option value' })
  @ApiResponse({ status: 200, type: OptionValueDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option value updated successfully')
  updateValue(
    @Param('valueId', ParseIntPipe) valueId: number,
    @Body() dto: UpdateOptionValueDto,
  ) {
    return this.optionService.updateValue(valueId, dto);
  }

  @Delete(':optionId/values/:valueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete option value' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  removeValue(@Param('valueId', ParseIntPipe) valueId: number) {
    return this.optionService.removeValue(valueId);
  }
}
