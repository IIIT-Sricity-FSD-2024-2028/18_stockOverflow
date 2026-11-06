import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ReservationRecord,
  ReservationRequestRecord,
} from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto';

@Injectable()
export class ReservationsService implements OnModuleInit {
  // Hold duration for pre-orders: 15 minutes
  public static readonly HOLD_DURATION_MS = 15 * 60 * 1000;

  constructor(
    private readonly db: JsonDbService,
    private readonly productsService: ProductsService,
  ) {}

  onModuleInit() {
    this.purgeExpiredReservations();
    setInterval(() => {
      try {
        this.purgeExpiredReservations();
      } catch (err) {
        // silent interval catch
      }
    }, 15000); // Check every 15 seconds
  }

  purgeExpiredReservations(): { expiredCount: number } {
    const now = Date.now();
    const nowIso = new Date().toISOString();
    const reservations = this.db.getCollection('reservations');
    const requests = this.db.getCollection('reservationRequests');
    const expiredRequestIds = new Set<string>();

    reservations.forEach((entry) => {
      const expiresAtMs = entry.expiresAt
        ? new Date(entry.expiresAt).getTime()
        : new Date(entry.reservedAt).getTime() + ReservationsService.HOLD_DURATION_MS;
      if (expiresAtMs <= now) {
        expiredRequestIds.add(entry.requestId);
      }
    });

    requests.forEach((entry) => {
      if (entry.status === 'pending') {
        const expiresAtMs = entry.expiresAt
          ? new Date(entry.expiresAt).getTime()
          : new Date(entry.createdAt).getTime() + ReservationsService.HOLD_DURATION_MS;
        if (expiresAtMs <= now) {
          expiredRequestIds.add(entry.requestId);
        }
      }
    });

    if (!expiredRequestIds.size) {
      return { expiredCount: 0 };
    }

    // 1. Remove expired holds from the active reservations queue (instantly frees available stock)
    const remainingReservations = reservations.filter(
      (entry) => !expiredRequestIds.has(entry.requestId),
    );
    this.db.saveCollection('reservations', remainingReservations);

    // 2. Mark requests as 'expired' in reservationRequests ledger
    const updatedRequests = requests.map((entry) => {
      if (expiredRequestIds.has(entry.requestId) && entry.status === 'pending') {
        return {
          ...entry,
          status: 'expired',
          expiredAt: nowIso,
          cancelReason:
            entry.cancelReason ||
            'Pre-order hold expired: 15-minute payment/pickup confirmation window elapsed',
        };
      }
      return entry;
    });
    this.db.saveCollection('reservationRequests', updatedRequests);

    return { expiredCount: expiredRequestIds.size };
  }

  findAll(storeId?: string) {
    this.purgeExpiredReservations();
    const storeKey = this.normalizeText(storeId);
    const items = this.db.getCollection('reservations');
    return storeKey
      ? items.filter((entry) => this.matchesStore(entry.storeId, storeKey))
      : items;
  }

  findRequests(
    status?: string,
    customerLookup?: string,
    storeId?: string,
  ) {
    this.purgeExpiredReservations();
    const statusKey = this.normalizeText(status).toLowerCase();
    const customerKey = this.normalizeText(customerLookup).toLowerCase();
    const storeKey = this.normalizeText(storeId);
    const items = this.db.getCollection('reservationRequests').sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return items.filter((entry) => {
      if (statusKey && entry.status.toLowerCase() !== statusKey) {
        return false;
      }
      if (storeKey && !this.matchesStore(entry.storeId, storeKey)) {
        return false;
      }
      if (customerKey && !this.matchesCustomer(entry, customerKey)) {
        return false;
      }
      return true;
    });
  }

  findRequest(requestId: string) {
    this.purgeExpiredReservations();
    const request = this.db
      .getCollection('reservationRequests')
      .find((entry) => entry.requestId === requestId);

    if (!request) {
      throw new NotFoundException('Reservation request not found');
    }

    return request;
  }

  createRequest(createReservationRequestDto: CreateReservationRequestDto) {
    // Purge any expired holds first so available quantity is 100% current
    this.purgeExpiredReservations();

    const product = this.productsService.findBySku(createReservationRequestDto.sku);
    let storeId = this.normalizeText(createReservationRequestDto.storeId);
    const rawStoreCode = storeId.includes(':') ? storeId.split(':').pop() : storeId;
    let storeEntry = product.storeInventory.find(
      (entry) =>
        entry.storeId === storeId ||
        entry.storeId === rawStoreCode ||
        storeId.endsWith(':' + entry.storeId),
    );

    // Fallback gracefully to the central fulfillment store or the first branch with inventory
    if (!storeEntry) {
      storeEntry =
        product.storeInventory.find((entry) => entry.storeId === 'default-store') ||
        product.storeInventory[0];
      if (storeEntry) {
        storeId = storeEntry.storeId;
      }
    } else {
      storeId = storeEntry.storeId;
    }

    if (!storeEntry) {
      throw new BadRequestException('Selected store is unavailable for this product');
    }

    const pendingReservedQty = this.db
      .getCollection('reservations')
      .filter((entry) => entry.sku === product.sku && this.matchesStore(entry.storeId, storeId))
      .reduce((sum, entry) => sum + (entry.qty || 0), 0);
    const availableQty = Math.max(0, (storeEntry.qty || 0) - pendingReservedQty);
    const requestedQty = Math.max(1, Math.trunc(createReservationRequestDto.qty || 1));

    if (requestedQty > availableQty) {
      throw new BadRequestException(
        `Requested quantity exceeds available stock in the selected store. Only ${availableQty} left.`,
      );
    }

    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAtIso = new Date(
      now.getTime() + ReservationsService.HOLD_DURATION_MS,
    ).toISOString();
    const storeName =
      this.normalizeText(createReservationRequestDto.store) ||
      this.resolveStoreName(storeId);

    const request: ReservationRequestRecord = {
      requestId,
      sku: product.sku,
      productName: product.name,
      qty: requestedQty,
      customer: this.normalizeText(createReservationRequestDto.customer),
      customerEmail: this.normalizeText(createReservationRequestDto.customerEmail),
      customerPhone: this.normalizeText(createReservationRequestDto.customerPhone),
      customerId: this.normalizeText(createReservationRequestDto.customerId),
      storeId,
      store: storeName,
      paymentMethod: this.normalizeText(
        createReservationRequestDto.paymentMethod,
        'Cash',
      ),
      status: 'pending',
      createdAt: nowIso,
      expiresAt: expiresAtIso,
    };

    const reservation: ReservationRecord = {
      requestId,
      sku: product.sku,
      name: product.name,
      qty: requestedQty,
      customer: request.customer,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      customerId: request.customerId,
      priceUSD: product.priceUSD,
      productImg: product.productImg,
      emoji: product.emoji,
      maxAvailable: availableQty,
      storeId,
      store: storeName,
      paymentMethod: request.paymentMethod,
      status: 'Pending POS Approval',
      reservedAt: nowIso,
      expiresAt: expiresAtIso,
    };

    const requests = this.db.getCollection('reservationRequests');
    requests.unshift(request);
    this.db.saveCollection('reservationRequests', requests);

    const reservations = this.db.getCollection('reservations');
    reservations.unshift(reservation);
    this.db.saveCollection('reservations', reservations);

    return {
      request,
      reservation,
    };
  }

