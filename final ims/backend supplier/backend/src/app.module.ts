import { Module } from '@nestjs/common';
import { BillersModule } from './billers/billers.module';
import { CommonModule } from './common/common.module';
import { CustomersModule } from './customers/customers.module';
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
  imports: [
    CommonModule,
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
export class AppModule {}
