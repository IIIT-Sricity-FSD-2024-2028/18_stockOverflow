import { createSlice } from '@reduxjs/toolkit';

function getInitialDuty() {
  try {
    const saved = localStorage.getItem('stockoverflow_emp_duty');
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
}

const employeeStatsSlice = createSlice({
  name: 'employeeStats',
  initialState: {
    stats: null,
    isOnDuty: getInitialDuty(),
    loading: false,
    error: null,
  },
  reducers: {
    fetchStatsStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayEmployeeStats(state, action) {
      state.stats = action.payload;
      state.loading = false;
    },
    toggleOnDuty(state) {
      state.isOnDuty = !state.isOnDuty;
      try {
        localStorage.setItem('stockoverflow_emp_duty', JSON.stringify(state.isOnDuty));
      } catch {}
    },
    statsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const employeeStatsActions = employeeStatsSlice.actions;

export default employeeStatsSlice;

