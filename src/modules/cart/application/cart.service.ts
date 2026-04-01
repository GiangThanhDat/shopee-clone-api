import { Inject, Injectable } from '@nestjs/common';
import { CartEntity } from '../domain/cart.entity';
import { CartItemSyncService } from './cart-item-sync.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import type {
  ICartQueryRepository,
  ICartCommandRepository,
} from './interfaces/cart-repository.interface';
import {
  CART_QUERY_REPOSITORY,
  CART_COMMAND_REPOSITORY,
} from './interfaces/cart-repository.interface';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_QUERY_REPOSITORY)
    private readonly cartQueryRepository: ICartQueryRepository,
    @Inject(CART_COMMAND_REPOSITORY)
    private readonly cartCommandRepository: ICartCommandRepository,
    private readonly cartItemSyncService: CartItemSyncService,
  ) {}

  async getOrCreateCart(userId: number): Promise<CartEntity> {
    const existing = await this.cartQueryRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return this.cartCommandRepository.save({ userId });
  }

  async getCart(userId: number) {
    const loaded = await this.cartQueryRepository.findByUserIdWithItems(userId);
    if (loaded) {
      return { cart: loaded };
    }
    const cart = await this.cartCommandRepository.save({ userId });
    return { cart: { ...cart, items: [] } };
  }

  async syncItems(userId: number, dto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemSyncService.validate(dto.items);
    await this.cartItemSyncService.sync(cart.id, dto.items);
    const loaded = await this.cartQueryRepository.findByUserIdWithItems(userId);
    return { cart: loaded! };
  }
}
