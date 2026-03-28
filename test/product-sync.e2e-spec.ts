import { DataSource, Repository } from 'typeorm';
import {
  initializeTransactionalContext,
  addTransactionalDataSource,
} from 'typeorm-transactional';
import { ProductEntity } from '../src/modules/products/domain/product.entity';
import { ProductSkuEntity } from '../src/modules/products/domain/product-sku.entity';
import { SkuValueEntity } from '../src/modules/products/domain/sku-value.entity';
import { ProductMediaEntity } from '../src/modules/products/domain/product-media.entity';
import { MediaEntity } from '../src/modules/media/domain/media.entity';
import { ProductDetailEntity } from '../src/modules/products/domain/product-detail.entity';
import { ProductSpecEntity } from '../src/modules/products/domain/product-spec.entity';
import { OptionEntity } from '../src/modules/options/domain/option.entity';
import { OptionValueEntity } from '../src/modules/options/domain/option-value.entity';
import { ProductSkuRepository } from '../src/modules/products/infrastructure/product-sku.repository';
import { ProductMediaRepository } from '../src/modules/products/infrastructure/product-media.repository';
import { ProductDetailRepository } from '../src/modules/products/infrastructure/product-detail.repository';
import { ProductSpecRepository } from '../src/modules/products/infrastructure/product-spec.repository';
import { MediaRepository } from '../src/modules/media/infrastructure/media.repository';
import { SkuSyncService } from '../src/modules/products/application/sku-sync.service';
import { MediaSyncService } from '../src/modules/products/application/media-sync.service';
import { DetailSyncService } from '../src/modules/products/application/detail-sync.service';
import { PRODUCT_SKU_REPOSITORY } from '../src/modules/products/application/interfaces/product-sku-repository.interface';
import { PRODUCT_MEDIA_REPOSITORY } from '../src/modules/products/application/interfaces/product-media-repository.interface';
import { PRODUCT_DETAIL_REPOSITORY } from '../src/modules/products/application/interfaces/product-detail-repository.interface';
import { PRODUCT_SPEC_REPOSITORY } from '../src/modules/products/application/interfaces/product-spec-repository.interface';
import { MEDIA_REPOSITORY } from '../src/modules/media/application/interfaces/media-repository.interface';
import { OPTION_VALUE_REPOSITORY } from '../src/modules/options/application/interfaces/option-value-repository.interface';
import { OptionValueRepository } from '../src/modules/options/infrastructure/option-value.repository';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

const entities = [
  ProductEntity,
  ProductSkuEntity,
  SkuValueEntity,
  ProductMediaEntity,
  MediaEntity,
  ProductDetailEntity,
  ProductSpecEntity,
  OptionEntity,
  OptionValueEntity,
];

let dataSource: DataSource;

beforeAll(async () => {
  initializeTransactionalContext();

  dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'thanhdat',
    database: 'shopee_clone',
    entities,
    synchronize: false,
    logging: ['query'],
  });

  await dataSource.initialize();
  addTransactionalDataSource(dataSource);
});

afterAll(async () => {
  await dataSource.destroy();
});

async function createTestProduct(): Promise<ProductEntity> {
  const repo = dataSource.getRepository(ProductEntity);
  return repo.save({ name: 'Test Product', description: 'integration test' });
}

async function cleanupProduct(productId: number): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.query(
    'DELETE FROM sku_values WHERE sku_id IN (SELECT id FROM product_skus WHERE product_id = $1)',
    [productId],
  );
  await qr.query('DELETE FROM product_skus WHERE product_id = $1', [productId]);
  await qr.query('DELETE FROM product_media WHERE product_id = $1', [
    productId,
  ]);
  await qr.query('DELETE FROM product_details WHERE product_id = $1', [
    productId,
  ]);
  await qr.query('DELETE FROM product WHERE id = $1', [productId]);
  await qr.release();
}

