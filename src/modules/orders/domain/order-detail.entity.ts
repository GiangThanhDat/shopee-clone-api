import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { ProductSkuEntity } from '../../products/domain/product-sku.entity';

@Entity('order_details')
export class OrderDetailEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'shipping_fee', type: 'double precision' })
  shippingFee: number;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'bigint' })
  quantity: number;

  @Column({ name: 'discount_percent', type: 'bigint', default: 0 })
  discountPercent: number;

  @Column({ type: 'double precision', default: 0 })
  subtotal: number;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'sku_id', type: 'bigint' })
  skuId: number;

  @ManyToOne(() => OrderEntity, (order) => order.details)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ProductSkuEntity)
  @JoinColumn({ name: 'sku_id' })
  sku: ProductSkuEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
