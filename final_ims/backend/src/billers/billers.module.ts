import { Module } from '@nestjs/common';
import { BillersController } from './billers.controller';
import { BillersService } from './billers.service';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [CommonModule, UsersModule, StoresModule],
  controllers: [BillersController],
  providers: [BillersService],
})
export class BillersModule {}
