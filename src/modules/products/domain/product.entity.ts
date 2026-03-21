import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductOptionEntity } from './product-option.entity';
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

  @OneToMany(() => ProductOptionEntity, (option) => option.product)
  options: ProductOptionEntity[];

  @OneToMany(() => ProductSkuEntity, (sku) => sku.product)
  skus: ProductSkuEntity[];

  @OneToMany(() => ProductMediaEntity, (media) => media.product)
  productMedia: ProductMediaEntity[];

  @OneToMany(() => ProductDetailEntity, (detail) => detail.product)
  details: ProductDetailEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
