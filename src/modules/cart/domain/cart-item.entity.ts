import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { CartEntity } from './cart.entity';
import { ProductSkuEntity } from '../../products/domain/product-sku.entity';

@Entity('cart_items')
@Index('UQ_cart_items_cart_sku_active', ['cartId', 'skuId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class CartItemEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'cart_id', type: 'bigint' })
  cartId: number;

  @Column({ name: 'sku_id', type: 'bigint' })
  skuId: number;

  @Column({ type: 'bigint' })
  quantity: number;

  @ManyToOne(() => CartEntity, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => ProductSkuEntity)
  @JoinColumn({ name: 'sku_id' })
  sku: ProductSkuEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
