/**
 * uiSlice.js - Redux Slice for Retailer Layout & SPA View Navigation
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the view state of the Retailer dashboard:
 * 1. Active view selection (dashboard, products, inventory, customers, etc.).
 * 2. Editing product payload across views.
 * 3. Selected supplier context for supplier performance & purchase order generation.
 * 4. Modal visibility states (select product dialog, support modal).
 */

import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeView: 'dashboard',
    editingProduct: null,
    selectProductModalOpen: false,
  },
  reducers: {
    setActiveView: (state, action) => {
      const view = action.payload;
      if (view === 'edit-product' && !state.editingProduct) {
        state.activeView = 'products';
        state.selectProductModalOpen = true;
        return;
      }
      if (view !== 'edit-product') {
        state.editingProduct = null;
      }
      state.activeView = view;
    },
    setEditingProduct: (state, action) => {
      state.editingProduct = action.payload;
      if (action.payload) {
        state.activeView = 'edit-product';
      }
    },
    setSelectProductModalOpen: (state, action) => {
      state.selectProductModalOpen = Boolean(action.payload);
    },
  },
});

export const {
  setActiveView,
  setEditingProduct,
  setSelectProductModalOpen,
} = uiSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectActiveView = (state) => state.ui.activeView;
export const selectEditingProduct = (state) => state.ui.editingProduct;
export const selectSelectProductModalOpen = (state) => state.ui.selectProductModalOpen;

export default uiSlice.reducer;