describe('SkuSyncService (integration)', () => {
  let skuSync: SkuSyncService;
  let skuRepo: Repository<ProductSkuEntity>;
  let product: ProductEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SkuSyncService,
        {
          provide: PRODUCT_SKU_REPOSITORY,
          useFactory: () =>
            new ProductSkuRepository(
              dataSource.getRepository(ProductSkuEntity),
              dataSource.getRepository(SkuValueEntity),
            ),
        },
        {
          provide: OPTION_VALUE_REPOSITORY,
          useFactory: () =>
            new OptionValueRepository(
              dataSource.getRepository(OptionValueEntity),
            ),
        },
        {
          provide: getRepositoryToken(ProductSkuEntity),
          useFactory: () => dataSource.getRepository(ProductSkuEntity),
        },
        {
          provide: getRepositoryToken(SkuValueEntity),
          useFactory: () => dataSource.getRepository(SkuValueEntity),
        },
      ],
    }).compile();

    skuSync = module.get(SkuSyncService);
    skuRepo = dataSource.getRepository(ProductSkuEntity);
  });

  beforeEach(async () => {
    product = await createTestProduct();
  });

  afterEach(async () => {
    await cleanupProduct(product.id);
  });

  it('should bulk create multiple SKUs in one operation', async () => {
    await skuSync.sync(product.id, [
      {
        price: 100,
        stock: 10,
        skuCode: 'SKU-A',
        thumbUrl: 'a.jpg',
        optionValueIds: [],
      },
      {
        price: 200,
        stock: 20,
        skuCode: 'SKU-B',
        thumbUrl: 'b.jpg',
        optionValueIds: [],
      },
      {
        price: 300,
        stock: 30,
        skuCode: 'SKU-C',
        thumbUrl: 'c.jpg',
        optionValueIds: [],
      },
    ] as any);

    const saved = await skuRepo.find({ where: { productId: product.id } });
    expect(saved).toHaveLength(3);
    expect(saved.map((s) => s.skuCode).sort()).toEqual([
      'SKU-A',
      'SKU-B',
      'SKU-C',
    ]);
  });

  it('should bulk update existing SKUs', async () => {
    await skuSync.sync(product.id, [
      {
        price: 100,
        stock: 10,
        skuCode: 'SKU-1',
        thumbUrl: 'x.jpg',
        optionValueIds: [],
      },
      {
        price: 200,
        stock: 20,
        skuCode: 'SKU-2',
        thumbUrl: 'y.jpg',
        optionValueIds: [],
      },
    ] as any);

    const created = await skuRepo.find({ where: { productId: product.id } });

    await skuSync.sync(product.id, [
      {
        id: created[0].id,
        price: 999,
        stock: 99,
        skuCode: 'SKU-1-UPDATED',
        thumbUrl: 'x2.jpg',
        optionValueIds: [],
      },
      {
        id: created[1].id,
        price: 888,
        stock: 88,
        skuCode: 'SKU-2-UPDATED',
        thumbUrl: 'y2.jpg',
        optionValueIds: [],
      },
    ] as any);

    const updated = await skuRepo.find({ where: { productId: product.id } });
    expect(updated).toHaveLength(2);
    expect(Number(updated.find((s) => s.id === created[0].id)?.price)).toBe(
      999,
    );
    expect(Number(updated.find((s) => s.id === created[1].id)?.price)).toBe(
      888,
    );
  });

  it('should soft delete SKUs not in incoming list', async () => {
    await skuSync.sync(product.id, [
      {
        price: 100,
        stock: 10,
        skuCode: 'KEEP',
        thumbUrl: 'k.jpg',
        optionValueIds: [],
      },
      {
        price: 200,
        stock: 20,
        skuCode: 'DELETE-ME',
        thumbUrl: 'd.jpg',
        optionValueIds: [],
      },
    ] as any);

    const created = await skuRepo.find({ where: { productId: product.id } });
    const keepId = created.find((s) => s.skuCode === 'KEEP')!.id;

    await skuSync.sync(product.id, [
      {
        id: keepId,
        price: 100,
        stock: 10,
        skuCode: 'KEEP',
        thumbUrl: 'k.jpg',
        optionValueIds: [],
      },
    ] as any);

    const remaining = await skuRepo.find({ where: { productId: product.id } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].skuCode).toBe('KEEP');

    const withDeleted = await skuRepo.find({
      where: { productId: product.id },
      withDeleted: true,
    });
    expect(withDeleted).toHaveLength(2);
  });
});

