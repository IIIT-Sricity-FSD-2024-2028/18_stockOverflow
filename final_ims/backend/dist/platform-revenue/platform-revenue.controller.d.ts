import { UpdateSubscriptionDto } from './dto/platform-revenue.dto';
import { PlatformRevenueService } from './platform-revenue.service';
export declare class PlatformRevenueController {
    private readonly platformRevenueService;
    constructor(platformRevenueService: PlatformRevenueService);
    getSummary(retailerId?: string): {
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
        recentCommissions: import("../common/database.types").PlatformCommissionRecord[];
        currency: string;
        currencySymbol: string;
    };
    getCommissions(retailerId?: string, limit?: number): import("../common/database.types").PlatformCommissionRecord[];
    getSubscriptions(userId?: string): import("../common/database.types").SubscriptionRecord[];
    updateSubscription(dto: UpdateSubscriptionDto): import("../common/database.types").SubscriptionRecord;
    getPricingTiers(): {
        currency: string;
        currencySymbol: string;
        price: number;
        name: string;
        features: string[];
        maxStores: number;
        maxProducts: number;
        billingInterval: string;
        tier: import("../common/database.types").SubscriptionTier;
    }[];
}
