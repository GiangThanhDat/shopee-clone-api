import { Test } from '@nestjs/testing';
import { MediaSyncService } from './media-sync.service';
import { PRODUCT_MEDIA_REPOSITORY } from './interfaces/product-media-repository.interface';
import { MEDIA_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';

const mockProductMediaRepo = {
  findByProductId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockMediaRepo = {
  save: jest.fn(),
  update: jest.fn(),
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

    it('should update existing media entity when mediaId provided', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([{ id: 6 }]);

      await service.sync(1, [
        { id: 6, mediaId: 3, url: 'new.jpg', size: 2048, fileName: 'f' },
      ] as any);

      expect(mockProductMediaRepo.update).toHaveBeenCalledWith(6, {
        mediaId: 3,
      });
      expect(mockMediaRepo.update).toHaveBeenCalledWith(3, {
        url: 'new.jpg',
        size: 2048,
        fileName: 'f',
      });
    });

    it('should create new media when no mediaId provided', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([{ id: 6 }]);
      mockMediaRepo.save.mockResolvedValue({ id: 99 });

      await service.sync(1, [
        { id: 6, url: 'new.jpg', size: 1024, fileName: 'f' },
      ] as any);

      expect(mockMediaRepo.save).toHaveBeenCalledWith({
        url: 'new.jpg',
        size: 1024,
        fileName: 'f',
      });
      expect(mockProductMediaRepo.update).toHaveBeenCalledWith(6, {
        mediaId: 99,
      });
    });

    it('should create new product media', async () => {
      mockProductMediaRepo.findByProductId.mockResolvedValue([]);

      await service.sync(1, [
        { mediaId: 3, url: 'url', size: 512, fileName: 'f' },
      ] as any);

      expect(mockProductMediaRepo.save).toHaveBeenCalledWith({
        productId: 1,
        mediaId: 3,
        media: { id: 3, url: 'url', size: 512, fileName: 'f' },
      });
    });
  });
});
