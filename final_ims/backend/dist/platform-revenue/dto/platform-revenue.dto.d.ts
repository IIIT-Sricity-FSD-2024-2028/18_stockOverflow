import { SubscriptionTier } from '../../common/database.types';
export declare class UpdateSubscriptionDto {
    userId: string;
    userName?: string;
    userEmail?: string;
    userRole?: 'retailer' | 'supplier';
    tier: SubscriptionTier;
    billingCycle?: 'monthly' | 'yearly';
}
export declare class QueryPlatformRevenueDto {
    retailerId?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
}
