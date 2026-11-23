/**
 * billerTransactionsSlice.js - Redux Slice for POS Checkout & Transaction History
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Submitting POS checkout transactions and generating official sales receipts.
 * 2. Fetching historical POS transactions for the store branch.
 * 3. Opening, viewing, and printing completed sale receipts.
 * 4. Filtering and searching past cashier transactions.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billerApi } from '../../api/billerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchBillerTransactions = createAsyncThunk(
  'billerTransactions/fetchTransactions',
  async ({ storeId = '', retailerId = '' }, { rejectWithValue }) => {
    try {
      const data = await billerApi.getTransactions(storeId, retailerId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch transactions');
    }
  }
);

export const createBillerTransaction = createAsyncThunk(
  'billerTransactions/createTransaction',
  async (txPayload, { rejectWithValue }) => {
    try {
      const res = await billerApi.createTransaction(txPayload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create transaction');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const billerTransactionsSlice = createSlice({
  name: 'billerTransactions',
  initialState: {
    transactions: [],
    completedTx: null,
    isReceiptOpen: false,
    isCharging: false,
    loading: false,
    error: null,
  },
  reducers: {
    setCompletedTx: (state, action) => {
      state.completedTx = action.payload;
    },
    setIsReceiptOpen: (state, action) => {
      state.isReceiptOpen = Boolean(action.payload);
    },
    closeReceiptModal: (state) => {
      state.isReceiptOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBillerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchBillerTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Transaction
      .addCase(createBillerTransaction.pending, (state) => {
        state.isCharging = true;
        state.error = null;
      })
      .addCase(createBillerTransaction.fulfilled, (state, action) => {
        state.isCharging = false;
        state.completedTx = action.payload;
        state.isReceiptOpen = true;
        state.transactions.unshift(action.payload);
      })
      .addCase(createBillerTransaction.rejected, (state, action) => {
        state.isCharging = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCompletedTx,
  setIsReceiptOpen,
  closeReceiptModal,
} = billerTransactionsSlice.actions;

// Selectors
export const selectBillerTransactions = (state) => state.billerTransactions.transactions;
export const selectBillerCompletedTx = (state) => state.billerTransactions.completedTx;
export const selectBillerIsReceiptOpen = (state) => state.billerTransactions.isReceiptOpen;
export const selectBillerIsCharging = (state) => state.billerTransactions.isCharging;
export const selectBillerTransactionsLoading = (state) => state.billerTransactions.loading;
export const selectBillerTransactionsError = (state) => state.billerTransactions.error;

export default billerTransactionsSlice.reducer;
