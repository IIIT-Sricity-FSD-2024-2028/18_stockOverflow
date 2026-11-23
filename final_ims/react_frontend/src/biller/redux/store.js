/**
 * store.js - Central Redux Store Configuration for Biller Module
 * 
 * IN LAYMAN'S TERMS:
 * This store unites the 4 POS biller slices:
 * 1. billerCatalog      -> Stores, active branch, products catalog, walk-in customers.
 * 2. billerCart         -> Active POS line items, price math, discounts, tax, payment method.
 * 3. billerReservations -> Consumer in-store pickup holds, hold timer tracking, release holds.
 * 4. billerTransactions -> POS checkout submission, transaction logs, receipt modal.
 */

import { configureStore } from '@reduxjs/toolkit';
import billerCatalogReducer from './slices/billerCatalogSlice';
import billerCartReducer from './slices/billerCartSlice';
import billerReservationsReducer from './slices/billerReservationsSlice';
import billerTransactionsReducer from './slices/billerTransactionsSlice';

export const billerStore = configureStore({
  reducer: {
    billerCatalog: billerCatalogReducer,
    billerCart: billerCartReducer,
    billerReservations: billerReservationsReducer,
    billerTransactions: billerTransactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default billerStore;
