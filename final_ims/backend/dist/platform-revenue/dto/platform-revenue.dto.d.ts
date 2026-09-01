import { SubscriptionTier } from '../../common/database.types';
export declare class UpdateSubscriptionDto {
    userId: string;
    userName?: string;
    userEmail?: string;
    userRole?: 'retailer' | 'supplier';
    tier: SubscriptionTier;
    billingCycle?: 'monthly' | 'yearly';
    paymentMethod?: string;
    paymentId?: string;
}
export declare class CancelSubscriptionDto {
    userId: string;
    reason?: string;
}
export declare class QueryPlatformRevenueDto {
    retailerId?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
}
