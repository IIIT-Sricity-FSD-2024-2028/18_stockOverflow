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
let BillersService = class BillersService extends collection_service_1.JsonCollectionService {
    constructor(db, usersService) {
        super(db);
        this.usersService = usersService;
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
    findAll() {
        return this.findAllTyped();
    }
    create(createBillerDto) {
        this.ensureUniqueStringValue(null, 'email', createBillerDto.email, 'A biller with this email already exists');
        const billers = this.findAllTyped();
        const biller = {
            id: this.nextNumericId(),
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
        const newRequest = {
            id: Date.now().toString(),
            ...requestData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        requests.push(newRequest);
        this.db.saveCollection('biller_requests', requests);
        return newRequest;
    }
    getRequests() {
        return this.db.getCollection('biller_requests') || [];
    }
    approveRequest(id) {
        const requests = this.getRequests();
        const requestIndex = requests.findIndex(r => r.id === id);
        if (requestIndex === -1) {
            throw new common_1.NotFoundException('Biller request not found');
        }
        const request = requests[requestIndex];
        request.status = 'approved';
        request.approvedAt = new Date().toISOString();
        const biller = this.create({
            name: request.name,
            company: request.company,
            email: request.email,
            phone: request.phone,
            country: request.country,
            status: 'active'
        });
        this.usersService.create({
            name: request.name,
            email: request.email,
            password: 'temp123',
            role: 'biller',
            store: 'Biller Store'
        });
        this.db.saveCollection('biller_requests', requests);
        return { request, biller };
    }
    rejectRequest(id) {
        const requests = this.getRequests();
        const requestIndex = requests.findIndex(r => r.id === id);
        if (requestIndex === -1) {
            throw new common_1.NotFoundException('Biller request not found');
        }
        const request = requests[requestIndex];
        request.status = 'rejected';
        request.rejectedAt = new Date().toISOString();
        this.db.saveCollection('biller_requests', requests);
        return request;
    }
};
exports.BillersService = BillersService;
exports.BillersService = BillersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService, users_service_1.UsersService])
], BillersService);
//# sourceMappingURL=billers.service.js.map