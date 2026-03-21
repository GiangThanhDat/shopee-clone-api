import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { MediaEntity } from './media.entity';

@Entity('product_media')
export class ProductMediaEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => ProductEntity, (product) => product.productMedia)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => MediaEntity)
  @JoinColumn({ name: 'media_id' })
  media: MediaEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
