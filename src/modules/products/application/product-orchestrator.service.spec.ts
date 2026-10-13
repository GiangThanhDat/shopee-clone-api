import { Test } from '@nestjs/testing';
import { ProductOrchestrator } from './product-orchestrator.service';
import {
  PRODUCT_QUERY_REPOSITORY,
  PRODUCT_COMMAND_REPOSITORY,
} from './interfaces/product-repository.interface';
import { SkuSyncService } from './sku-sync.service';
import { MediaSyncService } from './media-sync.service';
import { DetailSyncService } from './detail-sync.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

const mockProductQueryRepo = {
  findById: jest.fn(),
};

const mockProductCommandRepo = {
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

describe('ProductOrchestrator', () => {
  let orchestrator: ProductOrchestrator;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductOrchestrator,
        { provide: PRODUCT_QUERY_REPOSITORY, useValue: mockProductQueryRepo },
        {
          provide: PRODUCT_COMMAND_REPOSITORY,
          useValue: mockProductCommandRepo,
        },
        { provide: SkuSyncService, useValue: mockSkuSync },
        { provide: MediaSyncService, useValue: mockMediaSync },
        { provide: DetailSyncService, useValue: mockDetailSync },
      ],
    }).compile();

    orchestrator = module.get(ProductOrchestrator);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should validate SKUs and create product', async () => {
      const dto = { name: 'iPhone', description: 'A phone' };
      mockProductCommandRepo.create.mockResolvedValue({ id: 1 });
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.create(dto as CreateProductDto);

      expect(mockSkuSync.validate).toHaveBeenCalled();
      expect(mockProductCommandRepo.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const dto = { name: 'iPhone 16' };
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.update(1, dto as UpdateProductDto);

      expect(mockProductCommandRepo.update).toHaveBeenCalledWith(1, {
        name: 'iPhone 16',
        description: undefined,
      });
    });

    it('should delegate SKU sync', async () => {
      const skus = [{ id: 1, price: 200 }];
      const dto = { skus };
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.update(1, dto as UpdateProductDto);

      expect(mockSkuSync.sync).toHaveBeenCalledWith(1, skus);
    });

    it('should delegate media sync', async () => {
      const media = [{ id: 1, mediaId: 3 }];
      const dto = { media };
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.update(1, dto as UpdateProductDto);

      expect(mockMediaSync.sync).toHaveBeenCalledWith(1, media);
    });

    it('should delegate detail sync', async () => {
      const details = [{ id: 1, specName: 'Screen' }];
      const dto = { details };
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.update(1, dto as UpdateProductDto);

      expect(mockDetailSync.sync).toHaveBeenCalledWith(1, details);
    });

    it('should skip field update when no name or description', async () => {
      const dto = { skus: [] };
      mockProductQueryRepo.findById.mockResolvedValue({ id: 1 });

      await orchestrator.update(1, dto as UpdateProductDto);

      expect(mockProductCommandRepo.update).not.toHaveBeenCalled();
    });
  });
});
