import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { RetailersModule } from '../retailers/retailers.module';
import { StoresModule } from '../stores/stores.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { UsersModule } from '../users/users.module';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    RetailersModule,
    SuppliersModule,
    StoresModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
