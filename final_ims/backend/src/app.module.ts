import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggingMiddleware, SecurityMiddleware } from './common/middlewares';
import { AuditRouterMiddleware } from './common/router.middleware';
import { GlobalExceptionFilter } from './common/http-exception.filter';
import { AdminModule } from './admin/admin.module';
import { BillersModule } from './billers/billers.module';
import { CommonModule } from './common/common.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { ProductsModule } from './products/products.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { RetailersModule } from './retailers/retailers.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReturnsModule } from './returns/returns.module';
import { StockAdjustmentsModule } from './stock-adjustments/stock-adjustments.module';
import { StoresModule } from './stores/stores.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 3. Global Exception Filter (Error Handling)
    },
  ],
  imports: [
    CommonModule,
    AdminModule,
    EmployeesModule,
    ProductsModule,
    StoresModule,
    RetailersModule,
    CustomersModule,
    BillersModule,
    SuppliersModule,
    WarehousesModule,
    PurchaseOrdersModule,
    ReservationsModule,
    TransactionsModule,
    ReturnsModule,
    StockAdjustmentsModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Global Middleware (Security & Logging)
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
      
    // 2. Router-level Middleware
    consumer
      .apply(AuditRouterMiddleware)
      .forRoutes('products/upload', 'transactions', 'billers');
  }
}
