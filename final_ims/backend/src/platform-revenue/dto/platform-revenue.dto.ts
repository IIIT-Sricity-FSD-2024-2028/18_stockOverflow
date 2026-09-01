import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubscriptionTier } from '../../common/database.types';

export class UpdateSubscriptionDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  userRole?: 'retailer' | 'supplier';

  @IsEnum(['free', 'pro', 'enterprise'])
  tier: SubscriptionTier;

  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  billingCycle?: 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentId?: string;
}

export class CancelSubscriptionDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryPlatformRevenueDto {
  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
