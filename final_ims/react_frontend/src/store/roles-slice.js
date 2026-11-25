import { createSlice } from '@reduxjs/toolkit';

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchRolesStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayRoles(state, action) {
      state.roles = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRole(state, action) {
      state.roles.push(action.payload);
      state.loading = false;
    },
    updateRoleInState(state, action) {
      const updated = action.payload;
      const idx = state.roles.findIndex((r) => r.id === updated.id);
      if (idx !== -1) state.roles[idx] = updated;
      state.loading = false;
    },
    removeRoleFromState(state, action) {
      state.roles = state.roles.filter((r) => r.id !== action.payload);
      state.loading = false;
    },
    rolesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const roleActions = rolesSlice.actions;

export default rolesSlice;