describe('MediaSyncService (integration)', () => {
  let mediaSync: MediaSyncService;
  let productMediaRepo: Repository<ProductMediaEntity>;
  let mediaRepo: Repository<MediaEntity>;
  let product: ProductEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MediaSyncService,
        {
          provide: PRODUCT_MEDIA_REPOSITORY,
          useFactory: () =>
            new ProductMediaRepository(
              dataSource.getRepository(ProductMediaEntity),
            ),
        },
        {
          provide: MEDIA_REPOSITORY,
          useFactory: () =>
            new MediaRepository(dataSource.getRepository(MediaEntity)),
        },
      ],
    }).compile();

    mediaSync = module.get(MediaSyncService);
    productMediaRepo = dataSource.getRepository(ProductMediaEntity);
    mediaRepo = dataSource.getRepository(MediaEntity);
  });

  beforeEach(async () => {
    product = await createTestProduct();
  });

  afterEach(async () => {
    await cleanupProduct(product.id);
  });

  it('should bulk create multiple media entries', async () => {
    await mediaSync.sync(product.id, [
      { url: 'img1.jpg', size: 1024, fileName: 'img1.jpg' },
      { url: 'img2.jpg', size: 2048, fileName: 'img2.jpg' },
    ] as any);

    const saved = await productMediaRepo.find({
      where: { productId: product.id },
      relations: ['media'],
    });
    expect(saved).toHaveLength(2);
    expect(saved[0].media.url).toBeDefined();
    expect(saved[1].media.url).toBeDefined();
  });

  it('should update fileName of existing media', async () => {
    await mediaSync.sync(product.id, [
      { url: 'orig.jpg', size: 100, fileName: 'original.jpg' },
    ] as any);

    const created = await productMediaRepo.find({
      where: { productId: product.id },
      relations: ['media'],
    });
    const pm = created[0];

    await mediaSync.sync(product.id, [
      {
        id: pm.id,
        mediaId: pm.mediaId,
        url: 'orig.jpg',
        size: 100,
        fileName: 'renamed.jpg',
      },
    ] as any);

    const updated = await mediaRepo.findOne({
      where: { id: Number(pm.mediaId) },
    });
    expect(updated?.fileName).toBe('renamed.jpg');
  });

  it('should soft delete media not in incoming list', async () => {
    await mediaSync.sync(product.id, [
      { url: 'keep.jpg', size: 100, fileName: 'keep.jpg' },
      { url: 'remove.jpg', size: 200, fileName: 'remove.jpg' },
    ] as any);

    const created = await productMediaRepo.find({
      where: { productId: product.id },
    });
    const keepId = created[0].id;

    await mediaSync.sync(product.id, [
      {
        id: keepId,
        mediaId: created[0].mediaId,
        url: 'keep.jpg',
        size: 100,
        fileName: 'keep.jpg',
      },
    ] as any);

    const remaining = await productMediaRepo.find({
      where: { productId: product.id },
    });
    expect(remaining).toHaveLength(1);
  });
});

