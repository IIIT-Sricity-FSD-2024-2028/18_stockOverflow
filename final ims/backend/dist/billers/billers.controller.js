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
exports.BillersController = void 0;
const common_1 = require("@nestjs/common");
const billers_service_1 = require("./billers.service");
const create_biller_dto_1 = require("./dto/create-biller.dto");
let BillersController = class BillersController {
    constructor(billersService) {
        this.billersService = billersService;
    }
    create(createBillerDto) {
        return this.billersService.create(createBillerDto);
    }
    findAll(retailerId, storeId) {
        return this.billersService.findAll(retailerId, storeId);
    }
    createRequest(requestData) {
        return this.billersService.createRequest(requestData);
    }
    getRequests() {
        return this.billersService.getRequests();
    }
    approveRequest(id) {
        return this.billersService.approveRequest(id);
    }
    rejectRequest(id) {
        return this.billersService.rejectRequest(id);
    }
    findOne(id) {
        return this.billersService.findOne(id);
    }
};
exports.BillersController = BillersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_biller_dto_1.CreateBillerDto]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Put)('requests/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BillersController.prototype, "findOne", null);
exports.BillersController = BillersController = __decorate([
    (0, common_1.Controller)('billers'),
    __metadata("design:paramtypes", [billers_service_1.BillersService])
], BillersController);
//# sourceMappingURL=billers.controller.js.map