import { createSlice } from '@reduxjs/toolkit';

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: {
    summary: null,
    commissions: [],
    subscriptions: [],
    tiers: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchRevenueStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayRevenueData(state, action) {
      state.summary = action.payload.summary ?? state.summary;
      state.commissions = action.payload.commissions ?? state.commissions;
      state.subscriptions = action.payload.subscriptions ?? state.subscriptions;
      state.tiers = action.payload.tiers ?? state.tiers;
      state.loading = false;
      state.error = null;
    },
    revenueFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const revenueActions = revenueSlice.actions;

export default revenueSlice;

