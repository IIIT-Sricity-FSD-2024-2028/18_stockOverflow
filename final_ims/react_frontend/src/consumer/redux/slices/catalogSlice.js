/**
 * catalogSlice.js - Redux Slice for Products Catalog & Physical Store Locations
 * 
 * IN LAYMAN'S TERMS:
 * This slice holds the list of available inventory products and pickup stores.
 * It manages:
 * 1. Async fetching of products from the dedicated customer API with offline fallback.
 * 2. Async fetching of physical store locations.
 * 3. Selecting a target store branch (persisted in localStorage).
 * 4. Tracking loading and error states for catalog queries.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts as fetchProductsApi, fetchStores as fetchStoresApi } from '../../utils/api_consumer';
import { MOCK_PRODUCTS, MOCK_STORES } from '../../data/mockProducts_consumer';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialProducts = (() => {
  try {
    const local = localStorage.getItem('so_inventory') || localStorage.getItem('imsRetailerProductsV1');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return MOCK_PRODUCTS;
})();

const initialStoreId = (() => {
  try {
    return localStorage.getItem('imsSelectedStoreId') || '';
  } catch {
    return '';
  }
})();

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Fetch products for a specific store branch (or global).
 */
export const fetchCatalogProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (storeId = '', { rejectWithValue }) => {
    try {
      const data = await fetchProductsApi(storeId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch catalog products');
    }
  }
);

/**
 * Fetch store fulfillment branches.
 */
export const fetchStoreLocations = createAsyncThunk(
  'catalog/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchStoresApi();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stores');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────
const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    products: initialProducts,
    stores: MOCK_STORES,
    selectedStoreId: initialStoreId,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedStore: (state, action) => {
      const storePayload = action.payload;
      const matched =
        typeof storePayload === 'object' && storePayload !== null
          ? storePayload
          : state.stores.find(
              (s) => s.name === storePayload || String(s.id) === String(storePayload)
            );

      const nextStoreId = matched?.id || (typeof storePayload === 'string' ? storePayload : '');
      state.selectedStoreId = nextStoreId;
      try {
        localStorage.setItem('imsSelectedStoreId', nextStoreId);
      } catch {}
    },
    setLocalProducts: (state, action) => {
      state.products = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Products
    builder
      .addCase(fetchCatalogProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.products = action.payload;
        }
      })
      .addCase(fetchCatalogProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load catalog';
      });

    // Stores
    builder
      .addCase(fetchStoreLocations.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.stores = action.payload;
        }
      });
  },
});

export const { setSelectedStore, setLocalProducts } = catalogSlice.actions;

// Selectors
export const selectProducts = (state) => state.catalog.products;
export const selectStores = (state) => state.catalog.stores;
export const selectSelectedStoreId = (state) => state.catalog.selectedStoreId;
export const selectCatalogLoading = (state) => state.catalog.loading;
export const selectCatalogError = (state) => state.catalog.error;
export const selectSelectedStoreName = (state) => {
  const store = state.catalog.stores.find(
    (s) => String(s.id) === String(state.catalog.selectedStoreId)
  );
  return store?.name || 'Downtown Store';
};

export default catalogSlice.reducer;
