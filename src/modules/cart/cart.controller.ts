import {
  Controller,
  Get,
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
import { ErrorResponseDto } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CartService } from './application/cart.service';
import { AddToCartDto } from './application/dto/add-to-cart.dto';
import { UpdateCartDto } from './application/dto/update-cart.dto';
import {
  CartListDataDto,
  CartItemDataDto,
} from './application/dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartListDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart retrieved successfully')
  async getCart(
    @CurrentUser('userId') userId: number,
  ): Promise<CartListDataDto> {
    return this.cartService.getCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartItemDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'SKU already in cart',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Item added to cart')
  async addItem(
    @CurrentUser('userId') userId: number,
    @Body() dto: AddToCartDto,
  ): Promise<CartItemDataDto> {
    return this.cartService.addItem(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated',
    type: CartItemDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart item updated')
  async updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateCartDto,
  ): Promise<CartItemDataDto> {
    return this.cartService.updateQuantity(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Cart item removed' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart item removed')
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<Record<string, never>> {
    await this.cartService.removeItem(id, userId);
    return {};
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart cleared')
  async clearCart(
    @CurrentUser('userId') userId: number,
  ): Promise<Record<string, never>> {
    await this.cartService.clearCart(userId);
    return {};
  }
}
