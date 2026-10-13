import { Test } from '@nestjs/testing';
import { MediaSyncService } from './media-sync.service';
import {
  PRODUCT_MEDIA_QUERY_REPOSITORY,
  PRODUCT_MEDIA_COMMAND_REPOSITORY,
} from './interfaces/product-media-repository.interface';
import { MEDIA_COMMAND_REPOSITORY } from '../../media/application/interfaces/media-repository.interface';

const mockProductMediaQueryRepo = {
  findByProductId: jest.fn(),
};

const mockProductMediaCommandRepo = {
  saveMany: jest.fn(),
  updateMany: jest.fn(),
  softRemoveByIds: jest.fn(),
};

const mockMediaCommandRepo = {
  saveMany: jest.fn(),
  updateMany: jest.fn(),
};

describe('MediaSyncService', () => {
  let service: MediaSyncService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MediaSyncService,
        {
          provide: PRODUCT_MEDIA_QUERY_REPOSITORY,
          useValue: mockProductMediaQueryRepo,
        },
        {
          provide: PRODUCT_MEDIA_COMMAND_REPOSITORY,
          useValue: mockProductMediaCommandRepo,
        },
        { provide: MEDIA_COMMAND_REPOSITORY, useValue: mockMediaCommandRepo },
      ],
    }).compile();

    service = module.get(MediaSyncService);
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('should soft delete removed media', async () => {
      mockProductMediaQueryRepo.findByProductId.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await service.sync(1, [] as any);

      expect(mockProductMediaCommandRepo.softRemoveByIds).toHaveBeenCalledWith([
        1, 2,
      ]);
    });

    it('should bulk update existing media when mediaId provided', async () => {
      mockProductMediaQueryRepo.findByProductId.mockResolvedValue([{ id: 6 }]);

      await service.sync(1, [
        { id: 6, mediaId: 3, url: 'new.jpg', size: 2048, fileName: 'f' },
      ] as any);

      expect(mockProductMediaCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 6, mediaId: 3 },
      ]);
      expect(mockMediaCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 3, url: 'new.jpg', size: 2048, fileName: 'f' },
      ]);
    });

    it('should create new media and link when no mediaId provided', async () => {
      mockProductMediaQueryRepo.findByProductId.mockResolvedValue([{ id: 6 }]);
      mockMediaCommandRepo.saveMany.mockResolvedValue([{ id: 99 }]);

      await service.sync(1, [
        { id: 6, url: 'new.jpg', size: 1024, fileName: 'f' },
      ] as any);

      expect(mockMediaCommandRepo.saveMany).toHaveBeenCalledWith([
        { url: 'new.jpg', size: 1024, fileName: 'f' },
      ]);
      expect(mockProductMediaCommandRepo.updateMany).toHaveBeenCalledWith([
        { id: 6, mediaId: 99 },
      ]);
    });

    it('should bulk create new product media', async () => {
      mockProductMediaQueryRepo.findByProductId.mockResolvedValue([]);
      mockProductMediaCommandRepo.saveMany.mockResolvedValue([]);

      await service.sync(1, [
        { mediaId: 3, url: 'url', size: 512, fileName: 'f' },
      ] as any);

      expect(mockProductMediaCommandRepo.saveMany).toHaveBeenCalledWith([
        {
          productId: 1,
          mediaId: 3,
          media: { id: 3, url: 'url', size: 512, fileName: 'f' },
        },
      ]);
    });
  });
});