  updateRequest(
    requestId: string,
    updateReservationRequestDto: UpdateReservationRequestDto,
  ) {
    const requests = this.db.getCollection('reservationRequests');
    const index = requests.findIndex((entry) => entry.requestId === requestId);
    if (index === -1) {
      throw new NotFoundException('Reservation request not found');
    }

    const nextStatus = this.normalizeText(
      updateReservationRequestDto.status,
      requests[index].status,
    );
    const isCancelling = nextStatus.toLowerCase() === 'cancelled';
    const now = new Date().toISOString();

    requests[index] = {
      ...requests[index],
      ...updateReservationRequestDto,
      status: nextStatus,
      ...(isCancelling
        ? {
            cancelledAt: requests[index].cancelledAt || now,
            cancelledBy:
              updateReservationRequestDto.cancelledBy ||
              requests[index].cancelledBy ||
              'customer',
            cancelReason:
              updateReservationRequestDto.cancelReason ||
              requests[index].cancelReason ||
              'Cancelled by customer',
          }
        : {}),
    };
    this.db.saveCollection('reservationRequests', requests);

    if (isCancelling) {
      const remainingReservations = this.db
        .getCollection('reservations')
        .filter((entry) => entry.requestId !== requestId);
      this.db.saveCollection('reservations', remainingReservations);
    }

    return requests[index];
  }

  cancelRequest(requestId: string, reason?: string, cancelledBy?: string) {
    return this.updateRequest(requestId, {
      status: 'cancelled',
      cancelReason: reason || 'Cancelled by customer',
      cancelledBy: cancelledBy || 'customer',
      cancelledAt: new Date().toISOString(),
    });
  }

  completeRequests(requestIds: string[], orderId: string) {
    if (!Array.isArray(requestIds) || !requestIds.length) {
      return [];
    }

    const requestIdSet = new Set(
      requestIds.map((entry) => String(entry || '').trim()).filter(Boolean),
    );
    if (!requestIdSet.size) {
      return [];
    }

    const completedAt = new Date().toISOString();
    const requests = this.db.getCollection('reservationRequests').map((entry) => {
      if (!requestIdSet.has(entry.requestId)) {
        return entry;
      }

      return {
        ...entry,
        status: 'completed',
        orderId,
        completedAt,
        completedBy: 'biller',
      };
    });
    this.db.saveCollection('reservationRequests', requests);

    const remainingReservations = this.db
      .getCollection('reservations')
      .filter((entry) => !requestIdSet.has(entry.requestId));
    this.db.saveCollection('reservations', remainingReservations);

    return requests.filter((entry) => requestIdSet.has(entry.requestId));
  }

  private matchesStore(entryStoreId?: string, queryStoreId?: string): boolean {
    if (!queryStoreId || !queryStoreId.trim()) return true;
    if (!entryStoreId || !entryStoreId.trim()) return true;
    const e = entryStoreId.toLowerCase().trim();
    const q = queryStoreId.toLowerCase().trim();
    if (e === q) return true;
    if (e === 'default-store' || q === 'default-store') return true;

    const eCode = e.includes(':') ? e.split(':').pop()! : e;
    const qCode = q.includes(':') ? q.split(':').pop()! : q;
    if (eCode === qCode) return true;
    if (e.endsWith(':' + qCode) || q.endsWith(':' + eCode)) return true;
    if (e.includes(qCode) || q.includes(eCode)) return true;
    return false;
  }

  private resolveStoreName(storeId: string) {
    const stores = this.db.getCollection('stores');
    return (
      stores.find((entry) => entry.id === storeId)?.name ||
      'Downtown Store'
    );
  }

  private normalizeText(value: unknown, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private matchesCustomer(
    entry: Partial<ReservationRequestRecord>,
    customerKey: string,
  ) {
    const values = [
      entry.customer,
      entry.customerEmail,
      entry.customerId,
    ].map((value) => this.normalizeText(value).toLowerCase());

    return values.some((value) => value && value === customerKey);
  }
}
