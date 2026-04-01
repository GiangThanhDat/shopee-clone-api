import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ICartItemQueryRepository,
  ICartItemCommandRepository,
} from './interfaces/cart-item-repository.interface';
import {
  CART_ITEM_QUERY_REPOSITORY,
  CART_ITEM_COMMAND_REPOSITORY,
} from './interfaces/cart-item-repository.interface';
import type { IProductSkuQueryRepository } from '../../products/application/interfaces/product-sku-repository.interface';
import { PRODUCT_SKU_QUERY_REPOSITORY } from '../../products/application/interfaces/product-sku-repository.interface';
import { Quantity } from '../../../common/value-objects/quantity.vo';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto';

@Injectable()
export class CartItemService {
  constructor(
    @Inject(CART_ITEM_QUERY_REPOSITORY)
    private readonly cartItemQueryRepository: ICartItemQueryRepository,
    @Inject(CART_ITEM_COMMAND_REPOSITORY)
    private readonly cartItemCommandRepository: ICartItemCommandRepository,
    @Inject(PRODUCT_SKU_QUERY_REPOSITORY)
    private readonly skuQueryRepository: IProductSkuQueryRepository,
    private readonly cartService: CartService,
  ) {}

  async findByCartId(userId: number) {
    const cart = await this.cartService.getOrCreateCart(userId);
    const items = await this.cartItemQueryRepository.findByCartId(cart.id);
    return { items };
  }

  async findById(id: number, cartId: number) {
    const item = await this.cartItemQueryRepository.findByIdAndCart(id, cartId);
    if (!item) {
      throw new NotFoundException(`Cart item ${id} not found`);
    }
    return { item };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    await this.validateSku(dto.skuId);
    const cart = await this.cartService.getOrCreateCart(userId);
    await this.ensureSkuNotInCart(cart.id, dto.skuId);
    const deleted = await this.cartItemQueryRepository.findDeletedByCartAndSku(
      cart.id,
      dto.skuId,
    );
    if (deleted) {
      return this.restoreItem(deleted.id, dto.quantity);
    }
    return this.createItem(cart.id, dto);
  }

  private async validateSku(skuId: number): Promise<void> {
    const sku = await this.skuQueryRepository.findById(skuId);
    if (!sku) {
      throw new NotFoundException(`SKU ${skuId} not found`);
    }
  }

  private async ensureSkuNotInCart(
    cartId: number,
    skuId: number,
  ): Promise<void> {
    const existing = await this.cartItemQueryRepository.findByCartAndSku(
      cartId,
      skuId,
    );
    if (existing) {
      throw new BadRequestException(
        'SKU already in cart. Use PATCH to update quantity.',
      );
    }
  }

  private async restoreItem(id: number, quantity: number) {
    const restored = await this.cartItemCommandRepository.restore(id, {
      quantity: Quantity.of(quantity).toNumber(),
    });
    if (!restored) {
      throw new NotFoundException(`Cart item not found after restore`);
    }
    return { item: restored };
  }

  private async createItem(cartId: number, dto: AddToCartDto) {
    const saved = await this.cartItemCommandRepository.save({
      cartId,
      skuId: dto.skuId,
      quantity: Quantity.of(dto.quantity).toNumber(),
    });
    const item = await this.cartItemQueryRepository.findByIdAndCart(
      saved.id,
      cartId,
    );
    if (!item) {
      throw new NotFoundException(`Cart item not found after save`);
    }
    return { item };
  }

  async updateQuantity(id: number, userId: number, dto: UpdateCartQuantityDto) {
    const cart = await this.cartService.getOrCreateCart(userId);
    const { item } = await this.findById(id, cart.id);
    const updated = await this.cartItemCommandRepository.update(item.id, {
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
    await this.cartItemCommandRepository.softRemoveByIds([item.id]);
    return { item };
  }

  async clearCart(userId: number) {
    const cart = await this.cartService.getOrCreateCart(userId);
    await this.cartItemCommandRepository.softRemoveAllByCartId(cart.id);
    const updated = await this.cartService.getCart(userId);
    return updated;
  }
}
