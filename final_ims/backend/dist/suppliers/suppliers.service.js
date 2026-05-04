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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const products_service_1 = require("../products/products.service");
let SuppliersService = class SuppliersService {
    constructor(productsService) {
        this.productsService = productsService;
        this.suppliers = new Map();
        this.dataDirectory = (0, path_1.join)(__dirname, '..', '..', 'data');
        this.dataFile = (0, path_1.join)(this.dataDirectory, 'suppliers.json');
        this.loadFromDisk();
    }
    create(createSupplierSetupDto) {
        const now = new Date().toISOString();
        const supplier = {
            ...createSupplierSetupDto,
            retailers: createSupplierSetupDto.retailers ?? [],
            products: createSupplierSetupDto.products ?? [],
            id: (0, crypto_1.randomUUID)(),
            status: 'completed',
            profileStatus: createSupplierSetupDto.profileStatus ?? 'active',
            createdAt: now,
            updatedAt: now,
        };
        this.suppliers.set(supplier.id, supplier);
        this.syncProducts(supplier);
        this.persistToDisk();
        return supplier;
    }
    findAll() {
        return Array.from(this.suppliers.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    findOne(id) {
        const supplier = this.suppliers.get(id);
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier setup "${id}" was not found`);
        }
        return supplier;
    }
    findLatest() {
        return this.findAll()[0] ?? null;
    }
    findByBusinessEmail(email) {
        const lookup = String(email || '').trim().toLowerCase();
        if (!lookup) {
            return null;
        }
        return (this.findAll().find((supplier) => supplier.business.businessEmail.toLowerCase() === lookup ||
            supplier.primaryContact.directEmail?.toLowerCase() === lookup) ?? null);
    }
    update(id, updateSupplierSetupDto) {
        const supplier = this.findOne(id);
        const updatedSupplier = {
            ...supplier,
            ...updateSupplierSetupDto,
            business: updateSupplierSetupDto.business ?? supplier.business,
            primaryContact: updateSupplierSetupDto.primaryContact ?? supplier.primaryContact,
            retailers: updateSupplierSetupDto.retailers ?? supplier.retailers,
            products: updateSupplierSetupDto.products ?? supplier.products,
            pricingPolicies: updateSupplierSetupDto.pricingPolicies ?? supplier.pricingPolicies,
            bankDetails: updateSupplierSetupDto.bankDetails ?? supplier.bankDetails,
            profileStatus: updateSupplierSetupDto.profileStatus ?? supplier.profileStatus ?? 'active',
            updatedAt: new Date().toISOString(),
        };
        this.suppliers.set(id, updatedSupplier);
        this.syncProducts(updatedSupplier);
        this.persistToDisk();
        return updatedSupplier;
    }
    adjustProductStock(supplierId, sku, qtyDelta) {
        const supplier = this.findOne(String(supplierId));
        const normalizedSku = String(sku || '').trim().toLowerCase();
        if (!normalizedSku || !Array.isArray(supplier.products)) {
            return supplier;
        }
        let changed = false;
        const products = supplier.products.map((product) => {
            if (String(product.sku || '').trim().toLowerCase() !== normalizedSku) {
                return product;
            }
            changed = true;
            return {
                ...product,
                stockAvailable: Math.max(0, Math.trunc(Number(product.stockAvailable || 0) + qtyDelta)),
            };
        });
        if (!changed) {
            return supplier;
        }
        const updatedSupplier = {
            ...supplier,
            products,
            updatedAt: new Date().toISOString(),
        };
        this.suppliers.set(supplier.id, updatedSupplier);
        this.persistToDisk();
        return updatedSupplier;
    }
    getDirectory() {
        return this.findAll().map((supplier) => ({
            id: supplier.id,
            companyName: supplier.business.companyName,
            supplierCode: supplier.business.supplierCode,
            businessType: supplier.business.businessType,
            businessEmail: supplier.business.businessEmail,
            phoneNumber: supplier.business.phoneNumber,
            state: supplier.business.state,
            website: supplier.business.website,
            primaryCategory: supplier.business.primaryCategory,
            paymentTerms: supplier.business.paymentTerms,
            profileStatus: supplier.profileStatus ?? 'active',
            productCount: (supplier.products ?? []).length,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt,
        }));
    }
    remove(id) {
        const deleted = this.suppliers.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`Supplier setup "${id}" was not found`);
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
            const suppliers = JSON.parse(raw);
            suppliers.forEach((supplier) => {
                this.suppliers.set(supplier.id, {
                    ...supplier,
                    retailers: supplier.retailers ?? [],
                    products: supplier.products ?? [],
                    profileStatus: supplier.profileStatus ?? 'active',
                });
            });
        }
        catch {
            (0, fs_1.writeFileSync)(this.dataFile, '[]', 'utf-8');
        }
    }
    persistToDisk() {
        const suppliers = this.findAll();
        (0, fs_1.writeFileSync)(this.dataFile, JSON.stringify(suppliers, null, 2), 'utf-8');
    }
    syncProducts(supplier) {
        if (!Array.isArray(supplier.products))
            return;
        supplier.products.forEach(p => {
            try {
                this.productsService.findBySku(p.sku);
            }
            catch {
                this.productsService.create({
                    sku: p.sku,
                    name: p.name,
                    brand: p.brand || supplier.business.companyName,
                    category: p.category || 'General',
                    priceUSD: p.unitPrice || 0,
                    qty: p.stockAvailable || 0,
                    supplier: supplier.business.companyName,
                    description: `Supplied by ${supplier.business.companyName}`,
                    visibility: 'published'
                });
            }
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map