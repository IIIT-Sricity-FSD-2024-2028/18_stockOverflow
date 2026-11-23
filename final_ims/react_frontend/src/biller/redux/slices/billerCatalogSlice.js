/**
 * billerCatalogSlice.js - Redux Slice for POS Products, Stores & Customers
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Fetching available store locations scoped to the retailer.
 * 2. Active store selection for the POS cashier terminal.
 * 3. Fetching catalog products and live branch stock.
 * 4. Fetching and registering walk-in and registered customers.
 * 5. Active category and search filters.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billerApi } from '../../api/billerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchBillerStores = createAsyncThunk(
  'billerCatalog/fetchStores',
  async (retailerId = '', { rejectWithValue }) => {
    try {
      const stores = await billerApi.getStores(retailerId);
      return Array.isArray(stores) ? stores : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch stores');
    }
  }
);

export const fetchBillerProducts = createAsyncThunk(
  'billerCatalog/fetchProducts',
  async ({ storeId = '', retailerId = '' }, { rejectWithValue }) => {
    try {
      const products = await billerApi.getProducts(storeId, retailerId);
      return Array.isArray(products) ? products : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  }
);

export const fetchBillerCustomers = createAsyncThunk(
  'billerCatalog/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const customers = await billerApi.getCustomers();
      return Array.isArray(customers) ? customers : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch customers');
    }
  }
);

export const createBillerCustomer = createAsyncThunk(
  'billerCatalog/createCustomer',
  async (customerData, { rejectWithValue, dispatch }) => {
    try {
      const created = await billerApi.createCustomer(customerData);
      dispatch(fetchBillerCustomers());
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create customer');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const billerCatalogSlice = createSlice({
  name: 'billerCatalog',
  initialState: {
    stores: [],
    currentStoreId: '',
    currentStoreName: 'Retail Store',
    products: [],
    customers: ['Walk-in Customer'],
    selectedCustomer: 'Walk-in Customer',
    activeCategory: 'all',
    searchQuery: '',
    sortOrder: 'default',
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentStore: (state, action) => {
      const { id, name } = action.payload;
      state.currentStoreId = id || '';
      if (name) state.currentStoreName = name;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload || 'Walk-in Customer';
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload || 'all';
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload || '';
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload || 'default';
    },
  },
  extraReducers: (builder) => {
    builder
      // Stores
      .addCase(fetchBillerStores.fulfilled, (state, action) => {
        state.stores = action.payload;
      })
      // Products
      .addCase(fetchBillerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchBillerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Customers
      .addCase(fetchBillerCustomers.fulfilled, (state, action) => {
        const names = ['Walk-in Customer'].concat(
          action.payload
            .map((c) => c.name)
            .filter((n) => n && n.toLowerCase() !== 'walk-in customer')
        );
        state.customers = Array.from(new Set(names));
      });
  },
});

export const {
  setCurrentStore,
  setSelectedCustomer,
  setActiveCategory,
  setSearchQuery,
  setSortOrder,
} = billerCatalogSlice.actions;

// Selectors
export const selectBillerStores = (state) => state.billerCatalog.stores;
export const selectBillerCurrentStoreId = (state) => state.billerCatalog.currentStoreId;
export const selectBillerCurrentStoreName = (state) => state.billerCatalog.currentStoreName;
export const selectBillerProducts = (state) => state.billerCatalog.products;
export const selectBillerCustomers = (state) => state.billerCatalog.customers;
export const selectBillerSelectedCustomer = (state) => state.billerCatalog.selectedCustomer;
export const selectBillerActiveCategory = (state) => state.billerCatalog.activeCategory;
export const selectBillerSearchQuery = (state) => state.billerCatalog.searchQuery;
export const selectBillerSortOrder = (state) => state.billerCatalog.sortOrder;
export const selectBillerCatalogLoading = (state) => state.billerCatalog.loading;
export const selectBillerCatalogError = (state) => state.billerCatalog.error;

export default billerCatalogSlice.reducer;
