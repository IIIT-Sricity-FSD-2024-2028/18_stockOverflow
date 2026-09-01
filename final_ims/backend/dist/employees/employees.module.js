"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../common/common.module");
const retailers_module_1 = require("../retailers/retailers.module");
const stores_module_1 = require("../stores/stores.module");
const suppliers_module_1 = require("../suppliers/suppliers.module");
const users_module_1 = require("../users/users.module");
const employees_controller_1 = require("./employees.controller");
const employees_service_1 = require("./employees.service");
let EmployeesModule = class EmployeesModule {
};
exports.EmployeesModule = EmployeesModule;
exports.EmployeesModule = EmployeesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            retailers_module_1.RetailersModule,
            suppliers_module_1.SuppliersModule,
            stores_module_1.StoresModule,
        ],
        controllers: [employees_controller_1.EmployeesController],
        providers: [employees_service_1.EmployeesService],
        exports: [employees_service_1.EmployeesService],
    })
], EmployeesModule);
//# sourceMappingURL=employees.module.js.map