import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import {
  CustomerRecord,
  ProductRecord,
  ReturnPriority,
  ReturnRecord,
  ReturnStatus,
  TransactionRecord,
} from '../common/database.types';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    private readonly db: JsonDbService,
    private readonly productsService: ProductsService,
  ) {}

  findAll(retailerId?: string, storeId?: string, customerLookup?: string) {
    return (this.db.getCollection('returns') as ReturnRecord[])
      .map((entry) => this.normalizeReturnRecord(entry))
      .filter((entry) => this.matchesScope(entry, retailerId, storeId, customerLookup))
      .sort((a, b) => b.dateN - a.dateN);
  }

  findOne(id: string, retailerId?: string, storeId?: string, customerLookup?: string) {
    const entry = this.findAll(retailerId, storeId, customerLookup).find((item) => item.id === id);
    if (!entry) {
      throw new NotFoundException('Return request not found');
    }
    return entry;
  }

  create(createReturnDto: CreateReturnDto) {
    const items = this.db.getCollection('returns') as ReturnRecord[];
    const nextNumber =
      items.reduce((max, entry) => {
        const match = /^RET-(\d+)$/i.exec(entry.id);
        return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
      }, 0) + 1;

    const created = this.buildReturnRecord(createReturnDto, {
      id: `RET-${String(nextNumber).padStart(3, '0')}`,
    });

    items.unshift(created);
    this.saveReturns(items);
    return created;
  }

  update(id: string, updateReturnDto: UpdateReturnDto) {
    const items = this.db.getCollection('returns') as ReturnRecord[];
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new NotFoundException('Return request not found');
    }

    const existing = this.normalizeReturnRecord(items[index]);
    const updated = this.buildReturnRecord(updateReturnDto, {
      existing: items[index],
      id: items[index].id,
    });
    const nextStatus = this.normalizeStatus(updateReturnDto.status, existing.status);
    const shouldRestock =
      !existing.inventoryProcessedAt &&
      (nextStatus === 'Approved' || nextStatus === 'Exchanged');

    items[index] = this.normalizeReturnRecord({
      ...updated,
      retailerActionAt:
        nextStatus !== existing.status
          ? new Date().toISOString()
          : existing.retailerActionAt,
      inventoryProcessedAt: shouldRestock
        ? new Date().toISOString()
        : existing.inventoryProcessedAt,
    });

    if (shouldRestock) {
      this.applyApprovedReturnInventory(items[index]);
    }

    this.saveReturns(items);
    return items[index];
  }

  private buildReturnRecord(
    payload: CreateReturnDto | UpdateReturnDto,
    options: {
      id: string;
      existing?: ReturnRecord;
    },
  ): ReturnRecord {
    const existing = options.existing
      ? this.normalizeReturnRecord(options.existing)
      : undefined;
    const fallbackSku = existing?.sku || '';
    const fallbackName =
      existing?.productName || existing?.product || 'Product';
    const transactionContext = this.resolveTransactionContext(
      this.normalizeText(payload.orderId, existing?.orderId),
      this.normalizeText(payload.sku, fallbackSku),
      this.normalizeText(payload.productName || payload.product, fallbackName),
    );
    const product = this.resolveProduct(
      this.normalizeText(payload.sku, fallbackSku),
      this.normalizeText(payload.productName || payload.product, fallbackName),
    );

    const sku = this.normalizeText(
      payload.sku,
      existing?.sku,
      transactionContext.item?.sku,
      product?.sku,
    );
    const productName = this.normalizeText(
      payload.productName,
      payload.product,
      existing?.productName,
      existing?.product,
      transactionContext.item?.name,
      product?.name,
      'Product',
    );

    if (!sku && !productName) {
      throw new BadRequestException(
        'A product SKU or product name is required',
      );
    }

    const amount = this.resolveAmount(
      payload.amount,
      existing?.amount,
      transactionContext.item?.total,
      transactionContext.item?.price,
      product?.price,
      product?.priceUSD,
    );
    const refundMethod = this.normalizeText(
      payload.refundMethod,
      payload.method,
      existing?.refundMethod,
      existing?.method,
      'Original Payment Method',
    );
    const emoji = this.normalizeText(
      payload.emoji,
      existing?.emoji,
      product?.emoji,
      String.fromCodePoint(0x1f4e6),
    );
    const date = existing?.date || new Date().toISOString();

    return this.normalizeReturnRecord({
      id: options.id,
      retailerId: this.normalizeText(
        payload.retailerId,
        existing?.retailerId,
        transactionContext.transaction?.retailerId,
      ),
      orderId: this.normalizeText(
        payload.orderId,
        existing?.orderId,
        transactionContext.transaction?.orderId,
      ),
      customer: this.normalizeText(
        payload.customer,
        existing?.customer,
        transactionContext.transaction?.customer,
        transactionContext.customer?.name,
        'Recent Customer',
      ),
      customerId: this.normalizeText(
        payload.customerId,
        existing?.customerId,
        transactionContext.customer?.id != null
          ? String(transactionContext.customer.id)
          : '',
      ),
      email: this.normalizeText(
        payload.email,
        existing?.email,
        transactionContext.customer?.email,
      ),
      sku,
      productName,
      product: this.normalizeText(payload.product, existing?.product, productName),
      productImg: this.normalizeText(
        payload.productImg,
        existing?.productImg,
        product?.productImg,
        this.buildFallbackImage(productName, emoji),
      ),
      emoji,
      reason: this.normalizeText(
        payload.reason,
        existing?.reason,
        'Defective / Not Working',
      ),
      condition: this.normalizeText(
        payload.condition,
        existing?.condition,
        'Opened but Unused',
      ),
      refundMethod,
      method: refundMethod,
      notes: this.normalizeText(payload.notes, existing?.notes),
      status: this.normalizeStatus(payload.status, existing?.status),
      date: existing?.date || date,
      dateN: existing?.dateN || this.toDateNumber(existing?.date || date),
      amount,
      priority: this.normalizePriority(
        payload.priority,
        existing?.priority,
        this.inferPriority(
          this.normalizeText(payload.reason, existing?.reason),
          amount,
          this.normalizeText(payload.condition, existing?.condition),
        ),
      ),
      storeId: this.normalizeText(
        payload.storeId,
        existing?.storeId,
        transactionContext.transaction?.storeId,
      ),
      store: this.normalizeText(
        payload.store,
        existing?.store,
        transactionContext.transaction?.store,
      ),
      source: this.normalizeText(payload.source, existing?.source, 'customer'),
      retailerActionAt: this.normalizeText(existing?.retailerActionAt),
      inventoryProcessedAt: this.normalizeText(existing?.inventoryProcessedAt),
    });
  }

  private saveReturns(entries: ReturnRecord[]) {
    this.db.saveCollection(
      'returns',
      entries.map((entry) => this.normalizeReturnRecord(entry)),
    );
  }

  private normalizeReturnRecord(entry: Partial<ReturnRecord>): ReturnRecord {
    const productName = this.normalizeText(
      entry.productName,
      entry.product,
      'Product',
    );
    const refundMethod = this.normalizeText(
      entry.refundMethod,
      entry.method,
      'Original Payment Method',
    );
    const emoji = this.normalizeText(
      entry.emoji,
      String.fromCodePoint(0x1f4e6),
    );
    const date = this.normalizeDate(entry.date);
    const amount = this.toMoney(entry.amount);

    return {
      id: this.normalizeText(entry.id),
      retailerId: this.normalizeText(entry.retailerId),
      orderId: this.normalizeText(entry.orderId),
      customer: this.normalizeText(entry.customer, 'Recent Customer'),
      customerId: this.normalizeText(entry.customerId),
      email: this.normalizeText(entry.email),
      sku: this.normalizeText(entry.sku),
      productName,
      product: this.normalizeText(entry.product, productName),
      productImg: this.normalizeText(
        entry.productImg,
        this.buildFallbackImage(productName, emoji),
      ),
      emoji,
      reason: this.normalizeText(
        entry.reason,
        'Defective / Not Working',
      ),
      condition: this.normalizeText(
        entry.condition,
        'Opened but Unused',
      ),
      refundMethod,
      method: refundMethod,
      notes: this.normalizeText(entry.notes),
      status: this.normalizeStatus(entry.status),
      date,
      dateN: this.toDateNumber(entry.date, entry.dateN),
      amount,
      priority: this.normalizePriority(
        entry.priority,
        this.inferPriority(entry.reason, amount, entry.condition),
      ),
      storeId: this.normalizeText(entry.storeId),
      store: this.normalizeText(entry.store),
      source: this.normalizeText(entry.source, 'customer'),
      retailerActionAt: this.normalizeText(entry.retailerActionAt),
      inventoryProcessedAt: this.normalizeText(entry.inventoryProcessedAt),
    };
  }

  private applyApprovedReturnInventory(entry: ReturnRecord) {
    if (!entry.sku) {
      return;
    }

    try {
      this.productsService.applyInventoryAdjustment(
        entry.sku,
        1,
        this.normalizeText(entry.storeId),
        this.normalizeText(entry.retailerId),
      );
    } catch {
      // Inventory sync should not block the return approval status update.
    }
  }

  private resolveTransactionContext(
    orderId: string,
    sku: string,
    productName: string,
  ) {
    const transactions = this.db.getCollection(
      'transactions',
    ) as TransactionRecord[];
    const normalizedOrderId = this.normalizeText(orderId);
    const normalizedSku = this.normalizeText(sku).toLowerCase();
    const normalizedProductName = this.normalizeText(productName).toLowerCase();

    let transaction: TransactionRecord | undefined;
    let item:
      | TransactionRecord['items'][number]
      | undefined;

    if (normalizedOrderId) {
      transaction = transactions.find(
        (entry) => entry.orderId === normalizedOrderId,
      );
      item = transaction
        ? this.findTransactionItem(
            transaction,
            normalizedSku,
            normalizedProductName,
          )
        : undefined;
    }

    if (!transaction && (normalizedSku || normalizedProductName)) {
      for (const candidate of transactions) {
        const candidateItem = this.findTransactionItem(
          candidate,
          normalizedSku,
          normalizedProductName,
        );
        if (candidateItem) {
          transaction = candidate;
          item = candidateItem;
          break;
        }
      }
    }

    if (!item && transaction?.items?.length === 1) {
      item = transaction.items[0];
    }

    return {
      transaction,
      item,
      customer: this.resolveCustomer(transaction?.customer),
    };
  }

  private findTransactionItem(
    transaction: TransactionRecord,
    normalizedSku: string,
    normalizedProductName: string,
  ) {
    if (normalizedSku) {
      const bySku = transaction.items.find((entry) => {
        return String(entry.sku || '').trim().toLowerCase() === normalizedSku;
      });
      if (bySku) {
        return bySku;
      }
    }

    if (normalizedProductName) {
      return transaction.items.find((entry) => {
        return (
          String(entry.name || '').trim().toLowerCase() === normalizedProductName
        );
      });
    }

    return undefined;
  }

  private resolveCustomer(customerName: string | undefined) {
    const normalizedName = this.normalizeText(customerName).toLowerCase();
    if (!normalizedName) {
      return undefined;
    }

    const customers = this.db.getCollection('customers') as CustomerRecord[];
    return customers.find((entry) => {
      const fullName = this.normalizeText(
        entry.name,
        `${entry.fname || ''} ${entry.lname || ''}`.trim(),
      ).toLowerCase();
      return fullName === normalizedName || entry.email.toLowerCase() === normalizedName;
    });
  }

  private resolveProduct(sku: string, productName: string) {
    const normalizedSku = this.normalizeText(sku).toLowerCase();
    const normalizedProductName = this.normalizeText(productName).toLowerCase();
    const products = this.db.getCollection('products') as ProductRecord[];

    if (normalizedSku) {
      const bySku = products.find((entry) => {
        return String(entry.sku || '').trim().toLowerCase() === normalizedSku;
      });
      if (bySku) {
        return bySku;
      }
    }

    if (normalizedProductName) {
      return products.find((entry) => {
        return (
          String(entry.name || '').trim().toLowerCase() === normalizedProductName
        );
      });
    }

    return undefined;
  }

  private resolveAmount(...values: Array<unknown>) {
    for (const value of values) {
      const amount = Number(value);
      if (Number.isFinite(amount) && amount > 0) {
        return this.toMoney(amount);
      }
    }

    return 0;
  }

  private normalizeStatus(...values: Array<unknown>): ReturnStatus {
    const normalized = this.normalizeText(...values).toLowerCase();
    if (normalized === 'approved') {
      return 'Approved';
    }
    if (normalized === 'rejected') {
      return 'Rejected';
    }
    if (normalized === 'exchanged') {
      return 'Exchanged';
    }
    return 'Pending';
  }

  private normalizePriority(...values: Array<unknown>): ReturnPriority {
    const normalized = this.normalizeText(...values).toLowerCase();
    if (normalized === 'high') {
      return 'High';
    }
    if (normalized === 'low') {
      return 'Low';
    }
    return 'Medium';
  }

  private inferPriority(
    reason: unknown,
    amount: number,
    condition: unknown,
  ): ReturnPriority {
    const normalizedReason = this.normalizeText(reason).toLowerCase();
    const normalizedCondition = this.normalizeText(condition).toLowerCase();
    if (
      normalizedReason.includes('wrong') ||
      normalizedReason.includes('defect') ||
      normalizedCondition.includes('damaged') ||
      amount >= 5000
    ) {
      return 'High';
    }
    if (amount <= 1000 || normalizedReason.includes('mind')) {
      return 'Low';
    }
    return 'Medium';
  }

  private normalizeDate(value: unknown) {
    const raw = this.normalizeText(value);
    if (!raw) {
      return new Date().toISOString();
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
  }

  private toDateNumber(value: unknown, fallback?: unknown) {
    const primary = new Date(this.normalizeText(value));
    if (!Number.isNaN(primary.getTime())) {
      return primary.getTime();
    }

    const secondary = Number(fallback);
    if (Number.isFinite(secondary) && secondary > 0) {
      return Math.trunc(secondary);
    }

    return Date.now();
  }

  private toMoney(value: unknown) {
    const amount = Number(value);
    return Number((Number.isFinite(amount) ? amount : 0).toFixed(2));
  }

  private buildFallbackImage(productName: string, emoji: string) {
    const safeLabel = this.normalizeText(productName, 'Product')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const safeEmoji = this.normalizeText(emoji, String.fromCodePoint(0x1f4e6))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#eff6ff"/><stop offset="1" stop-color="#dbeafe"/></linearGradient></defs><rect width="640" height="480" rx="36" fill="url(#g)"/><circle cx="320" cy="176" r="72" fill="#bfdbfe"/><text x="320" y="198" text-anchor="middle" font-size="72">${safeEmoji}</text><text x="320" y="320" text-anchor="middle" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#1d4ed8">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private normalizeText(...values: unknown[]) {
    for (const candidate of values) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return '';
  }

  private matchesScope(
    entry: Partial<ReturnRecord>,
    retailerId?: string,
    storeId?: string,
    customerLookup?: string,
  ) {
    const normalizedRetailerId = this.normalizeText(retailerId);
    const normalizedStoreId = this.normalizeText(storeId);
    const normalizedCustomerLookup = this.normalizeText(customerLookup).toLowerCase();

    if (
      normalizedRetailerId &&
      this.normalizeText(entry.retailerId) !== normalizedRetailerId
    ) {
      return false;
    }

    const entryStoreId = this.normalizeText(entry.storeId);
    if (normalizedStoreId && entryStoreId && entryStoreId !== normalizedStoreId) {
      return false;
    }

    if (normalizedCustomerLookup) {
      const customerName = this.normalizeText(entry.customer).toLowerCase();
      const customerEmail = this.normalizeText(entry.email).toLowerCase();
      const customerId = this.normalizeText(entry.customerId).toLowerCase();
      if (
        normalizedCustomerLookup !== customerName &&
        normalizedCustomerLookup !== customerEmail &&
        normalizedCustomerLookup !== customerId
      ) {
        return false;
      }
    }

    return true;
  }
}
