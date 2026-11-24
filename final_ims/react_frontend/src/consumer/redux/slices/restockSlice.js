/**
 * restockSlice.js - Redux Slice for Consumer Restock Watchlist & Stock Alerts
 * 
 * IN LAYMAN'S TERMS:
 * This slice tracks customer restock notifications:
 * 1. Adding a new alert for low or out-of-stock items (with priority: High/Medium/Low).
 * 2. Deleting an active alert.
 * 3. Persisting the alert watchlist into localStorage (`imsAppStateV1`).
 */

import { createSlice } from '@reduxjs/toolkit';

const getInitialAlerts = () => {
  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    return Array.isArray(state.alerts) ? state.alerts : [];
  } catch {
    return [];
  }
};

const persistAlerts = (alerts) => {
  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    state.alerts = alerts;
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
  } catch {}
};

const restockSlice = createSlice({
  name: 'restock',
  initialState: {
    alerts: getInitialAlerts(),
  },
  reducers: {
    addRestockAlert: (state, action) => {
      const newAlert = action.payload;
      state.alerts.unshift(newAlert);
      persistAlerts(state.alerts);
    },
    removeRestockAlert: (state, action) => {
      const alertId = action.payload;
      state.alerts = state.alerts.filter((a) => a.id !== alertId);
      persistAlerts(state.alerts);
    },
  },
});

export const { addRestockAlert, removeRestockAlert } = restockSlice.actions;

// Selectors
export const selectRestockAlerts = (state) => state.restock.alerts;
export const selectRestockAlertsCount = (state) => state.restock.alerts.length;

export default restockSlice.reducer;
