import { Test } from '@nestjs/testing';
import { DetailSyncService } from './detail-sync.service';
import { PRODUCT_DETAIL_REPOSITORY } from './interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './interfaces/product-spec-repository.interface';

const mockDetailRepo = {
  findByProductId: jest.fn(),
  saveMany: jest.fn(),
  updateMany: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockSpecRepo = {
  findOrCreateMany: jest.fn(),
  updateMany: jest.fn(),
};

describe('DetailSyncService', () => {
  let service: DetailSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DetailSyncService,
        { provide: PRODUCT_DETAIL_REPOSITORY, useValue: mockDetailRepo },
        { provide: PRODUCT_SPEC_REPOSITORY, useValue: mockSpecRepo },
      ],
    }).compile();

    service = module.get(DetailSyncService);
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('should soft delete removed details', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ]);
      mockSpecRepo.findOrCreateMany.mockResolvedValue([]);

      await service.sync(1, [] as any);

      expect(mockDetailRepo.softRemoveByIds).toHaveBeenCalledWith([10, 11]);
    });

    it('should bulk update with existing spec when fieldId provided', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([{ id: 15 }]);
      mockSpecRepo.findOrCreateMany.mockResolvedValue([]);
      mockDetailRepo.saveMany.mockResolvedValue([]);
      mockSpecRepo.updateMany.mockResolvedValue([]);

      await service.sync(1, [
        { id: 15, fieldId: 15, specName: 'Screen', specValue: '6.7' },
      ] as any);

      expect(mockDetailRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, fieldId: 15 },
      ]);
      expect(mockSpecRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, name: 'Screen', value: '6.7' },
      ]);
    });

    it('should batch findOrCreate specs when no fieldId', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([{ id: 15 }]);
      mockSpecRepo.findOrCreateMany.mockResolvedValue([
        { id: 99, name: 'Battery', value: '4000mAh' },
      ]);

      await service.sync(1, [
        { id: 15, specName: 'Battery', specValue: '4000mAh' },
      ] as any);

      expect(mockSpecRepo.findOrCreateMany).toHaveBeenCalledWith([
        { name: 'Battery', value: '4000mAh' },
      ]);
      expect(mockDetailRepo.updateMany).toHaveBeenCalledWith([
        { id: 15, fieldId: 99 },
      ]);
    });

    it('should bulk create with existing spec', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([]);
      mockSpecRepo.findOrCreateMany.mockResolvedValue([]);
      mockDetailRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [{ fieldId: 5 }] as any);

      expect(mockDetailRepo.saveMany).toHaveBeenCalledWith([
        { productId: 1, fieldId: 5 },
      ]);
    });

    it('should bulk create with new spec', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([]);
      mockSpecRepo.findOrCreateMany.mockResolvedValue([
        { id: 50, name: 'Color', value: 'Black' },
      ]);
      mockDetailRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [{ specName: 'Color', specValue: 'Black' }] as any);

      expect(mockSpecRepo.findOrCreateMany).toHaveBeenCalledWith([
        { name: 'Color', value: 'Black' },
      ]);
      expect(mockDetailRepo.saveMany).toHaveBeenCalledWith([
        { productId: 1, fieldId: 50 },
      ]);
    });
  });
});
