/**
 * billerCartSlice.js - Redux Slice for POS Line Items, Pricing & Adjustments
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Line items in the active POS transaction cart.
 * 2. Quantity updates (+ / -), removals, and clearing order.
 * 3. Adding approved reserved holds into the POS cart with requestIds.
 * 4. Shipping, tax, discount, coupon, and round-off calculation states.
 * 5. Payment method selection (Cash, Card, UPI, etc.).
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  stagedReservationIds: {},
  shipping: 0,
  tax: 0,
  discount: 0,
  coupon: 0,
  roundoffEnabled: true,
  paymentMethod: 'Cash',
};

const billerCartSlice = createSlice({
  name: 'billerCart',
  initialState,
  reducers: {
    addToBillerCart: (state, action) => {
      const { product, addQty = 1 } = action.payload;
      const sku = product.sku;
      const price = Number(product.priceUSD || product.price || 0);

      const existingIndex = state.cart.findIndex((item) => item.sku === sku);
      if (existingIndex >= 0) {
        const existing = state.cart[existingIndex];
        const newQty = existing.quantity + addQty;
        state.cart[existingIndex] = {
          ...existing,
          quantity: newQty,
          total: newQty * price,
        };
      } else {
        state.cart.push({
          sku: product.sku,
          name: product.name || 'Product',
          price: price,
          quantity: addQty,
          total: price * addQty,
          image: product.productImg || product.image || '',
          emoji: product.emoji || '📦',
          maxStock: product.qty || 50,
          isReserved: false,
          requestIds: [],
        });
      }
    },

    updateBillerCartQty: (state, action) => {
      const { sku, delta } = action.payload;
      state.cart = state.cart
        .map((item) => {
          if (item.sku === sku) {
            const nextQty = Math.max(0, item.quantity + delta);
            return {
              ...item,
              quantity: nextQty,
              total: nextQty * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    },

    removeFromBillerCart: (state, action) => {
      const sku = action.payload;
      state.cart = state.cart.filter((item) => item.sku !== sku);
    },

    clearBillerCart: (state) => {
      state.cart = [];
      state.stagedReservationIds = {};
    },

    addReservedHoldToCart: (state, action) => {
      const reservation = action.payload;
      const sku = reservation.sku;
      const safeQty = Math.max(1, Number(reservation.qty) || 1);
      const price = Number(reservation.priceUSD || 0);
      const requestId = reservation.requestId;

      if (requestId) {
        state.stagedReservationIds[requestId] = true;
      }

      if (reservation.paymentMethod) {
        state.paymentMethod = reservation.paymentMethod;
      }

      const existingIndex = state.cart.findIndex((item) => item.sku === sku);
      if (existingIndex >= 0) {
        const existing = state.cart[existingIndex];
        const newQty = existing.quantity + safeQty;
        const reqIds = Array.from(
          new Set([...(existing.requestIds || []), requestId].filter(Boolean))
        );
        state.cart[existingIndex] = {
          ...existing,
          quantity: newQty,
          total: newQty * existing.price,
          isReserved: true,
          requestIds: reqIds,
        };
      } else {
        state.cart.push({
          sku: reservation.sku,
          name: reservation.name || reservation.productName || 'Reserved Item',
          price: price,
          quantity: safeQty,
          total: price * safeQty,
          image: reservation.productImg || '',
          emoji: reservation.emoji || '📦',
          isReserved: true,
          requestIds: requestId ? [requestId] : [],
        });
      }
    },

    setBillerShipping: (state, action) => {
      state.shipping = Number(action.payload) || 0;
    },
    setBillerTax: (state, action) => {
      state.tax = Number(action.payload) || 0;
    },
    setBillerDiscount: (state, action) => {
      state.discount = Number(action.payload) || 0;
    },
    setBillerCoupon: (state, action) => {
      state.coupon = Number(action.payload) || 0;
    },
    setBillerRoundoffEnabled: (state, action) => {
      state.roundoffEnabled = Boolean(action.payload);
    },
    setBillerPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload || 'Cash';
    },
  },
});

export const {
  addToBillerCart,
  updateBillerCartQty,
  removeFromBillerCart,
  clearBillerCart,
  addReservedHoldToCart,
  setBillerShipping,
  setBillerTax,
  setBillerDiscount,
  setBillerCoupon,
  setBillerRoundoffEnabled,
  setBillerPaymentMethod,
} = billerCartSlice.actions;

// Selectors
export const selectBillerCart = (state) => state.billerCart.cart;
export const selectBillerStagedReservationIds = (state) => state.billerCart.stagedReservationIds;
export const selectBillerShipping = (state) => state.billerCart.shipping;
export const selectBillerTax = (state) => state.billerCart.tax;
export const selectBillerDiscount = (state) => state.billerCart.discount;
export const selectBillerCoupon = (state) => state.billerCart.coupon;
export const selectBillerRoundoffEnabled = (state) => state.billerCart.roundoffEnabled;
export const selectBillerPaymentMethod = (state) => state.billerCart.paymentMethod;

// Memoized calculation selectors
export const selectBillerCartSubtotal = (state) =>
  state.billerCart.cart.reduce((sum, item) => sum + (item.total || 0), 0);

export const selectBillerCartItemCount = (state) =>
  state.billerCart.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

export const selectBillerRawTotal = (state) => {
  const subtotal = state.billerCart.cart.reduce((sum, item) => sum + (item.total || 0), 0);
  const raw =
    subtotal +
    Number(state.billerCart.shipping) +
    Number(state.billerCart.tax) -
    Number(state.billerCart.discount) -
    Number(state.billerCart.coupon);
  return Math.max(0, raw);
};

export const selectBillerFinalTotal = (state) => {
  const rawTotal = selectBillerRawTotal(state);
  return state.billerCart.roundoffEnabled ? Math.round(rawTotal) : rawTotal;
};

export const selectBillerRoundoffValue = (state) => {
  const rawTotal = selectBillerRawTotal(state);
  const finalTotal = selectBillerFinalTotal(state);
  return finalTotal - rawTotal;
};

export default billerCartSlice.reducer;
