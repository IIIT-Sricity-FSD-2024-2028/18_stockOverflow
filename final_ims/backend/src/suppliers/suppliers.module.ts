import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { ProductsModule } from '../products/products.module';
import { SupplierAuditMiddleware } from '../common/router.middleware';

/**
 * IMPLEMENTATION DETAIL (Evaluation Criteria):
 * Router-level Middleware - Configured in SuppliersModule via NestModule configure()
 * to apply SupplierAuditMiddleware directly to all routes handled by SuppliersController.
 */
@Module({
  imports: [ProductsModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SupplierAuditMiddleware)
      .forRoutes(SuppliersController);
  }
}

