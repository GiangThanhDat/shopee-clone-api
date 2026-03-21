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
import { UserEntity } from '../../users/domain/user.entity';
import { OrderDetailEntity } from './order-detail.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'order_code', type: 'bigint' })
  orderCode: number;

  @Column({ name: 'total_amount', type: 'double precision' })
  totalAmount: number;

  @Column({ name: 'delivery_address', type: 'varchar', length: 255 })
  deliveryAddress: string;

  @Column({ name: 'order_status', type: 'bigint', default: 0 })
  orderStatus: number;

  @Column({ name: 'ordered_at', type: 'timestamp', nullable: true })
  orderedAt: Date | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => OrderDetailEntity, (detail) => detail.order)
  details: OrderDetailEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
