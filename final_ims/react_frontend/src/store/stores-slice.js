import { createSlice } from '@reduxjs/toolkit';

function getInitialStoreId() {
  try {
    return localStorage.getItem('stockoverflow_active_store_id') || 'all';
  } catch {
    return 'all';
  }
}

const storesSlice = createSlice({
  name: 'stores',
  initialState: {
    stores: [],
    activeStoreId: getInitialStoreId(),
    storeProducts: [],
    storeTransactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchStoresStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displayStores(state, action) {
      state.stores = action.payload;
      state.loading = false;
      state.error = null;
    },
    addStore(state, action) {
      state.stores.unshift(action.payload);
      state.loading = false;
    },
    updateStoreInState(state, action) {
      const updated = action.payload;
      const idx = state.stores.findIndex((s) => s.id === updated.id);
      if (idx !== -1) state.stores[idx] = updated;
      state.loading = false;
    },
    removeStoreFromState(state, action) {
      state.stores = state.stores.filter((s) => s.id !== action.payload);
      state.loading = false;
    },
    setActiveStoreId(state, action) {
      state.activeStoreId = action.payload;
      try {
        localStorage.setItem('stockoverflow_active_store_id', action.payload);
      } catch {}
    },
    displayStoreDetails(state, action) {
      state.storeProducts = action.payload.products || [];
      state.storeTransactions = action.payload.transactions || [];
    },
    storesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const storeActions = storesSlice.actions;

export default storesSlice;

