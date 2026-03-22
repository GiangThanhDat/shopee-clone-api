import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ErrorResponseDto } from '../../common/dto/api-response.dto';
import { CreateProductDto } from './application/dto/create-product.dto';
import { ProductFilterDto } from './application/dto/product-filter.dto';
import { ProductListDataDto } from './application/dto/product-list-response.dto';
import {
  ProductResponse,
  ProductSingleDataDto,
} from './application/dto/product-response.dto';
import { UpdateProductDto } from './application/dto/update-product.dto';
import { ProductService } from './application/product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductListDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Products retrieved successfully')
  async findAll(
    @Query() filterDto: ProductFilterDto,
  ): Promise<ProductListDataDto> {
    return this.productService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Product retrieved successfully')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ product: ProductResponse }> {
    return this.productService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductSingleDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Product created successfully')
  async create(@Body() dto: CreateProductDto): Promise<ProductSingleDataDto> {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductSingleDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Product updated successfully')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductSingleDataDto> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductSingleDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Product deleted successfully')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
