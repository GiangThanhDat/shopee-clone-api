import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { OrderService } from './application/order.service';
import { CreateOrderDto } from './application/dto/create-order.dto';
import { OrderFilterDto } from './application/dto/order-filter.dto';
import { UpdateOrderStatusDto } from './application/dto/update-order-status.dto';
import {
  OrderListDataDto,
  OrderDetailDataDto,
} from './application/dto/order-response.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get order history with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Orders retrieved successfully')
  async findAll(
    @CurrentUser('userId') userId: number,
    @Query() filterDto: OrderFilterDto,
  ): Promise<OrderListDataDto> {
    return this.orderService.findAll(userId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderDetailDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Order retrieved successfully')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<OrderDetailDataDto> {
    return this.orderService.findById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderDetailDataDto,
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
    description: 'SKU not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Order created successfully')
  async create(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDetailDataDto> {
    return this.orderService.create(userId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: OrderDetailDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Order status updated')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailDataDto> {
    return this.orderService.updateStatus(id, userId, dto);
  }
}
