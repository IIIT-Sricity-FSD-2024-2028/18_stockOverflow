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
exports.JsonCollectionService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const json_db_service_1 = require("./json-db.service");
let JsonCollectionService = class JsonCollectionService {
    constructor(db) {
        this.db = db;
    }
    findAll() {
        return this.db.getCollection(this.collectionKey);
    }
    findOne(id) {
        const entity = this.findAllTyped().find((item) => String(item.id) === String(id));
        if (!entity) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        return entity;
    }
    remove(id) {
        const items = this.findAllTyped();
        const index = items.findIndex((item) => String(item.id) === String(id));
        if (index === -1) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        const [deleted] = items.splice(index, 1);
        this.write(items);
        return {
            message: `${this.entityName} deleted successfully`,
            item: deleted,
        };
    }
    findAllTyped() {
        return this.db.getCollection(this.collectionKey);
    }
    write(items) {
        return this.db.saveCollection(this.collectionKey, items);
    }
    nextNumericId() {
        return (this.findAllTyped().reduce((max, item) => {
            return typeof item.id === 'number' ? Math.max(max, item.id) : max;
        }, 0) + 1);
    }
    nextCode(prefix, width = 3, property = 'code') {
        const numericIds = this.findAllTyped()
            .map((item) => String(item[property] ?? ''))
            .map((value) => {
            const match = new RegExp(`${prefix}-?(\\d+)$`, 'i').exec(value);
            return match ? Number.parseInt(match[1], 10) : 0;
        });
        const nextValue = (Math.max(0, ...numericIds) + 1).toString().padStart(width, '0');
        return prefix.includes('-') ? `${prefix}${nextValue}` : `${prefix}${nextValue}`;
    }
    newUuid() {
        return (0, node_crypto_1.randomUUID)();
    }
    timestamp() {
        return new Date().toISOString();
    }
    formatDateLabel(date = new Date()) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }
    dateNumber(date) {
        return Number(date
            .toISOString()
            .slice(0, 10)
            .replaceAll('-', ''));
    }
    ensureUniqueStringValue(currentId, property, value, message) {
        const exists = this.findAllTyped().some((item) => {
            const propValue = item[property];
            return (String(item.id) !== String(currentId ?? '') &&
                typeof propValue === 'string' &&
                propValue.toLowerCase() === value.toLowerCase());
        });
        if (exists) {
            throw new common_1.ConflictException(message);
        }
    }
    nextProductSku(products) {
        const nextNumber = products.reduce((max, product) => {
            const match = /^PT(\d+)$/i.exec(product.sku);
            return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
        }, 0) + 1;
        return `PT${String(nextNumber).padStart(3, '0')}`;
    }
};
exports.JsonCollectionService = JsonCollectionService;
exports.JsonCollectionService = JsonCollectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], JsonCollectionService);
//# sourceMappingURL=collection.service.js.map