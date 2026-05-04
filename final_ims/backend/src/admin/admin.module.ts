import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [CommonModule, UsersModule, StoresModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}