/**
 * storesSlice.js - Redux Slice for Multi-Store Management & Location Analytics
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the retailer's physical and digital branches:
 * 1. Fetching all physical store locations assigned to the retailer.
 * 2. Selecting the active store location for POS transactions and catalog views.
 * 3. Loading individual store performance analytics for the details drawer
 *    (net profit, inventory valuation, units, PO count, sales count).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';
import { request } from '../../api/client';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchStores = createAsyncThunk(
  'retailerStores/fetchStores',
  async (retailerId = '', { rejectWithValue }) => {
    try {
      const data = await retailerApi.getStores(retailerId);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stores');
    }
  }
);

export const fetchStoreDrawerAnalytics = createAsyncThunk(
  'retailerStores/fetchStoreDrawerAnalytics',
  async ({ store, retailerId = '' }, { rejectWithValue }) => {
    try {
      const storeCode = store.code || store.id || '';
      const scopedQuery = retailerId
        ? `?retailerId=${encodeURIComponent(retailerId)}&storeId=${encodeURIComponent(storeCode)}`
        : `?storeId=${encodeURIComponent(storeCode)}`;

      const [txList, poList, prodList] = await Promise.all([
        request(`/transactions${scopedQuery}`).catch(() => []),
        request(`/purchase-orders${scopedQuery}`).catch(() => []),
        request(`/products${scopedQuery}`).catch(() => []),
      ]);

      const transactions = Array.isArray(txList) ? txList : [];
      const purchaseOrders = Array.isArray(poList) ? poList : [];
      const products = Array.isArray(prodList) ? prodList : [];

      const netSales = transactions.reduce((acc, t) => acc + (Number(t.finalTotal || t.total) || 0), 0);
      const netPurchase = purchaseOrders.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
      const netProfit = netSales - netPurchase;
      const totalUnits = products.reduce((acc, p) => acc + (Number(p.qty != null ? p.qty : p.initialQty) || 0), 0);
      const invValue = products.reduce((acc, p) => {
        const q = Number(p.qty != null ? p.qty : p.initialQty) || 0;
        const pr = Number(p.price || p.unitPrice) || 0;
        return acc + q * pr;
      }, 0);

      const alerts = products
        .filter((p) => {
          const q = Number(p.qty != null ? p.qty : p.initialQty) || 0;
          const min = Number(p.min || p.minThreshold) || 10;
          return q <= min;
        })
        .map((p) => ({
          name: p.name || 'Product',
          sku: p.sku || 'SKU',
          qty: Number(p.qty != null ? p.qty : p.initialQty) || 0,
        }));

      return {
        store,
        stats: {
          netProfit,
          netSales,
          netPurchase,
          invValue,
          totalUnits,
          totalSalesCount: transactions.length,
          totalPoCount: purchaseOrders.length,
          products,
          alerts,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch store drawer analytics');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const storesSlice = createSlice({
  name: 'stores',
  initialState: {
    items: [],
    currentStoreId: '',
    drawerStore: null,
    drawerStats: {
      netProfit: 0,
      netSales: 0,
      netPurchase: 0,
      invValue: 0,
      totalUnits: 0,
      totalSalesCount: 0,
      totalPoCount: 0,
      products: [],
      alerts: [],
    },
    loading: false,
    drawerLoading: false,
    error: null,
  },
  reducers: {
    setCurrentStoreId: (state, action) => {
      state.currentStoreId = action.payload;
    },
    setDrawerStore: (state, action) => {
      state.drawerStore = action.payload;
    },
    closeStoreDrawer: (state) => {
      state.drawerStore = null;
    },
    clearStoresError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Store Drawer Analytics
      .addCase(fetchStoreDrawerAnalytics.pending, (state) => {
        state.drawerLoading = true;
      })
      .addCase(fetchStoreDrawerAnalytics.fulfilled, (state, action) => {
        state.drawerLoading = false;
        state.drawerStore = action.payload.store;
        state.drawerStats = action.payload.stats;
      })
      .addCase(fetchStoreDrawerAnalytics.rejected, (state) => {
        state.drawerLoading = false;
      });
  },
});

export const {
  setCurrentStoreId,
  setDrawerStore,
  closeStoreDrawer,
  clearStoresError,
} = storesSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectStores = (state) => state.stores.items;
export const selectCurrentStoreId = (state) => state.stores.currentStoreId;
export const selectStoresLoading = (state) => state.stores.loading;
export const selectStoresError = (state) => state.stores.error;
export const selectDrawerStore = (state) => state.stores.drawerStore;
export const selectDrawerStats = (state) => state.stores.drawerStats;
export const selectDrawerLoading = (state) => state.stores.drawerLoading;

export default storesSlice.reducer;
