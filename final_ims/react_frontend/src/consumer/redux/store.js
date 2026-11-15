/**
 * store.js - Central Redux Store Configuration for Consumer Module
 * 
 * IN LAYMAN'S TERMS:
 * This is the central hub that unites all 5 consumer slices:
 * 1. catalog  -> Products, stores, branch filtering.
 * 2. cart     -> Shopping basket & reservations with branch preservation.
 * 3. orders   -> Purchases, pending holds, invoices/receipts.
 * 4. returns  -> RMA claims and order lookup.
 * 5. feedback -> Verified reviews & star rating summaries.
 * 6. restock  -> Restock alerts watchlist.
 */

import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import returnsReducer from './slices/returnsSlice';
import feedbackReducer from './slices/feedbackSlice';
import restockReducer from './slices/restockSlice';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    orders: ordersReducer,
    returns: returnsReducer,
    feedback: feedbackReducer,
    restock: restockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
