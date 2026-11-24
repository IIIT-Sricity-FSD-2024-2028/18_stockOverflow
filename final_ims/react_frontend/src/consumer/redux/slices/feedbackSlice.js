/**
 * feedbackSlice.js - Redux Slice for Customer Product Reviews & Ratings
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Fetching verified feedback reviews for products.
 * 2. Fetching star ratings summary and breakdown bars (5 stars down to 1 star).
 * 3. Submitting new customer ratings and detailed reviews.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchProductFeedback as fetchProductFeedbackApi,
  fetchRatingSummary as fetchRatingSummaryApi,
  submitProductFeedback as submitProductFeedbackApi,
} from '../../utils/api_consumer';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProductReviews = createAsyncThunk(
  'feedback/fetchProductReviews',
  async (sku, { rejectWithValue }) => {
    try {
      const [reviews, summary] = await Promise.all([
        fetchProductFeedbackApi(sku),
        fetchRatingSummaryApi(sku),
      ]);
      return { sku, reviews, summary };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReview = createAsyncThunk(
  'feedback/submitReview',
  async ({ sku, feedbackData }, { rejectWithValue, dispatch }) => {
    try {
      const result = await submitProductFeedbackApi(sku, feedbackData);
      // Reload reviews and rating summary after submission
      dispatch(fetchProductReviews(sku));
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    reviewsBySku: {},
    ratingSummaryBySku: {},
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { sku, reviews, summary } = action.payload;
        state.reviewsBySku[sku] = reviews || [];
        state.ratingSummaryBySku[sku] = summary || {
          avg: 4.8,
          total: reviews?.length || 0,
          breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 },
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackError } = feedbackSlice.actions;

// Selectors
export const selectProductReviews = (state, sku) => state.feedback.reviewsBySku[sku] || [];
export const selectProductRatingSummary = (state, sku) =>
  state.feedback.ratingSummaryBySku[sku] || {
    avg: 4.8,
    total: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 },
  };
export const selectFeedbackLoading = (state) => state.feedback.loading;
export const selectFeedbackSubmitting = (state) => state.feedback.submitting;

export default feedbackSlice.reducer;
