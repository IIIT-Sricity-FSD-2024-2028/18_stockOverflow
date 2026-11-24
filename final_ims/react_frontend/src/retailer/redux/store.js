/**
 * store.js - Central Redux Store Configuration for Retailer Module
 * 
 * IN LAYMAN'S TERMS:
 * This is the central brain of the Retailer module state management:
 * 1. products       -> Catalog, inventory levels, low stock warnings, reorder suggestions.
 * 2. dashboard      -> Real-time financial metrics, overview graphs, transaction feeds.
 * 3. stores         -> Multi-store location branches and individual store performance analytics.
 * 4. customers      -> Retail consumer records, spend history, customer directory.
 * 5. billers        -> POS cashier staff, pending biller registration review & approval.
 * 6. suppliers      -> Wholesale supplier directory & performance scorecards.
 * 7. purchaseOrders -> Procurement purchase orders, supplier catalogue items, delivery tracking.
 * 8. returns        -> Customer purchase return claims, RMA evaluations, inspection records.
 * 9. stockAdjust    -> Physical inventory recount logs, shrinkage adjustments, and audit trail.
 * 10. profile       -> Business profile, subscription tier, initial setup wizard.
 * 11. notifications -> Stock alarms, incoming returns, header bell notification center.
 * 12. ui            -> View navigation, modal state, editing product contexts.
 */

import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import dashboardReducer from './slices/dashboardSlice';
import storesReducer from './slices/storesSlice';
import customersReducer from './slices/customersSlice';
import billersReducer from './slices/billersSlice';
import suppliersReducer from './slices/suppliersSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';
import returnsReducer from './slices/returnsSlice';
import stockAdjustReducer from './slices/stockAdjustSlice';
import profileReducer from './slices/profileSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    dashboard: dashboardReducer,
    stores: storesReducer,
    customers: customersReducer,
    billers: billersReducer,
    suppliers: suppliersReducer,
    purchaseOrders: purchaseOrdersReducer,
    returns: returnsReducer,
    stockAdjust: stockAdjustReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
