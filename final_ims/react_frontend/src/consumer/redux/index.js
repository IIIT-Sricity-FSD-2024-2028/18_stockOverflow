/**
 * index.js - Consumer Redux Public Barrel File
 */

import store from './store';

export default store;
export { store, store as consumerStore };
export * from './slices/catalogSlice';
export * from './slices/cartSlice';
export * from './slices/ordersSlice';
export * from './slices/returnsSlice';
export * from './slices/feedbackSlice';
export * from './slices/restockSlice';
