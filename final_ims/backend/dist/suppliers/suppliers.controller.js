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
exports.SuppliersController = void 0;
const common_1 = require("@nestjs/common");
const create_supplier_setup_dto_1 = require("./dto/create-supplier-setup.dto");
const update_supplier_setup_dto_1 = require("./dto/update-supplier-setup.dto");
const suppliers_service_1 = require("./suppliers.service");
let SuppliersController = class SuppliersController {
    constructor(suppliersService) {
        this.suppliersService = suppliersService;
    }
    create(createSupplierSetupDto) {
        return this.suppliersService.create(createSupplierSetupDto);
    }
    findAll() {
        return this.suppliersService.findAll();
    }
    getDirectory() {
        return this.suppliersService.getDirectory();
    }
    findLatest() {
        return this.suppliersService.findLatest();
    }
    findByBusinessEmail(email) {
        return this.suppliersService.findByBusinessEmail(email);
    }
    findOne(id) {
        return this.suppliersService.findOne(id);
    }
    update(id, updateSupplierSetupDto) {
        return this.suppliersService.update(id, updateSupplierSetupDto);
    }
    remove(id) {
        return this.suppliersService.remove(id);
    }
};
exports.SuppliersController = SuppliersController;
__decorate([
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supplier_setup_dto_1.CreateSupplierSetupDto]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], SuppliersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('directory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], SuppliersController.prototype, "getDirectory", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('by-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findByBusinessEmail", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_supplier_setup_dto_1.UpdateSupplierSetupDto]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "remove", null);
exports.SuppliersController = SuppliersController = __decorate([
    (0, common_1.Controller)('suppliers'),
    __metadata("design:paramtypes", [suppliers_service_1.SuppliersService])
], SuppliersController);
//# sourceMappingURL=suppliers.controller.js.map