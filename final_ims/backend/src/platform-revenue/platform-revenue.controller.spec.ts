import { Test, TestingModule } from '@nestjs/testing';
import { PlatformRevenueController } from './platform-revenue.controller';
import { PlatformRevenueService } from './platform-revenue.service';
import { JsonDbService } from '../common/json-db.service';

describe('PlatformRevenueController', () => {
  let controller: PlatformRevenueController;
  let service: PlatformRevenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformRevenueController],
      providers: [
        PlatformRevenueService,
        {
          provide: JsonDbService,
          useValue: {
            getCollection: jest.fn((key: string) => {
              if (key === 'transactions') {
                return [
                  {
                    orderId: 'ORD-101',
                    retailerId: 'ret-1',
                    storeId: 's1',
                    store: 'Downtown Store',
                    customer: 'Alice',
                    finalTotal: 1000,
                    platformFee: 20,
                    netRetailerAmount: 980,
                    timestamp: new Date().toISOString(),
                  },
                ];
              }
              if (key === 'platformCommissions') {
                return [
                  {
                    id: 'comm-1',
                    orderId: 'ORD-101',
                    retailerId: 'ret-1',
                    storeId: 's1',
                    storeName: 'Downtown Store',
                    customerName: 'Alice',
                    orderTotal: 1000,
                    commissionRate: 0.02,
                    commissionAmount: 20,
                    netRetailerAmount: 980,
                    currency: 'INR',
                    timestamp: new Date().toISOString(),
                    status: 'settled',
                  },
                ];
              }
              if (key === 'subscriptions') {
                return [
                  {
                    id: 'sub-1',
                    userId: 'user-1',
                    userName: 'John Retailer',
                    userEmail: 'john@gmail.com',
                    userRole: 'retailer',
                    tier: 'pro',
                    pricePerMonth: 799,
                    billingCycle: 'monthly',
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    renewalDate: new Date().toISOString(),
                    status: 'active',
                    autoRenew: true,
                    features: [],
                  },
                ];
              }
              return [];
            }),
            saveCollection: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlatformRevenueController>(PlatformRevenueController);
    service = module.get<PlatformRevenueService>(PlatformRevenueService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return revenue summary with 2% platform commission and subscription data', () => {
    const summary = controller.getSummary();
    expect(summary).toBeDefined();
    expect(summary.commissionRate).toBe(0.02);
    expect(summary.totalGrossVolume).toBe(1000);
    expect(summary.totalCommissionEarned).toBe(20);
    expect(summary.totalSubscriptionRevenue).toBe(799);
    expect(summary.totalPlatformRevenue).toBe(819);
    expect(summary.netRetailerPayout).toBe(980);
  });

  it('should return available pricing tiers', () => {
    const tiers = controller.getPricingTiers();
    expect(tiers.length).toBe(3);
    expect(tiers.map((t) => t.tier)).toEqual(['free', 'pro', 'enterprise']);
  });

  it('should return platform commissions list', () => {
    const comms = controller.getCommissions();
    expect(comms.length).toBe(1);
    expect(comms[0].commissionAmount).toBe(20);
  });
});
