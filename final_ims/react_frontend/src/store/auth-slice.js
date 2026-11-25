import { createSlice } from '@reduxjs/toolkit';

// Helper to restore session only on in-tab browser refresh (same behavior as before)
function getInitialUser() {
  try {
    const navEntries =
      typeof performance !== 'undefined' && performance.getEntriesByType
        ? performance.getEntriesByType('navigation')
        : [];
    const isReload =
      (navEntries.length > 0 && navEntries[0].type === 'reload') ||
      (typeof performance !== 'undefined' &&
        performance.navigation &&
        performance.navigation.type === 1);

    if (!isReload) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('so_session');
        sessionStorage.removeItem('so_token');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('so_session');
        localStorage.removeItem('so_token');
      }
      return null;
    }

    const saved =
      (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('so_session') : null) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('so_session') : null);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (!parsed || !parsed.id || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

const initialUser = getInitialUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    isLoggedIn: Boolean(initialUser),
    retailers: [],
    loading: false,
    error: null,
  },
  reducers: {
    authRequestStarted(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;
    },
    authFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setRetailers(state, action) {
      state.retailers = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice;

