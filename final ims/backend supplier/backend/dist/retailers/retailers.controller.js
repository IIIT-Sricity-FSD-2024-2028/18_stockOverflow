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
exports.RetailersController = void 0;
const common_1 = require("@nestjs/common");
const create_retailer_setup_dto_1 = require("./dto/create-retailer-setup.dto");
const update_retailer_setup_dto_1 = require("./dto/update-retailer-setup.dto");
const retailers_service_1 = require("./retailers.service");
let RetailersController = class RetailersController {
    constructor(retailersService) {
        this.retailersService = retailersService;
    }
    create(createRetailerSetupDto) {
        return this.retailersService.create(createRetailerSetupDto);
    }
    findAll() {
        return this.retailersService.findAll();
    }
    findLatest() {
        return this.retailersService.findLatest();
    }
    findByBusinessEmail(email) {
        return this.retailersService.findByBusinessEmail(email);
    }
    findOne(id) {
        return this.retailersService.findOne(id);
    }
    update(id, updateRetailerSetupDto) {
        return this.retailersService.update(id, updateRetailerSetupDto);
    }
    remove(id) {
        return this.retailersService.remove(id);
    }
};
exports.RetailersController = RetailersController;
__decorate([
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_retailer_setup_dto_1.CreateRetailerSetupDto]),
    __metadata("design:returntype", Object)
], RetailersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], RetailersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], RetailersController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('by-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], RetailersController.prototype, "findByBusinessEmail", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], RetailersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_retailer_setup_dto_1.UpdateRetailerSetupDto]),
    __metadata("design:returntype", Object)
], RetailersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetailersController.prototype, "remove", null);
exports.RetailersController = RetailersController = __decorate([
    (0, common_1.Controller)('retailers'),
    __metadata("design:paramtypes", [retailers_service_1.RetailersService])
], RetailersController);
//# sourceMappingURL=retailers.controller.js.map