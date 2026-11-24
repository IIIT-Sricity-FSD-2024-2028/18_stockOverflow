import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth-slice';
import usersSlice from './users-slice';
import rolesSlice from './roles-slice';
import storesSlice from './stores-slice';
import settingsSlice from './settings-slice';
import adminReportsSlice from './admin-reports-slice';
import revenueSlice from './revenue-slice';
import assignmentsSlice from './assignments-slice';
import queriesSlice from './queries-slice';
import employeeStatsSlice from './employee-stats-slice';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    roles: rolesSlice.reducer,
    stores: storesSlice.reducer,
    settings: settingsSlice.reducer,
    adminReports: adminReportsSlice.reducer,
    revenue: revenueSlice.reducer,
    assignments: assignmentsSlice.reducer,
    queries: queriesSlice.reducer,
    employeeStats: employeeStatsSlice.reducer,
  },
});

export default store;

