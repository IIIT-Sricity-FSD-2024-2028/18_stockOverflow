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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const json_db_service_1 = require("../common/json-db.service");
let CustomersService = class CustomersService {
    constructor(db) {
        this.db = db;
    }
    findAll(retailerId, storeId) {
        return this.getCustomers()
            .map((customer) => this.normalizeCustomer(customer))
            .filter((customer) => this.matchesScope(customer, retailerId, storeId));
    }
    findOne(id, retailerId, storeId) {
        const customer = this.findAll(retailerId, storeId).find((entry) => String(entry.id) === String(id));
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return customer;
    }
    create(createCustomerDto) {
        const customers = this.getCustomers();
        const email = this.normalizeText(createCustomerDto.email);
        if (email &&
            customers.some((entry) => this.matchesScope(this.normalizeCustomer(entry), createCustomerDto.retailerId, createCustomerDto.storeId) &&
                this.normalizeText(entry.email).toLowerCase() === email.toLowerCase())) {
            throw new common_1.ConflictException('A customer with this email already exists');
        }
        const normalized = this.buildCustomerRecord(createCustomerDto, {
            id: `cust-${(0, node_crypto_1.randomUUID)()}`,
            existing: undefined,
        });
        customers.unshift(normalized);
        this.saveCustomers(customers);
        return normalized;
    }
    update(id, updateCustomerDto) {
        const customers = this.getCustomers();
        const index = customers.findIndex((entry) => String(entry.id) === String(id));
        if (index === -1) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const existing = this.normalizeCustomer(customers[index]);
        const nextEmail = this.normalizeText(updateCustomerDto.email, existing.email);
        if (nextEmail &&
            customers.some((entry) => String(entry.id) !== String(id) &&
                this.matchesScope(existing, entry.retailerId, entry.storeId) &&
                this.normalizeText(entry.email).toLowerCase() === nextEmail.toLowerCase())) {
            throw new common_1.ConflictException('A customer with this email already exists');
        }
        const merged = this.buildCustomerRecord(updateCustomerDto, {
            id: existing.id,
            existing,
        });
        customers[index] = merged;
        this.saveCustomers(customers);
        return merged;
    }
    remove(id) {
        const customers = this.getCustomers();
        const index = customers.findIndex((entry) => String(entry.id) === String(id));
        if (index === -1) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const [removed] = customers.splice(index, 1);
        this.saveCustomers(customers);
        return {
            message: 'Customer deleted successfully',
            item: this.normalizeCustomer(removed),
        };
    }
    registerPurchase(customerName, finalTotal, retailerId, storeId, customerEmail, customerId) {
        const normalizedName = this.normalizeText(customerName);
        if (!normalizedName || normalizedName.toLowerCase() === 'walk-in customer') {
            return null;
        }
        const customers = this.getCustomers();
        const index = customers.findIndex((entry) => {
            const normalizedEntry = this.normalizeCustomer(entry);
            return (this.matchesScope(normalizedEntry, retailerId, storeId) &&
                ((customerId &&
                    String(normalizedEntry.id).toLowerCase() ===
                        String(customerId).toLowerCase()) ||
                    (customerEmail &&
                        this.normalizeText(normalizedEntry.email).toLowerCase() ===
                            this.normalizeText(customerEmail).toLowerCase()) ||
                    this.normalizeText(normalizedEntry.name).toLowerCase() ===
                        normalizedName.toLowerCase()));
        });
        if (index === -1) {
            const created = this.buildCustomerRecord({
                retailerId,
                storeId,
                name: normalizedName,
                email: this.normalizeText(customerEmail) ||
                    `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@stockoverflow.local`,
                status: 'Active',
                totalOrders: 1,
                totalSpent: finalTotal,
                orders: 1,
                spent: finalTotal,
            }, { id: this.normalizeText(customerId, `cust-${(0, node_crypto_1.randomUUID)()}`) });
            customers.unshift(created);
            this.saveCustomers(customers);
            return created;
        }
        const existing = this.normalizeCustomer(customers[index]);
        const updated = {
            ...existing,
            totalOrders: (existing.totalOrders || 0) + 1,
            totalSpent: this.toMoney((existing.totalSpent || 0) + (finalTotal || 0)),
            orders: (existing.orders || 0) + 1,
            spent: this.toMoney((existing.spent || 0) + (finalTotal || 0)),
        };
        customers[index] = updated;
        this.saveCustomers(customers);
        return updated;
    }
    getCustomers() {
        return this.db.getCollection('customers');
    }
    saveCustomers(customers) {
        return this.db.saveCollection('customers', customers);
    }
    buildCustomerRecord(payload, options) {
        const existing = options.existing;
        const name = this.resolveName(payload, existing);
        const [fname, ...rest] = name.split(' ').filter(Boolean);
        const lname = rest.join(' ').trim();
        const totalOrders = this.toSafeInteger(payload.totalOrders ?? payload.orders ?? existing?.totalOrders ?? existing?.orders ?? 0);
        const totalSpent = this.toMoney(payload.totalSpent ?? payload.spent ?? existing?.totalSpent ?? existing?.spent ?? 0);
        return {
            id: options.id,
            retailerId: this.normalizeText(payload.retailerId, existing?.retailerId),
            storeId: this.normalizeText(payload.storeId, existing?.storeId),
            name,
            fname: this.normalizeText(payload.fname, existing?.fname || fname || 'Customer'),
            lname: this.normalizeText(payload.lname, existing?.lname || lname),
            email: this.normalizeText(payload.email, existing?.email || `${Date.now()}@stockoverflow.local`),
            phone: this.normalizeText(payload.phone, existing?.phone),
            city: this.normalizeText(payload.city, existing?.city),
            country: this.normalizeText(payload.country, existing?.country || 'India'),
            store: this.normalizeText(payload.store, existing?.store || 'Downtown Store'),
            status: this.normalizeText(payload.status, existing?.status || 'Active'),
            totalOrders,
            totalSpent,
            orders: totalOrders,
            spent: totalSpent,
            created: this.normalizeText(payload.created, existing?.created || this.formatDateLabel()),
            rating: this.clampRating(payload.rating ?? existing?.rating ?? 3),
            notes: this.normalizeText(payload.notes, existing?.notes),
        };
    }
    normalizeCustomer(customer) {
        return this.buildCustomerRecord(customer, {
            id: customer.id || `cust-${(0, node_crypto_1.randomUUID)()}`,
            existing: customer,
        });
    }
    matchesScope(customer, retailerId, storeId) {
        const normalizedRetailerId = this.normalizeText(retailerId);
        const normalizedStoreId = this.normalizeText(storeId);
        if (normalizedRetailerId &&
            this.normalizeText(customer.retailerId) !== normalizedRetailerId) {
            return false;
        }
        if (normalizedStoreId && this.normalizeText(customer.storeId) !== normalizedStoreId) {
            return false;
        }
        return true;
    }
    resolveName(payload, existing) {
        const explicitName = this.normalizeText(payload.name);
        if (explicitName) {
            return explicitName;
        }
        const fname = this.normalizeText(payload.fname, existing?.fname);
        const lname = this.normalizeText(payload.lname, existing?.lname);
        const combined = [fname, lname].filter(Boolean).join(' ').trim();
        return combined || this.normalizeText(existing?.name, 'Customer');
    }
    normalizeText(value, fallback = '') {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }
    toSafeInteger(value) {
        return Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0);
    }
    toMoney(value) {
        return Number((Number.isFinite(value) ? value : 0).toFixed(2));
    }
    clampRating(value) {
        const rating = Number.isFinite(value) ? Math.trunc(value) : 3;
        return Math.max(1, Math.min(5, rating));
    }
    formatDateLabel(date = new Date()) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map