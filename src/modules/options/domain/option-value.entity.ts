import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OptionEntity } from './option.entity';

@Entity('option_values')
export class OptionValueEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ name: 'option_id', type: 'bigint' })
  optionId: number;

  @ManyToOne(() => OptionEntity, (option) => option.values)
  @JoinColumn({ name: 'option_id' })
  option: OptionEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
