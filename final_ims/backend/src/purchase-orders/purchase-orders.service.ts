import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonCollectionService } from '../common/collection.service';
import { PurchaseOrder } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchaseOrdersService extends JsonCollectionService<
  PurchaseOrder,
  'purchaseOrders'
> {
  protected readonly collectionKey = 'purchaseOrders' as const;
  protected readonly entityName = 'Purchase order';

  constructor(
    db: JsonDbService,
    private readonly suppliersService: SuppliersService,
    private readonly retailersService: RetailersService,
    private readonly productsService: ProductsService,
  ) {
    super(db);
  }

  override findAll(retailerId?: string, storeId?: string, supplierId?: string) {
    return this.findAllTyped().filter((order) =>
      this.matchesScope(order, retailerId, storeId, supplierId),
    );
  }

  create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const supplier = this.suppliersService.findOne(createPurchaseOrderDto.supplierId);
    const retailer =
      createPurchaseOrderDto.retailerId
        ? this.retailersService.findOne(createPurchaseOrderDto.retailerId)
        : null;

    const purchaseOrders = this.findAllTyped();
    const subtotal = createPurchaseOrderDto.items.reduce(
      (total, item) => total + item.price * item.qty,
      0,
    );
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    const year = new Date().getFullYear();
    const nextNumber =
      purchaseOrders
        .map((order) => {
          const match = new RegExp(`PO-${year}-(\\d+)$`).exec(order.id);
          return match ? Number.parseInt(match[1], 10) : 0;
        })
        .reduce((max, value) => Math.max(max, value), 0) + 1;

    const purchaseOrder: PurchaseOrder = {
      id: `PO-${year}-${String(nextNumber).padStart(4, '0')}`,
      supplierId: supplier.id,
      supplierName:
        createPurchaseOrderDto.supplierName ||
        supplier.business.companyName ||
        supplier.primaryContact.fullName,
      retailerId: retailer?.id || createPurchaseOrderDto.retailerId || '',
      retailerName:
        createPurchaseOrderDto.retailerName ||
        retailer?.business.businessName ||
        retailer?.primaryContact.fullName ||
        '',
      storeId: createPurchaseOrderDto.storeId || '',
      items: createPurchaseOrderDto.items,
      deliveryDate: createPurchaseOrderDto.deliveryDate,
      paymentTerms: createPurchaseOrderDto.paymentTerms || 'Net 30',
      notes: createPurchaseOrderDto.notes || '',
      shippingAddress: createPurchaseOrderDto.shippingAddress || '',
      subtotal,
      tax,
      total,
      units: createPurchaseOrderDto.items.reduce(
        (count, item) => count + item.qty,
        0,
      ),
      status: createPurchaseOrderDto.status || 'Pending',
      createdAt: this.timestamp(),
    };

    purchaseOrders.unshift(purchaseOrder);
    this.write(purchaseOrders);

    return purchaseOrder;
  }

  update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrders = this.findAllTyped();
    const index = purchaseOrders.findIndex((order) => order.id === id);

    if (index === -1) {
      throw new NotFoundException('Purchase order not found');
    }

    const existing = purchaseOrders[index];
    const items = updatePurchaseOrderDto.items || existing.items;
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.qty,
      0,
    );
    const tax = Math.round(subtotal * 0.05);

    const updated: PurchaseOrder = {
      ...existing,
      ...updatePurchaseOrderDto,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      units: items.reduce((count, item) => count + item.qty, 0),
    };

    purchaseOrders[index] = updated;
    this.write(purchaseOrders);

    // Trigger inventory update if status changed to Delivered
    if (
      updated.status === 'Delivered' &&
      existing.status !== 'Delivered' &&
      updated.retailerId
    ) {
      this.syncInventoryOnDelivery(updated);
    }

    return updated;
  }

  private syncInventoryOnDelivery(order: PurchaseOrder) {
    order.items.forEach((item) => {
      try {
        // Try to adjust existing product in retailer's inventory
        this.productsService.applyInventoryAdjustment(
          item.sku,
          item.qty,
          order.storeId,
          order.retailerId,
        );
      } catch {
        // If product doesn't exist for this retailer, create it
        this.productsService.create({
          sku: item.sku,
          name: item.name,
          retailerId: order.retailerId,
          storeId: order.storeId,
          priceUSD: item.price * 1.3, // 30% markup for retail
          qty: item.qty,
          brand: order.supplierName,
          category: 'General',
          supplier: order.supplierName,
          visibility: 'published',
        });
      }

      try {
        this.suppliersService.adjustProductStock(
          order.supplierId,
          item.sku,
          -item.qty,
        );
      } catch {
        // Supplier stock sync should not block retailer inventory receipt.
      }
    });
  }

  private matchesScope(
    order: Partial<PurchaseOrder>,
    retailerId?: string,
    storeId?: string,
    supplierId?: string,
  ) {
    const normalizedRetailerId = this.normalizeText(retailerId);
    const normalizedStoreId = this.normalizeText(storeId);
    const normalizedSupplierId = this.normalizeText(supplierId);

    if (
      normalizedRetailerId &&
      this.normalizeText(order.retailerId) !== normalizedRetailerId
    ) {
      return false;
    }

    if (normalizedStoreId && this.normalizeText(order.storeId) !== normalizedStoreId) {
      return false;
    }

    if (
      normalizedSupplierId &&
      this.normalizeText(order.supplierId) !== normalizedSupplierId
    ) {
      return false;
    }

    return true;
  }

  private normalizeText(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : '';
  }
}
