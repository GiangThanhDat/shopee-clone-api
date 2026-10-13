import { Test } from '@nestjs/testing';
import { DetailSyncService } from './detail-sync.service';
import {
  PRODUCT_DETAIL_QUERY_REPOSITORY,
  PRODUCT_DETAIL_COMMAND_REPOSITORY,
} from './interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_COMMAND_REPOSITORY } from './interfaces/product-spec-repository.interface';
import type { UpdateProductDto } from './dto/update-product.dto';

type DetailInput = NonNullable<UpdateProductDto['details']>;

const mockDetailQueryRepo = {
  findByProductId: jest.fn(),
};

const mockDetailCommandRepo = {
  saveMany: jest.fn(),
  updateMany: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockSpecCommandRepo = {
  findOrCreateMany: jest.fn(),
  updateMany: jest.fn(),
};

describe('DetailSyncService', () => {
  let service: DetailSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DetailSyncService,
        {
          provide: PRODUCT_DETAIL_QUERY_REPOSITORY,
          useValue: mockDetailQueryRepo,
        },
        {
          provide: PRODUCT_DETAIL_COMMAND_REPOSITORY,
          useValue: mockDetailCommandRepo,
        },
        {
          provide: PRODUCT_SPEC_COMMAND_REPOSITORY,
          useValue: mockSpecCommandRepo,
        },
      ],
    }).compile();

    service = module.get(DetailSyncService);
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('should soft delete removed details', async () => {
      mockDetailQueryRepo.findByProductId.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ]);
      mockSpecCommandRepo.findOrCreateMany.mockResolvedValue([]);

      await service.sync(1, [] as DetailInput);

      expect(mockDetailCommandRepo.softRemoveByIds).toHaveBeenCalledWith([
        10, 11,
      ]);
    });

    it('should bulk update with existing spec when fieldId provided', async () => {
      mockDetailQueryRepo.findByProductId.mockResolvedValue([{ id: 15 }]);
      mockSpecCommandRepo.findOrCreateMany.mockResolvedValue([]);
      mockDetailCommandRepo.saveMany.mockResolvedValue([]);
      mockSpecCommandRepo.updateMany.mockResolvedValue([]);

      await service.sync(1, [
        { id: 15, fieldId: 15, specName: 'Screen', specValue: '6.7' },
      ] as DetailInput);

      expect(mockDetailCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, fieldId: 15 },
      ]);
      expect(mockSpecCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, name: 'Screen', value: '6.7' },
      ]);
    });

    it('should batch findOrCreate specs when no fieldId', async () => {
      mockDetailQueryRepo.findByProductId.mockResolvedValue([{ id: 15 }]);
      mockSpecCommandRepo.findOrCreateMany.mockResolvedValue([
        { id: 99, name: 'Battery', value: '4000mAh' },
      ]);

      await service.sync(1, [
        { id: 15, specName: 'Battery', specValue: '4000mAh' },
      ] as DetailInput);

      expect(mockSpecCommandRepo.findOrCreateMany).toHaveBeenCalledWith([
        { name: 'Battery', value: '4000mAh' },
      ]);
      expect(mockDetailCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, fieldId: 99 },
      ]);
    });

    it('should bulk create with existing spec', async () => {
      mockDetailQueryRepo.findByProductId.mockResolvedValue([]);
      mockSpecCommandRepo.findOrCreateMany.mockResolvedValue([]);
      mockDetailCommandRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [{ fieldId: 5 }] as DetailInput);

      expect(mockDetailCommandRepo.saveMany).toHaveBeenCalledWith([
        { productId: 1, fieldId: 5 },
      ]);
    });

    it('should bulk create with new spec', async () => {
      mockDetailQueryRepo.findByProductId.mockResolvedValue([]);
      mockSpecCommandRepo.findOrCreateMany.mockResolvedValue([
        { id: 50, name: 'Color', value: 'Black' },
      ]);
      mockDetailCommandRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [
        { specName: 'Color', specValue: 'Black' },
      ] as DetailInput);

      expect(mockSpecCommandRepo.findOrCreateMany).toHaveBeenCalledWith([
        { name: 'Color', value: 'Black' },
      ]);
      expect(mockDetailCommandRepo.saveMany).toHaveBeenCalledWith([
        { productId: 1, fieldId: 50 },
      ]);
    });
  });
});
