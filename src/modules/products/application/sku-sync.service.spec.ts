import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SkuSyncService } from './sku-sync.service';
import {
  PRODUCT_SKU_QUERY_REPOSITORY,
  PRODUCT_SKU_COMMAND_REPOSITORY,
} from './interfaces/product-sku-repository.interface';
import { OPTION_VALUE_QUERY_REPOSITORY } from '../../options/application/interfaces/option-value-repository.interface';

const mockSkuQueryRepo = {
  findByProductId: jest.fn(),
};

const mockSkuCommandRepo = {
  saveMany: jest.fn(),
  updateMany: jest.fn(),
  softRemoveByIds: jest.fn(),
  syncSkuValues: jest.fn(),
};

const mockOptionValueQueryRepo = {
  findByIds: jest.fn(),
};

describe('SkuSyncService', () => {
  let service: SkuSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SkuSyncService,
        { provide: PRODUCT_SKU_QUERY_REPOSITORY, useValue: mockSkuQueryRepo },
        { provide: PRODUCT_SKU_COMMAND_REPOSITORY, useValue: mockSkuCommandRepo },
        { provide: OPTION_VALUE_QUERY_REPOSITORY, useValue: mockOptionValueQueryRepo },
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
      const skus = [{ price: 100, optionValueIds: [1, 2] }] as any;
      mockOptionValueQueryRepo.findByIds.mockResolvedValue([{ id: 1 }]);

      await expect(service.validate(skus)).rejects.toThrow(BadRequestException);
    });

    it('should validate optionValueIds for existing SKUs too', async () => {
      const skus = [{ id: 5, price: 100, optionValueIds: [10, 20] }] as any;
      mockOptionValueQueryRepo.findByIds.mockResolvedValue([{ id: 10 }]);

      await expect(service.validate(skus)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sync', () => {
    it('should soft delete removed SKUs', async () => {
      mockSkuQueryRepo.findByProductId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockSkuCommandRepo.updateMany.mockResolvedValue([]);

      await service.sync(1, [{ id: 1, price: 100 }] as any);

      expect(mockSkuCommandRepo.softRemoveByIds).toHaveBeenCalledWith([2]);
    });

    it('should bulk update existing SKUs', async () => {
      mockSkuQueryRepo.findByProductId.mockResolvedValue([{ id: 5 }]);
      mockSkuCommandRepo.updateMany.mockResolvedValue([]);

      await service.sync(1, [
        { id: 5, price: 300, stock: 20, skuCode: 'S1' },
      ] as any);

      expect(mockSkuCommandRepo.updateMany).toHaveBeenCalledWith([
        {
          id: 5,
          price: 300,
          stock: 20,
          skuCode: 'S1',
          thumbUrl: undefined,
        },
      ]);
    });

    it('should bulk create new SKUs', async () => {
      mockSkuQueryRepo.findByProductId.mockResolvedValue([]);
      mockSkuCommandRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [
        { price: 100, stock: 10, skuCode: 'NEW', optionValueIds: [1] },
      ] as any);

      expect(mockSkuCommandRepo.saveMany).toHaveBeenCalledWith([
        {
          productId: 1,
          price: 100,
          stock: 10,
          skuCode: 'NEW',
          thumbUrl: undefined,
          skuValues: [{ optionValueId: 1 }],
        },
      ]);
    });

    it('should sync skuValues when updating with optionValueIds', async () => {
      mockSkuQueryRepo.findByProductId.mockResolvedValue([{ id: 5 }]);
      mockSkuCommandRepo.updateMany.mockResolvedValue(undefined);
      mockSkuCommandRepo.syncSkuValues.mockResolvedValue(undefined);

      await service.sync(1, [
        {
          id: 5,
          price: 300,
          stock: 20,
          skuCode: 'S1',
          optionValueIds: [10, 20],
        },
      ] as any);

      expect(mockSkuCommandRepo.syncSkuValues).toHaveBeenCalledWith([
        { skuId: 5, optionValueIds: [10, 20] },
      ]);
    });

    it('should not sync skuValues when updating without optionValueIds', async () => {
      mockSkuQueryRepo.findByProductId.mockResolvedValue([{ id: 5 }]);
      mockSkuCommandRepo.updateMany.mockResolvedValue(undefined);
      mockSkuCommandRepo.syncSkuValues.mockResolvedValue(undefined);

      await service.sync(1, [
        { id: 5, price: 300, stock: 20, skuCode: 'S1' },
      ] as any);

      expect(mockSkuCommandRepo.syncSkuValues).toHaveBeenCalledWith([]);
    });
  });
});
