/**
 * retailersSlice.js - Redux Slice for Linked Retailers Directory
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the retail store network that buys goods from this supplier:
 * 1. Directory of connected retailers (name, code, contact, credit limit, fulfilment score).
 * 2. Adding / linking a new retailer partner and syncing with backend.
 * 3. Inspecting retailer details in a dedicated view modal.
 * 4. Filtering retailers by active/inactive tabs and name search.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateSupplier, fetchRetailers } from '../../api/supplierApi.js';
import { initSupplierProfile } from './profileSlice.js';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Loads the retailers list from backend.
 */
export const fetchSupplierRetailers = createAsyncThunk(
  'supplierRetailers/fetchRetailers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRetailers();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch retailers');
    }
  }
);

/**
 * Links a new retailer to the supplier and persists to backend.
 */
export const linkSupplierRetailer = createAsyncThunk(
  'supplierRetailers/linkRetailer',
  async ({ retailerForm, supplierId, currentRetailers }, { rejectWithValue }) => {
    try {
      if (!retailerForm.name || !retailerForm.email) {
        throw new Error('Please enter Retailer Name and Email.');
      }

      const newRet = {
        id: retailerForm.code || `RET-${Date.now()}`,
        code: retailerForm.code,
        name: retailerForm.name,
        contact: retailerForm.contact || retailerForm.name,
        email: retailerForm.email,
        phone: retailerForm.phone,
        state: retailerForm.state,
        terms: retailerForm.terms,
        status: 'active',
        lastOrder: 'Just Now',
        fulfilment: 100,
        ratingGiven: 5.0,
        orders: 0,
      };

      const updated = [newRet, ...currentRetailers];

      if (supplierId) {
        try {
          await updateSupplier(supplierId, { retailers: updated });
        } catch (backendErr) {
          console.warn('Failed to update retailers in backend:', backendErr);
        }
      }

      return updated;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to link retailer');
    }
  }
);

// ─── Default Form Helper ──────────────────────────────────────────────────────
const createDefaultRetailerForm = () => ({
  code: `RET-${Math.floor(100 + Math.random() * 900)}`,
  name: '',
  contact: '',
  email: '',
  phone: '',
  state: 'Gujarat',
  terms: 'Net 30',
  creditLimit: '500000',
  addr: '',
});

// ─── Slice Definition ─────────────────────────────────────────────────────────

const retailersSlice = createSlice({
  name: 'retailers',
  initialState: {
    retailers: [],
    loading: false,
    linking: false,
    error: null,
    retailerSearch: '',
    retailerTabFilter: 'all',
    retailerModalOpen: false,
    retailerViewModalOpen: false,
    selectedRetailer: null,
    retailerForm: createDefaultRetailerForm(),
  },
  reducers: {
    setRetailers: (state, action) => {
      state.retailers = Array.isArray(action.payload) ? action.payload : [];
    },
    setRetailerSearch: (state, action) => {
      state.retailerSearch = action.payload;
    },
    setRetailerTabFilter: (state, action) => {
      state.retailerTabFilter = action.payload;
    },
    openRetailerModal: (state) => {
      state.retailerForm = createDefaultRetailerForm();
      state.retailerModalOpen = true;
    },
    closeRetailerModal: (state) => {
      state.retailerModalOpen = false;
      state.retailerForm = createDefaultRetailerForm();
    },
    openRetailerViewModal: (state, action) => {
      state.selectedRetailer = action.payload;
      state.retailerViewModalOpen = true;
    },
    closeRetailerViewModal: (state) => {
      state.retailerViewModalOpen = false;
      state.selectedRetailer = null;
    },
    setRetailerForm: (state, action) => {
      state.retailerForm = { ...state.retailerForm, ...action.payload };
    },
    updateRetailerFormField: (state, action) => {
      const { field, value } = action.payload;
      state.retailerForm[field] = value;
    },
    resetRetailerForm: (state) => {
      state.retailerForm = createDefaultRetailerForm();
    },
    clearRetailersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Auto-populate when profile loads
      .addCase(initSupplierProfile.fulfilled, (state, action) => {
        const s = action.payload.supplierRecord;
        if (s && Array.isArray(s.retailers)) {
          state.retailers = s.retailers;
        } else if (!s) {
          state.retailers = [];
        }
      })

      // Fetch retailers
      .addCase(fetchSupplierRetailers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierRetailers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          state.retailers = action.payload;
        }
      })
      .addCase(fetchSupplierRetailers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Link retailer
      .addCase(linkSupplierRetailer.pending, (state) => {
        state.linking = true;
        state.error = null;
      })
      .addCase(linkSupplierRetailer.fulfilled, (state, action) => {
        state.linking = false;
        state.retailers = action.payload;
        state.retailerModalOpen = false;
        state.retailerForm = createDefaultRetailerForm();
      })
      .addCase(linkSupplierRetailer.rejected, (state, action) => {
        state.linking = false;
        state.error = action.payload || 'Failed to link retailer';
      });
  },
});

export const {
  setRetailers,
  setRetailerSearch,
  setRetailerTabFilter,
  openRetailerModal,
  closeRetailerModal,
  openRetailerViewModal,
  closeRetailerViewModal,
  setRetailerForm,
  updateRetailerFormField,
  resetRetailerForm,
  clearRetailersError,
} = retailersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSupplierRetailers = (state) => state.retailers.retailers;
export const selectRetailersLoading = (state) => state.retailers.loading;
export const selectRetailersLinking = (state) => state.retailers.linking;
export const selectRetailersError = (state) => state.retailers.error;
export const selectRetailerSearch = (state) => state.retailers.retailerSearch;
export const selectRetailerTabFilter = (state) => state.retailers.retailerTabFilter;
export const selectRetailerModalOpen = (state) => state.retailers.retailerModalOpen;
export const selectRetailerViewModalOpen = (state) => state.retailers.retailerViewModalOpen;
export const selectSelectedRetailer = (state) => state.retailers.selectedRetailer;
export const selectRetailerForm = (state) => state.retailers.retailerForm;

export const selectFilteredRetailers = (state) => {
  const retailers = state.retailers.retailers;
  const search = (state.retailers.retailerSearch || '').toLowerCase().trim();
  const tab = state.retailers.retailerTabFilter;

  return retailers.filter((r) => {
    const matchQ =
      !search ||
      (r.name && r.name.toLowerCase().includes(search)) ||
      (r.code && r.code.toLowerCase().includes(search)) ||
      (r.contact && r.contact.toLowerCase().includes(search));
    const matchTab = tab === 'all' || r.status === tab;
    return matchQ && matchTab;
  });
};

export default retailersSlice.reducer;
