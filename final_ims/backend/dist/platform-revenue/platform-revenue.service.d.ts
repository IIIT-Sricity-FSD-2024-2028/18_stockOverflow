import { PlatformCommissionRecord, SubscriptionRecord, SubscriptionTier } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CancelSubscriptionDto, UpdateSubscriptionDto } from './dto/platform-revenue.dto';
export declare class PlatformRevenueService {
    private readonly db;
    constructor(db: JsonDbService);
    getPricingTiers(role?: 'retailer' | 'supplier'): {
        tier: SubscriptionTier;
        name: string;
        price: number;
        billingInterval: string;
        maxStores: number;
        maxProducts: number;
        weeklyOrderLimit: string | number;
        features: string[];
        role: "retailer" | "supplier";
        currency: string;
        currencySymbol: string;
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
                name: string;
                count: number;
                revenue: number;
            };
            pro: {
                name: string;
                count: number;
                revenue: number;
            };
            enterprise: {
                name: string;
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
    private findMatchingUser;
    getActiveSubscription(userId: string): {
        daysRemaining: number;
        isExpired: boolean;
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        userRole: "retailer" | "supplier";
        tier: SubscriptionTier;
        tierName?: string;
        pricePerMonth: number;
        billingCycle: "monthly" | "yearly";
        startDate: string;
        endDate: string;
        renewalDate: string;
        status: "active" | "cancelled" | "trial";
        autoRenew: boolean;
        cancelledAt?: string;
        paymentId?: string;
        paymentMethod?: string;
        features: string[];
        maxStores?: number;
        maxProducts?: number;
    };
    updateSubscription(dto: UpdateSubscriptionDto): SubscriptionRecord;
    cancelSubscription(dto: CancelSubscriptionDto): SubscriptionRecord;
    getWeeklyOrderUsage(userId: string, role?: 'retailer' | 'supplier'): {
        userId: string;
        role: "retailer" | "supplier";
        tier: SubscriptionTier;
        tierName: string;
        weeklyLimit: string | number;
        usedThisWeek: number;
        remainingThisWeek: string | number;
        isUnlimited: boolean;
        isQuotaReached: boolean;
        resetDate: string;
        status: "active" | "cancelled" | "trial";
        subscription: {
            daysRemaining: number;
            isExpired: boolean;
            id: string;
            userId: string;
            userName: string;
            userEmail: string;
            userRole: "retailer" | "supplier";
            tier: SubscriptionTier;
            tierName?: string;
            pricePerMonth: number;
            billingCycle: "monthly" | "yearly";
            startDate: string;
            endDate: string;
            renewalDate: string;
            status: "active" | "cancelled" | "trial";
            autoRenew: boolean;
            cancelledAt?: string;
            paymentId?: string;
            paymentMethod?: string;
            features: string[];
            maxStores?: number;
            maxProducts?: number;
        };
    };
    validateOrderQuota(retailerId?: string, supplierId?: string): void;
}
