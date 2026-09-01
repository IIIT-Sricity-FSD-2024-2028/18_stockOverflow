import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { RetailersModule } from '../retailers/retailers.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductsModule } from '../products/products.module';
import { PlatformRevenueModule } from '../platform-revenue/platform-revenue.module';

@Module({
  imports: [SuppliersModule, RetailersModule, ProductsModule, PlatformRevenueModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
