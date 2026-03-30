import { Controller, Get, Patch, Body } from '@nestjs/common';
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
import { UpdateCartDto } from './application/dto/update-cart.dto';
import { CartDataDto } from './application/dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart with all items' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart retrieved successfully')
  async getCart(@CurrentUser('userId') userId: number): Promise<CartDataDto> {
    return this.cartService.getCart(userId);
  }

  @Patch()
  @ApiOperation({
    summary:
      'Sync cart items — items with id are updated, items without id are created, existing items not in payload are soft-deleted',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart synced successfully',
    type: CartDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid SKU or payload',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Cart synced successfully')
  async syncItems(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateCartDto,
  ): Promise<CartDataDto> {
    return this.cartService.syncItems(userId, dto);
  }
}
