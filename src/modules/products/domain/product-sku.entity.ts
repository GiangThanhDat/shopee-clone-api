import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { SkuValueEntity } from './sku-value.entity';

@Entity('product_skus')
export class ProductSkuEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'bigint' })
  stock: number;

  @Column({ name: 'sku_code', type: 'varchar', length: 255 })
  skuCode: string;

  @Column({ name: 'thumb_url', type: 'varchar', length: 255 })
  thumbUrl: string;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.skus)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @OneToMany(() => SkuValueEntity, (skuValue) => skuValue.sku, {
    cascade: ['insert'],
  })
  skuValues: SkuValueEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
