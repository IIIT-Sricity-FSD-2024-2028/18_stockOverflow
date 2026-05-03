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
exports.RetailersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
let RetailersService = class RetailersService {
    constructor() {
        this.retailers = new Map();
        this.dataDirectory = (0, path_1.join)(__dirname, '..', '..', 'data');
        this.dataFile = (0, path_1.join)(this.dataDirectory, 'retailers.json');
        this.loadFromDisk();
    }
    create(createRetailerSetupDto) {
        const now = new Date().toISOString();
        const retailer = {
            ...createRetailerSetupDto,
            stores: createRetailerSetupDto.stores ?? [],
            suppliers: createRetailerSetupDto.suppliers ?? [],
            products: createRetailerSetupDto.products ?? [],
            id: (0, crypto_1.randomUUID)(),
            status: 'completed',
            profileStatus: createRetailerSetupDto.profileStatus ?? 'active',
            createdAt: now,
            updatedAt: now,
        };
        this.retailers.set(retailer.id, retailer);
        this.persistToDisk();
        return retailer;
    }
    findAll() {
        return Array.from(this.retailers.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    findOne(id) {
        const retailer = this.retailers.get(id);
        if (!retailer) {
            throw new common_1.NotFoundException(`Retailer setup "${id}" was not found`);
        }
        return retailer;
    }
    findLatest() {
        return this.findAll()[0] ?? null;
    }
    findByBusinessEmail(email) {
        const lookup = String(email || '').trim().toLowerCase();
        if (!lookup) {
            return null;
        }
        return (this.findAll().find((retailer) => retailer.business.businessEmail.toLowerCase() === lookup ||
            retailer.primaryContact.directEmail?.toLowerCase() === lookup) ?? null);
    }
    update(id, updateRetailerSetupDto) {
        const retailer = this.findOne(id);
        const updatedRetailer = {
            ...retailer,
            ...updateRetailerSetupDto,
            business: updateRetailerSetupDto.business ?? retailer.business,
            primaryContact: updateRetailerSetupDto.primaryContact ?? retailer.primaryContact,
            stores: updateRetailerSetupDto.stores ?? retailer.stores,
            suppliers: updateRetailerSetupDto.suppliers ?? retailer.suppliers,
            products: updateRetailerSetupDto.products ?? retailer.products,
            profileStatus: updateRetailerSetupDto.profileStatus ?? retailer.profileStatus ?? 'active',
            updatedAt: new Date().toISOString(),
        };
        this.retailers.set(id, updatedRetailer);
        this.persistToDisk();
        return updatedRetailer;
    }
    remove(id) {
        const deleted = this.retailers.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`Retailer setup "${id}" was not found`);
        }
        this.persistToDisk();
    }
    loadFromDisk() {
        (0, fs_1.mkdirSync)(this.dataDirectory, { recursive: true });
        if (!(0, fs_1.existsSync)(this.dataFile)) {
            (0, fs_1.writeFileSync)(this.dataFile, '[]', 'utf-8');
            return;
        }
        const raw = (0, fs_1.readFileSync)(this.dataFile, 'utf-8').trim();
        if (!raw) {
            return;
        }
        try {
            const retailers = JSON.parse(raw);
            retailers.forEach((retailer) => {
                this.retailers.set(retailer.id, {
                    ...retailer,
                    stores: retailer.stores ?? [],
                    suppliers: retailer.suppliers ?? [],
                    products: retailer.products ?? [],
                    profileStatus: retailer.profileStatus ?? 'active',
                });
            });
        }
        catch {
            (0, fs_1.writeFileSync)(this.dataFile, '[]', 'utf-8');
        }
    }
    persistToDisk() {
        const retailers = this.findAll();
        (0, fs_1.writeFileSync)(this.dataFile, JSON.stringify(retailers, null, 2), 'utf-8');
    }
};
exports.RetailersService = RetailersService;
exports.RetailersService = RetailersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RetailersService);
//# sourceMappingURL=retailers.service.js.map