import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
export class ReservationsService {
  constructor(
    private readonly db: JsonDbService,
    private readonly productsService: ProductsService,
  ) {}

  findAll(storeId?: string) {
    const storeKey = this.normalizeText(storeId).toLowerCase();
    const items = this.db.getCollection('reservations');
    return storeKey
      ? items.filter((entry) => entry.storeId.toLowerCase() === storeKey)
      : items;
  }

  findRequests(status?: string, customerLookup?: string) {
    const statusKey = this.normalizeText(status).toLowerCase();
    const customerKey = this.normalizeText(customerLookup).toLowerCase();
    const items = this.db.getCollection('reservationRequests').sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return items.filter((entry) => {
      if (statusKey && entry.status.toLowerCase() !== statusKey) {
        return false;
      }
      if (customerKey && !this.matchesCustomer(entry, customerKey)) {
        return false;
      }
      return true;
    });
  }

  findRequest(requestId: string) {
    const request = this.db
      .getCollection('reservationRequests')
      .find((entry) => entry.requestId === requestId);

    if (!request) {
      throw new NotFoundException('Reservation request not found');
    }

    return request;
  }

  createRequest(createReservationRequestDto: CreateReservationRequestDto) {
    const product = this.productsService.findBySku(createReservationRequestDto.sku);
    const storeId = this.normalizeText(createReservationRequestDto.storeId);
    const storeEntry = product.storeInventory.find((entry) => entry.storeId === storeId);

    if (!storeEntry) {
      throw new BadRequestException('Selected store is unavailable for this product');
    }

    const pendingReservedQty = this.db
      .getCollection('reservations')
      .filter((entry) => entry.sku === product.sku && entry.storeId === storeId)
      .reduce((sum, entry) => sum + (entry.qty || 0), 0);
    const availableQty = Math.max(0, (storeEntry.qty || 0) - pendingReservedQty);
    const requestedQty = Math.max(1, Math.trunc(createReservationRequestDto.qty || 1));

    if (requestedQty > availableQty) {
      throw new BadRequestException(
        `Requested quantity exceeds available stock in the selected store. Only ${availableQty} left.`,
      );
    }

    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const now = new Date().toISOString();
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
      customerId: this.normalizeText(createReservationRequestDto.customerId),
      storeId,
      store: storeName,
      paymentMethod: this.normalizeText(
        createReservationRequestDto.paymentMethod,
        'Cash',
      ),
      status: 'pending',
      createdAt: now,
    };

    const reservation: ReservationRecord = {
      requestId,
      sku: product.sku,
      name: product.name,
      qty: requestedQty,
      customer: request.customer,
      customerEmail: request.customerEmail,
      customerId: request.customerId,
      priceUSD: product.priceUSD,
      productImg: product.productImg,
      emoji: product.emoji,
      maxAvailable: availableQty,
      storeId,
      store: storeName,
      paymentMethod: request.paymentMethod,
      status: 'Pending POS Approval',
      reservedAt: now,
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

    requests[index] = {
      ...requests[index],
      ...updateReservationRequestDto,
      status: this.normalizeText(
        updateReservationRequestDto.status,
        requests[index].status,
      ),
    };
    this.db.saveCollection('reservationRequests', requests);
    return requests[index];
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
