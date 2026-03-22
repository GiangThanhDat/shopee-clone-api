import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { ICartRepository } from './interfaces/cart-repository.interface';
import { CART_REPOSITORY } from './interfaces/cart-repository.interface';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async getCart(userId: number) {
    const items = await this.cartRepository.findByUserId(userId);
    return { items };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const existing = await this.cartRepository.findByUserAndSku(
      userId,
      dto.skuId,
    );
    if (existing) {
      throw new BadRequestException(
        'SKU already in cart. Use PATCH to update quantity.',
      );
    }
    const item = await this.cartRepository.save({
      userId,
      skuId: dto.skuId,
      quantity: dto.quantity,
    });
    return { item };
  }

  async updateQuantity(id: number, userId: number, dto: UpdateCartDto) {
    const item = await this.findOwnedItem(id, userId);
    const updated = await this.cartRepository.update(item.id, {
      quantity: dto.quantity,
    });
    if (!updated) {
      throw new NotFoundException(`Cart item ${id} not found`);
    }
    return { item: updated };
  }

  async removeItem(id: number, userId: number) {
    const item = await this.findOwnedItem(id, userId);
    await this.cartRepository.remove(id);
    return { item };
  }

  async clearCart(userId: number) {
    const items = await this.cartRepository.findByUserId(userId);
    await this.cartRepository.clearByUserId(userId);
    return { items };
  }

  private async findOwnedItem(id: number, userId: number) {
    const item = await this.cartRepository.findByIdAndUser(id, userId);
    if (!item) {
      throw new NotFoundException(`Cart item ${id} not found`);
    }
    return item;
  }
}
