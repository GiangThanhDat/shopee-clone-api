import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_SKU_STOCK_REPOSITORY,
  type IProductSkuStockRepository,
} from '../../products/application/interfaces/product-sku-repository.interface';

export interface StockLine {
  skuId: number;
  quantity: number;
}

@Injectable()
export class OrderStockReservation {
  constructor(
    @Inject(PRODUCT_SKU_STOCK_REPOSITORY)
    private readonly stockRepository: IProductSkuStockRepository,
  ) {}

  async reserve(lines: StockLine[]): Promise<void> {
    for (const line of lines) {
      await this.reserveLine(line);
    }
  }

  async release(lines: StockLine[]): Promise<void> {
    for (const line of lines) {
      await this.stockRepository.incrementStock(line.skuId, line.quantity);
    }
  }

  private async reserveLine(line: StockLine): Promise<void> {
    const reserved = await this.stockRepository.decrementStock(
      line.skuId,
      line.quantity,
    );
    if (!reserved) {
      throw new ConflictException(`Insufficient stock for SKU ${line.skuId}`);
    }
  }
}
