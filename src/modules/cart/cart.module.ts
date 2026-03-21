import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './domain/cart.entity';
import { CART_REPOSITORY } from './application/interfaces/cart-repository.interface';
import { CartRepository } from './infrastructure/cart.repository';
import { CartService } from './application/cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity])],
  controllers: [CartController],
  providers: [
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
    CartService,
  ],
  exports: [TypeOrmModule, CartService],
})
export class CartModule {}
