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
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
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
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map