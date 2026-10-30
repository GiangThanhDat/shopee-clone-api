import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CART_ITEM_REPOSITORY,
  type ICartItemRepository,
} from './interfaces/cart-item-repository.interface';
import {
  PRODUCT_SKU_REPOSITORY,
  type IProductSkuRepository,
} from '../../products/application/interfaces/product-sku-repository.interface';
import type { UpdateCartItemDto } from './dto/update-cart.dto';
import { findIdsToRemove, rejectForeignIds } from '../../../common/utils/sync';

@Injectable()
export class CartItemSyncService {
  constructor(
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
    @Inject(PRODUCT_SKU_REPOSITORY)
    private readonly skuRepository: IProductSkuRepository,
  ) {}

  async validate(items: UpdateCartItemDto[]): Promise<void> {
    const skuIds = items.filter((i) => !i.id).map((i) => i.skuId);
    if (skuIds.length === 0) {
      return;
    }
    const uniqueIds = [...new Set(skuIds)];
    const found = await this.skuRepository.findByIds(uniqueIds);
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Some SKU IDs are invalid');
    }
  }

  async sync(cartId: number, incoming: UpdateCartItemDto[]): Promise<void> {
    const existing = await this.cartItemRepository.findByCartId(cartId);
    rejectForeignIds(existing, incoming);
    const idsToRemove = findIdsToRemove(existing, incoming);

    const toUpdate = incoming.filter((i) => i.id);
    const toCreate = incoming.filter((i) => !i.id);

    await this.cartItemRepository.softRemoveByIds(idsToRemove);
    await this.cartItemRepository.updateMany(
      toUpdate.map((i) => ({ id: Number(i.id), quantity: i.quantity })),
    );
    await this.cartItemRepository.saveMany(
      toCreate.map((i) => ({ cartId, skuId: i.skuId, quantity: i.quantity })),
    );
  }
}
