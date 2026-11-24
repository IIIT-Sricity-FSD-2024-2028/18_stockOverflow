/**
 * customersSlice.js - Redux Slice for Customer Accounts & Purchasing CRM
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the retailer's customer relationships:
 * 1. Fetching customers who have made purchases at the store.
 * 2. Creating new customer profiles.
 * 3. Updating customer contact details, city, status, and account notes.
 * 4. Deleting customer records.
 * 5. Tracking lifetime spend, total order count, and purchase history.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCustomers = createAsyncThunk(
  'retailerCustomers/fetchCustomers',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const rawData = await retailerApi.getCustomers(retailerId, storeId);
      const list = Array.isArray(rawData) ? rawData : [];
      const purchasedOnly = list.filter(
        (c) =>
          (Number(c.totalOrders != null ? c.totalOrders : c.orders) || 0) > 0 ||
          (Number(c.totalSpent != null ? c.totalSpent : c.spent) || 0) > 0
      );

      return purchasedOnly.map((c) => ({
        id: c.id,
        name: c.name || `${c.fname || ''} ${c.lname || ''}`.trim() || 'Valued Customer',
        fname: c.fname || (c.name ? c.name.split(' ')[0] : 'Customer'),
        lname: c.lname || (c.name ? c.name.split(' ').slice(1).join(' ') : ''),
        email: c.email || 'customer@example.com',
        phone: c.phone || '+91 98765 43210',
        city: c.city || c.location || 'Mumbai',
        country: c.country || 'India',
        status: (c.status || 'Active').toLowerCase(),
        totalSpent: Number(c.totalSpent != null ? c.totalSpent : c.spent) || 0,
        totalOrders: Number(c.totalOrders != null ? c.totalOrders : c.orders) || 0,
        notes: c.notes || '',
        created: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025',
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'retailerCustomers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createCustomer(customerData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'retailerCustomers/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.updateCustomer(id, customerData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'retailerCustomers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await retailerApi.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete customer');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    selectedCustomer: null,
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearCustomerMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = 'Customer created successfully';
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload && action.payload.id) {
          const idx = state.items.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
        state.message = 'Customer updated successfully';
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
        state.message = 'Customer deleted successfully';
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedCustomer,
  clearCustomerError,
  clearCustomerMessage,
} = customersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCustomers = (state) => state.customers.items;
export const selectSelectedCustomer = (state) => state.customers.selectedCustomer;
export const selectCustomersLoading = (state) => state.customers.loading;
export const selectCustomersSubmitting = (state) => state.customers.submitting;
export const selectCustomersError = (state) => state.customers.error;
export const selectCustomersMessage = (state) => state.customers.message;

export default customersSlice.reducer;
