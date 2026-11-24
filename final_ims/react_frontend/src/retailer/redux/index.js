/**
 * index.js - Retailer Redux Public Barrel File
 */

import store from './store';

export default store;
export { store, store as retailerStore };

export * from './slices/productsSlice';
export * from './slices/dashboardSlice';
export * from './slices/storesSlice';
export * from './slices/customersSlice';
export * from './slices/billersSlice';
export * from './slices/suppliersSlice';
export * from './slices/purchaseOrdersSlice';
export * from './slices/returnsSlice';
export * from './slices/stockAdjustSlice';
export * from './slices/profileSlice';
export * from './slices/notificationsSlice';
export * from './slices/uiSlice';
