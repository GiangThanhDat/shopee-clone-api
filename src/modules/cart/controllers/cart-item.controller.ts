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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CartItemService } from '../application/cart-item.service';
import { AddToCartDto } from '../application/dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from '../application/dto/update-cart-quantity.dto';
import {
  CartSingleResponse,
  CartItemSingleResponse,
  CartItemListResponse,
} from '../application/dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart/items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items in current user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart items retrieved successfully',
    type: CartItemListResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart items retrieved successfully')
  async findAll(
    @CurrentUser('userId') userId: number,
  ): Promise<CartItemListResponse> {
    return this.cartItemService.findByCartId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a single item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartItemSingleResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'SKU already in cart or invalid SKU',
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
  ): Promise<CartItemSingleResponse> {
    return this.cartItemService.addItem(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated',
    type: CartItemSingleResponse,
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
    @Body() dto: UpdateCartQuantityDto,
  ): Promise<CartItemSingleResponse> {
    return this.cartItemService.updateQuantity(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a cart item' })
  @ApiResponse({
    status: 200,
    description: 'Cart item removed',
    type: CartItemSingleResponse,
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
  @ResponseMessage('Cart item removed')
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<CartItemSingleResponse> {
    return this.cartItemService.removeItem(id, userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Soft delete all items in cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared',
    type: CartSingleResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart cleared')
  async clearCart(@CurrentUser('userId') userId: number): Promise<CartSingleResponse> {
    return this.cartItemService.clearCart(userId);
  }
}
