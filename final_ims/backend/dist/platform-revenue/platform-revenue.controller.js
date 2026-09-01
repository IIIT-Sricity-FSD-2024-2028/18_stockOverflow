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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRevenueController = void 0;
const common_1 = require("@nestjs/common");
const platform_revenue_dto_1 = require("./dto/platform-revenue.dto");
const platform_revenue_service_1 = require("./platform-revenue.service");
let PlatformRevenueController = class PlatformRevenueController {
    constructor(platformRevenueService) {
        this.platformRevenueService = platformRevenueService;
    }
    getSummary(retailerId) {
        return this.platformRevenueService.getRevenueSummary(retailerId);
    }
    getCommissions(retailerId, limit) {
        return this.platformRevenueService.getCommissions(retailerId, limit ? Number(limit) : 50);
    }
    getActiveSubscription(userId) {
        return this.platformRevenueService.getActiveSubscription(userId);
    }
    getSubscriptions(userId) {
        return this.platformRevenueService.getSubscriptions(userId);
    }
    updateSubscription(dto) {
        return this.platformRevenueService.updateSubscription(dto);
    }
    cancelSubscription(dto) {
        return this.platformRevenueService.cancelSubscription(dto);
    }
    getPricingTiers(role) {
        return this.platformRevenueService.getPricingTiers(role);
    }
    getWeeklyOrderUsage(userId, role) {
        return this.platformRevenueService.getWeeklyOrderUsage(userId, role || 'retailer');
    }
};
exports.PlatformRevenueController = PlatformRevenueController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('retailerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('commissions'),
    __param(0, (0, common_1.Query)('retailerId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getCommissions", null);
__decorate([
    (0, common_1.Get)('subscriptions/active'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getActiveSubscription", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Post)('subscriptions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [platform_revenue_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/cancel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [platform_revenue_dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('tiers'),
    __param(0, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getPricingTiers", null);
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformRevenueController.prototype, "getWeeklyOrderUsage", null);
exports.PlatformRevenueController = PlatformRevenueController = __decorate([
    (0, common_1.Controller)('platform-revenue'),
    __metadata("design:paramtypes", [platform_revenue_service_1.PlatformRevenueService])
], PlatformRevenueController);
//# sourceMappingURL=platform-revenue.controller.js.map