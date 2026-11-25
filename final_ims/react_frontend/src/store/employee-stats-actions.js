import { employeeStatsActions } from './employee-stats-slice';
import { fetchEmployeeStats } from '../employee/utils/api_employee';

export const fetchEmployeeStatsData = () => {
  return async (dispatch) => {
    dispatch(employeeStatsActions.fetchStatsStarted());
    try {
      const data = await fetchEmployeeStats();
      dispatch(employeeStatsActions.displayEmployeeStats(data));
    } catch (err) {
      dispatch(employeeStatsActions.statsFailed(err.message || 'Failed to load stats'));
    }
  };
};

