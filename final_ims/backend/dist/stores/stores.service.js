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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../common/json-db.service");
const retailers_service_1 = require("../retailers/retailers.service");
let StoresService = class StoresService {
    constructor(db, retailersService) {
        this.db = db;
        this.retailersService = retailersService;
    }
    findAll(retailerId) {
        const directStores = this.db
            .getCollection('stores')
            .filter((store) => this.matchesRetailer(store.retailerId, retailerId));
        const retailerStores = this.retailersService.findAll().flatMap((retailer) => {
            if (!this.matchesRetailer(retailer.id, retailerId)) {
                return [];
            }
            return (retailer.stores || []).map((store, index) => ({
                id: store.code || `${retailer.id}-store-${index + 1}`,
                retailerId: retailer.id,
                name: store.name,
                location: store.address || '',
                manager: store.contactPerson || retailer.primaryContact.fullName,
                status: store.status || 'active',
            }));
        });
        const merged = [...directStores, ...retailerStores];
        const unique = new Map();
        merged.forEach((store) => {
            unique.set(String(store.id), store);
        });
        return Array.from(unique.values());
    }
    matchesRetailer(candidateRetailerId, retailerId) {
        const normalizedCandidate = typeof candidateRetailerId === 'string' ? candidateRetailerId.trim() : '';
        const normalizedRetailerId = typeof retailerId === 'string' ? retailerId.trim() : '';
        if (!normalizedRetailerId) {
            return true;
        }
        return normalizedCandidate === normalizedRetailerId;
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        retailers_service_1.RetailersService])
], StoresService);
//# sourceMappingURL=stores.service.js.map