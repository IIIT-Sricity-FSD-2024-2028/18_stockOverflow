import { createSlice } from '@reduxjs/toolkit';

const adminReportsSlice = createSlice({
  name: 'adminReports',
  initialState: {
    dashboardStats: null,
    reportsSummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayDashboardStats(state, action) {
      state.dashboardStats = action.payload;
      state.loading = false;
    },
    displayReportsSummary(state, action) {
      state.reportsSummary = action.payload;
      state.loading = false;
    },
    reportsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const adminReportsActions = adminReportsSlice.actions;

export default adminReportsSlice;

