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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const collection_service_1 = require("../common/collection.service");
const json_db_service_1 = require("../common/json-db.service");
let WarehousesService = class WarehousesService extends collection_service_1.JsonCollectionService {
    constructor(db) {
        super(db);
        this.collectionKey = 'warehouses';
        this.entityName = 'Warehouse';
    }
    findAll() {
        return this.findAllTyped();
    }
    create(createWarehouseDto) {
        const warehouse = {
            id: this.nextNumericId(),
            name: createWarehouseDto.name,
            contact: createWarehouseDto.contact,
            phone: createWarehouseDto.phone,
            totalProducts: createWarehouseDto.totalProducts ?? 0,
            totalStock: createWarehouseDto.totalStock ?? 0,
            createdOn: createWarehouseDto.createdOn ?? this.formatDateLabel(),
            createdTs: createWarehouseDto.createdTs ?? this.dateNumber(new Date()),
            status: createWarehouseDto.status ?? 'active',
            inventory: createWarehouseDto.inventory ?? [],
            zones: createWarehouseDto.zones ?? [],
        };
        const warehouses = this.findAllTyped();
        warehouses.unshift(warehouse);
        this.write(warehouses);
        return warehouse;
    }
    update(id, updateWarehouseDto) {
        const warehouses = this.findAllTyped();
        const index = warehouses.findIndex((warehouse) => warehouse.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Warehouse not found');
        }
        const updated = {
            ...warehouses[index],
            ...updateWarehouseDto,
        };
        warehouses[index] = updated;
        this.write(warehouses);
        return updated;
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map