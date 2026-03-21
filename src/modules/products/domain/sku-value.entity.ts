import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSkuEntity } from './product-sku.entity';
import { ProductOptionValueEntity } from './product-option-value.entity';

@Entity('sku_values')
export class SkuValueEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => ProductSkuEntity, (sku) => sku.skuValues)
  @JoinColumn({ name: 'sku_id' })
  sku: ProductSkuEntity;

  @ManyToOne(() => ProductOptionValueEntity)
  @JoinColumn({ name: 'option_value_id' })
  optionValue: ProductOptionValueEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
