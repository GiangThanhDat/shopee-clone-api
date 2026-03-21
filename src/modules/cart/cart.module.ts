import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './domain/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity])],
  exports: [TypeOrmModule],
})
export class CartModule {}
