/**
 * billersSlice.js - Redux Slice for Cashier Billers & Access Approval Workflow
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages store cashier and POS terminal staff:
 * 1. Fetching active billers assigned to the store.
 * 2. Fetching pending biller applicant requests submitted via the portal.
 * 3. Approving or rejecting biller registration requests with store scope.
 * 4. Creating, modifying, or removing biller staff credentials and access.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchBillersAndRequests = createAsyncThunk(
  'retailerBillers/fetchBillersAndRequests',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const [billersRes, requestsRes] = await Promise.all([
        retailerApi.getBillers(retailerId, storeId).catch(() => []),
        retailerApi.getBillerRequests().catch(() => []),
      ]);

      const billers = (Array.isArray(billersRes) ? billersRes : []).map((b, idx) => ({
        id: b.id || idx + 1,
        code: b.code || `BI00${idx + 1}`,
        name: b.name || 'Biller Staff',
        company: b.company || b.companyName || "Main Store",
        email: b.email || 'biller@example.com',
        phone: b.phone || '+91 98200 11223',
        country: b.country || 'India',
        status: (b.status || 'active').toLowerCase(),
        color: b.color || '#2e6bc5',
      }));

      const rawRequests = Array.isArray(requestsRes) ? requestsRes : [];
      const pendingRequests = rawRequests.filter((r) => r.status === 'pending');

      return { billers, pendingRequests };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch billers');
    }
  }
);

export const createBiller = createAsyncThunk(
  'retailerBillers/createBiller',
  async (billerData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createBiller(billerData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create biller');
    }
  }
);

export const updateBiller = createAsyncThunk(
  'retailerBillers/updateBiller',
  async ({ id, billerData }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.updateBiller(id, billerData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update biller');
    }
  }
);

export const deleteBiller = createAsyncThunk(
  'retailerBillers/deleteBiller',
  async (id, { rejectWithValue }) => {
    try {
      await retailerApi.deleteBiller(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete biller');
    }
  }
);

export const approveBiller = createAsyncThunk(
  'retailerBillers/approveBiller',
  async ({ id, scope }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.approveBillerRequest(id, scope);
      return { id, result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to approve biller request');
    }
  }
);

export const rejectBiller = createAsyncThunk(
  'retailerBillers/rejectBiller',
  async (id, { rejectWithValue }) => {
    try {
      await retailerApi.rejectBillerRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject biller request');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const billersSlice = createSlice({
  name: 'billers',
  initialState: {
    items: [],
    pendingRequests: [],
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    clearBillerError: (state) => {
      state.error = null;
    },
    clearBillerMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBillersAndRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillersAndRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.billers;
        state.pendingRequests = action.payload.pendingRequests;
      })
      .addCase(fetchBillersAndRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Biller
      .addCase(createBiller.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createBiller.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = 'Biller created successfully';
      })
      .addCase(createBiller.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update Biller
      .addCase(updateBiller.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateBiller.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload && action.payload.id) {
          const idx = state.items.findIndex((b) => b.id === action.payload.id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
        state.message = 'Biller updated successfully';
      })
      .addCase(updateBiller.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete Biller
      .addCase(deleteBiller.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
        state.message = 'Biller deleted successfully';
      })

      // Approve Biller Request
      .addCase(approveBiller.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter((r) => r.id !== action.payload.id);
        state.message = 'Biller application approved successfully';
      })

      // Reject Biller Request
      .addCase(rejectBiller.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter((r) => r.id !== action.payload);
        state.message = 'Biller application rejected';
      });
  },
});

export const {
  clearBillerError,
  clearBillerMessage,
} = billersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectBillers = (state) => state.billers.items;
export const selectPendingBillerRequests = (state) => state.billers.pendingRequests;
export const selectBillersLoading = (state) => state.billers.loading;
export const selectBillersSubmitting = (state) => state.billers.submitting;
export const selectBillersError = (state) => state.billers.error;
export const selectBillersMessage = (state) => state.billers.message;

export default billersSlice.reducer;
