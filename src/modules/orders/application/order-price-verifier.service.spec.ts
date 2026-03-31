import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderPriceVerifier } from './order-price-verifier.service';
import { PRODUCT_SKU_REPOSITORY } from '../../products/application/interfaces/product-sku-repository.interface';
import { ProductSkuEntity } from '../../products/domain/product-sku.entity';
import { CreateOrderDto } from './dto/create-order.dto';

const makeSku = (id: number, price: number): ProductSkuEntity =>
  ({ id, price }) as ProductSkuEntity;

const makeDto = (overrides: Partial<CreateOrderDto> = {}): CreateOrderDto => ({
  deliveryAddress: '123 Main St',
  totalAmount: 150000,
  items: [{ skuId: 1, price: 150000, quantity: 1 }],
  ...overrides,
});

const mockSkuRepository = {
  findByIds: jest.fn(),
};

describe('OrderPriceVerifier', () => {
  let verifier: OrderPriceVerifier;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderPriceVerifier,
        { provide: PRODUCT_SKU_REPOSITORY, useValue: mockSkuRepository },
      ],
    }).compile();

    verifier = module.get<OrderPriceVerifier>(OrderPriceVerifier);
    jest.clearAllMocks();
  });

  describe('verify', () => {
    it('should calculate correct total when user orders a single item', async () => {
      // Arrange
      const dto = makeDto({ totalAmount: 150000 });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.total).toBe(150000);
      expect(result.subtotals.get(1)).toBe(150000);
    });

    it('should calculate correct total when user orders multiple items', async () => {
      // Arrange
      const dto = makeDto({
        totalAmount: 350000,
        items: [
          { skuId: 1, price: 200000, quantity: 1 },
          { skuId: 2, price: 150000, quantity: 1 },
        ],
      });
      mockSkuRepository.findByIds.mockResolvedValue([
        makeSku(1, 200000),
        makeSku(2, 150000),
      ]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.total).toBe(350000);
      expect(result.subtotals.get(1)).toBe(200000);
      expect(result.subtotals.get(2)).toBe(150000);
    });

    it('should deduct discount from subtotal when item has a discount', async () => {
      // Arrange - 150000 * 1 * 10% discount = 135000
      const dto = makeDto({
        totalAmount: 135000,
        items: [{ skuId: 1, price: 150000, quantity: 1, discountPercent: 10 }],
      });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.subtotals.get(1)).toBe(135000);
    });

    it('should add shipping fee to subtotal', async () => {
      // Arrange - 150000 item + 30000 shipping = 180000
      const dto = makeDto({
        totalAmount: 180000,
        items: [{ skuId: 1, price: 150000, quantity: 1, shippingFee: 30000 }],
      });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.subtotals.get(1)).toBe(180000);
    });

    it('should calculate subtotal correctly when item has both discount and shipping fee', async () => {
      // Arrange - (150000 * 2) * (1 - 10%) + 30000 = 270000 + 30000 = 300000
      const dto = makeDto({
        totalAmount: 300000,
        items: [
          {
            skuId: 1,
            price: 150000,
            quantity: 2,
            discountPercent: 10,
            shippingFee: 30000,
          },
        ],
      });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.subtotals.get(1)).toBe(300000);
    });

    it('should reject order when user orders a SKU that no longer exists', async () => {
      // Arrange
      const dto = makeDto({
        items: [{ skuId: 99, price: 150000, quantity: 1 }],
      });
      mockSkuRepository.findByIds.mockResolvedValue([]);

      // Act & Assert
      await expect(verifier.verify(dto)).rejects.toThrow(
        new NotFoundException('SKU 99 not found'),
      );
    });

    it('should reject order when user submits a price lower than the actual SKU price', async () => {
      // Arrange - user tampered the price from 150000 to 1
      const dto = makeDto({ items: [{ skuId: 1, price: 1, quantity: 1 }] });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act & Assert
      await expect(verifier.verify(dto)).rejects.toThrow(BadRequestException);
      await expect(verifier.verify(dto)).rejects.toThrow('Price mismatch');
    });

    it('should reject order when client total does not match server-calculated total', async () => {
      // Arrange - user tampered the totalAmount field
      const dto = makeDto({ totalAmount: 1 });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act & Assert
      await expect(verifier.verify(dto)).rejects.toThrow(BadRequestException);
      await expect(verifier.verify(dto)).rejects.toThrow('Total mismatch');
    });
  });
});
