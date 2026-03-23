import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SkuSyncService } from './sku-sync.service';
import { PRODUCT_SKU_REPOSITORY } from './interfaces/product-sku-repository.interface';
import { OPTION_VALUE_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';

const mockSkuRepo = {
  findByProductId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockOptionValueRepo = {
  findByIds: jest.fn(),
};

describe('SkuSyncService', () => {
  let service: SkuSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SkuSyncService,
        { provide: PRODUCT_SKU_REPOSITORY, useValue: mockSkuRepo },
        { provide: OPTION_VALUE_REPOSITORY, useValue: mockOptionValueRepo },
      ],
    }).compile();

    service = module.get(SkuSyncService);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should pass when no SKUs provided', async () => {
      await expect(service.validate(undefined)).resolves.not.toThrow();
    });

    it('should throw when option value IDs are invalid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const skus = [{ price: 100, optionValueIds: [1, 2] }] as any;
      mockOptionValueRepo.findByIds.mockResolvedValue([{ id: 1 }]);

      await expect(service.validate(skus)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sync', () => {
    it('should soft delete removed SKUs', async () => {
      mockSkuRepo.findByProductId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockSkuRepo.update.mockResolvedValue({});

      await service.sync(1, [{ id: 1, price: 100 }] as any);

      expect(mockSkuRepo.softRemoveByIds).toHaveBeenCalledWith([2]);
    });

    it('should update existing SKU', async () => {
      mockSkuRepo.findByProductId.mockResolvedValue([{ id: 5 }]);

      await service.sync(1, [
        { id: 5, price: 300, stock: 20, skuCode: 'S1' },
      ] as any);

      expect(mockSkuRepo.update).toHaveBeenCalledWith(5, {
        price: 300,
        stock: 20,
        skuCode: 'S1',
        thumbUrl: undefined,
      });
    });

    it('should create new SKU', async () => {
      mockSkuRepo.findByProductId.mockResolvedValue([]);

      await service.sync(1, [
        { price: 100, stock: 10, skuCode: 'NEW', optionValueIds: [1] },
      ] as any);

      expect(mockSkuRepo.save).toHaveBeenCalledWith({
        productId: 1,
        price: 100,
        stock: 10,
        skuCode: 'NEW',
        thumbUrl: undefined,
        skuValues: [{ optionValueId: 1 }],
      });
    });
  });
});
