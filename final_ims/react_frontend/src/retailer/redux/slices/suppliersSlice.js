/**
 * suppliersSlice.js - Redux Slice for Wholesale Suppliers & Logistics Partners
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages supplier partner accounts:
 * 1. Fetching verified suppliers list with category, email, payment terms, and ratings.
 * 2. Creating new supplier accounts.
 * 3. Selecting a supplier for detailed performance scorecard (on-time delivery %, spend stats).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchSuppliers = createAsyncThunk(
  'retailerSuppliers/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getSuppliers();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'retailerSuppliers/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createSupplier(supplierData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create supplier');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    items: [],
    selectedSupplier: null,
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedSupplier: (state, action) => {
      state.selectedSupplier = action.payload;
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
    clearSupplierError: (state) => {
      state.error = null;
    },
    clearSupplierMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = 'Supplier created successfully';
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedSupplier,
  clearSelectedSupplier,
  clearSupplierError,
  clearSupplierMessage,
} = suppliersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSuppliers = (state) => state.suppliers.items;
export const selectSelectedSupplier = (state) => state.suppliers.selectedSupplier;
export const selectSuppliersLoading = (state) => state.suppliers.loading;
export const selectSuppliersSubmitting = (state) => state.suppliers.submitting;
export const selectSuppliersError = (state) => state.suppliers.error;
export const selectSuppliersMessage = (state) => state.suppliers.message;

export default suppliersSlice.reducer;
