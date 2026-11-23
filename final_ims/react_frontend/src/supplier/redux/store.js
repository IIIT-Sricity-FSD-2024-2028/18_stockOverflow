/**
 * store.js - Central Redux Store Configuration for Supplier Module
 * 
 * IN LAYMAN'S TERMS:
 * This is the central hub that unites all 5 supplier slices:
 * 1. profile   -> Supplier business info, authentication ID, document vault, setup wizard.
 * 2. products  -> Wholesale catalog, inventory quantities, pricing, MOQ, stock status.
 * 3. orders    -> Purchase orders, retailer order approval, fulfillment tracking.
 * 4. retailers -> Connected retailer directory, credit limits, performance scorecards.
 * 5. ui        -> Active view tabs, toast alerts, modals, payment checkout simulation.
 */

import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice.js';
import productsReducer from './slices/productsSlice.js';
import ordersReducer from './slices/ordersSlice.js';
import retailersReducer from './slices/retailersSlice.js';
import uiReducer from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    products: productsReducer,
    orders: ordersReducer,
    retailers: retailersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
