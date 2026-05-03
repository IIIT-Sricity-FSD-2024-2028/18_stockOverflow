"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../common/json-db.service");
const products_service_1 = require("../products/products.service");
let ReservationsService = class ReservationsService {
    constructor(db, productsService) {
        this.db = db;
        this.productsService = productsService;
    }
    findAll(storeId) {
        const storeKey = this.normalizeText(storeId).toLowerCase();
        const items = this.db.getCollection('reservations');
        return storeKey
            ? items.filter((entry) => entry.storeId.toLowerCase() === storeKey)
            : items;
    }
    findRequests(status) {
        const statusKey = this.normalizeText(status).toLowerCase();
        const items = this.db.getCollection('reservationRequests').sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return statusKey
            ? items.filter((entry) => entry.status.toLowerCase() === statusKey)
            : items;
    }
    findRequest(requestId) {
        const request = this.db
            .getCollection('reservationRequests')
            .find((entry) => entry.requestId === requestId);
        if (!request) {
            throw new common_1.NotFoundException('Reservation request not found');
        }
        return request;
    }
    createRequest(createReservationRequestDto) {
        const product = this.productsService.findBySku(createReservationRequestDto.sku);
        const storeId = this.normalizeText(createReservationRequestDto.storeId);
        const storeEntry = product.storeInventory.find((entry) => entry.storeId === storeId);
        if (!storeEntry) {
            throw new common_1.BadRequestException('Selected store is unavailable for this product');
        }
        const pendingReservedQty = this.db
            .getCollection('reservations')
            .filter((entry) => entry.sku === product.sku && entry.storeId === storeId)
            .reduce((sum, entry) => sum + (entry.qty || 0), 0);
        const availableQty = Math.max(0, (storeEntry.qty || 0) - pendingReservedQty);
        const requestedQty = Math.max(1, Math.trunc(createReservationRequestDto.qty || 1));
        if (requestedQty > availableQty) {
            throw new common_1.BadRequestException(`Requested quantity exceeds available stock in the selected store. Only ${availableQty} left.`);
        }
        const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const now = new Date().toISOString();
        const storeName = this.normalizeText(createReservationRequestDto.store) ||
            this.resolveStoreName(storeId);
        const request = {
            requestId,
            sku: product.sku,
            productName: product.name,
            qty: requestedQty,
            storeId,
            store: storeName,
            paymentMethod: this.normalizeText(createReservationRequestDto.paymentMethod, 'Cash'),
            status: 'pending',
            createdAt: now,
        };
        const reservation = {
            requestId,
            sku: product.sku,
            name: product.name,
            qty: requestedQty,
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
    updateRequest(requestId, updateReservationRequestDto) {
        const requests = this.db.getCollection('reservationRequests');
        const index = requests.findIndex((entry) => entry.requestId === requestId);
        if (index === -1) {
            throw new common_1.NotFoundException('Reservation request not found');
        }
        requests[index] = {
            ...requests[index],
            ...updateReservationRequestDto,
            status: this.normalizeText(updateReservationRequestDto.status, requests[index].status),
        };
        this.db.saveCollection('reservationRequests', requests);
        return requests[index];
    }
    completeRequests(requestIds, orderId) {
        if (!Array.isArray(requestIds) || !requestIds.length) {
            return [];
        }
        const requestIdSet = new Set(requestIds.map((entry) => String(entry || '').trim()).filter(Boolean));
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
    resolveStoreName(storeId) {
        const stores = this.db.getCollection('stores');
        return (stores.find((entry) => entry.id === storeId)?.name ||
            'Downtown Store');
    }
    normalizeText(value, fallback = '') {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        products_service_1.ProductsService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map