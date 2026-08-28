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
const create_query_dto_1 = require("./dto/create-query.dto");
const resolve_assignment_dto_1 = require("./dto/resolve-assignment.dto");
const resolve_query_dto_1 = require("./dto/resolve-query.dto");
const employees_service_1 = require("./employees.service");
let EmployeesController = class EmployeesController {
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    distributeWork() {
        return this.employeesService.distributePendingWork();
    }
    getAssignments(employeeId, status) {
        return this.employeesService.getAssignments(employeeId, status);
    }
    getAssignmentById(id) {
        return this.employeesService.getAssignmentById(id);
    }
    resolveAssignment(id, dto) {
        return this.employeesService.resolveAssignment(id, dto);
    }
    getQueries(employeeId, status) {
        return this.employeesService.getQueries(employeeId, status);
    }
    createQuery(dto) {
        return this.employeesService.createQuery(dto);
    }
    resolveQuery(id, dto) {
        return this.employeesService.resolveQuery(id, dto);
    }
    getStats(employeeId) {
        return this.employeesService.getStats(employeeId);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)('assignments/distribute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "distributeWork", null);
__decorate([
    (0, common_1.Get)('assignments'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Get)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getAssignmentById", null);
__decorate([
    (0, common_1.Patch)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_assignment_dto_1.ResolveAssignmentDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "resolveAssignment", null);
__decorate([
    (0, common_1.Get)('queries'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getQueries", null);
__decorate([
    (0, common_1.Post)('queries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_query_dto_1.CreateQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createQuery", null);
__decorate([
    (0, common_1.Patch)('queries/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_query_dto_1.ResolveQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "resolveQuery", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getStats", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map