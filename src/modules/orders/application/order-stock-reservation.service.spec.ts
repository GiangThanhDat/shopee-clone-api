import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStockReservation } from './order-stock-reservation.service';
import { PRODUCT_SKU_STOCK_REPOSITORY } from '../../products/application/interfaces/product-sku-repository.interface';

const mockStockRepository = {
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
};

describe('OrderStockReservation', () => {
  let reservation: OrderStockReservation;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderStockReservation,
        {
          provide: PRODUCT_SKU_STOCK_REPOSITORY,
          useValue: mockStockRepository,
        },
      ],
    }).compile();

    reservation = module.get(OrderStockReservation);
    jest.clearAllMocks();
  });

  describe('reserve', () => {
    it('should decrement stock for each line when enough stock is available', async () => {
      // Arrange
      mockStockRepository.decrementStock.mockResolvedValue(true);

      // Act
      await reservation.reserve([
        { skuId: 1, quantity: 2 },
        { skuId: 2, quantity: 1 },
      ]);

      // Assert
      expect(mockStockRepository.decrementStock).toHaveBeenCalledWith(1, 2);
      expect(mockStockRepository.decrementStock).toHaveBeenCalledWith(2, 1);
    });

    it('should throw ConflictException when a SKU does not have enough stock', async () => {
      // Arrange
      mockStockRepository.decrementStock.mockResolvedValue(false);

      // Act & Assert
      await expect(
        reservation.reserve([{ skuId: 7, quantity: 5 }]),
      ).rejects.toThrow(new ConflictException('Insufficient stock for SKU 7'));
    });
  });

  describe('release', () => {
    it('should return quantity to stock for each line', async () => {
      // Act
      await reservation.release([{ skuId: 3, quantity: 4 }]);

      // Assert
      expect(mockStockRepository.incrementStock).toHaveBeenCalledWith(3, 4);
    });
  });
});
