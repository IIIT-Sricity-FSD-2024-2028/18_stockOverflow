import { createSlice } from '@reduxjs/toolkit';

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchAssignmentsStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayAssignments(state, action) {
      state.assignments = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateAssignmentInState(state, action) {
      const updated = action.payload;
      const idx = state.assignments.findIndex((a) => a.id === updated.id);
      if (idx !== -1) state.assignments[idx] = updated;
      state.loading = false;
    },
    assignmentsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const assignmentActions = assignmentsSlice.actions;

export default assignmentsSlice;

