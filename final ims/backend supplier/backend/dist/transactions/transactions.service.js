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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("../customers/customers.service");
const json_db_service_1 = require("../common/json-db.service");
const products_service_1 = require("../products/products.service");
const reservations_service_1 = require("../reservations/reservations.service");
let TransactionsService = class TransactionsService {
    constructor(db, productsService, customersService, reservationsService) {
        this.db = db;
        this.productsService = productsService;
        this.customersService = customersService;
        this.reservationsService = reservationsService;
    }
    findAll() {
        return this.db.getCollection('transactions').sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }
    findLatest() {
        return this.findAll()[0] || null;
    }
    findOne(orderId) {
        const transaction = this.findAll().find((entry) => entry.orderId === orderId);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    create(createTransactionDto) {
        const orderId = this.generateOrderId();
        const normalized = this.buildTransactionRecord(createTransactionDto, orderId);
        this.ensureInventoryAvailability(normalized.items, normalized.storeId);
        const transactions = this.findAll();
        transactions.unshift(normalized);
        this.db.saveCollection('transactions', transactions);
        const requestIds = this.collectTransactionRequestIds(normalized.items, normalized.storeId);
        if (requestIds.length) {
            this.reservationsService.completeRequests(requestIds, normalized.orderId);
        }
        this.productsService.rebuildInventoryFromTransactions(transactions);
        this.customersService.registerPurchase(normalized.customer, normalized.finalTotal);
        return normalized;
    }
    update(orderId, updateTransactionDto) {
        const transactions = this.findAll();
        const index = transactions.findIndex((entry) => entry.orderId === orderId);
        if (index === -1) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const existing = transactions[index];
        const normalized = this.buildTransactionRecord({
            customer: this.normalizeText(updateTransactionDto.customer, existing.customer),
            store: this.normalizeText(updateTransactionDto.store, existing.store),
            storeId: this.normalizeText(updateTransactionDto.storeId, existing.storeId),
            paymentMethod: this.normalizeText(updateTransactionDto.paymentMethod, existing.paymentMethod),
            items: Array.isArray(updateTransactionDto.items)
                ? updateTransactionDto.items.map((item, itemIndex) => ({
                    ...existing.items[itemIndex],
                    ...item,
                }))
                : existing.items,
            shipping: updateTransactionDto.shipping != null
                ? updateTransactionDto.shipping
                : existing.shipping,
            tax: updateTransactionDto.tax != null ? updateTransactionDto.tax : existing.tax,
            coupon: updateTransactionDto.coupon != null
                ? updateTransactionDto.coupon
                : existing.coupon,
            discount: updateTransactionDto.discount != null
                ? updateTransactionDto.discount
                : existing.discount,
            roundoff: updateTransactionDto.roundoff != null
                ? updateTransactionDto.roundoff
                : existing.roundoff,
            status: this.normalizeText(updateTransactionDto.status, existing.status),
        }, existing.orderId, existing.timestamp);
        const otherTransactions = transactions.filter((entry) => entry.orderId !== orderId);
        this.productsService.rebuildInventoryFromTransactions(otherTransactions);
        this.ensureInventoryAvailability(normalized.items, normalized.storeId);
        const nextTransactions = otherTransactions.slice();
        nextTransactions.unshift(normalized);
        this.db.saveCollection('transactions', nextTransactions);
        this.productsService.rebuildInventoryFromTransactions(nextTransactions);
        return normalized;
    }
    remove(orderId) {
        const transactions = this.findAll();
        const index = transactions.findIndex((entry) => entry.orderId === orderId);
        if (index === -1) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const [removed] = transactions.splice(index, 1);
        this.db.saveCollection('transactions', transactions);
        this.productsService.rebuildInventoryFromTransactions(transactions);
        return {
            message: 'Transaction deleted successfully',
            item: removed,
        };
    }
    reconcileInventory() {
        const transactions = this.findAll();
        const products = this.productsService.rebuildInventoryFromTransactions(transactions);
        return {
            message: 'Inventory reconciled from transactions',
            transactions: transactions.length,
            products: products.length,
        };
    }
    getPurchasedProducts() {
        const products = this.db.getCollection('products');
        const grouped = this.findAll().reduce((acc, transaction) => {
            transaction.items.forEach((item) => {
                const key = item.sku || item.name;
                if (!key) {
                    return;
                }
                const product = products.find((entry) => entry.sku === item.sku);
                if (!acc[key]) {
                    acc[key] = {
                        sku: item.sku,
                        name: item.name,
                        totalQty: 0,
                        totalSpent: 0,
                        lastOrderedAt: transaction.timestamp,
                        lastOrderId: transaction.orderId,
                        productImg: product?.productImg || '',
                        emoji: product?.emoji || String.fromCodePoint(0x1f4e6),
                    };
                }
                acc[key].totalQty += item.quantity;
                acc[key].totalSpent = this.toMoney(acc[key].totalSpent + item.total);
                if (new Date(transaction.timestamp).getTime() >
                    new Date(acc[key].lastOrderedAt).getTime()) {
                    acc[key].lastOrderedAt = transaction.timestamp;
                    acc[key].lastOrderId = transaction.orderId;
                }
            });
            return acc;
        }, {});
        return Object.values(grouped).sort((a, b) => {
            return (new Date(b.lastOrderedAt).getTime() -
                new Date(a.lastOrderedAt).getTime());
        });
    }
    buildTransactionRecord(payload, orderId, timestamp = new Date().toISOString()) {
        const store = this.normalizeText(payload.store, 'Downtown Store');
        const storeId = this.normalizeText(payload.storeId, this.resolveStoreId(store));
        const items = Array.isArray(payload.items)
            ? payload.items.map((item) => this.normalizeItem(item))
            : [];
        if (!items.length) {
            throw new common_1.BadRequestException('At least one item is required');
        }
        const subtotal = this.toMoney(items.reduce((sum, item) => sum + item.total, 0));
        const shipping = this.toMoney(payload.shipping ?? 0);
        const tax = this.toMoney(payload.tax ?? 0);
        const coupon = this.toMoney(payload.coupon ?? 0);
        const discount = this.toMoney(payload.discount ?? 0);
        const roundoff = this.toMoney(payload.roundoff ?? 0);
        const finalTotal = this.toMoney(subtotal + shipping + tax - coupon - discount + roundoff);
        return {
            orderId,
            timestamp,
            customer: this.normalizeText(payload.customer, 'Walk-in Customer'),
            store,
            storeId,
            paymentMethod: this.normalizeText(payload.paymentMethod, 'Cash'),
            items,
            subtotal,
            shipping,
            tax,
            coupon,
            discount,
            roundoff,
            finalTotal,
            status: this.normalizeText(payload.status, 'Delivered'),
        };
    }
    normalizeItem(item) {
        const quantity = Math.max(1, Math.trunc(Number(item.quantity) || 0));
        const price = this.toMoney(Number(item.price) || 0);
        const total = this.toMoney(item.total != null ? Number(item.total) : quantity * price);
        return {
            sku: this.normalizeText(item.sku),
            name: this.normalizeText(item.name),
            quantity,
            price,
            total,
            isReserved: Boolean(item.isReserved),
            requestIds: Array.isArray(item.requestIds)
                ? item.requestIds.map((entry) => this.normalizeText(entry)).filter(Boolean)
                : [],
        };
    }
    ensureInventoryAvailability(items, storeId) {
        const products = this.db.getCollection('products');
        const unavailable = items.reduce((acc, item) => {
            const product = products.find((entry) => entry.sku === item.sku);
            if (!product) {
                acc.push({ name: item.name, requested: item.quantity, available: 0 });
                return acc;
            }
            const storeInventory = product.storeInventory.find((entry) => entry.storeId === storeId) ||
                product.storeInventory[0];
            const availableQty = Math.min(product.qty || 0, storeInventory ? storeInventory.qty || 0 : product.qty || 0);
            if (item.quantity > availableQty) {
                acc.push({
                    name: item.name || product.name,
                    requested: item.quantity,
                    available: availableQty,
                });
            }
            return acc;
        }, []);
        if (unavailable.length) {
            throw new common_1.BadRequestException({
                message: 'Insufficient inventory for one or more items',
                unavailable,
            });
        }
    }
    collectTransactionRequestIds(items, storeId) {
        const reservations = this.db.getCollection('reservations');
        const collected = new Set();
        items.forEach((item) => {
            if (Array.isArray(item.requestIds) && item.requestIds.length) {
                item.requestIds.forEach((entry) => {
                    if (entry) {
                        collected.add(entry);
                    }
                });
                return;
            }
            if (!item.isReserved) {
                return;
            }
            const matchingReservations = reservations.filter((entry) => entry.sku === item.sku && entry.storeId === storeId);
            matchingReservations.slice(0, item.quantity).forEach((entry) => {
                collected.add(entry.requestId);
            });
        });
        return Array.from(collected);
    }
    resolveStoreId(storeName) {
        const normalized = String(storeName || '').trim().toLowerCase();
        if (normalized === 'east coast hub') {
            return 's3';
        }
        if (normalized === 'global hub') {
            return 's7';
        }
        return 's1';
    }
    generateOrderId() {
        return `ORD${Math.floor(100000 + Math.random() * 900000)}`;
    }
    normalizeText(value, fallback = '') {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }
    toMoney(value) {
        return Number((Number.isFinite(value) ? value : 0).toFixed(2));
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        products_service_1.ProductsService,
        customers_service_1.CustomersService,
        reservations_service_1.ReservationsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map