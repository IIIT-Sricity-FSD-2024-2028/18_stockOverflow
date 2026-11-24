/**
 * billerReservationsSlice.js - Redux Slice for In-Store Consumer Pre-Orders & Holds
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Fetching active pending consumer reservation holds for the active store branch.
 * 2. Fetching cancelled reservation requests.
 * 3. Cancelling a reservation request directly from the POS terminal and releasing hold stock.
 * 4. Tracking hold expiration timers.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billerApi } from '../../api/billerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchBillerReservations = createAsyncThunk(
  'billerReservations/fetchReservations',
  async (storeId = '', { rejectWithValue }) => {
    try {
      const [pending, cancelled] = await Promise.all([
        billerApi.getReservationRequests('pending', storeId).catch(() => []),
        billerApi.getReservationRequests('cancelled', storeId).catch(() => []),
      ]);
      return {
        pending: Array.isArray(pending) ? pending : [],
        cancelled: Array.isArray(cancelled) ? cancelled : [],
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch reservations');
    }
  }
);

export const cancelBillerReservation = createAsyncThunk(
  'billerReservations/cancelReservation',
  async ({ requestId, reason, cancelledBy }, { rejectWithValue }) => {
    try {
      const res = await billerApi.cancelReservationRequest(
        requestId,
        reason || 'Cancelled by POS store staff',
        cancelledBy || 'biller'
      );
      return { requestId, res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel reservation');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const billerReservationsSlice = createSlice({
  name: 'billerReservations',
  initialState: {
    reservedOrders: [],
    cancelledOrders: [],
    ordersModalTab: 'active',
    isOrdersModalOpen: false,
    cancellingRequestId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setOrdersModalTab: (state, action) => {
      state.ordersModalTab = action.payload || 'active';
    },
    setIsOrdersModalOpen: (state, action) => {
      state.isOrdersModalOpen = Boolean(action.payload);
    },
    removeReservedOrderFromList: (state, action) => {
      const requestId = action.payload;
      state.reservedOrders = state.reservedOrders.filter((r) => r.requestId !== requestId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBillerReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillerReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservedOrders = action.payload.pending;
        state.cancelledOrders = action.payload.cancelled;
      })
      .addCase(fetchBillerReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel
      .addCase(cancelBillerReservation.pending, (state, action) => {
        state.cancellingRequestId = action.meta.arg.requestId;
      })
      .addCase(cancelBillerReservation.fulfilled, (state, action) => {
        state.cancellingRequestId = null;
        const reqId = action.payload.requestId;
        state.reservedOrders = state.reservedOrders.filter((r) => r.requestId !== reqId);
      })
      .addCase(cancelBillerReservation.rejected, (state) => {
        state.cancellingRequestId = null;
      });
  },
});

export const {
  setOrdersModalTab,
  setIsOrdersModalOpen,
  removeReservedOrderFromList,
} = billerReservationsSlice.actions;

// Selectors
export const selectBillerReservedOrders = (state) => state.billerReservations.reservedOrders;
export const selectBillerCancelledOrders = (state) => state.billerReservations.cancelledOrders;
export const selectBillerOrdersModalTab = (state) => state.billerReservations.ordersModalTab;
export const selectBillerIsOrdersModalOpen = (state) => state.billerReservations.isOrdersModalOpen;
export const selectBillerCancellingRequestId = (state) => state.billerReservations.cancellingRequestId;
export const selectBillerReservationsLoading = (state) => state.billerReservations.loading;

export default billerReservationsSlice.reducer;
