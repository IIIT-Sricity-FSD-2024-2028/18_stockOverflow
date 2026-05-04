import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonCollectionService } from '../common/collection.service';
import {
  Product,
  StockAdjustment,
} from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';

@Injectable()
export class StockAdjustmentsService extends JsonCollectionService<
  StockAdjustment,
  'stockAdjustments'
> {
  protected readonly collectionKey = 'stockAdjustments' as const;
  protected readonly entityName = 'Stock adjustment';
  private readonly fallbackPersonImg =
    'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4';

  constructor(
    db: JsonDbService,
    private readonly productsService: ProductsService,
  ) {
    super(db);
  }

  override findAll(retailerId?: string, storeId?: string) {
    return this.findAllTyped().filter((adjustment) =>
      this.matchesScope(adjustment, retailerId, storeId),
    );
  }

  create(createStockAdjustmentDto: CreateStockAdjustmentDto) {
    const product = this.productsService.findBySku(
      createStockAdjustmentDto.productSku,
      createStockAdjustmentDto.retailerId,
      createStockAdjustmentDto.storeId,
    );
    const nextQuantity = this.resolveQuantity(
      product.qty,
      createStockAdjustmentDto.qty,
      createStockAdjustmentDto.type,
    );
    const qtyDelta =
      createStockAdjustmentDto.type === 'add'
        ? createStockAdjustmentDto.qty
        : -createStockAdjustmentDto.qty;

    this.productsService.applyInventoryAdjustment(
      product.sku,
      qtyDelta,
      createStockAdjustmentDto.storeId || this.resolvePreferredStoreId(product),
      createStockAdjustmentDto.retailerId,
    );

    const adjustments = this.findAllTyped();
    const adjustment: StockAdjustment = {
      id: this.nextNumericId(),
      retailerId: createStockAdjustmentDto.retailerId,
      storeId: createStockAdjustmentDto.storeId,
      productSku: product.sku,
      product: product.name,
      warehouse: createStockAdjustmentDto.warehouse || '',
      type: createStockAdjustmentDto.type,
      qty: createStockAdjustmentDto.qty,
      reason: createStockAdjustmentDto.reason,
      date: createStockAdjustmentDto.date || this.formatDateLabel(),
      person: createStockAdjustmentDto.person || 'Current User',
      personImg: createStockAdjustmentDto.personImg || this.fallbackPersonImg,
      status: createStockAdjustmentDto.status || 'completed',
      notes: createStockAdjustmentDto.notes || '',
    };

    adjustments.unshift(adjustment);
    this.write(adjustments);

    return adjustment;
  }

  update(id: number, updateStockAdjustmentDto: UpdateStockAdjustmentDto) {
    const adjustments = this.findAllTyped();
    const index = adjustments.findIndex((adjustment) => adjustment.id === id);

    if (index === -1) {
      throw new NotFoundException('Stock adjustment not found');
    }

    const updated: StockAdjustment = {
      ...adjustments[index],
      ...updateStockAdjustmentDto,
    };

    adjustments[index] = updated;
    this.write(adjustments);

    return updated;
  }

  private matchesScope(
    adjustment: Partial<StockAdjustment>,
    retailerId?: string,
    storeId?: string,
  ) {
    const normalizedRetailerId = this.normalizeText(retailerId);
    const normalizedStoreId = this.normalizeText(storeId);

    if (
      normalizedRetailerId &&
      this.normalizeText(adjustment.retailerId) !== normalizedRetailerId
    ) {
      return false;
    }

    if (normalizedStoreId && this.normalizeText(adjustment.storeId) !== normalizedStoreId) {
      return false;
    }

    return true;
  }

  private normalizeText(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : '';
  }

  private resolvePreferredStoreId(product: Product) {
    if (!Array.isArray(product.storeInventory) || !product.storeInventory.length) {
      return undefined;
    }

    const sorted = product.storeInventory
      .slice()
      .sort((left, right) => (left.qty || 0) - (right.qty || 0));
    return sorted[0]?.storeId;
  }

  private resolveQuantity(
    currentQty: number,
    adjustmentQty: number,
    type: string,
  ) {
    if (type === 'add') {
      return currentQty + adjustmentQty;
    }

    if (adjustmentQty > currentQty) {
      throw new BadRequestException(
        'Adjustment quantity cannot exceed current product stock',
      );
    }

    return currentQty - adjustmentQty;
  }
}
