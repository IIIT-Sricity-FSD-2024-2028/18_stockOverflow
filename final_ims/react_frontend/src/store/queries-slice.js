import { createSlice } from '@reduxjs/toolkit';

const queriesSlice = createSlice({
  name: 'queries',
  initialState: {
    queries: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchQueriesStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayQueries(state, action) {
      state.queries = action.payload;
      state.loading = false;
      state.error = null;
    },
    addQuery(state, action) {
      state.queries.unshift(action.payload);
      state.loading = false;
    },
    updateQueryInState(state, action) {
      const updated = action.payload;
      const idx = state.queries.findIndex((q) => q.id === updated.id);
      if (idx !== -1) state.queries[idx] = updated;
      state.loading = false;
    },
    queriesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const queryActions = queriesSlice.actions;

export default queriesSlice;

