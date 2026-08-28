import { Module } from '@nestjs/common';
import { BillersModule } from '../billers/billers.module';
import { RetailersModule } from '../retailers/retailers.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { UsersModule } from '../users/users.module';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [UsersModule, RetailersModule, SuppliersModule, BillersModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
