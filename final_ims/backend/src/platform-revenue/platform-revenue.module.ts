import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PlatformRevenueController } from './platform-revenue.controller';
import { PlatformRevenueService } from './platform-revenue.service';

@Module({
  imports: [CommonModule],
  controllers: [PlatformRevenueController],
  providers: [PlatformRevenueService],
  exports: [PlatformRevenueService],
})
export class PlatformRevenueModule {}
