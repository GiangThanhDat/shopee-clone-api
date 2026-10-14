import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderPriceVerifier } from './order-price-verifier.service';
import { PRODUCT_SKU_QUERY_REPOSITORY } from '../../products/application/interfaces/product-sku-repository.interface';
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
        { provide: PRODUCT_SKU_QUERY_REPOSITORY, useValue: mockSkuRepository },
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

    it('should multiply server price by quantity when computing subtotal', async () => {
      // Arrange
      const dto = makeDto({
        totalAmount: 450000,
        items: [{ skuId: 1, price: 150000, quantity: 3 }],
      });
      mockSkuRepository.findByIds.mockResolvedValue([makeSku(1, 150000)]);

      // Act
      const result = await verifier.verify(dto);

      // Assert
      expect(result.subtotals.get(1)).toBe(450000);
    });

    it('should reject order when the same SKU appears more than once', async () => {
      // Arrange
      const dto = makeDto({
        totalAmount: 300000,
        items: [
          { skuId: 1, price: 150000, quantity: 1 },
          { skuId: 1, price: 150000, quantity: 1 },
        ],
      });

      // Act & Assert
      await expect(verifier.verify(dto)).rejects.toThrow(BadRequestException);
      expect(mockSkuRepository.findByIds).not.toHaveBeenCalled();
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
