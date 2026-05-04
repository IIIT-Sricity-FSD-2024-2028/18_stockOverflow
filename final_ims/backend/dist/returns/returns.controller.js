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
exports.ReturnsController = void 0;
const common_1 = require("@nestjs/common");
const create_return_dto_1 = require("./dto/create-return.dto");
const update_return_dto_1 = require("./dto/update-return.dto");
const returns_service_1 = require("./returns.service");
let ReturnsController = class ReturnsController {
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    findAll(retailerId, storeId, customerLookup) {
        return this.returnsService.findAll(retailerId, storeId, customerLookup);
    }
    findOne(id, retailerId, storeId, customerLookup) {
        return this.returnsService.findOne(id, retailerId, storeId, customerLookup);
    }
    create(createReturnDto) {
        return this.returnsService.create(createReturnDto);
    }
    update(id, updateReturnDto) {
        return this.returnsService.update(id, updateReturnDto);
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('retailerId')),
    __param(2, (0, common_1.Query)('storeId')),
    __param(3, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_return_dto_1.CreateReturnDto]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_return_dto_1.UpdateReturnDto]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "update", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, common_1.Controller)('returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map