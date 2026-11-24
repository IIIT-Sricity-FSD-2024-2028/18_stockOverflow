import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchUsersStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayUsers(state, action) {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    addUser(state, action) {
      state.users.unshift(action.payload);
      state.loading = false;
    },
    updateUserInState(state, action) {
      const updated = action.payload;
      const idx = state.users.findIndex((u) => u.id === updated.id);
      if (idx !== -1) state.users[idx] = updated;
      state.loading = false;
    },
    removeUserFromState(state, action) {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.loading = false;
    },
    usersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const userActions = usersSlice.actions;

export default usersSlice;

