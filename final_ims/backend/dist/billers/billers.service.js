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
exports.BillersService = void 0;
const common_1 = require("@nestjs/common");
const collection_service_1 = require("../common/collection.service");
const json_db_service_1 = require("../common/json-db.service");
const users_service_1 = require("../users/users.service");
const stores_service_1 = require("../stores/stores.service");
let BillersService = class BillersService extends collection_service_1.JsonCollectionService {
    constructor(db, usersService, storesService) {
        super(db);
        this.usersService = usersService;
        this.storesService = storesService;
        this.collectionKey = 'billers';
        this.entityName = 'Biller';
        this.avatarPalette = [
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#E91E63',
            '#9C27B0',
            '#F44336',
            '#00BCD4',
            '#673AB7',
        ];
    }
    findAll(retailerId, storeId) {
        return this.findAllTyped().filter((biller) => this.matchesScope(biller, retailerId, storeId));
    }
    create(createBillerDto) {
        this.ensureUniqueStringValue(null, 'email', createBillerDto.email, 'A biller with this email already exists');
        const billers = this.findAllTyped();
        const biller = {
            id: this.nextNumericId(),
            retailerId: createBillerDto.retailerId,
            storeId: createBillerDto.storeId,
            code: this.nextCode('BI'),
            name: createBillerDto.name,
            company: createBillerDto.company,
            email: createBillerDto.email,
            phone: createBillerDto.phone,
            country: createBillerDto.country,
            status: createBillerDto.status ?? 'active',
            avatar: createBillerDto.avatar ||
                this.avatarPalette[billers.length % this.avatarPalette.length],
        };
        billers.unshift(biller);
        this.write(billers);
        return biller;
    }
    update(id, updateBillerDto) {
        const billers = this.findAllTyped();
        const index = billers.findIndex((biller) => biller.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Biller not found');
        }
        const existing = billers[index];
        const nextEmail = updateBillerDto.email || existing.email;
        this.ensureUniqueStringValue(existing.id, 'email', nextEmail, 'A biller with this email already exists');
        const updated = {
            ...existing,
            ...updateBillerDto,
            email: nextEmail,
        };
        billers[index] = updated;
        this.write(billers);
        return updated;
    }
    createRequest(requestData) {
        const requests = this.getRequests();
        const scope = this.resolveRequestScope(requestData);
        const newRequest = {
            id: Date.now().toString(),
            ...requestData,
            retailerId: scope.retailerId,
            storeId: scope.storeId,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        requests.push(newRequest);
        this.db.saveCollection('biller_requests', requests);
        return newRequest;
    }
    getRequests() {
        return this.db.getCollection('biller_requests') || [];
    }
    approveRequest(id, approvalScope) {
        const requests = this.getRequests();
        const requestIndex = requests.findIndex((r) => r.id === id);
        if (requestIndex === -1) {
            throw new common_1.NotFoundException('Biller request not found');
        }
        const request = requests[requestIndex];
        const scope = this.resolveRequestScope({
            ...request,
            retailerId: this.normalizeText(approvalScope?.retailerId, request.retailerId),
            storeId: this.normalizeText(approvalScope?.storeId, request.storeId),
        });
        const biller = this.upsertApprovedBiller(request, scope);
        this.ensureBillerUserExists(request);
        request.retailerId = scope.retailerId;
        if (scope.storeId) {
            request.storeId = scope.storeId;
        }
        request.status = 'approved';
        request.approvedAt = new Date().toISOString();
        this.db.saveCollection('biller_requests', requests);
        return { request, biller };
    }
    rejectRequest(id) {
        const requests = this.getRequests();
        const requestIndex = requests.findIndex((r) => r.id === id);
        if (requestIndex === -1) {
            throw new common_1.NotFoundException('Biller request not found');
        }
        const request = requests[requestIndex];
        request.status = 'rejected';
        request.rejectedAt = new Date().toISOString();
        this.db.saveCollection('biller_requests', requests);
        return request;
    }
    matchesScope(biller, retailerId, storeId) {
        const normalizedRetailerId = this.normalizeText(retailerId);
        const normalizedStoreId = this.normalizeText(storeId);
        if (normalizedRetailerId &&
            this.normalizeText(biller.retailerId) &&
            this.normalizeText(biller.retailerId) !== normalizedRetailerId) {
            return false;
        }
        if (normalizedRetailerId &&
            !this.normalizeText(biller.retailerId) &&
            !this.normalizeText(biller.storeId)) {
            return false;
        }
        if (normalizedStoreId &&
            this.normalizeText(biller.storeId) &&
            this.normalizeText(biller.storeId) !== normalizedStoreId) {
            return false;
        }
        return true;
    }
    upsertApprovedBiller(request, scope) {
        const billers = this.findAllTyped();
        const normalizedEmail = this.normalizeEmail(request.email);
        const existingIndex = billers.findIndex((entry) => {
            return this.normalizeEmail(entry.email) === normalizedEmail;
        });
        if (existingIndex === -1) {
            return this.create({
                retailerId: scope.retailerId,
                storeId: scope.storeId,
                name: request.name,
                company: request.company,
                email: request.email,
                phone: request.phone,
                country: request.country,
                status: 'active',
            });
        }
        const existing = billers[existingIndex];
        const existingRetailerId = this.normalizeText(existing.retailerId);
        const existingStoreId = this.normalizeText(existing.storeId);
        if (scope.retailerId &&
            existingRetailerId &&
            existingRetailerId !== scope.retailerId) {
            throw new common_1.ConflictException('This biller email is already linked to another retailer.');
        }
        if (scope.storeId && existingStoreId && existingStoreId !== scope.storeId) {
            throw new common_1.ConflictException('This biller email is already linked to another store.');
        }
        const updated = {
            ...existing,
            retailerId: this.normalizeText(existingRetailerId, scope.retailerId),
            storeId: this.normalizeText(existingStoreId, scope.storeId),
            name: this.normalizeText(request.name, existing.name),
            company: this.normalizeText(request.company, existing.company),
            phone: this.normalizeText(request.phone, existing.phone),
            country: this.normalizeText(request.country, existing.country),
            status: 'active',
        };
        billers[existingIndex] = updated;
        this.write(billers);
        return updated;
    }
    ensureBillerUserExists(request) {
        const existingUsers = this.usersService.findAll(undefined, request.email);
        if (!existingUsers.length) {
            this.usersService.create({
                name: request.name,
                email: request.email,
                password: 'temp123',
                role: 'biller',
                store: '',
            });
            return;
        }
        const existingUser = existingUsers[0];
        if (String(existingUser.role || '').toLowerCase() !== 'biller') {
            throw new common_1.ConflictException('A non-biller user already exists with this email address.');
        }
    }
    resolveRequestScope(payload) {
        const requestedRetailerId = this.normalizeText(payload.retailerId);
        const requestedStoreId = this.normalizeText(payload.storeId);
        const stores = this.storesService.findAll();
        const directStore = stores.find((store) => {
            return this.normalizeText(store.id) === requestedStoreId;
        });
        if (directStore) {
            return {
                retailerId: this.normalizeText(directStore.retailerId, requestedRetailerId),
                storeId: this.normalizeText(directStore.id, requestedStoreId),
            };
        }
        if (!requestedStoreId && requestedRetailerId) {
            const legacyStore = stores.find((store) => {
                return this.normalizeText(store.id) === requestedRetailerId;
            });
            if (legacyStore) {
                return {
                    retailerId: this.normalizeText(legacyStore.retailerId),
                    storeId: this.normalizeText(legacyStore.id),
                };
            }
        }
        return {
            retailerId: requestedRetailerId,
            storeId: requestedStoreId,
        };
    }
    normalizeText(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }
    normalizeEmail(value) {
        return this.normalizeText(value).toLowerCase();
    }
};
exports.BillersService = BillersService;
exports.BillersService = BillersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        users_service_1.UsersService,
        stores_service_1.StoresService])
], BillersService);
//# sourceMappingURL=billers.service.js.map