import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { ORDER_REPOSITORY } from './interfaces/order-repository.interface';
import { OrderPriceVerifier } from './order-price-verifier.service';
import { OrderEntity } from '../domain/order.entity';
import { OrderDetailEntity } from '../domain/order-detail.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const makeOrder = (overrides: Partial<OrderEntity> = {}): OrderEntity =>
  ({
    id: 1,
    orderCode: 1711234567890,
    totalAmount: 150000,
    deliveryAddress: '123 Main St',
    orderStatus: 0,
    orderedAt: new Date('2026-01-01'),
    paidAt: null,
    shippedAt: null,
    completedAt: null,
    userId: 1,
    details: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }) as OrderEntity;

const makeDetail = (
  overrides: Partial<OrderDetailEntity> = {},
): OrderDetailEntity =>
  ({
    id: 1,
    orderId: 1,
    userId: 1,
    skuId: 1,
    price: 150000,
    quantity: 1,
    discountPercent: 0,
    shippingFee: 0,
    subtotal: 150000,
    ...overrides,
  }) as OrderDetailEntity;

const makeCreateDto = (
  overrides: Partial<CreateOrderDto> = {},
): CreateOrderDto => ({
  deliveryAddress: '123 Main St',
  totalAmount: 150000,
  items: [{ skuId: 1, price: 150000, quantity: 1 }],
  ...overrides,
});

const mockOrderRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIdAndUser: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  saveDetails: jest.fn(),
};

