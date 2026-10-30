import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CartEntity } from './domain/cart.entity';
import { CartItemEntity } from './domain/cart-item.entity';
import { CART_REPOSITORY } from './application/interfaces/cart-repository.interface';
import { CART_ITEM_REPOSITORY } from './application/interfaces/cart-item-repository.interface';
import { CartRepository } from './infrastructure/cart.repository';
import { CartItemRepository } from './infrastructure/cart-item.repository';
import { CartService } from './application/cart.service';
import { CartItemService } from './application/cart-item.service';
import { CartItemSyncService } from './application/cart-item-sync.service';
import { CartController } from './cart.controller';
import { CartItemController } from './controllers/cart-item.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    ProductsModule,
  ],
  controllers: [CartController, CartItemController],
  providers: [
    { provide: CART_REPOSITORY, useClass: CartRepository },
    { provide: CART_ITEM_REPOSITORY, useClass: CartItemRepository },
    CartService,
    CartItemService,
    CartItemSyncService,
  ],
  exports: [TypeOrmModule, CartService],
})
export class CartModule {}
