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
exports.StockAdjustmentsService = void 0;
const common_1 = require("@nestjs/common");
const collection_service_1 = require("../common/collection.service");
const json_db_service_1 = require("../common/json-db.service");
const products_service_1 = require("../products/products.service");
let StockAdjustmentsService = class StockAdjustmentsService extends collection_service_1.JsonCollectionService {
    constructor(db, productsService) {
        super(db);
        this.productsService = productsService;
        this.collectionKey = 'stockAdjustments';
        this.entityName = 'Stock adjustment';
        this.fallbackPersonImg = 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4';
    }
    findAll() {
        return this.findAllTyped();
    }
    create(createStockAdjustmentDto) {
        const product = this.productsService.findBySku(createStockAdjustmentDto.productSku);
        const nextQuantity = this.resolveQuantity(product.qty, createStockAdjustmentDto.qty, createStockAdjustmentDto.type);
        const qtyDelta = createStockAdjustmentDto.type === 'add'
            ? createStockAdjustmentDto.qty
            : -createStockAdjustmentDto.qty;
        this.productsService.applyInventoryAdjustment(product.sku, qtyDelta, this.resolvePreferredStoreId(product));
        const adjustments = this.findAllTyped();
        const adjustment = {
            id: this.nextNumericId(),
            productSku: product.sku,
            product: product.name,
            warehouse: createStockAdjustmentDto.warehouse,
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
    update(id, updateStockAdjustmentDto) {
        const adjustments = this.findAllTyped();
        const index = adjustments.findIndex((adjustment) => adjustment.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Stock adjustment not found');
        }
        const updated = {
            ...adjustments[index],
            ...updateStockAdjustmentDto,
        };
        adjustments[index] = updated;
        this.write(adjustments);
        return updated;
    }
    resolvePreferredStoreId(product) {
        if (!Array.isArray(product.storeInventory) || !product.storeInventory.length) {
            return undefined;
        }
        const sorted = product.storeInventory
            .slice()
            .sort((left, right) => (left.qty || 0) - (right.qty || 0));
        return sorted[0]?.storeId;
    }
    resolveQuantity(currentQty, adjustmentQty, type) {
        if (type === 'add') {
            return currentQty + adjustmentQty;
        }
        if (adjustmentQty > currentQty) {
            throw new common_1.BadRequestException('Adjustment quantity cannot exceed current product stock');
        }
        return currentQty - adjustmentQty;
    }
};
exports.StockAdjustmentsService = StockAdjustmentsService;
exports.StockAdjustmentsService = StockAdjustmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        products_service_1.ProductsService])
], StockAdjustmentsService);
//# sourceMappingURL=stock-adjustments.service.js.map