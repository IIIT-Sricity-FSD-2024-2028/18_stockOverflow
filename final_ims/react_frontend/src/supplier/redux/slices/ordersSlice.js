/**
 * ordersSlice.js - Redux Slice for Purchase Orders Workflow
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages procurement orders placed by retail stores with the supplier:
 * 1. Fetching purchase orders and filtering them specifically for this supplier.
 * 2. Status workflow progression: Pending -> Approved -> Confirmed -> In Delivery -> Delivered (or Cancelled).
 * 3. Search and filter by retailer name, product, status, or date range.
 * 4. Pagination and modal inspection for viewing individual order details.
 * 5. Computing overall supply chain metrics (total completed sales, net payout, fulfillment rate).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPurchaseOrders, updatePurchaseOrder } from '../../api/supplierApi.js';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Fetches and filters purchase orders for the authenticated supplier.
 */
export const fetchSupplierOrders = createAsyncThunk(
  'supplierOrders/fetchOrders',
  async ({ supplierId, userEmail }, { rejectWithValue }) => {
    try {
      const pos = await fetchPurchaseOrders();
      if (!Array.isArray(pos)) return [];

      const cleanEmail = (userEmail || '').toLowerCase();
      const myOrders = pos.filter((po) => {
        return (
          (supplierId && po.supplierId === supplierId) ||
          (po.supplierEmail && cleanEmail && po.supplierEmail.toLowerCase() === cleanEmail)
        );
      });

      const mapped = myOrders.map((po) => {
        const statusClean = String(po.status || 'pending')
          .toLowerCase()
          .replace(/\s+/g, '');
        return {
          id: po.orderNumber || po.id || 'PO-0001',
          retailer: po.retailerName || 'Retail Store',
          product:
            po.items?.[0]?.name ||
            po.items?.[0]?.productName ||
            po.productName ||
            'Product',
          qty:
            po.items?.[0]?.qty ||
            po.items?.[0]?.quantity ||
            po.quantity ||
            1,
          amount:
            po.total ||
            po.totalAmount ||
            (po.items?.[0]?.price
              ? po.items[0].price * (po.items[0].qty || 1)
              : 0),
          date: po.createdAt
            ? new Date(po.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Recent',
          delivery:
            po.deliveryDate ||
            (po.expectedDeliveryDate
              ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Scheduled'),
          status: statusClean,
          rawStatus: po.status || 'Pending',
          supplierId: po.supplierId,
          rawOrder: po,
        };
      });

      return mapped;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch purchase orders');
    }
  }
);

/**
 * Updates a purchase order's status in backend and updates state.
 */
export const updateOrderStatus = createAsyncThunk(
  'supplierOrders/updateStatus',
  async ({ orderId, newStatus }, { rejectWithValue }) => {
    try {
      let backendStatus = 'Pending';
      const s = String(newStatus).toLowerCase();
      if (s === 'approved') backendStatus = 'Approved';
      else if (s === 'confirmed') backendStatus = 'Confirmed';
      else if (s === 'indelivery' || s === 'in delivery') backendStatus = 'In Delivery';
      else if (s === 'delivered') backendStatus = 'Delivered';
      else if (s === 'cancelled') backendStatus = 'Cancelled';

      await updatePurchaseOrder(orderId, { status: backendStatus });

      const cleanStatus = s.replace(/\s+/g, '');
      return {
        orderId,
        status: cleanStatus,
        rawStatus: backendStatus,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    updating: false,
    error: null,
    orderSearch: '',
    orderStatusFilter: 'all',
    orderDateFrom: '',
    orderDateTo: '',
    ordersPage: 1,
    orderModalOpen: false,
    selectedOrder: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
    },
    setOrderSearch: (state, action) => {
      state.orderSearch = action.payload;
    },
    setOrderStatusFilter: (state, action) => {
      state.orderStatusFilter = action.payload;
    },
    setOrderDateFrom: (state, action) => {
      state.orderDateFrom = action.payload;
    },
    setOrderDateTo: (state, action) => {
      state.orderDateTo = action.payload;
    },
    setOrdersPage: (state, action) => {
      state.ordersPage = action.payload;
    },
    openOrderModal: (state, action) => {
      state.selectedOrder = action.payload;
      state.orderModalOpen = true;
    },
    closeOrderModal: (state) => {
      state.orderModalOpen = false;
      state.selectedOrder = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchSupplierOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchSupplierOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load purchase orders';
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        const { orderId, status, rawStatus } = action.payload;
        state.orders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status, rawStatus } : o
        );
        if (state.selectedOrder && state.selectedOrder.id === orderId) {
          state.selectedOrder = {
            ...state.selectedOrder,
            status,
            rawStatus,
          };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update order status';
      });
  },
});

export const {
  setOrders,
  setOrderSearch,
  setOrderStatusFilter,
  setOrderDateFrom,
  setOrderDateTo,
  setOrdersPage,
  openOrderModal,
  closeOrderModal,
  setSelectedOrder,
  clearOrdersError,
} = ordersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSupplierOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersUpdating = (state) => state.orders.updating;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrderSearch = (state) => state.orders.orderSearch;
export const selectOrderStatusFilter = (state) => state.orders.orderStatusFilter;
export const selectOrderDateFrom = (state) => state.orders.orderDateFrom;
export const selectOrderDateTo = (state) => state.orders.orderDateTo;
export const selectOrdersPage = (state) => state.orders.ordersPage;
export const selectOrderModalOpen = (state) => state.orders.orderModalOpen;
export const selectSelectedOrder = (state) => state.orders.selectedOrder;

export const selectFilteredOrders = (state) => {
  const orders = state.orders.orders;
  const search = (state.orders.orderSearch || '').toLowerCase().trim();
  const statusFilter = state.orders.orderStatusFilter;

  return orders.filter((o) => {
    const matchQ =
      !search ||
      (o.id && o.id.toLowerCase().includes(search)) ||
      (o.retailer && o.retailer.toLowerCase().includes(search)) ||
      (o.product && o.product.toLowerCase().includes(search));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchQ && matchStatus;
  });
};

export const selectSupplierStats = (state) => {
  const orders = state.orders.orders;
  const products = state.products.products;

  const totalSales = orders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
  const fee = totalSales * 0.02;
  const netPayout = totalSales - fee;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const pendingCount = pendingOrders.length;
  const pendingVal = pendingOrders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
  const fulfillmentRate =
    orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;
  const avgPoVal = orders.length > 0 ? totalSales / orders.length : 0;
  const activeProductsCount = products.filter((p) => p.status === 'active').length;

  return {
    totalSales,
    netPayout,
    fee,
    deliveredCount,
    pendingCount,
    pendingVal,
    fulfillmentRate,
    avgPoVal,
    activeProductsCount,
  };
};

export default ordersSlice.reducer;
