/**
 * ordersSlice.js - Redux Slice for Customer Order History & In-Store Holds
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Fetching verified purchased products and past orders.
 * 2. Fetching active/pending in-store reservation requests.
 * 3. Submitting direct transactions and reservation requests during checkout.
 * 4. Tracking order queries, search filtering, and active hold status.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchPurchasedProducts as fetchPurchasedProductsApi,
  fetchReservationRequests as fetchReservationRequestsApi,
  createTransaction as createTransactionApi,
  createReservationRequest as createReservationRequestApi,
  fetchTransactionByOrderId as fetchTransactionByOrderIdApi,
} from '../../utils/api_consumer';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCustomerOrders = createAsyncThunk(
  'orders/fetchCustomerOrders',
  async (customer = '', { rejectWithValue }) => {
    try {
      const [purchased, pending] = await Promise.all([
        fetchPurchasedProductsApi(customer),
        fetchReservationRequestsApi('pending', customer),
      ]);
      return { purchased, pending };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customer orders');
    }
  }
);

export const submitOrderTransaction = createAsyncThunk(
  'orders/submitTransaction',
  async (transactionPayload, { rejectWithValue }) => {
    try {
      const result = await createTransactionApi(transactionPayload);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit order transaction');
    }
  }
);

export const submitReservationHold = createAsyncThunk(
  'orders/submitReservationHold',
  async (reservationPayload, { rejectWithValue }) => {
    try {
      const result = await createReservationRequestApi(reservationPayload);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit reservation hold');
    }
  }
);

export const fetchOrderReceipt = createAsyncThunk(
  'orders/fetchOrderReceipt',
  async (orderId, { rejectWithValue }) => {
    try {
      const receipt = await fetchTransactionByOrderIdApi(orderId);
      return receipt;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch receipt');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    purchasedProducts: [],
    pendingReservations: [],
    currentReceipt: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentReceipt: (state) => {
      state.currentReceipt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedProducts = action.payload.purchased || [];
        state.pendingReservations = action.payload.pending || [];
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load order history';
      })

      // Fetch receipt
      .addCase(fetchOrderReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReceipt = action.payload;
      })
      .addCase(fetchOrderReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentReceipt } = ordersSlice.actions;

// Selectors
export const selectPurchasedProducts = (state) => state.orders.purchasedProducts;
export const selectPendingReservations = (state) => state.orders.pendingReservations;
export const selectCurrentReceipt = (state) => state.orders.currentReceipt;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer;
