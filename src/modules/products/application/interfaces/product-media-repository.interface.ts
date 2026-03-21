import { ProductMediaEntity } from '../../domain/product-media.entity';

export const PRODUCT_MEDIA_REPOSITORY = Symbol('PRODUCT_MEDIA_REPOSITORY');

export interface IProductMediaRepository {
  findByProductId(productId: number): Promise<ProductMediaEntity[]>;
  findById(id: number): Promise<ProductMediaEntity | null>;
  save(media: Partial<ProductMediaEntity>): Promise<ProductMediaEntity>;
  remove(id: number): Promise<void>;
}
