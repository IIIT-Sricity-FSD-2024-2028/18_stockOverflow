/**
 * returnsSlice.js - Redux Slice for Purchase Returns, RMA & Warranty Exchanges
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages customer return requests, RMA tracking, and refunds:
 * 1. Fetching all return claims for the retailer.
 * 2. Processing return approvals, rejections, refund disbursements, and item restocks.
 * 3. Creating manual in-store return slips.
 * 4. Tracking RMA inspection status and refund settlement methods.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchReturns = createAsyncThunk(
  'retailerReturns/fetchReturns',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getReturns(retailerId, storeId);
      const list = Array.isArray(data) ? data : [];
      return list.map((r) => ({
        id: r.id,
        orderId: r.orderId || 'ORD-2026-001',
        party: r.customer || r.party || r.supplier || 'Customer',
        email: r.email || 'customer@example.com',
        productName: r.productName || r.product || 'Purchased Item',
        sku: r.sku || 'SKU-ITEM',
        qty: Number(r.qty) || 1,
        amount: Number(r.refundAmount || r.amount) || 1500,
        reason: r.reason || 'Damaged Goods',
        method: r.refundMethod || r.method || 'Store Credit',
        status: r.status || 'Pending',
        date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'),
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch returns');
    }
  }
);

export const createReturn = createAsyncThunk(
  'retailerReturns/createReturn',
  async (returnData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createReturn(returnData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create return claim');
    }
  }
);

export const updateReturn = createAsyncThunk(
  'retailerReturns/updateReturn',
  async ({ id, returnData }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.updateReturn(id, returnData);
      return { id, result, returnData };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update return');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const returnsSlice = createSlice({
  name: 'returns',
  initialState: {
    items: [],
    selectedReturn: null,
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedReturn: (state, action) => {
      state.selectedReturn = action.payload;
    },
    clearSelectedReturn: (state) => {
      state.selectedReturn = null;
    },
    clearReturnError: (state) => {
      state.error = null;
    },
    clearReturnMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Returns
      .addCase(fetchReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        if (!state.selectedReturn && action.payload.length > 0) {
          state.selectedReturn = action.payload[0];
        }
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Return
      .addCase(createReturn.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
          state.selectedReturn = action.payload;
        }
        state.message = 'Return claim created successfully';
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update Return
      .addCase(updateReturn.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateReturn.fulfilled, (state, action) => {
        state.submitting = false;
        const { id, returnData } = action.payload;
        const idx = state.items.findIndex((r) => r.id === id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...returnData };
        }
        if (state.selectedReturn?.id === id) {
          state.selectedReturn = { ...state.selectedReturn, ...returnData };
        }
        state.message = 'Return status updated successfully';
      })
      .addCase(updateReturn.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedReturn,
  clearSelectedReturn,
  clearReturnError,
  clearReturnMessage,
} = returnsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectReturns = (state) => state.returns.items;
export const selectSelectedReturn = (state) => state.returns.selectedReturn;
export const selectReturnsLoading = (state) => state.returns.loading;
export const selectReturnsSubmitting = (state) => state.returns.submitting;
export const selectReturnsError = (state) => state.returns.error;
export const selectReturnsMessage = (state) => state.returns.message;

export default returnsSlice.reducer;
