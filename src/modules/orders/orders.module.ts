import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { OrderEntity } from './domain/order.entity';
import { OrderDetailEntity } from './domain/order-detail.entity';
import { ORDER_REPOSITORY } from './application/interfaces/order-repository.interface';
import { OrderRepository } from './infrastructure/order.repository';
import { OrderPriceVerifier } from './application/order-price-verifier.service';
import { OrderService } from './application/order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity]),
    ProductsModule,
  ],
  controllers: [OrderController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    OrderPriceVerifier,
    OrderService,
  ],
  exports: [TypeOrmModule, OrderService],
})
export class OrdersModule {}
