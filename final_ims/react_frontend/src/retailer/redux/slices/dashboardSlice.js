/**
 * dashboardSlice.js - Redux Slice for Retailer Dashboard & Live Analytics
 * 
 * IN LAYMAN'S TERMS:
 * This slice orchestrates all real-time overview metrics for the retailer:
 * 1. Financial stats: Gross sales, net profit, expenses, purchase invoices due.
 * 2. Activity streams: Live sales orders, purchase orders, consumer pre-order holds.
 * 3. Inventory health: Fast moving top sellers, low stock alerts, category sales breakdown.
 * 4. Filter tabs: Time horizons (1D, 7D, 1M, 1Y) and transaction stream tabs.
 * 5. Pre-order reservation cancellation by retailer staff.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';
import { request } from '../../api/client';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchDashboardData = createAsyncThunk(
  'retailerDashboard/fetchDashboardData',
  async ({ retailerId = '', storeId = '', userId = '' } = {}, { rejectWithValue }) => {
    try {
      const scopedQuery = retailerId
        ? `?retailerId=${encodeURIComponent(retailerId)}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`
        : '';

      const [
        productsRes,
        customersRes,
        transactionsRes,
        poRes,
        returnsRes,
        suppliersRes,
        subRes,
        orderActRes,
        reservationsRes,
      ] = await Promise.all([
        request(`/products${scopedQuery}`).catch(() => []),
        request(`/customers${scopedQuery}`).catch(() => []),
        request(`/transactions${scopedQuery}`).catch(() => []),
        request(`/purchase-orders${scopedQuery}`).catch(() => []),
        request(`/returns${scopedQuery}`).catch(() => []),
        request('/suppliers').catch(() => []),
        userId
          ? request(`/platform-revenue/subscriptions/active?userId=${encodeURIComponent(userId)}`).catch(() => null)
          : Promise.resolve(null),
        request(`/transactions/order-activity${scopedQuery}`).catch(() => null),
        request(`/reservations/requests${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ''}`).catch(() => []),
      ]);

      const purchasedCustomers = (Array.isArray(customersRes) ? customersRes : []).filter(
        (c) =>
          (Number(c.totalOrders != null ? c.totalOrders : c.orders) || 0) > 0 ||
          (Number(c.totalSpent != null ? c.totalSpent : c.spent) || 0) > 0
      );

      return {
        products: Array.isArray(productsRes) ? productsRes : [],
        customers: purchasedCustomers,
        transactions: Array.isArray(transactionsRes) ? transactionsRes : [],
        purchaseOrders: Array.isArray(poRes) ? poRes : [],
        returns: Array.isArray(returnsRes) ? returnsRes : [],
        suppliers: Array.isArray(suppliersRes) ? suppliersRes : [],
        subscription: subRes,
        orderActivity: orderActRes,
        reservationRequests: Array.isArray(reservationsRes) ? reservationsRes : [],
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'retailerDashboard/cancelReservation',
  async ({ requestId, reason = '', cancelledBy = 'retailer' }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.cancelReservationRequest(requestId, reason, cancelledBy);
      return { requestId, result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel reservation');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: {
      products: [],
      customers: [],
      transactions: [],
      purchaseOrders: [],
      returns: [],
      suppliers: [],
      subscription: null,
      orderActivity: null,
      reservationRequests: [],
    },
    activeFilter: '1D',
    activeTransTab: 'Sale',
    notifVisible: true,
    loading: true,
    error: null,
  },
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setActiveTransTab: (state, action) => {
      state.activeTransTab = action.payload;
    },
    setNotifVisible: (state, action) => {
      state.notifVisible = action.payload;
    },
    setDashboardDataLocal: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state, action) => {
        // If meta.arg contains isSilent, don't flip loading to true
        if (!action.meta?.arg?.isSilent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Reservation
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        state.data.reservationRequests = state.data.reservationRequests.map((r) =>
          r.requestId === requestId || r.id === requestId
            ? { ...r, status: 'cancelled', cancelReason: 'Cancelled by Retailer' }
            : r
        );
      });
  },
});

export const {
  setActiveFilter,
  setActiveTransTab,
  setNotifVisible,
  setDashboardDataLocal,
  clearDashboardError,
} = dashboardSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDashboardData = (state) => state.dashboard.data;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardActiveFilter = (state) => state.dashboard.activeFilter;
export const selectDashboardActiveTransTab = (state) => state.dashboard.activeTransTab;
export const selectDashboardNotifVisible = (state) => state.dashboard.notifVisible;

export const selectDashboardProducts = (state) => state.dashboard.data.products;
export const selectDashboardCustomers = (state) => state.dashboard.data.customers;
export const selectDashboardTransactions = (state) => state.dashboard.data.transactions;
export const selectDashboardPurchaseOrders = (state) => state.dashboard.data.purchaseOrders;
export const selectDashboardReturns = (state) => state.dashboard.data.returns;
export const selectDashboardSuppliers = (state) => state.dashboard.data.suppliers;
export const selectDashboardSubscription = (state) => state.dashboard.data.subscription;
export const selectDashboardReservationRequests = (state) => state.dashboard.data.reservationRequests;

export default dashboardSlice.reducer;
