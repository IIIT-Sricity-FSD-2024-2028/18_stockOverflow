/**
 * profileSlice.js - Redux Slice for Retailer Profile, Setup Wizard & Subscription Tier
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages retailer account settings:
 * 1. Business Profile: Store name, address, GSTIN, fiscal calendar, contact phone.
 * 2. Subscription Billing: Active plan (Starter, Growth/Pro, Enterprise), monthly/annual cycle.
 * 3. Initial Setup Wizard: Multi-step initialization wizard for newly registered retailers.
 * 4. Plan Upgrade: Purchasing higher tier plan with mock payment checkout.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';
import { request } from '../../api/client';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchRetailerProfile = createAsyncThunk(
  'retailerProfile/fetchRetailerProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getCurrentUser(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch retailer profile');
    }
  }
);

export const updateRetailerProfile = createAsyncThunk(
  'retailerProfile/updateRetailerProfile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await retailerApi.updateUser(id, data);
      return res;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const fetchActiveSubscription = createAsyncThunk(
  'retailerProfile/fetchActiveSubscription',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await request(`/platform-revenue/subscriptions/active?userId=${encodeURIComponent(userId)}`);
      return res;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subscription');
    }
  }
);

export const upgradeSubscriptionPlan = createAsyncThunk(
  'retailerProfile/upgradeSubscriptionPlan',
  async ({ userId, tier, paymentMethod = 'upi' }, { rejectWithValue }) => {
    try {
      const res = await request('/platform-revenue/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          tier,
          paymentMethod,
          status: 'active',
          startedAt: new Date().toISOString(),
        }),
      }).catch(async () => {
        // Fallback simulate upgrade
        return { userId, tier, status: 'active', paymentMethod };
      });
      return { tier, res };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upgrade subscription');
    }
  }
);

export const submitRetailerSetup = createAsyncThunk(
  'retailerProfile/submitRetailerSetup',
  async (wizardData, { rejectWithValue }) => {
    try {
      const res = await retailerApi.setupRetailer(wizardData);
      return res;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit retailer setup');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profileData: null,
    subscription: null,
    activePlan: 'starter',
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setActivePlan: (state, action) => {
      state.activePlan = action.payload;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchRetailerProfile.fulfilled, (state, action) => {
        state.profileData = action.payload;
        if (action.payload?.plan) {
          state.activePlan = action.payload.plan;
        }
      })

      // Update Profile
      .addCase(updateRetailerProfile.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateRetailerProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.profileData = action.payload;
        state.message = 'Profile updated successfully';
      })
      .addCase(updateRetailerProfile.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch Subscription
      .addCase(fetchActiveSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
        if (action.payload?.tier) {
          state.activePlan = action.payload.tier;
        }
      })

      // Upgrade Subscription
      .addCase(upgradeSubscriptionPlan.pending, (state) => {
        state.submitting = true;
      })
      .addCase(upgradeSubscriptionPlan.fulfilled, (state, action) => {
        state.submitting = false;
        state.activePlan = action.payload.tier;
        state.message = `Plan updated to ${action.payload.tier.toUpperCase()} successfully`;
      })
      .addCase(upgradeSubscriptionPlan.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Submit Setup
      .addCase(submitRetailerSetup.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitRetailerSetup.fulfilled, (state, action) => {
        state.submitting = false;
        state.profileData = action.payload;
        state.message = 'Setup completed successfully';
      })
      .addCase(submitRetailerSetup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActivePlan,
  clearProfileError,
  clearProfileMessage,
} = profileSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectRetailerProfile = (state) => state.profile.profileData;
export const selectActivePlan = (state) => state.profile.activePlan;
export const selectSubscription = (state) => state.profile.subscription;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileSubmitting = (state) => state.profile.submitting;
export const selectProfileError = (state) => state.profile.error;
export const selectProfileMessage = (state) => state.profile.message;

export default profileSlice.reducer;
