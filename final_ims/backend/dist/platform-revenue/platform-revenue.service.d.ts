import { PlatformCommissionRecord, SubscriptionRecord, SubscriptionTier } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { UpdateSubscriptionDto } from './dto/platform-revenue.dto';
export declare class PlatformRevenueService {
    private readonly db;
    constructor(db: JsonDbService);
    getPricingTiers(): {
        currency: string;
        currencySymbol: string;
        price: number;
        name: string;
        features: string[];
        maxStores: number;
        maxProducts: number;
        billingInterval: string;
        tier: SubscriptionTier;
    }[];
    getRevenueSummary(retailerId?: string): {
        commissionRate: number;
        commissionPercentage: string;
        totalGrossVolume: number;
        totalCommissionEarned: number;
        totalSubscriptionRevenue: number;
        totalPlatformRevenue: number;
        netRetailerPayout: number;
        totalTransactionsProcessed: number;
        activeSubscriptionsCount: number;
        monthlyBreakdown: Record<string, {
            grossVolume: number;
            commission: number;
            subscriptions: number;
            totalPlatform: number;
            ordersCount: number;
        }>;
        byStore: {
            storeName: string;
            storeId: string;
            totalSales: number;
            commission: number;
            orderCount: number;
        }[];
        subscriptionStats: {
            free: {
                count: number;
                revenue: number;
            };
            pro: {
                count: number;
                revenue: number;
            };
            enterprise: {
                count: number;
                revenue: number;
            };
        };
        recentCommissions: PlatformCommissionRecord[];
        currency: string;
        currencySymbol: string;
    };
    getCommissions(retailerId?: string, limit?: number): PlatformCommissionRecord[];
    getSubscriptions(userId?: string): SubscriptionRecord[];
    updateSubscription(dto: UpdateSubscriptionDto): SubscriptionRecord;
}
