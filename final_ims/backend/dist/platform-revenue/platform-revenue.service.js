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
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const json_db_service_1 = require("../common/json-db.service");
const TIER_PRICING = {
    free: {
        price: 0,
        name: 'Starter',
        maxStores: 1,
        maxProducts: 50,
        retailerWeeklyOrderLimit: 3,
        supplierWeeklyOrderLimit: 5,
        billingInterval: 'month',
        retailerFeatures: [
            '3 Purchase Orders / week (Auto-resets weekly)',
            '1 Store Location',
            'Up to 50 Products Catalog',
            'Standard POS Billing Terminal',
            'Daily Sales Reports',
        ],
        supplierFeatures: [
            '5 Incoming POs / week (Auto-resets weekly)',
            'Up to 25 Product Listings',
            'Single Warehouse Dispatch Depot',
            'Basic Order Tracking & Status',
        ],
    },
    pro: {
        price: 799,
        name: 'Growth',
        maxStores: 5,
        maxProducts: 10000,
        retailerWeeklyOrderLimit: 15,
        supplierWeeklyOrderLimit: 30,
        billingInterval: 'month',
        retailerFeatures: [
            '15 Purchase Orders / week (Auto-resets weekly)',
            'Up to 5 Retail Outlets',
            'Unlimited Products & SKUs',
            'AI Automated Reorder Suggestions',
            'Multi-Store Inventory Sync',
            'Priority Staff Verification Queue',
        ],
        supplierFeatures: [
            '30 Incoming POs / week (Auto-resets weekly)',
            'Unlimited Product Listings',
            'Up to 3 Regional Depots',
            'Bulk CSV/Excel Catalog Import & Export',
            'Automated Dispatch Alerts',
            'Priority Buyer Discovery',
        ],
    },
    enterprise: {
        price: 3499,
        name: 'Enterprise',
        maxStores: 999,
        maxProducts: 999999,
        retailerWeeklyOrderLimit: 999999,
        supplierWeeklyOrderLimit: 999999,
        billingInterval: 'month',
        retailerFeatures: [
            'UNLIMITED Purchase Orders (No weekly cap)',
            'Unlimited Stores & Depots',
            'Multi-Warehouse Stock Routing',
            'Custom ERP & API Integrations',
            'Dedicated 24/7 Account Manager',
            'Advanced Analytics & Forecasts',
        ],
        supplierFeatures: [
            'UNLIMITED Incoming POs (No weekly cap)',
            'Unlimited Warehouses & Depots',
            'Multi-Depot Route Logistics',
            'B2B Extended Credit Terms (Net 30/60)',
            'Custom ERP & EDI Sync API',
            'Dedicated Account Manager',
            '24/7 Priority Support',
        ],
    },
};
let PlatformRevenueService = class PlatformRevenueService {
    constructor(db) {
        this.db = db;
    }
    getPricingTiers(role = 'retailer') {
        return Object.entries(TIER_PRICING).map(([tier, config]) => {
            const features = role === 'supplier'
                ? config.supplierFeatures
                : config.retailerFeatures;
            const weeklyOrderLimit = role === 'supplier'
                ? config.supplierWeeklyOrderLimit
                : config.retailerWeeklyOrderLimit;
            return {
                tier: tier,
                name: config.name,
                price: config.price,
                billingInterval: config.billingInterval,
                maxStores: config.maxStores,
                maxProducts: config.maxProducts,
                weeklyOrderLimit: weeklyOrderLimit >= 999999 ? 'Unlimited' : weeklyOrderLimit,
                features,
                role,
                currency: 'INR',
                currencySymbol: '₹',
            };
        });
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
            free: { name: 'Starter', count: 0, revenue: 0 },
            pro: { name: 'Growth', count: 0, revenue: 0 },
            enterprise: { name: 'Enterprise', count: 0, revenue: 0 },
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
    findMatchingUser(userId) {
        if (!userId)
            return null;
        const target = String(userId).trim().toLowerCase();
        const dbUsers = this.db.getCollection('users') || [];
        const foundDbUser = dbUsers.find((u) => String(u.id || '').trim().toLowerCase() === target ||
            String(u.profileId || '').trim().toLowerCase() === target ||
            String(u.email || '').trim().toLowerCase() === target);
        if (foundDbUser)
            return foundDbUser;
        try {
            const usersFile = (0, node_path_1.resolve)(process.cwd(), 'data', 'users.json');
            if ((0, node_fs_1.existsSync)(usersFile)) {
                const raw = (0, node_fs_1.readFileSync)(usersFile, 'utf8');
                const diskUsers = JSON.parse(raw);
                if (Array.isArray(diskUsers)) {
                    const foundDiskUser = diskUsers.find((u) => String(u.id || '').trim().toLowerCase() === target ||
                        String(u.profileId || '').trim().toLowerCase() === target ||
                        String(u.email || '').trim().toLowerCase() === target);
                    if (foundDiskUser)
                        return foundDiskUser;
                }
            }
        }
        catch { }
        try {
            const retailersFile = (0, node_path_1.resolve)(process.cwd(), 'data', 'retailers.json');
            if ((0, node_fs_1.existsSync)(retailersFile)) {
                const raw = (0, node_fs_1.readFileSync)(retailersFile, 'utf8');
                const retailers = JSON.parse(raw);
                if (Array.isArray(retailers)) {
                    const r = retailers.find((ret) => String(ret.id || '').trim().toLowerCase() === target ||
                        String(ret.business?.retailerCode || '').trim().toLowerCase() === target ||
                        String(ret.primaryContact?.directEmail || '').trim().toLowerCase() === target);
                    if (r) {
                        return {
                            id: r.id,
                            name: r.business?.companyName || r.primaryContact?.fullName || 'Retailer',
                            email: r.primaryContact?.directEmail || '',
                            role: 'retailer',
                            profileId: r.id,
                        };
                    }
                }
            }
        }
        catch { }
        try {
            const suppliersFile = (0, node_path_1.resolve)(process.cwd(), 'data', 'suppliers.json');
            if ((0, node_fs_1.existsSync)(suppliersFile)) {
                const raw = (0, node_fs_1.readFileSync)(suppliersFile, 'utf8');
                const suppliers = JSON.parse(raw);
                if (Array.isArray(suppliers)) {
                    const s = suppliers.find((sup) => String(sup.id || '').trim().toLowerCase() === target ||
                        String(sup.business?.supplierCode || '').trim().toLowerCase() === target ||
                        String(sup.primaryContact?.directEmail || '').trim().toLowerCase() === target);
                    if (s) {
                        return {
                            id: s.id,
                            name: s.business?.companyName || s.primaryContact?.fullName || 'Supplier',
                            email: s.primaryContact?.directEmail || '',
                            role: 'supplier',
                            profileId: s.id,
                        };
                    }
                }
            }
        }
        catch { }
        return null;
    }
    getActiveSubscription(userId) {
        if (!userId)
            return null;
        const subscriptions = this.db.getCollection('subscriptions') || [];
        const user = this.findMatchingUser(userId);
        const target = String(userId).trim().toLowerCase();
        const matchIds = new Set([
            target,
            ...(user
                ? [
                    String(user.id || '').trim().toLowerCase(),
                    String(user.profileId || '').trim().toLowerCase(),
                    String(user.email || '').trim().toLowerCase(),
                ].filter(Boolean)
                : []),
        ]);
        const record = subscriptions.find((s) => {
            const sUserId = String(s.userId || '').trim().toLowerCase();
            const sEmail = String(s.userEmail || '').trim().toLowerCase();
            if (matchIds.has(sUserId))
                return true;
            if (sEmail && matchIds.has(sEmail))
                return true;
            return false;
        });
        if (!record) {
            return null;
        }
        const now = Date.now();
        const end = new Date(record.endDate || record.renewalDate).getTime();
        const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        return {
            ...record,
            daysRemaining,
            isExpired: now > end && record.status !== 'active',
        };
    }
    updateSubscription(dto) {
        const subscriptions = this.db.getCollection('subscriptions') || [];
        const tier = dto.tier || 'free';
        const tierConfig = TIER_PRICING[tier] || TIER_PRICING.free;
        const userRole = dto.userRole || 'retailer';
        const features = userRole === 'supplier'
            ? tierConfig.supplierFeatures
            : tierConfig.retailerFeatures;
        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const user = this.findMatchingUser(dto.userId);
        const target = String(dto.userId).trim().toLowerCase();
        const matchIds = new Set([
            target,
            ...(user
                ? [
                    String(user.id || '').trim().toLowerCase(),
                    String(user.profileId || '').trim().toLowerCase(),
                    String(user.email || '').trim().toLowerCase(),
                ].filter(Boolean)
                : []),
        ]);
        const existingIndex = subscriptions.findIndex((s) => {
            const sUserId = String(s.userId || '').trim().toLowerCase();
            const sEmail = String(s.userEmail || '').trim().toLowerCase();
            if (matchIds.has(sUserId))
                return true;
            if (sEmail && matchIds.has(sEmail))
                return true;
            return false;
        });
        const paymentId = dto.paymentId ||
            (tier !== 'free'
                ? `PAY-SO-${Math.floor(100000 + Math.random() * 900000)}`
                : undefined);
        const paymentMethod = dto.paymentMethod ||
            (tier === 'free' ? 'None (Free Plan)' : 'UPI AutoPay');
        const primaryUserId = user ? (user.id || user.profileId) : dto.userId;
        const userName = dto.userName || (user ? user.name : (existingIndex >= 0 ? subscriptions[existingIndex].userName : 'User'));
        const userEmail = dto.userEmail || (user ? user.email : (existingIndex >= 0 ? subscriptions[existingIndex].userEmail : ''));
        const record = {
            id: existingIndex >= 0 ? subscriptions[existingIndex].id : `sub-${(0, node_crypto_1.randomUUID)()}`,
            userId: primaryUserId,
            userName: userName,
            userEmail: userEmail,
            userRole: userRole,
            tier: tier,
            tierName: tierConfig.name,
            pricePerMonth: tierConfig.price,
            billingCycle: dto.billingCycle || 'monthly',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            renewalDate: endDate.toISOString(),
            status: 'active',
            autoRenew: true,
            paymentId,
            paymentMethod,
            features,
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
    cancelSubscription(dto) {
        const subscriptions = this.db.getCollection('subscriptions') || [];
        const user = this.findMatchingUser(dto.userId);
        const target = String(dto.userId || '').trim().toLowerCase();
        const matchIds = new Set([
            target,
            ...(user
                ? [
                    String(user.id || '').trim().toLowerCase(),
                    String(user.profileId || '').trim().toLowerCase(),
                    String(user.email || '').trim().toLowerCase(),
                ].filter(Boolean)
                : []),
        ]);
        let existingIndex = subscriptions.findIndex((s) => {
            const sUserId = String(s.userId || '').trim().toLowerCase();
            const sEmail = String(s.userEmail || '').trim().toLowerCase();
            if (matchIds.has(sUserId))
                return true;
            if (sEmail && matchIds.has(sEmail))
                return true;
            return false;
        });
        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (existingIndex === -1) {
            const sub = {
                id: `sub-${(0, node_crypto_1.randomUUID)()}`,
                userId: user ? (user.id || user.profileId) : dto.userId,
                userName: user ? user.name : 'User',
                userEmail: user ? user.email : '',
                userRole: user?.role || 'retailer',
                tier: 'free',
                tierName: 'Starter',
                pricePerMonth: 0,
                billingCycle: 'monthly',
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                renewalDate: endDate.toISOString(),
                status: 'cancelled',
                autoRenew: false,
                cancelledAt: now.toISOString(),
                features: TIER_PRICING.free.retailerFeatures,
                maxStores: 1,
                maxProducts: 50,
            };
            subscriptions.push(sub);
            this.db.saveCollection('subscriptions', subscriptions);
            return {
                ...sub,
                daysRemaining: 30,
                isExpired: false,
            };
        }
        const sub = subscriptions[existingIndex];
        sub.status = 'cancelled';
        sub.autoRenew = false;
        sub.cancelledAt = now.toISOString();
        subscriptions[existingIndex] = sub;
        this.db.saveCollection('subscriptions', subscriptions);
        const end = new Date(sub.endDate || sub.renewalDate).getTime();
        const daysRemaining = Math.max(0, Math.ceil((end - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
            ...sub,
            daysRemaining,
            isExpired: now.getTime() > end,
        };
    }
    getWeeklyOrderUsage(userId, role = 'retailer') {
        const activeSub = this.getActiveSubscription(userId);
        const tier = (activeSub?.tier || 'free').toLowerCase();
        const tierConfig = TIER_PRICING[tier] || TIER_PRICING.free;
        const weeklyLimit = role === 'supplier'
            ? tierConfig.supplierWeeklyOrderLimit
            : tierConfig.retailerWeeklyOrderLimit;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const purchaseOrders = this.db.getCollection('purchaseOrders') || [];
        const user = this.findMatchingUser(userId);
        const matchIds = new Set([
            String(userId || '').trim().toLowerCase(),
            ...(user
                ? [
                    String(user.id || '').trim().toLowerCase(),
                    String(user.profileId || '').trim().toLowerCase(),
                    String(user.email || '').trim().toLowerCase(),
                    ...(user.profile?.retailerCode ? [String(user.profile.retailerCode).trim().toLowerCase()] : []),
                    ...(Array.isArray(user.profile?.stores)
                        ? user.profile.stores.map((st) => String(st.id || st.code || '').trim().toLowerCase())
                        : []),
                ].filter(Boolean)
                : []),
        ]);
        const recentOrders = purchaseOrders.filter((po) => {
            const targetId = role === 'supplier'
                ? String(po.supplierId || '').trim().toLowerCase()
                : String(po.retailerId || '').trim().toLowerCase();
            const isTarget = matchIds.has(targetId);
            const isRecent = (po.createdAt || '') >= sevenDaysAgo;
            return isTarget && isRecent;
        });
        const usedThisWeek = recentOrders.length;
        const isUnlimited = weeklyLimit >= 999999;
        const remainingThisWeek = isUnlimited
            ? 'Unlimited'
            : Math.max(0, weeklyLimit - usedThisWeek);
        const isQuotaReached = !isUnlimited && usedThisWeek >= weeklyLimit;
        const resetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return {
            userId,
            role,
            tier,
            tierName: tierConfig.name,
            weeklyLimit: isUnlimited ? 'Unlimited' : weeklyLimit,
            usedThisWeek,
            remainingThisWeek,
            isUnlimited,
            isQuotaReached,
            resetDate,
            status: activeSub?.status || 'active',
            subscription: activeSub || null,
        };
    }
    validateOrderQuota(retailerId, supplierId) {
        if (retailerId) {
            const retailerUsage = this.getWeeklyOrderUsage(retailerId, 'retailer');
            if (retailerUsage.isQuotaReached) {
                throw new common_1.BadRequestException(`Weekly purchase order quota reached for your ${retailerUsage.tierName} plan (${retailerUsage.usedThisWeek}/${retailerUsage.weeklyLimit} orders used this week). Limit resets weekly. Upgrade to Growth (15 orders/week) or Enterprise (Unlimited) to place more orders.`);
            }
        }
        if (supplierId) {
            const supplierUsage = this.getWeeklyOrderUsage(supplierId, 'supplier');
            if (supplierUsage.isQuotaReached) {
                throw new common_1.BadRequestException(`The selected supplier has reached their weekly order processing capacity (${supplierUsage.usedThisWeek}/${supplierUsage.weeklyLimit} orders on their ${supplierUsage.tierName} plan). Please contact the supplier or try again next week.`);
            }
        }
    }
};
exports.PlatformRevenueService = PlatformRevenueService;
exports.PlatformRevenueService = PlatformRevenueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], PlatformRevenueService);
//# sourceMappingURL=platform-revenue.service.js.map