const mockPriceVerifier = {
  verify: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
        { provide: OrderPriceVerifier, useValue: mockPriceVerifier },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return order history with pagination metadata', async () => {
      // Arrange
      const orders = [makeOrder(), makeOrder({ id: 2 })];
      mockOrderRepository.findAll.mockResolvedValue([orders, 2]);

      // Act
      const result = await service.findAll(1, { page: 1, limit: 10 });

      // Assert
      expect(result.orders).toHaveLength(2);
      expect(result.metadata.pagination.totalItems).toBe(2);
      expect(result.metadata.pagination.currentPage).toBe(1);
      expect(result.metadata.pagination.totalPages).toBe(1);
    });

    it('should return only orders matching the requested status', async () => {
      // Arrange - user wants to see only shipped orders
      const shippedOrders = [makeOrder({ orderStatus: 2 })];
      mockOrderRepository.findAll.mockResolvedValue([shippedOrders, 1]);

      // Act
      const filterDto: OrderFilterDto = { status: 2 };
      const result = await service.findAll(1, filterDto);

      // Assert
      expect(result.orders).toHaveLength(1);
      expect(mockOrderRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 2 }),
      );
    });

    it('should return empty list when user has no orders', async () => {
      // Arrange
      mockOrderRepository.findAll.mockResolvedValue([[], 0]);

      // Act
      const result = await service.findAll(1, {});

      // Assert
      expect(result.orders).toHaveLength(0);
      expect(result.metadata.pagination.totalItems).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return order detail when user owns the order', async () => {
      // Arrange
      const order = makeOrder({ details: [makeDetail()] });
      mockOrderRepository.findByIdAndUser.mockResolvedValue(order);

      // Act
      const result = await service.findById(1, 1);

      // Assert
      expect(result.order.id).toBe(1);
      expect(result.order.details).toHaveLength(1);
    });

    it('should throw NotFoundException when order does not belong to the user', async () => {
      // Arrange - another user's order, or order doesn't exist
      mockOrderRepository.findByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(99, 1)).rejects.toThrow(
        new NotFoundException('Order 99 not found'),
      );
    });
  });

  describe('create', () => {
    it('should place an order and return the order with its items', async () => {
      // Arrange
      const dto = makeCreateDto();
      mockPriceVerifier.verify.mockResolvedValue({
        total: 150000,
        subtotals: new Map([[1, 150000]]),
      });
      mockOrderRepository.save.mockResolvedValue(makeOrder({ id: 1 }));
      mockOrderRepository.saveDetails.mockResolvedValue(undefined);
      const fullOrder = makeOrder({ details: [makeDetail()] });
      mockOrderRepository.findById.mockResolvedValue(fullOrder);

      // Act
      const result = await service.create(1, dto);

      // Assert
      expect(result.order.details).toHaveLength(1);
      expect(result.order.totalAmount).toBe(150000);
    });

    it('should verify prices before placing the order', async () => {
      // Arrange
      const dto = makeCreateDto();
      mockPriceVerifier.verify.mockResolvedValue({
        total: 150000,
        subtotals: new Map([[1, 150000]]),
      });
      mockOrderRepository.save.mockResolvedValue(makeOrder());
      mockOrderRepository.saveDetails.mockResolvedValue(undefined);
      mockOrderRepository.findById.mockResolvedValue(makeOrder());

      // Act
      await service.create(1, dto);

      // Assert
      expect(mockPriceVerifier.verify).toHaveBeenCalledWith(dto);
    });

    it('should record the server-calculated subtotal for each item, not the client value', async () => {
      // Arrange - server calculated 135000 (with discount), not 150000
      const dto = makeCreateDto({
        totalAmount: 135000,
        items: [{ skuId: 1, price: 150000, quantity: 1, discountPercent: 10 }],
      });
      mockPriceVerifier.verify.mockResolvedValue({
        total: 135000,
        subtotals: new Map([[1, 135000]]),
      });
      mockOrderRepository.save.mockResolvedValue(
        makeOrder({ totalAmount: 135000 }),
      );
      mockOrderRepository.saveDetails.mockResolvedValue(undefined);
      mockOrderRepository.findById.mockResolvedValue(makeOrder());

      // Act
      await service.create(1, dto);

      // Assert
      expect(mockOrderRepository.saveDetails).toHaveBeenCalledWith([
        expect.objectContaining({ subtotal: 135000 }),
      ]);
    });
  });

  describe('updateStatus', () => {
    it('should mark an order as paid and record the payment timestamp', async () => {
      // Arrange
      mockOrderRepository.findByIdAndUser.mockResolvedValue(makeOrder());
      const paidOrder = makeOrder({ orderStatus: 1, paidAt: new Date() });
      mockOrderRepository.update.mockResolvedValue(paidOrder);

      // Act
      const result = await service.updateStatus(1, 1, { orderStatus: 1 });

      // Assert
      expect(result.order.orderStatus).toBe(1);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          paidAt: expect.any(Date) as unknown as Date,
        }),
      );
    });

    it('should mark an order as shipped and record the shipped timestamp', async () => {
      // Arrange
      mockOrderRepository.findByIdAndUser.mockResolvedValue(makeOrder());
      mockOrderRepository.update.mockResolvedValue(
        makeOrder({ orderStatus: 2 }),
      );
      const dto: UpdateOrderStatusDto = { orderStatus: 2 };

      // Act
      await service.updateStatus(1, 1, dto);

      // Assert
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          shippedAt: expect.any(Date) as unknown as Date,
        }),
      );
    });

    it('should mark an order as completed and record the completed timestamp', async () => {
      // Arrange
      mockOrderRepository.findByIdAndUser.mockResolvedValue(makeOrder());
      mockOrderRepository.update.mockResolvedValue(
        makeOrder({ orderStatus: 3 }),
      );
      const dto: UpdateOrderStatusDto = { orderStatus: 3 };

      // Act
      await service.updateStatus(1, 1, dto);

      // Assert
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          completedAt: expect.any(Date) as unknown as Date,
        }),
      );
    });

    it('should cancel an order without recording any delivery timestamp', async () => {
      // Arrange
      mockOrderRepository.findByIdAndUser.mockResolvedValue(makeOrder());
      mockOrderRepository.update.mockResolvedValue(
        makeOrder({ orderStatus: 4 }),
      );
      const dto: UpdateOrderStatusDto = { orderStatus: 4 };

      // Act
      await service.updateStatus(1, 1, dto);

      // Assert
      expect(mockOrderRepository.update).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ paidAt: expect.anything() as unknown }),
      );
      expect(mockOrderRepository.update).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ shippedAt: expect.anything() as unknown }),
      );
      expect(mockOrderRepository.update).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ completedAt: expect.anything() as unknown }),
      );
    });

    it('should throw NotFoundException when order does not exist or does not belong to the user', async () => {
      // Arrange
      mockOrderRepository.findByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateStatus(99, 1, { orderStatus: 1 }),
      ).rejects.toThrow(new NotFoundException('Order 99 not found'));
    });
  });
});
