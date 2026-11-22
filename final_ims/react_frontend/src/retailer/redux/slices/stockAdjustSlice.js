/**
 * stockAdjustSlice.js - Redux Slice for Physical Stock Adjustments & Recount Audits
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages manual inventory recounts and discrepancy adjustments:
 * 1. Fetching the historical log of stock adjustments across warehouses and stores.
 * 2. Creating adjustment tickets for shrinkage, breakage, recount bonuses, or returns.
 * 3. Deleting past adjustment records.
 * 4. Maintaining the inventory audit trail with before/after quantities and staff reasons.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchStockAdjustments = createAsyncThunk(
  'retailerStockAdjust/fetchStockAdjustments',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getStockAdjustments(retailerId, storeId);
      const list = Array.isArray(data) ? data : [];
      return list.map((a) => ({
        id: a.id,
        date: a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'),
        product: a.productName || a.product || a.productSku || 'Product Item',
        productId: a.productId || '',
        sku: a.sku || a.productSku || 'SKU-001',
        warehouse: a.warehouse || a.store || "Main Store",
        type: a.type || a.adjustType || 'add',
        qty: Math.abs(Number(a.qty != null ? a.qty : a.quantity) || 1),
        reason: a.reason || 'Recount',
        user: a.user || a.adjustedBy || 'Retailer Admin',
        status: a.status || 'Completed',
        notes: a.notes || '',
        currentStock: Number(a.currentStock != null ? a.currentStock : a.qtyAfter) || 0,
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stock adjustments');
    }
  }
);

export const createStockAdjustment = createAsyncThunk(
  'retailerStockAdjust/createStockAdjustment',
  async (adjustmentData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createStockAdjustment(adjustmentData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create stock adjustment');
    }
  }
);

export const deleteStockAdjustment = createAsyncThunk(
  'retailerStockAdjust/deleteStockAdjustment',
  async (id, { rejectWithValue }) => {
    try {
      await retailerApi.deleteStockAdjustment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete stock adjustment');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const stockAdjustSlice = createSlice({
  name: 'stockAdjust',
  initialState: {
    items: [],
    selectedAdjustment: null,
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedAdjustment: (state, action) => {
      state.selectedAdjustment = action.payload;
    },
    clearSelectedAdjustment: (state) => {
      state.selectedAdjustment = null;
    },
    clearStockAdjustError: (state) => {
      state.error = null;
    },
    clearStockAdjustMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchStockAdjustments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockAdjustments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStockAdjustments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createStockAdjustment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createStockAdjustment.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = 'Stock adjustment recorded successfully';
      })
      .addCase(createStockAdjustment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStockAdjustment.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
        state.message = 'Adjustment ticket deleted';
      });
  },
});

export const {
  setSelectedAdjustment,
  clearSelectedAdjustment,
  clearStockAdjustError,
  clearStockAdjustMessage,
} = stockAdjustSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectStockAdjustments = (state) => state.stockAdjust.items;
export const selectSelectedAdjustment = (state) => state.stockAdjust.selectedAdjustment;
export const selectStockAdjustLoading = (state) => state.stockAdjust.loading;
export const selectStockAdjustSubmitting = (state) => state.stockAdjust.submitting;
export const selectStockAdjustError = (state) => state.stockAdjust.error;
export const selectStockAdjustMessage = (state) => state.stockAdjust.message;

export default stockAdjustSlice.reducer;
