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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const collection_service_1 = require("../common/collection.service");
const json_db_service_1 = require("../common/json-db.service");
const retailers_service_1 = require("../retailers/retailers.service");
const suppliers_service_1 = require("../suppliers/suppliers.service");
const products_service_1 = require("../products/products.service");
let PurchaseOrdersService = class PurchaseOrdersService extends collection_service_1.JsonCollectionService {
    constructor(db, suppliersService, retailersService, productsService) {
        super(db);
        this.suppliersService = suppliersService;
        this.retailersService = retailersService;
        this.productsService = productsService;
        this.collectionKey = 'purchaseOrders';
        this.entityName = 'Purchase order';
    }
    findAll(retailerId, storeId, supplierId) {
        return this.findAllTyped().filter((order) => this.matchesScope(order, retailerId, storeId, supplierId));
    }
    create(createPurchaseOrderDto) {
        const supplier = this.suppliersService.findOne(createPurchaseOrderDto.supplierId);
        const retailer = createPurchaseOrderDto.retailerId
            ? this.retailersService.findOne(createPurchaseOrderDto.retailerId)
            : null;
        const purchaseOrders = this.findAllTyped();
        const subtotal = createPurchaseOrderDto.items.reduce((total, item) => total + item.price * item.qty, 0);
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + tax;
        const year = new Date().getFullYear();
        const nextNumber = purchaseOrders
            .map((order) => {
            const match = new RegExp(`PO-${year}-(\\d+)$`).exec(order.id);
            return match ? Number.parseInt(match[1], 10) : 0;
        })
            .reduce((max, value) => Math.max(max, value), 0) + 1;
        const purchaseOrder = {
            id: `PO-${year}-${String(nextNumber).padStart(4, '0')}`,
            supplierId: supplier.id,
            supplierName: createPurchaseOrderDto.supplierName ||
                supplier.business.companyName ||
                supplier.primaryContact.fullName,
            retailerId: retailer?.id || createPurchaseOrderDto.retailerId || '',
            retailerName: createPurchaseOrderDto.retailerName ||
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
            units: createPurchaseOrderDto.items.reduce((count, item) => count + item.qty, 0),
            status: createPurchaseOrderDto.status || 'Pending',
            createdAt: this.timestamp(),
        };
        purchaseOrders.unshift(purchaseOrder);
        this.write(purchaseOrders);
        return purchaseOrder;
    }
    update(id, updatePurchaseOrderDto) {
        const purchaseOrders = this.findAllTyped();
        const index = purchaseOrders.findIndex((order) => order.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Purchase order not found');
        }
        const existing = purchaseOrders[index];
        const items = updatePurchaseOrderDto.items || existing.items;
        const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
        const tax = Math.round(subtotal * 0.05);
        const updated = {
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
        if (updated.status === 'Delivered' &&
            existing.status !== 'Delivered' &&
            updated.retailerId) {
            this.syncInventoryOnDelivery(updated);
        }
        return updated;
    }
    syncInventoryOnDelivery(order) {
        order.items.forEach((item) => {
            try {
                this.productsService.applyInventoryAdjustment(item.sku, item.qty, order.storeId, order.retailerId);
            }
            catch {
                this.productsService.create({
                    sku: item.sku,
                    name: item.name,
                    retailerId: order.retailerId,
                    storeId: order.storeId,
                    priceUSD: item.price * 1.3,
                    qty: item.qty,
                    brand: order.supplierName,
                    category: 'General',
                    supplier: order.supplierName,
                    visibility: 'published',
                });
            }
            try {
                this.suppliersService.adjustProductStock(order.supplierId, item.sku, -item.qty);
            }
            catch {
            }
        });
    }
    matchesScope(order, retailerId, storeId, supplierId) {
        const normalizedRetailerId = this.normalizeText(retailerId);
        const normalizedStoreId = this.normalizeText(storeId);
        const normalizedSupplierId = this.normalizeText(supplierId);
        if (normalizedRetailerId &&
            this.normalizeText(order.retailerId) !== normalizedRetailerId) {
            return false;
        }
        if (normalizedStoreId && this.normalizeText(order.storeId) !== normalizedStoreId) {
            return false;
        }
        if (normalizedSupplierId &&
            this.normalizeText(order.supplierId) !== normalizedSupplierId) {
            return false;
        }
        return true;
    }
    normalizeText(value) {
        return typeof value === 'string' && value.trim() ? value.trim() : '';
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        suppliers_service_1.SuppliersService,
        retailers_service_1.RetailersService,
        products_service_1.ProductsService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map