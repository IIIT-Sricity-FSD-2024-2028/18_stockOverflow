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
const users_service_1 = require("../users/users.service");
let RetailersService = class RetailersService {
    constructor(usersService) {
        this.usersService = usersService;
        this.retailers = new Map();
        this.dataDirectory = (0, path_1.join)(__dirname, '..', '..', 'data');
        this.dataFile = (0, path_1.join)(this.dataDirectory, 'retailers.json');
        this.loadFromDisk();
    }
    create(createRetailerSetupDto) {
        const now = new Date().toISOString();
        const profileAssignment = this.usersService.getNextEmployeeId(this.findAll().map((retailer) => retailer.assignedEmployeeId));
        const storeAssignments = this.collectStoreAssignmentIds();
        const stores = (createRetailerSetupDto.stores ?? []).map((store, index) => {
            const assignedEmployeeId = this.usersService.getNextEmployeeId(storeAssignments);
            if (assignedEmployeeId) {
                storeAssignments.push(assignedEmployeeId);
            }
            return {
                ...store,
                code: store.code || `STORE-${index + 1}`,
                status: store.status || 'active',
                validationStatus: store.validationStatus ?? 'pending',
                assignedEmployeeId: store.assignedEmployeeId || assignedEmployeeId,
                assignedAt: store.assignedAt || (assignedEmployeeId ? now : ''),
            };
        });
        const retailer = {
            ...createRetailerSetupDto,
            stores,
            suppliers: createRetailerSetupDto.suppliers ?? [],
            products: createRetailerSetupDto.products ?? [],
            id: (0, crypto_1.randomUUID)(),
            status: 'completed',
            profileStatus: createRetailerSetupDto.profileStatus ?? 'active',
            validationStatus: createRetailerSetupDto.validationStatus ?? 'pending',
            assignedEmployeeId: createRetailerSetupDto.assignedEmployeeId || profileAssignment,
            assignedAt: createRetailerSetupDto.assignedAt || (profileAssignment ? now : ''),
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
    findAssignedValidations(employeeId) {
        this.ensurePendingAssignments();
        const normalizedEmployeeId = this.normalizeText(employeeId);
        return this.findAll().filter((retailer) => {
            return this.normalizeText(retailer.assignedEmployeeId) === normalizedEmployeeId;
        });
    }
    findAssignedStoreValidations(employeeId) {
        this.ensurePendingAssignments();
        const normalizedEmployeeId = this.normalizeText(employeeId);
        return this.findAll().flatMap((retailer) => {
            return (retailer.stores || [])
                .map((store, index) => ({
                id: `${retailer.id}:${store.code || index + 1}`,
                retailerId: retailer.id,
                retailerName: retailer.business.businessName,
                businessEmail: retailer.business.businessEmail,
                storeCode: store.code || `STORE-${index + 1}`,
                storeName: store.name,
                contactPerson: store.contactPerson || retailer.primaryContact.fullName,
                phone: store.phone || '',
                address: store.address || '',
                status: store.status || 'active',
                validationStatus: store.validationStatus || 'approved',
                assignedEmployeeId: store.assignedEmployeeId || '',
                assignedAt: store.assignedAt || '',
                validatedBy: store.validatedBy || '',
                validatedAt: store.validatedAt || '',
                rejectionReason: store.rejectionReason || '',
                createdAt: retailer.createdAt,
                updatedAt: retailer.updatedAt,
            }))
                .filter((store) => store.assignedEmployeeId === normalizedEmployeeId);
        });
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
    getDirectory() {
        return this.findAll().map((retailer) => ({
            id: retailer.id,
            businessName: retailer.business.businessName,
            retailerCode: retailer.business.retailerCode || '',
            businessType: retailer.business.businessType || '',
            businessEmail: retailer.business.businessEmail,
            phoneNumber: retailer.business.phoneNumber || '',
            address: retailer.business.businessAddress || '',
            website: retailer.business.website || '',
            primaryIndustry: retailer.business.primaryIndustry || '',
            primaryContactName: retailer.primaryContact.fullName,
            primaryContactEmail: retailer.primaryContact.directEmail || '',
            storeCount: (retailer.stores || []).length,
            stores: (retailer.stores || []).map((store, index) => ({
                name: store.name,
                code: store.code || `STORE-${index + 1}`,
                contactPerson: store.contactPerson || '',
                phone: store.phone || '',
                address: store.address || '',
                type: store.type || '',
                status: store.status || 'active',
            })),
            profileStatus: retailer.profileStatus || 'active',
            createdAt: retailer.createdAt,
            updatedAt: retailer.updatedAt,
        }));
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
            validationStatus: updateRetailerSetupDto.validationStatus ??
                retailer.validationStatus ??
                'approved',
            assignedEmployeeId: updateRetailerSetupDto.assignedEmployeeId ?? retailer.assignedEmployeeId,
            assignedAt: updateRetailerSetupDto.assignedAt ?? retailer.assignedAt,
            validatedBy: updateRetailerSetupDto.validatedBy ?? retailer.validatedBy,
            validatedAt: updateRetailerSetupDto.validatedAt ?? retailer.validatedAt,
            rejectionReason: updateRetailerSetupDto.rejectionReason ?? retailer.rejectionReason,
            updatedAt: new Date().toISOString(),
        };
        this.retailers.set(id, updatedRetailer);
        this.persistToDisk();
        return updatedRetailer;
    }
    approveValidation(id, employeeId) {
        return this.updateValidation(id, employeeId, 'approved');
    }
    rejectValidation(id, employeeId, rejectionReason) {
        return this.updateValidation(id, employeeId, 'rejected', rejectionReason);
    }
    approveStoreValidation(retailerId, storeCode, employeeId) {
        return this.updateStoreValidation(retailerId, storeCode, employeeId, 'approved');
    }
    rejectStoreValidation(retailerId, storeCode, employeeId, rejectionReason) {
        return this.updateStoreValidation(retailerId, storeCode, employeeId, 'rejected', rejectionReason);
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
                    stores: (retailer.stores ?? []).map((store, index) => ({
                        ...store,
                        code: store.code || `STORE-${index + 1}`,
                        validationStatus: store.validationStatus || 'approved',
                        assignedEmployeeId: store.assignedEmployeeId || '',
                        assignedAt: store.assignedAt || '',
                        validatedBy: store.validatedBy || '',
                        validatedAt: store.validatedAt || '',
                        rejectionReason: store.rejectionReason || '',
                    })),
                    suppliers: retailer.suppliers ?? [],
                    products: retailer.products ?? [],
                    profileStatus: retailer.profileStatus ?? 'active',
                    validationStatus: retailer.validationStatus ?? 'approved',
                    assignedEmployeeId: retailer.assignedEmployeeId ?? '',
                    assignedAt: retailer.assignedAt ?? '',
                    validatedBy: retailer.validatedBy ?? '',
                    validatedAt: retailer.validatedAt ?? '',
                    rejectionReason: retailer.rejectionReason ?? '',
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
    updateValidation(id, employeeId, validationStatus, rejectionReason = '') {
        const retailer = this.findOne(id);
        this.ensureAssignedToEmployee(retailer.assignedEmployeeId, employeeId);
        const now = new Date().toISOString();
        const updatedRetailer = {
            ...retailer,
            validationStatus,
            profileStatus: validationStatus === 'rejected' ? 'inactive' : 'active',
            validatedBy: employeeId,
            validatedAt: now,
            rejectionReason: validationStatus === 'rejected' ? rejectionReason : '',
            updatedAt: now,
        };
        this.retailers.set(id, updatedRetailer);
        this.persistToDisk();
        return updatedRetailer;
    }
    updateStoreValidation(retailerId, storeCode, employeeId, validationStatus, rejectionReason = '') {
        const retailer = this.findOne(retailerId);
        const normalizedStoreCode = this.normalizeText(storeCode).toLowerCase();
        const storeIndex = (retailer.stores || []).findIndex((store, index) => {
            const code = this.normalizeText(store.code, `STORE-${index + 1}`).toLowerCase();
            return code === normalizedStoreCode;
        });
        if (storeIndex === -1) {
            throw new common_1.NotFoundException('Store validation not found');
        }
        const store = retailer.stores[storeIndex];
        this.ensureAssignedToEmployee(store.assignedEmployeeId, employeeId);
        const now = new Date().toISOString();
        const stores = retailer.stores.map((entry, index) => {
            if (index !== storeIndex) {
                return entry;
            }
            return {
                ...entry,
                validationStatus,
                status: validationStatus === 'rejected'
                    ? 'inactive'
                    : 'active',
                validatedBy: employeeId,
                validatedAt: now,
                rejectionReason: validationStatus === 'rejected' ? rejectionReason : '',
            };
        });
        const updatedRetailer = {
            ...retailer,
            stores,
            updatedAt: now,
        };
        this.retailers.set(retailerId, updatedRetailer);
        this.persistToDisk();
        return this.findAssignedStoreValidations(employeeId).find((entry) => {
            return (entry.retailerId === retailerId &&
                entry.storeCode.toLowerCase() === normalizedStoreCode);
        });
    }
    ensurePendingAssignments() {
        const retailers = this.findAll();
        const profileAssignments = retailers
            .map((retailer) => retailer.assignedEmployeeId)
            .filter(Boolean);
        const storeAssignments = this.collectStoreAssignmentIds();
        let changed = false;
        const now = new Date().toISOString();
        retailers.forEach((retailer) => {
            if ((retailer.validationStatus || 'approved') === 'pending' &&
                !this.normalizeText(retailer.assignedEmployeeId)) {
                const assignedEmployeeId = this.usersService.getNextEmployeeId(profileAssignments);
                if (assignedEmployeeId) {
                    retailer.assignedEmployeeId = assignedEmployeeId;
                    retailer.assignedAt = now;
                    profileAssignments.push(assignedEmployeeId);
                    changed = true;
                }
            }
            retailer.stores = (retailer.stores || []).map((store, index) => {
                if ((store.validationStatus || 'approved') !== 'pending' ||
                    this.normalizeText(store.assignedEmployeeId)) {
                    return store;
                }
                const assignedEmployeeId = this.usersService.getNextEmployeeId(storeAssignments);
                if (!assignedEmployeeId) {
                    return store;
                }
                storeAssignments.push(assignedEmployeeId);
                changed = true;
                return {
                    ...store,
                    code: store.code || `STORE-${index + 1}`,
                    assignedEmployeeId,
                    assignedAt: now,
                };
            });
            this.retailers.set(retailer.id, retailer);
        });
        if (changed) {
            this.persistToDisk();
        }
    }
    collectStoreAssignmentIds() {
        return this.findAll().flatMap((retailer) => {
            return (retailer.stores || [])
                .map((store) => store.assignedEmployeeId)
                .filter(Boolean);
        });
    }
    ensureAssignedToEmployee(assignedEmployeeId, employeeId) {
        if (!this.normalizeText(assignedEmployeeId) ||
            this.normalizeText(assignedEmployeeId) !== this.normalizeText(employeeId)) {
            throw new common_1.NotFoundException('Assigned validation not found');
        }
    }
    normalizeText(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }
};
exports.RetailersService = RetailersService;
exports.RetailersService = RetailersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], RetailersService);
//# sourceMappingURL=retailers.service.js.map