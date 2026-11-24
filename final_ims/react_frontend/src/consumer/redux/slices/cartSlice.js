/**
 * cartSlice.js - Redux Slice for Consumer Shopping & Reservation Cart
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the customer's in-store pickup reservation basket:
 * 1. Adding products to cart (with branch/store separation).
 * 2. Updating quantities with stepper controls (+ / -).
 * 3. Removing items or clearing the entire cart.
 * 4. Automatic synchronization with localStorage (`imsAppStateV1`).
 */

import { createSlice } from '@reduxjs/toolkit';
import { getLocalCart, saveLocalCart } from '../../utils/api_consumer';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getLocalCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, storeId = '', storeName = 'Downtown Store' } = action.payload;
      if (!product?.sku) return;

      const productStoreId = product.storeId || storeId || '';
      const productStoreName = product.storeName || storeName || 'Downtown Store';

      const existingIdx = state.items.findIndex(
        (item) => item.sku === product.sku && String(item.storeId || '') === String(productStoreId)
      );

      if (existingIdx > -1) {
        state.items[existingIdx].qty =
          Number(state.items[existingIdx].qty || 1) + Number(quantity);
      } else {
        state.items.push({
          sku: product.sku,
          name: product.name,
          priceUSD: Number(product.priceUSD || product.price || 0),
          price: Number(product.priceUSD || product.price || 0),
          productImg: product.productImg || '',
          emoji: product.emoji || '📦',
          qty: Number(quantity),
          category: product.category || 'General',
          storeId: productStoreId,
          storeName: productStoreName,
        });
      }

      saveLocalCart(state.items);
    },

    updateCartQty: (state, action) => {
      const { sku, qty, storeId = '' } = action.payload;
      if (qty <= 0) {
        state.items = state.items.filter(
          (item) => !(item.sku === sku && String(item.storeId || '') === String(storeId || ''))
        );
      } else {
        const item = state.items.find(
          (i) => i.sku === sku && String(i.storeId || '') === String(storeId || '')
        );
        if (item) {
          item.qty = Number(qty);
        }
      }
      saveLocalCart(state.items);
    },

    removeFromCart: (state, action) => {
      const { sku, storeId = '' } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.sku === sku && String(item.storeId || '') === String(storeId || ''))
      );
      saveLocalCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveLocalCart([]);
    },
  },
});

export const { addToCart, updateCartQty, removeFromCart, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + (Number(item.qty) || 1), 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const p = Number(item.priceUSD || item.price || 0);
    const q = Number(item.qty || 1);
    return sum + p * q;
  }, 0);

export default cartSlice.reducer;
