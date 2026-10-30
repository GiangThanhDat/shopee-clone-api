import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { globalValidationPipe } from '../src/common/pipes/validation.pipe';
import { ProductSkuEntity } from '../src/modules/products/domain/product-sku.entity';

describe('Order cancellation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(globalValidationPipe);
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(
      new TransformResponseInterceptor(app.get(Reflector)),
    );
    await app.init();
    dataSource = app.get(DataSource);
    // Jest sets NODE_ENV=test, so AppModule does not synchronize; build the full schema on the test database
    await dataSource.synchronize();

    const unique = Date.now();
    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Cancel Tester',
        username: `cancel_${unique}`,
        email: `cancel_${unique}@example.com`,
        password: 'StrongP@ss1',
      })
      .expect(201);
    accessToken = registered.body.data.auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createSkuWithStock(stock: number): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Cancel race product',
        skus: [
          {
            price: 100000,
            stock,
            skuCode: `RACE-${Date.now()}`,
            thumbUrl: 'https://cdn.example.com/thumb.png',
            optionValueIds: [],
          },
        ],
      })
      .expect(201);
    return Number(response.body.data.product.skus[0].id);
  }

  async function readStock(skuId: number): Promise<number> {
    const sku = await dataSource
      .getRepository(ProductSkuEntity)
      .findOneByOrFail({ id: skuId });
    return Number(sku.stock);
  }

  it('should release stock only once when the same order is cancelled twice in parallel', async () => {
    // Arrange
    const skuId = await createSkuWithStock(10);
    const order = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        deliveryAddress: '123 Main St',
        totalAmount: 200000,
        items: [{ skuId, price: 100000, quantity: 2 }],
      })
      .expect(201);
    const orderId = order.body.data.order.id;
    expect(await readStock(skuId)).toBe(8);

    // Act
    const cancel = () =>
      request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ orderStatus: 4 });
    const responses = await Promise.all([cancel(), cancel()]);

    // Assert
    // The loser gets 409 when both requests read Pending, or 400 when it reads Cancelled
    const statuses = responses.map((response) => response.status).sort();
    expect(statuses[0]).toBe(200);
    expect([400, 409]).toContain(statuses[1]);
    expect(await readStock(skuId)).toBe(10);
  });
});
