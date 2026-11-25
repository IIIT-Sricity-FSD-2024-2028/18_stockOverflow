import { revenueActions } from './revenue-slice';
import {
  fetchPlatformRevenueSummary,
  fetchPlatformCommissions,
  fetchPlatformSubscriptions,
  fetchPricingTiers,
} from '../admin/utils/api_admin';

export const fetchPlatformRevenueData = () => {
  return async (dispatch) => {
    dispatch(revenueActions.fetchRevenueStarted());
    try {
      const [summary, commissions, subscriptions, tiers] = await Promise.all([
        fetchPlatformRevenueSummary().catch(() => null),
        fetchPlatformCommissions().catch(() => []),
        fetchPlatformSubscriptions().catch(() => []),
        fetchPricingTiers('retailer').catch(() => []),
      ]);

      dispatch(
        revenueActions.displayRevenueData({
          summary,
          commissions: Array.isArray(commissions) ? commissions : [],
          subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
          tiers: Array.isArray(tiers) ? tiers : [],
        })
      );
    } catch (err) {
      dispatch(revenueActions.revenueFailed(err.message || 'Failed to load revenue data'));
    }
  };
};

