import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CommonModule } from '../common/common.module';
import { RetailersModule } from '../retailers/retailers.module';

@Module({
  imports: [CommonModule, RetailersModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
