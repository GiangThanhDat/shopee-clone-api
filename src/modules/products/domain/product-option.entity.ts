import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductOptionValueEntity } from './product-option-value.entity';

@Entity('product_options')
export class ProductOptionEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.options)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @OneToMany(() => ProductOptionValueEntity, (value) => value.productOption, {
    cascade: ['insert'],
  })
  values: ProductOptionValueEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
