/**
 * returnsSlice.js - Redux Slice for Consumer RMA & Return Claims
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the customer returns workflow:
 * 1. Fetching order details by orderId to verify items eligible for return.
 * 2. Submitting RMA return claims with return reasons, resolution options (refund/replacement), and photo proofs.
 * 3. Tracking submission status and newly issued RMA claim receipts.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createReturnRequest as createReturnRequestApi,
  fetchTransactionByOrderId as fetchTransactionByOrderIdApi,
  fetchTransactions as fetchTransactionsApi,
} from '../../utils/api_consumer';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const lookupOrderForReturn = createAsyncThunk(
  'returns/lookupOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      let found = await fetchTransactionByOrderIdApi(orderId);
      if (!found) {
        const all = await fetchTransactionsApi();
        found = all.find((o) => o.orderId === orderId) || null;
      }
      if (!found) {
        return rejectWithValue(`Order #${orderId} not found`);
      }
      return found;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to lookup order');
    }
  }
);

export const submitReturnClaim = createAsyncThunk(
  'returns/submitClaim',
  async (returnPayload, { rejectWithValue }) => {
    try {
      const claim = await createReturnRequestApi(returnPayload);
      return claim;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit return claim');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────
const returnsSlice = createSlice({
  name: 'returns',
  initialState: {
    selectedOrder: null,
    submittedReturn: null,
    lookupLoading: false,
    submitLoading: false,
    error: null,
  },
  reducers: {
    clearReturnLookup: (state) => {
      state.selectedOrder = null;
      state.submittedReturn = null;
      state.error = null;
    },
    resetSubmittedReturn: (state) => {
      state.submittedReturn = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lookup
      .addCase(lookupOrderForReturn.pending, (state) => {
        state.lookupLoading = true;
        state.error = null;
      })
      .addCase(lookupOrderForReturn.fulfilled, (state, action) => {
        state.lookupLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(lookupOrderForReturn.rejected, (state, action) => {
        state.lookupLoading = false;
        state.selectedOrder = null;
        state.error = action.payload;
      })

      // Submit claim
      .addCase(submitReturnClaim.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(submitReturnClaim.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submittedReturn = action.payload;
      })
      .addCase(submitReturnClaim.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReturnLookup, resetSubmittedReturn } = returnsSlice.actions;

// Selectors
export const selectReturnSelectedOrder = (state) => state.returns.selectedOrder;
export const selectSubmittedReturn = (state) => state.returns.submittedReturn;
export const selectReturnLookupLoading = (state) => state.returns.lookupLoading;
export const selectReturnSubmitLoading = (state) => state.returns.submitLoading;
export const selectReturnError = (state) => state.returns.error;

export default returnsSlice.reducer;
