"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const middlewares_1 = require("./common/middlewares");
const router_middleware_1 = require("./common/router.middleware");
const http_exception_filter_1 = require("./common/http-exception.filter");
const admin_module_1 = require("./admin/admin.module");
const billers_module_1 = require("./billers/billers.module");
const common_module_1 = require("./common/common.module");
const customers_module_1 = require("./customers/customers.module");
const products_module_1 = require("./products/products.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const retailers_module_1 = require("./retailers/retailers.module");
const reservations_module_1 = require("./reservations/reservations.module");
const returns_module_1 = require("./returns/returns.module");
const stock_adjustments_module_1 = require("./stock-adjustments/stock-adjustments.module");
const stores_module_1 = require("./stores/stores.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const transactions_module_1 = require("./transactions/transactions.module");
const users_module_1 = require("./users/users.module");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const employees_module_1 = require("./employees/employees.module");
const platform_revenue_module_1 = require("./platform-revenue/platform-revenue.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(middlewares_1.SecurityMiddleware, middlewares_1.LoggingMiddleware)
            .forRoutes('*');
        consumer
            .apply(router_middleware_1.AuditRouterMiddleware)
            .forRoutes('products/upload', 'transactions', 'billers');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.GlobalExceptionFilter,
            },
        ],
        imports: [
            common_module_1.CommonModule,
            admin_module_1.AdminModule,
            products_module_1.ProductsModule,
            stores_module_1.StoresModule,
            retailers_module_1.RetailersModule,
            customers_module_1.CustomersModule,
            billers_module_1.BillersModule,
            suppliers_module_1.SuppliersModule,
            warehouses_module_1.WarehousesModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            reservations_module_1.ReservationsModule,
            transactions_module_1.TransactionsModule,
            returns_module_1.ReturnsModule,
            stock_adjustments_module_1.StockAdjustmentsModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            platform_revenue_module_1.PlatformRevenueModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map