import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PRODUCT_SKU_QUERY_REPOSITORY,
  type IProductSkuQueryRepository,
} from '../../products/application/interfaces/product-sku-repository.interface';
import { ProductSkuEntity } from '../../products/domain/product-sku.entity';
import { Money } from '../../../common/value-objects/money.vo';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';

export interface VerifiedOrderResult {
  total: number;
  subtotals: Map<number, number>;
}

@Injectable()
export class OrderPriceVerifier {
  constructor(
    @Inject(PRODUCT_SKU_QUERY_REPOSITORY)
    private readonly skuRepository: IProductSkuQueryRepository,
  ) {}

  async verify(dto: CreateOrderDto): Promise<VerifiedOrderResult> {
    const skuIds = dto.items.map((item) => item.skuId);
    this.rejectDuplicateSkus(skuIds);
    const skus = await this.loadSkus(skuIds);
    const result = this.calculateItems(dto.items, skus);
    this.verifyTotalAmount(dto.totalAmount, result.total);
    return result;
  }

  private rejectDuplicateSkus(skuIds: number[]): void {
    if (new Set(skuIds).size !== skuIds.length) {
      throw new BadRequestException('Each SKU may appear only once per order');
    }
  }

  private async loadSkus(
    skuIds: number[],
  ): Promise<Map<number, ProductSkuEntity>> {
    const skus = await this.skuRepository.findByIds(skuIds);
    const skuMap = new Map<number, ProductSkuEntity>();
    for (const sku of skus) {
      skuMap.set(sku.id, sku);
    }
    return skuMap;
  }

  private calculateItems(
    items: OrderItemDto[],
    skus: Map<number, ProductSkuEntity>,
  ): VerifiedOrderResult {
    let total = 0;
    const subtotals = new Map<number, number>();
    for (const item of items) {
      const subtotal = this.verifyItem(item, skus);
      subtotals.set(item.skuId, subtotal);
      total += subtotal;
    }
    return { total, subtotals };
  }

  private verifyItem(
    item: OrderItemDto,
    skus: Map<number, ProductSkuEntity>,
  ): number {
    const sku = skus.get(item.skuId);
    if (!sku) {
      throw new NotFoundException(`SKU ${item.skuId} not found`);
    }
    const itemPrice = Money.of(item.price);
    const skuPrice = Money.of(sku.price);
    if (!itemPrice.equals(skuPrice)) {
      throw new BadRequestException(
        `Price mismatch for SKU ${item.skuId}: expected ${sku.price} but received ${item.price}`,
      );
    }
    return skuPrice.multiply(item.quantity).toNumber();
  }

  private verifyTotalAmount(clientTotal: number, serverTotal: number): void {
    if (clientTotal !== serverTotal) {
      throw new BadRequestException(
        `Total mismatch: expected ${serverTotal} but received ${clientTotal}. Prices may have changed.`,
      );
    }
  }
}
