import { Test } from '@nestjs/testing';
import { MediaSyncService } from './media-sync.service';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import { MEDIA_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';

const mockProductMediaRepo = {
  findByProductId: jest.fn(),
  saveMany: jest.fn(),
  updateMany: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockMediaRepo = {
  saveMany: jest.fn(),
  updateMany: jest.fn(),
};

describe('MediaSyncService', () => {
  let service: MediaSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MediaSyncService,
        { provide: PRODUCT_MEDIA_REPOSITORY, useValue: mockProductMediaRepo },
        { provide: MEDIA_REPOSITORY, useValue: mockMediaRepo },
      ],
    }).compile();

    service = module.get(MediaSyncService);
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('should soft delete removed media', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await service.sync(1, [] as any);

      expect(mockProductMediaRepo.softRemoveByIds).toHaveBeenCalledWith([1, 2]);
    });

    it('should bulk update existing media when mediaId provided', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([{ id: 6 }]);

      await service.sync(1, [
        { id: 6, mediaId: 3, url: 'new.jpg', size: 2048, fileName: 'f' },
      ] as any);

      expect(mockProductMediaRepo.updateMany).toHaveBeenCalledWith([
        { id: 6, mediaId: 3 },
      ]);
      expect(mockMediaRepo.updateMany).toHaveBeenCalledWith([
        { id: 3, url: 'new.jpg', size: 2048, fileName: 'f' },
      ]);
    });

    it('should create new media and link when no mediaId provided', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([{ id: 6 }]);
      mockMediaRepo.saveMany.mockResolvedValue([{ id: 99 }]);

      await service.sync(1, [
        { id: 6, url: 'new.jpg', size: 1024, fileName: 'f' },
      ] as any);

      expect(mockMediaRepo.saveMany).toHaveBeenCalledWith([
        { url: 'new.jpg', size: 1024, fileName: 'f' },
      ]);
      expect(mockProductMediaRepo.updateMany).toHaveBeenCalledWith([
        { id: 6, mediaId: 99 },
      ]);
    });

    it('should bulk create new product media', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([]);
      mockProductMediaRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [
        { mediaId: 3, url: 'url', size: 512, fileName: 'f' },
      ] as any);

      expect(mockProductMediaRepo.saveMany).toHaveBeenCalledWith([
        {
          productId: 1,
          mediaId: 3,
          media: { id: 3, url: 'url', size: 512, fileName: 'f' },
        },
      ]);
    });
  });
});
