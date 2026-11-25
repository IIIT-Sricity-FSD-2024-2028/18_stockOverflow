import { adminReportsActions } from './admin-reports-slice';
import {
  fetchAdminDashboardStats,
  fetchReportsSummary,
} from '../admin/utils/api_admin';

export const fetchDashboardStatsData = () => {
  return async (dispatch) => {
    dispatch(adminReportsActions.fetchStarted());
    try {
      const data = await fetchAdminDashboardStats();
      dispatch(adminReportsActions.displayDashboardStats(data));
    } catch (err) {
      dispatch(adminReportsActions.reportsFailed(err.message || 'Failed to load dashboard stats'));
    }
  };
};

export const fetchReportsSummaryData = () => {
  return async (dispatch) => {
    dispatch(adminReportsActions.fetchStarted());
    try {
      const data = await fetchReportsSummary();
      dispatch(adminReportsActions.displayReportsSummary(data));
    } catch (err) {
      dispatch(adminReportsActions.reportsFailed(err.message || 'Failed to load reports summary'));
    }
  };
};

