import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ICartItemRepository } from './interfaces/cart-item-repository.interface';
import { CART_ITEM_REPOSITORY } from './interfaces/cart-item-repository.interface';
import type { IProductSkuRepository } from '../../products/application/interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_REPOSITORY } from '../../products/application/interfaces/product-sku-repository.interface';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto';

@Injectable()
export class CartItemService {
  constructor(
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
    @Inject(PRODUCT_SKU_REPOSITORY)
    private readonly skuRepository: IProductSkuRepository,
    private readonly cartService: CartService,
  ) {}

  async findByCartId(userId: number) {
    const cart = await this.cartService.getOrCreateCart(userId);
    const items = await this.cartItemRepository.findByCartId(cart.id);
    return { items };
  }

  async findById(id: number, cartId: number) {
    const item = await this.cartItemRepository.findByIdAndCart(id, cartId);
    if (!item) {
      throw new NotFoundException(`Cart item ${id} not found`);
    }
    return { item };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const sku = await this.skuRepository.findById(dto.skuId);
    if (!sku) {
      throw new NotFoundException(`SKU ${dto.skuId} not found`);
    }
    const cart = await this.cartService.getOrCreateCart(userId);
    const existing = await this.cartItemRepository.findByCartAndSku(
      cart.id,
      dto.skuId,
    );
    if (existing) {
      throw new BadRequestException(
        'SKU already in cart. Use PATCH to update quantity.',
      );
    }
    const deleted = await this.cartItemRepository.findDeletedByCartAndSku(
      cart.id,
      dto.skuId,
    );
    if (deleted) {
      const restored = await this.cartItemRepository.restore(deleted.id, {
        quantity: dto.quantity,
      });
      if (!restored) {
        throw new NotFoundException(`Cart item not found after restore`);
      }
      return { item: restored };
    }
    const saved = await this.cartItemRepository.save({
      cartId: cart.id,
      skuId: dto.skuId,
      quantity: dto.quantity,
    });
    const item = await this.cartItemRepository.findByIdAndCart(
      saved.id,
      cart.id,
    );
    if (!item) {
      throw new NotFoundException(`Cart item not found after save`);
    }
    return { item };
  }

  async updateQuantity(id: number, userId: number, dto: UpdateCartQuantityDto) {
    const cart = await this.cartService.getOrCreateCart(userId);
    const { item } = await this.findById(id, cart.id);
    const updated = await this.cartItemRepository.update(item.id, {
      quantity: dto.quantity,
    });
    if (!updated) {
      throw new NotFoundException(`Cart item ${id} not found after update`);
    }
    return { item: updated };
  }

  async removeItem(id: number, userId: number) {
    const cart = await this.cartService.getOrCreateCart(userId);
    const { item } = await this.findById(id, cart.id);
    await this.cartItemRepository.softRemoveByIds([item.id]);
    return { item };
  }

  async clearCart(userId: number) {
    const cart = await this.cartService.getOrCreateCart(userId);
    await this.cartItemRepository.softRemoveAllByCartId(cart.id);
    const updated = await this.cartService.getCart(userId);
    return updated;
  }
}
