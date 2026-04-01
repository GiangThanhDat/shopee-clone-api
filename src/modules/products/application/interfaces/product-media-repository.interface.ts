import { DeepPartial } from 'typeorm';
import { ProductMediaEntity } from '../../domain/product-media.entity';

export const PRODUCT_MEDIA_QUERY_REPOSITORY = Symbol(
  'PRODUCT_MEDIA_QUERY_REPOSITORY',
);
export const PRODUCT_MEDIA_COMMAND_REPOSITORY = Symbol(
  'PRODUCT_MEDIA_COMMAND_REPOSITORY',
);

export interface IProductMediaQueryRepository {
  findByProductId(productId: number): Promise<ProductMediaEntity[]>;
  findById(id: number): Promise<ProductMediaEntity | null>;
}

export interface IProductMediaCommandRepository {
  save(media: DeepPartial<ProductMediaEntity>): Promise<ProductMediaEntity>;
  saveMany(
    medias: DeepPartial<ProductMediaEntity>[],
  ): Promise<ProductMediaEntity[]>;
  updateMany(items: DeepPartial<ProductMediaEntity>[]): Promise<void>;
  remove(id: number): Promise<void>;
  softRemoveByIds(ids: number[]): Promise<void>;
}