describe('DetailSyncService (integration)', () => {
  let detailSync: DetailSyncService;
  let detailRepo: Repository<ProductDetailEntity>;
  let specRepo: Repository<ProductSpecEntity>;
  let product: ProductEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DetailSyncService,
        {
          provide: PRODUCT_DETAIL_REPOSITORY,
          useFactory: () =>
            new ProductDetailRepository(
              dataSource.getRepository(ProductDetailEntity),
            ),
        },
        {
          provide: PRODUCT_SPEC_REPOSITORY,
          useFactory: () =>
            new ProductSpecRepository(
              dataSource.getRepository(ProductSpecEntity),
            ),
        },
      ],
    }).compile();

    detailSync = module.get(DetailSyncService);
    detailRepo = dataSource.getRepository(ProductDetailEntity);
    specRepo = dataSource.getRepository(ProductSpecEntity);
  });

  beforeEach(async () => {
    product = await createTestProduct();
  });

  afterEach(async () => {
    await cleanupProduct(product.id);
  });

  it('should bulk create details with new specs (findOrCreateMany)', async () => {
    await detailSync.sync(product.id, [
      { specName: 'Screen', specValue: '6.7 inches' },
      { specName: 'Battery', specValue: '5000mAh' },
      { specName: 'Weight', specValue: '200g' },
    ] as any);

    const details = await detailRepo.find({
      where: { productId: product.id },
      relations: ['spec'],
    });
    expect(details).toHaveLength(3);

    const specNames = details.map((d) => d.spec.name).sort();
    expect(specNames).toEqual(['Battery', 'Screen', 'Weight']);
  });

  it('should reuse existing specs via findOrCreateMany', async () => {
    const existingSpec = await specRepo.save({
      name: 'Screen',
      value: '6.7 inches',
    });

    await detailSync.sync(product.id, [
      { specName: 'Screen', specValue: '6.7 inches' },
      { specName: 'Battery', specValue: '5000mAh' },
    ] as any);

    const details = await detailRepo.find({
      where: { productId: product.id },
      relations: ['spec'],
    });
    expect(details).toHaveLength(2);

    const screenDetail = details.find((d) => d.spec.name === 'Screen');
    expect(screenDetail?.fieldId).toBe(existingSpec.id);
  });

  it('should update specName of existing detail', async () => {
    await detailSync.sync(product.id, [
      { specName: 'Screen', specValue: '6.7 inches' },
    ] as any);

    const created = await detailRepo.find({
      where: { productId: product.id },
      relations: ['spec'],
    });
    const detail = created[0];

    await detailSync.sync(product.id, [
      {
        id: detail.id,
        fieldId: detail.fieldId,
        specName: 'Display Size',
        specValue: '6.7 inches',
      },
    ] as any);

    const updatedSpec = await specRepo.findOne({
      where: { id: Number(detail.fieldId) },
    });
    expect(updatedSpec?.name).toBe('Display Size');
  });

  it('should soft delete details not in incoming list', async () => {
    await detailSync.sync(product.id, [
      { specName: 'Keep', specValue: 'yes' },
      { specName: 'Remove', specValue: 'yes' },
    ] as any);

    const created = await detailRepo.find({
      where: { productId: product.id },
    });
    const keepId = created[0].id;

    await detailSync.sync(product.id, [
      {
        id: keepId,
        fieldId: created[0].fieldId,
        specName: 'Keep',
        specValue: 'yes',
      },
    ] as any);

    const remaining = await detailRepo.find({
      where: { productId: product.id },
    });
    expect(remaining).toHaveLength(1);
  });
});

describe('Transaction rollback (integration)', () => {
  let product: ProductEntity;
  let skuRepo: Repository<ProductSkuEntity>;

  beforeEach(async () => {
    product = await createTestProduct();
    skuRepo = dataSource.getRepository(ProductSkuEntity);
  });

  afterEach(async () => {
    await cleanupProduct(product.id);
  });

  it('should rollback all changes when error occurs mid-transaction', async () => {
    const skuSaved = await skuRepo.save({
      productId: product.id,
      price: 100,
      stock: 10,
      skuCode: 'ORIGINAL',
      thumbUrl: 'orig.jpg',
    });

    const qr = dataSource.createQueryRunner();
    await qr.startTransaction();
    try {
      await qr.manager.getRepository(ProductSkuEntity).save({
        id: skuSaved.id,
        price: 999,
        stock: 99,
        skuCode: 'MODIFIED',
        thumbUrl: 'mod.jpg',
      });

      const midTx = await qr.manager
        .getRepository(ProductSkuEntity)
        .findOne({ where: { id: skuSaved.id } });
      expect(midTx?.skuCode).toBe('MODIFIED');

      throw new Error('Simulated failure');
    } catch {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }

    const afterRollback = await skuRepo.findOne({
      where: { id: skuSaved.id },
    });
    expect(afterRollback?.skuCode).toBe('ORIGINAL');
    expect(Number(afterRollback?.price)).toBe(100);
  });
});
