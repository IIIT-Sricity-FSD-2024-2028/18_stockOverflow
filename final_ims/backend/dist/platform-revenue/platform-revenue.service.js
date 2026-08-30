"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRevenueService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const json_db_service_1 = require("../common/json-db.service");
const TIER_PRICING = {
    free: {
        price: 0,
        name: 'Starter Kirana',
        features: ['1 Store Location', 'Up to 50 Products Catalog', 'UPI QR & POS Billing', 'Daily Sales Report'],
        maxStores: 1,
        maxProducts: 50,
        billingInterval: 'month',
    },
    pro: {
        price: 799,
        name: 'Vyapar Pro',
        features: ['Up to 5 Retail Outlets', 'Unlimited Products & SKUs', 'GST E-Invoice & e-Way Bill', 'WhatsApp & SMS Stock Alerts', 'Automated Reorder Suggestions', 'Priority Verification Queue'],
        maxStores: 5,
        maxProducts: 10000,
        billingInterval: 'month',
    },
    enterprise: {
        price: 3499,
        name: 'Bharat Enterprise',
        features: ['Unlimited Stores & Depots', 'Multi-Warehouse Inventory Routing', 'Bulk Supplier POs & Credit Terms', 'Dedicated Account Manager', 'Custom ERP & Tally Sync API'],
        maxStores: 999,
        maxProducts: 999999,
        billingInterval: 'month',
    },
};
let PlatformRevenueService = class PlatformRevenueService {
    constructor(db) {
        this.db = db;
    }
    getPricingTiers() {
        return Object.entries(TIER_PRICING).map(([tier, config]) => ({
            tier: tier,
            ...config,
            currency: 'INR',
            currencySymbol: '₹',
        }));
    }
    getRevenueSummary(retailerId) {
        const transactions = this.db.getCollection('transactions') || [];
        let commissions = this.db.getCollection('platformCommissions') || [];
        const subscriptions = this.db.getCollection('subscriptions') || [];
        const scopedTransactions = retailerId
            ? transactions.filter((t) => String(t.retailerId || '').trim() === String(retailerId).trim())
            : transactions;
        if (commissions.length < transactions.length) {
            const existingTxnIds = new Set(commissions.map((c) => c.transactionId || c.orderId));
            transactions.forEach((t) => {
                if (!existingTxnIds.has(t.orderId)) {
                    const orderTotal = Number(t.finalTotal || 0);
                    const commissionAmount = Number((orderTotal * 0.02).toFixed(2));
                    commissions.push({
                        id: `comm-${t.orderId}`,
                        transactionId: t.orderId,
                        orderId: t.orderId,
                        retailerId: t.retailerId || 'default-retailer',
                        retailerName: t.store || 'Retailer Store',
                        storeId: t.storeId || 's1',
                        storeName: t.store || 'Main Store',
                        customerName: t.customer || 'Customer',
                        orderTotal,
                        commissionRate: 0.02,
                        commissionAmount,
                        netRetailerAmount: Number((orderTotal - commissionAmount).toFixed(2)),
                        currency: 'INR',
                        timestamp: t.timestamp || new Date().toISOString(),
                        status: 'settled',
                    });
                }
            });
            this.db.saveCollection('platformCommissions', commissions);
        }
        const scopedCommissions = retailerId
            ? commissions.filter((c) => String(c.retailerId || '').trim() === String(retailerId).trim())
            : commissions;
        const totalGrossVolume = scopedTransactions.reduce((sum, t) => sum + Number(t.finalTotal || 0), 0);
        const totalCommissionEarned = scopedCommissions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
        const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
        const totalSubscriptionRevenue = activeSubscriptions.reduce((sum, s) => sum + Number(s.pricePerMonth || 0), 0);
        const totalPlatformRevenue = Number((totalCommissionEarned + (retailerId ? 0 : totalSubscriptionRevenue)).toFixed(2));
        const netRetailerPayout = Number((totalGrossVolume - totalCommissionEarned).toFixed(2));
        const monthlyData = {};
        scopedTransactions.forEach((t) => {
            const month = String(t.timestamp || '').substring(0, 7) || new Date().toISOString().substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { grossVolume: 0, commission: 0, subscriptions: 0, totalPlatform: 0, ordersCount: 0 };
            }
            const gross = Number(t.finalTotal || 0);
            const comm = Number((gross * 0.02).toFixed(2));
            monthlyData[month].grossVolume += gross;
            monthlyData[month].commission += comm;
            monthlyData[month].ordersCount += 1;
        });
        if (!retailerId) {
            activeSubscriptions.forEach((s) => {
                const startMonth = String(s.startDate || '').substring(0, 7) || new Date().toISOString().substring(0, 7);
                if (!monthlyData[startMonth]) {
                    monthlyData[startMonth] = { grossVolume: 0, commission: 0, subscriptions: 0, totalPlatform: 0, ordersCount: 0 };
                }
                monthlyData[startMonth].subscriptions += Number(s.pricePerMonth || 0);
            });
        }
        Object.keys(monthlyData).forEach((m) => {
            monthlyData[m].totalPlatform = Number((monthlyData[m].commission + monthlyData[m].subscriptions).toFixed(2));
            monthlyData[m].grossVolume = Number(monthlyData[m].grossVolume.toFixed(2));
            monthlyData[m].commission = Number(monthlyData[m].commission.toFixed(2));
        });
        const storeMap = {};
        scopedTransactions.forEach((t) => {
            const sId = t.storeId || 'default-store';
            if (!storeMap[sId]) {
                storeMap[sId] = {
                    storeId: sId,
                    storeName: t.store || 'Store ' + sId,
                    totalSales: 0,
                    commission: 0,
                    orderCount: 0,
                };
            }
            const val = Number(t.finalTotal || 0);
            storeMap[sId].totalSales += val;
            storeMap[sId].commission += Number((val * 0.02).toFixed(2));
            storeMap[sId].orderCount += 1;
        });
        const tierStats = {
            free: { count: 0, revenue: 0 },
            pro: { count: 0, revenue: 0 },
            enterprise: { count: 0, revenue: 0 },
        };
        activeSubscriptions.forEach((s) => {
            const t = (s.tier || 'free').toLowerCase();
            if (tierStats[t]) {
                tierStats[t].count += 1;
                tierStats[t].revenue += Number(s.pricePerMonth || 0);
            }
        });
        const recentCommissions = scopedCommissions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 15);
        return {
            commissionRate: 0.02,
            commissionPercentage: '2.0%',
            totalGrossVolume: Number(totalGrossVolume.toFixed(2)),
            totalCommissionEarned: Number(totalCommissionEarned.toFixed(2)),
            totalSubscriptionRevenue: Number(totalSubscriptionRevenue.toFixed(2)),
            totalPlatformRevenue,
            netRetailerPayout,
            totalTransactionsProcessed: scopedTransactions.length,
            activeSubscriptionsCount: activeSubscriptions.length,
            monthlyBreakdown: monthlyData,
            byStore: Object.values(storeMap).sort((a, b) => b.totalSales - a.totalSales),
            subscriptionStats: tierStats,
            recentCommissions,
            currency: 'INR',
            currencySymbol: '₹',
        };
    }
    getCommissions(retailerId, limit = 50) {
        let commissions = this.db.getCollection('platformCommissions') || [];
        if (retailerId) {
            commissions = commissions.filter((c) => String(c.retailerId || '').trim() === String(retailerId).trim());
        }
        return commissions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
    getSubscriptions(userId) {
        const subscriptions = this.db.getCollection('subscriptions') || [];
        if (userId) {
            return subscriptions.filter((s) => String(s.userId || '').trim() === String(userId).trim());
        }
        return subscriptions;
    }
    updateSubscription(dto) {
        const subscriptions = this.db.getCollection('subscriptions') || [];
        const tierConfig = TIER_PRICING[dto.tier] || TIER_PRICING.free;
        const now = new Date();
        const renewalDate = new Date(now.getTime() + 30 * 86400000);
        const existingIndex = subscriptions.findIndex((s) => String(s.userId).trim() === String(dto.userId).trim());
        const record = {
            id: existingIndex >= 0 ? subscriptions[existingIndex].id : `sub-${(0, node_crypto_1.randomUUID)()}`,
            userId: dto.userId,
            userName: dto.userName || (existingIndex >= 0 ? subscriptions[existingIndex].userName : 'User'),
            userEmail: dto.userEmail || (existingIndex >= 0 ? subscriptions[existingIndex].userEmail : ''),
            userRole: dto.userRole || (existingIndex >= 0 ? subscriptions[existingIndex].userRole : 'retailer'),
            tier: dto.tier,
            pricePerMonth: tierConfig.price,
            billingCycle: dto.billingCycle || 'monthly',
            startDate: existingIndex >= 0 ? subscriptions[existingIndex].startDate : now.toISOString(),
            renewalDate: renewalDate.toISOString(),
            status: 'active',
            features: tierConfig.features,
            maxStores: tierConfig.maxStores,
            maxProducts: tierConfig.maxProducts,
        };
        if (existingIndex >= 0) {
            subscriptions[existingIndex] = record;
        }
        else {
            subscriptions.push(record);
        }
        this.db.saveCollection('subscriptions', subscriptions);
        return record;
    }
};
exports.PlatformRevenueService = PlatformRevenueService;
exports.PlatformRevenueService = PlatformRevenueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], PlatformRevenueService);
//# sourceMappingURL=platform-revenue.service.js.map