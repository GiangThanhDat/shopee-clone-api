import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import type { UpdateCartItemDto } from './dto/update-cart.dto';
import { findIdsToRemove } from '../../products/application/sync-utils';

@Injectable()
export class CartItemSyncService {
  constructor(
    @Inject(CART_ITEM_QUERY_REPOSITORY)
    private readonly cartItemQueryRepository: ICartItemQueryRepository,
    @Inject(CART_ITEM_COMMAND_REPOSITORY)
    private readonly cartItemCommandRepository: ICartItemCommandRepository,
    @Inject(PRODUCT_SKU_QUERY_REPOSITORY)
    private readonly skuQueryRepository: IProductSkuQueryRepository,
  ) {}

  async validate(items: UpdateCartItemDto[]): Promise<void> {
    const skuIds = items.filter((i) => !i.id).map((i) => i.skuId);
    if (skuIds.length === 0) {
      return;
    }
    const uniqueIds = [...new Set(skuIds)];
    const found = await this.skuQueryRepository.findByIds(uniqueIds);
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Some SKU IDs are invalid');
    }
  }

  async sync(cartId: number, incoming: UpdateCartItemDto[]): Promise<void> {
    const existing = await this.cartItemQueryRepository.findByCartId(cartId);
    const idsToRemove = findIdsToRemove(existing, incoming);

    const toUpdate = incoming.filter((i) => i.id);
    const toCreate = incoming.filter((i) => !i.id);

    await this.cartItemCommandRepository.softRemoveByIds(idsToRemove);
    await this.cartItemCommandRepository.updateMany(
      toUpdate.map((i) => ({ id: Number(i.id), quantity: i.quantity })),
    );
    await this.cartItemCommandRepository.saveMany(
      toCreate.map((i) => ({ cartId, skuId: i.skuId, quantity: i.quantity })),
    );
  }
}
