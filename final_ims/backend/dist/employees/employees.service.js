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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const billers_service_1 = require("../billers/billers.service");
const retailers_service_1 = require("../retailers/retailers.service");
const suppliers_service_1 = require("../suppliers/suppliers.service");
const users_service_1 = require("../users/users.service");
let EmployeesService = class EmployeesService {
    constructor(usersService, retailersService, suppliersService, billersService) {
        this.usersService = usersService;
        this.retailersService = retailersService;
        this.suppliersService = suppliersService;
        this.billersService = billersService;
    }
    getWork(employeeId) {
        const employee = this.requireEmployee(employeeId);
        const retailerRegistrations = this.retailersService.findAssignedValidations(employeeId);
        const retailerStores = this.retailersService.findAssignedStoreValidations(employeeId);
        const suppliers = this.suppliersService.findAssignedValidations(employeeId);
        const billerRequests = this.billersService.getRequests(employeeId);
        return {
            employee,
            stats: {
                retailerRegistrations: retailerRegistrations.length,
                retailerStores: retailerStores.length,
                suppliers: suppliers.length,
                billerRequests: billerRequests.length,
                pending: retailerRegistrations.filter((item) => item.validationStatus === 'pending').length +
                    retailerStores.filter((item) => item.validationStatus === 'pending')
                        .length +
                    suppliers.filter((item) => item.validationStatus === 'pending').length +
                    billerRequests.filter((item) => item.status === 'pending').length,
            },
            retailerRegistrations,
            retailerStores,
            suppliers,
            billerRequests,
        };
    }
    approveRetailer(employeeId, retailerId) {
        this.requireEmployee(employeeId);
        return this.retailersService.approveValidation(retailerId, employeeId);
    }
    rejectRetailer(employeeId, retailerId, actionDto = {}) {
        this.requireEmployee(employeeId);
        return this.retailersService.rejectValidation(retailerId, employeeId, actionDto.reason);
    }
    approveRetailerStore(employeeId, retailerId, storeCode) {
        this.requireEmployee(employeeId);
        return this.retailersService.approveStoreValidation(retailerId, storeCode, employeeId);
    }
    rejectRetailerStore(employeeId, retailerId, storeCode, actionDto = {}) {
        this.requireEmployee(employeeId);
        return this.retailersService.rejectStoreValidation(retailerId, storeCode, employeeId, actionDto.reason);
    }
    approveSupplier(employeeId, supplierId) {
        this.requireEmployee(employeeId);
        return this.suppliersService.approveValidation(supplierId, employeeId);
    }
    rejectSupplier(employeeId, supplierId, actionDto = {}) {
        this.requireEmployee(employeeId);
        return this.suppliersService.rejectValidation(supplierId, employeeId, actionDto.reason);
    }
    approveBillerRequest(employeeId, requestId, actionDto = {}) {
        this.requireEmployee(employeeId);
        return this.billersService.approveAssignedRequest(requestId, employeeId, actionDto);
    }
    rejectBillerRequest(employeeId, requestId, actionDto = {}) {
        this.requireEmployee(employeeId);
        return this.billersService.rejectAssignedRequest(requestId, employeeId, actionDto.reason);
    }
    requireEmployee(employeeId) {
        const user = this.usersService.findOne(employeeId);
        if (String(user.role || '').toLowerCase() !== 'employee') {
            throw new common_1.NotFoundException('Employee not found');
        }
        return user;
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        retailers_service_1.RetailersService,
        suppliers_service_1.SuppliersService,
        billers_service_1.BillersService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map