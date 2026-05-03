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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const transactions_service_1 = require("./transactions.service");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    findAll(retailerId, storeId, customerLookup) {
        return this.transactionsService.findAll(retailerId, storeId, customerLookup);
    }
    findLatest(retailerId, storeId, customerLookup) {
        return this.transactionsService.findLatest(retailerId, storeId, customerLookup);
    }
    findPurchasedProducts(retailerId, storeId, customerLookup) {
        return this.transactionsService.getPurchasedProducts(retailerId, storeId, customerLookup);
    }
    findOne(orderId, retailerId, storeId, customerLookup) {
        return this.transactionsService.findOne(orderId, retailerId, storeId, customerLookup);
    }
    create(createTransactionDto) {
        return this.transactionsService.create(createTransactionDto);
    }
    update(orderId, updateTransactionDto) {
        return this.transactionsService.update(orderId, updateTransactionDto);
    }
    remove(orderId) {
        return this.transactionsService.remove(orderId);
    }
    reconcileInventory() {
        return this.transactionsService.reconcileInventory();
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('purchased-products'),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findPurchasedProducts", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Query)('retailerId')),
    __param(2, (0, common_1.Query)('storeId')),
    __param(3, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('reconcile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "reconcileInventory", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map