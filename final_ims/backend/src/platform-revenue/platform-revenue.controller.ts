import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  CancelSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/platform-revenue.dto';
import { PlatformRevenueService } from './platform-revenue.service';

@Controller('platform-revenue')
export class PlatformRevenueController {
  constructor(private readonly platformRevenueService: PlatformRevenueService) {}

  @Get('summary')
  getSummary(@Query('retailerId') retailerId?: string) {
    return this.platformRevenueService.getRevenueSummary(retailerId);
  }

  @Get('commissions')
  getCommissions(
    @Query('retailerId') retailerId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.platformRevenueService.getCommissions(
      retailerId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('subscriptions/active')
  getActiveSubscription(@Query('userId') userId: string) {
    return this.platformRevenueService.getActiveSubscription(userId);
  }

  @Get('subscriptions')
  getSubscriptions(@Query('userId') userId?: string) {
    return this.platformRevenueService.getSubscriptions(userId);
  }

  @Post('subscriptions')
  updateSubscription(@Body() dto: UpdateSubscriptionDto) {
    return this.platformRevenueService.updateSubscription(dto);
  }

  @Post('subscriptions/cancel')
  cancelSubscription(@Body() dto: CancelSubscriptionDto) {
    return this.platformRevenueService.cancelSubscription(dto);
  }

  @Get('tiers')
  getPricingTiers(@Query('role') role?: 'retailer' | 'supplier') {
    return this.platformRevenueService.getPricingTiers(role);
  }

  @Get('usage')
  getWeeklyOrderUsage(
    @Query('userId') userId: string,
    @Query('role') role?: 'retailer' | 'supplier',
  ) {
    return this.platformRevenueService.getWeeklyOrderUsage(userId, role || 'retailer');
  }
}
