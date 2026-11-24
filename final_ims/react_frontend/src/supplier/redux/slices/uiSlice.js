/**
 * uiSlice.js - Redux Slice for Supplier UI, Navigation Tabs, Modals & Toast State
 * 
 * IN LAYMAN'S TERMS:
 * This slice controls the visual interface of the Supplier Portal:
 * 1. Active navigation tabs ('dashboard', 'profile', 'products', 'orders', 'retailers', 'performance', 'plan').
 * 2. Toast alerts and notifications with auto-dismissal.
 * 3. Modal open/close state (Contact Support, Plan Payment Gateway, Profile Popover).
 * 4. Simulated payment processing for plan upgrades (UPI, Card, Netbanking).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setPlanTier } from './profileSlice.js';

// ─── Initial Tab Detection ───────────────────────────────────────────────────
const getInitialActiveTab = () => {
  try {
    const p = new URLSearchParams(window.location.search).get('tab');
    return ['dashboard', 'profile', 'products', 'orders', 'retailers', 'performance', 'plan'].includes(p)
      ? p
      : 'dashboard';
  } catch {
    return 'dashboard';
  }
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Simulates gateway payment processing and updates plan tier in profile.
 */
export const processPaymentThunk = createAsyncThunk(
  'supplierUi/processPayment',
  async (selectedPlan, { dispatch }) => {
    // Simulated processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile tier
    dispatch(setPlanTier({ planTier: selectedPlan.name, planPrice: selectedPlan.price }));

    // Show toast
    dispatch(
      showToast({
        message: `Payment Successful! Plan activated: ${selectedPlan.name}`,
        type: 'ok',
      })
    );

    return selectedPlan;
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: getInitialActiveTab(),
    toast: { show: false, message: '', type: 'ok' },
    profilePopoverOpen: false,
    isSupportModalOpen: false,
    paymentModalOpen: false,
    selectedPlan: { name: 'Vyapar Pro', price: 799 },
    payMethod: 'upi',
    payingState: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      try {
        const url = new URL(window.location);
        url.searchParams.set('tab', action.payload);
        window.history.pushState({}, '', url);
      } catch {}
    },
    showToast: (state, action) => {
      const payload = typeof action.payload === 'string'
        ? { message: action.payload, type: 'ok' }
        : action.payload;
      state.toast = {
        show: true,
        message: payload.message || '',
        type: payload.type || 'ok',
      };
    },
    hideToast: (state) => {
      state.toast = { show: false, message: '', type: 'ok' };
    },
    setProfilePopoverOpen: (state, action) => {
      state.profilePopoverOpen = action.payload;
    },
    setSupportModalOpen: (state, action) => {
      state.isSupportModalOpen = action.payload;
    },
    openPaymentModal: (state, action) => {
      const { name, price } = action.payload || { name: 'Vyapar Pro', price: 799 };
      state.selectedPlan = { name, price };
      state.paymentModalOpen = true;
    },
    closePaymentModal: (state) => {
      state.paymentModalOpen = false;
      state.payingState = false;
    },
    setPayMethod: (state, action) => {
      state.payMethod = action.payload;
    },
    setPayingState: (state, action) => {
      state.payingState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPaymentThunk.pending, (state) => {
        state.payingState = true;
      })
      .addCase(processPaymentThunk.fulfilled, (state) => {
        state.payingState = false;
        state.paymentModalOpen = false;
      })
      .addCase(processPaymentThunk.rejected, (state) => {
        state.payingState = false;
      });
  },
});

export const {
  setActiveTab,
  showToast,
  hideToast,
  setProfilePopoverOpen,
  setSupportModalOpen,
  openPaymentModal,
  closePaymentModal,
  setPayMethod,
  setPayingState,
} = uiSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectActiveTab = (state) => state.ui.activeTab;
export const selectToast = (state) => state.ui.toast;
export const selectProfilePopoverOpen = (state) => state.ui.profilePopoverOpen;
export const selectIsSupportModalOpen = (state) => state.ui.isSupportModalOpen;
export const selectPaymentModalOpen = (state) => state.ui.paymentModalOpen;
export const selectSelectedPlan = (state) => state.ui.selectedPlan;
export const selectPayMethod = (state) => state.ui.payMethod;
export const selectPayingState = (state) => state.ui.payingState;

export default uiSlice.reducer;
