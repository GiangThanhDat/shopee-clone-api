import { DeepPartial } from 'typeorm';
import { ProductMediaEntity } from '../../domain/product-media.entity';

export const PRODUCT_MEDIA_REPOSITORY = Symbol('PRODUCT_MEDIA_REPOSITORY');

export interface IProductMediaRepository {
  findByProductId(productId: number): Promise<ProductMediaEntity[]>;
  findById(id: number): Promise<ProductMediaEntity | null>;
  save(media: DeepPartial<ProductMediaEntity>): Promise<ProductMediaEntity>;
  update(
    id: number,
    data: DeepPartial<ProductMediaEntity>,
  ): Promise<ProductMediaEntity | null>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
}
