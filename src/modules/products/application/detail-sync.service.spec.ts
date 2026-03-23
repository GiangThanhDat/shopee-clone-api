import { Test } from '@nestjs/testing';
import { DetailSyncService } from './detail-sync.service';
import { PRODUCT_DETAIL_REPOSITORY } from './interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from './interfaces/product-spec-repository.interface';

const mockDetailRepo = {
  findByProductId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockSpecRepo = {
  findOrCreate: jest.fn(),
  update: jest.fn(),
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

      await service.sync(1, [] as any);

      expect(mockDetailRepo.softRemoveByIds).toHaveBeenCalledWith([10, 11]);
    });

    it('should update existing spec when fieldId provided', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([{ id: 15 }]);

      await service.sync(1, [
        { id: 15, fieldId: 15, specName: 'Screen', specValue: '6.7' },
      ] as any);

      expect(mockDetailRepo.update).toHaveBeenCalledWith(15, {
        fieldId: 15,
      });
      expect(mockSpecRepo.update).toHaveBeenCalledWith(15, {
        name: 'Screen',
        value: '6.7',
      });
    });

    it('should findOrCreate spec when no fieldId', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([{ id: 15 }]);
      mockSpecRepo.findOrCreate.mockResolvedValue({ id: 99 });

      await service.sync(1, [
        { id: 15, specName: 'Battery', specValue: '4000mAh' },
      ] as any);

      expect(mockSpecRepo.findOrCreate).toHaveBeenCalledWith(
        'Battery',
        '4000mAh',
      );
      expect(mockDetailRepo.update).toHaveBeenCalledWith(15, {
        fieldId: 99,
      });
    });

    it('should create with existing spec', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([]);

      await service.sync(1, [{ fieldId: 5 }] as any);

      expect(mockDetailRepo.save).toHaveBeenCalledWith({
        productId: 1,
        fieldId: 5,
      });
    });

    it('should create with new spec', async () => {
      mockDetailRepo.findByProductId.mockResolvedValue([]);
      mockSpecRepo.findOrCreate.mockResolvedValue({ id: 50 });

      await service.sync(1, [{ specName: 'Color', specValue: 'Black' }] as any);

      expect(mockSpecRepo.findOrCreate).toHaveBeenCalledWith('Color', 'Black');
      expect(mockDetailRepo.save).toHaveBeenCalledWith({
        productId: 1,
        fieldId: 50,
      });
    });
  });
});
