import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductSpecEntity } from './product-spec.entity';

@Entity('product_details')
export class ProductDetailEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.details)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'field_id', type: 'bigint' })
  fieldId: number;

  @ManyToOne(() => ProductSpecEntity)
  @JoinColumn({ name: 'field_id' })
  spec: ProductSpecEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
