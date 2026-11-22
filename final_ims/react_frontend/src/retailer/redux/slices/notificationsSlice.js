/**
 * notificationsSlice.js - Redux Slice for Header Notifications & Stock Alerts
 * 
 * IN LAYMAN'S TERMS:
 * This slice aggregates real-time notifications for the retailer:
 * 1. Low stock warnings and out-of-stock emergency alerts.
 * 2. Incoming customer return claims awaiting RMA decision.
 * 3. Pending customer in-store reservation requests.
 * 4. Tracking dismissed alert IDs across browser sessions.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchRetailerNotifications = createAsyncThunk(
  'retailerNotifications/fetchNotifications',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const [returnsRes, productsRes, reservationsRes] = await Promise.all([
        retailerApi.getReturns(retailerId, storeId).catch(() => []),
        retailerApi.getProducts(retailerId, storeId).catch(() => []),
        retailerApi.getReservationRequests('', storeId).catch(() => []),
      ]);

      const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
      const returnList = Array.isArray(returnsRes) ? returnsRes : [];
      const prodList = Array.isArray(productsRes) ? productsRes : [];
      const resList = Array.isArray(reservationsRes) ? reservationsRes : [];

      const notifs = [];

      // 1. Pending Returns
      returnList.forEach((r) => {
        const status = String(r.status || '').toLowerCase();
        if (status === 'pending') {
          const id = `notif-return-${r.id}`;
          if (!dismissed.includes(id)) {
            notifs.push({
              id,
              type: 'return',
              title: 'Customer Return Request',
              desc: `${r.customer || r.party || 'A customer'} requested a return for ${r.productName || r.product || 'an item'} (${r.reason || 'Damaged'}).`,
              time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Pending review',
              unread: true,
              link: 'returns',
            });
          }
        }
      });

      // 2. Pending Reservations
      resList.forEach((req) => {
        const status = String(req.status || '').toLowerCase();
        if (status === 'pending') {
          const id = `notif-res-${req.id || req.requestId}`;
          if (!dismissed.includes(id)) {
            notifs.push({
              id,
              type: 'reservation',
              title: 'New In-Store Pickup Hold',
              desc: `${req.customer || 'A customer'} reserved ${req.productName || req.sku || 'an item'} for 15-min pickup hold.`,
              time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Action required',
              unread: true,
              link: 'dashboard',
            });
          }
        }
      });

      // 3. Low / Out of stock
      prodList.forEach((p) => {
        const qty = Number(p.qty != null ? p.qty : p.quantity) || 0;
        const min = Number(p.min || 10);
        if (qty === 0) {
          const id = `notif-out-${p.id}`;
          if (!dismissed.includes(id)) {
            notifs.push({
              id,
              type: 'critical',
              title: 'Out of Stock Alert',
              desc: `"${p.name || p.sku}" is completely out of stock. Reorder required immediately.`,
              time: 'Needs attention',
              unread: true,
              link: 'low-stocks',
            });
          }
        } else if (qty <= min) {
          const id = `notif-low-${p.id}`;
          if (!dismissed.includes(id)) {
            notifs.push({
              id,
              type: 'warning',
              title: 'Low Stock Warning',
              desc: `"${p.name || p.sku}" has only ${qty} units left (Min threshold: ${min}).`,
              time: 'Needs attention',
              unread: true,
              link: 'low-stocks',
            });
          }
        }
      });

      return notifs;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    dismissNotification: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((n) => n.id !== id);
      try {
        const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
        if (!dismissed.includes(id)) {
          dismissed.push(id);
          localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
        }
      } catch {}
    },
    clearAllNotifications: (state) => {
      const allIds = state.items.map((n) => n.id);
      state.items = [];
      try {
        const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
        allIds.forEach((id) => {
          if (!dismissed.includes(id)) dismissed.push(id);
        });
        localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRetailerNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRetailerNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRetailerNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  dismissNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadNotifCount = (state) => state.notifications.items.filter((n) => n.unread).length;
export const selectNotificationsLoading = (state) => state.notifications.loading;

export default notificationsSlice.reducer;
