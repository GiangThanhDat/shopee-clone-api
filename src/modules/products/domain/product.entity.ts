import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSkuEntity } from './product-sku.entity';
import { ProductMediaEntity } from './product-media.entity';
import { ProductDetailEntity } from './product-detail.entity';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @OneToMany(() => ProductSkuEntity, (sku) => sku.product, {
    cascade: ['insert', 'update'],
  })
  skus: ProductSkuEntity[];

  @OneToMany(() => ProductMediaEntity, (media) => media.product, {
    cascade: ['insert', 'update'],
  })
  productMedia: ProductMediaEntity[];

  @OneToMany(() => ProductDetailEntity, (detail) => detail.product, {
    cascade: ['insert', 'update'],
  })
  details: ProductDetailEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
