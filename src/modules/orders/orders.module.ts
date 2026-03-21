import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './domain/order.entity';
import { OrderDetailEntity } from './domain/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity])],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
