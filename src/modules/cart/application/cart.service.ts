import { Inject, Injectable } from '@nestjs/common';
import { CartEntity } from '../domain/cart.entity';
import { CartItemSyncService } from './cart-item-sync.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import type { ICartRepository } from './interfaces/cart-repository.interface';
import { CART_REPOSITORY } from './interfaces/cart-repository.interface';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartItemSyncService: CartItemSyncService,
  ) {}

  async getOrCreateCart(userId: number): Promise<CartEntity> {
    const existing = await this.cartRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return this.cartRepository.save({ userId });
  }

  async getCart(userId: number) {
    const loaded = await this.cartRepository.findByUserIdWithItems(userId);
    if (loaded) {
      return { cart: loaded };
    }
    const cart = await this.cartRepository.save({ userId });
    return { cart: { ...cart, items: [] } };
  }

  async syncItems(userId: number, dto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemSyncService.validate(dto.items);
    await this.cartItemSyncService.sync(cart.id, dto.items);
    const loaded = await this.cartRepository.findByUserIdWithItems(userId);
    return { cart: loaded! };
  }
}
