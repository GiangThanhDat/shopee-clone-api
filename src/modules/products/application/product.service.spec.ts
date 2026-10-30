import { Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';
import { SkuSyncService } from './sku-sync.service';
import { MediaSyncService } from './media-sync.service';
import { DetailSyncService } from './detail-sync.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

const mockProductRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockSkuSync = {
  validate: jest.fn(),
  sync: jest.fn(),
};

const mockMediaSync = {
  sync: jest.fn(),
};

const mockDetailSync = {
  sync: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepo },
        { provide: SkuSyncService, useValue: mockSkuSync },
        { provide: MediaSyncService, useValue: mockMediaSync },
        { provide: DetailSyncService, useValue: mockDetailSync },
      ],
    }).compile();

    service = module.get(ProductService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should validate SKUs and create product', async () => {
      const dto = { name: 'iPhone', description: 'A phone' };
      mockProductRepo.create.mockResolvedValue({ id: 1 });
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.create(dto as CreateProductDto);

      expect(mockSkuSync.validate).toHaveBeenCalled();
      expect(mockProductRepo.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const dto = { name: 'iPhone 16' };
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.update(1, dto as UpdateProductDto);

      expect(mockProductRepo.update).toHaveBeenCalledWith(1, {
        name: 'iPhone 16',
        description: undefined,
      });
    });

    it('should delegate SKU sync', async () => {
      const skus = [{ id: 1, price: 200 }];
      const dto = { skus };
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.update(1, dto as UpdateProductDto);

      expect(mockSkuSync.sync).toHaveBeenCalledWith(1, skus);
    });

    it('should delegate media sync', async () => {
      const media = [{ id: 1, mediaId: 3 }];
      const dto = { media };
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.update(1, dto as UpdateProductDto);

      expect(mockMediaSync.sync).toHaveBeenCalledWith(1, media);
    });

    it('should delegate detail sync', async () => {
      const details = [{ id: 1, specName: 'Screen' }];
      const dto = { details };
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.update(1, dto as UpdateProductDto);

      expect(mockDetailSync.sync).toHaveBeenCalledWith(1, details);
    });

    it('should skip field update when no name or description', async () => {
      const dto = { skus: [] };
      mockProductRepo.findById.mockResolvedValue({ id: 1 });

      await service.update(1, dto as UpdateProductDto);

      expect(mockProductRepo.update).not.toHaveBeenCalled();
    });
  });
});
