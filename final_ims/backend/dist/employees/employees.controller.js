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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employee_action_dto_1 = require("./dto/employee-action.dto");
const employees_service_1 = require("./employees.service");
let EmployeesController = class EmployeesController {
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    getWork(employeeId) {
        return this.employeesService.getWork(employeeId);
    }
    approveRetailer(employeeId, retailerId) {
        return this.employeesService.approveRetailer(employeeId, retailerId);
    }
    rejectRetailer(employeeId, retailerId, actionDto) {
        return this.employeesService.rejectRetailer(employeeId, retailerId, actionDto);
    }
    approveRetailerStore(employeeId, retailerId, storeCode) {
        return this.employeesService.approveRetailerStore(employeeId, retailerId, storeCode);
    }
    rejectRetailerStore(employeeId, retailerId, storeCode, actionDto) {
        return this.employeesService.rejectRetailerStore(employeeId, retailerId, storeCode, actionDto);
    }
    approveSupplier(employeeId, supplierId) {
        return this.employeesService.approveSupplier(employeeId, supplierId);
    }
    rejectSupplier(employeeId, supplierId, actionDto) {
        return this.employeesService.rejectSupplier(employeeId, supplierId, actionDto);
    }
    approveBillerRequest(employeeId, requestId, actionDto) {
        return this.employeesService.approveBillerRequest(employeeId, requestId, actionDto);
    }
    rejectBillerRequest(employeeId, requestId, actionDto) {
        return this.employeesService.rejectBillerRequest(employeeId, requestId, actionDto);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Get)(':employeeId/work'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getWork", null);
__decorate([
    (0, common_1.Put)(':employeeId/retailers/:retailerId/approve'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('retailerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "approveRetailer", null);
__decorate([
    (0, common_1.Put)(':employeeId/retailers/:retailerId/reject'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('retailerId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, employee_action_dto_1.EmployeeActionDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "rejectRetailer", null);
__decorate([
    (0, common_1.Put)(':employeeId/retailers/:retailerId/stores/:storeCode/approve'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('retailerId')),
    __param(2, (0, common_1.Param)('storeCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "approveRetailerStore", null);
__decorate([
    (0, common_1.Put)(':employeeId/retailers/:retailerId/stores/:storeCode/reject'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('retailerId')),
    __param(2, (0, common_1.Param)('storeCode')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, employee_action_dto_1.EmployeeActionDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "rejectRetailerStore", null);
__decorate([
    (0, common_1.Put)(':employeeId/suppliers/:supplierId/approve'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "approveSupplier", null);
__decorate([
    (0, common_1.Put)(':employeeId/suppliers/:supplierId/reject'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('supplierId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, employee_action_dto_1.EmployeeActionDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "rejectSupplier", null);
__decorate([
    (0, common_1.Put)(':employeeId/biller-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('requestId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, employee_action_dto_1.EmployeeActionDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "approveBillerRequest", null);
__decorate([
    (0, common_1.Put)(':employeeId/biller-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('requestId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, employee_action_dto_1.EmployeeActionDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "rejectBillerRequest", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map