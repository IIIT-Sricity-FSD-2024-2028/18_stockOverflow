import { MOCK_PRODUCTS, MOCK_STORES } from '../data/mockProducts';

const API_BASE_URL = typeof window !== 'undefined' && window.IMS_API_BASE_URL
  ? window.IMS_API_BASE_URL
  : 'http://localhost:3001/api';

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (_error) {
    // Graceful fallback to localStorage or mock dataset
  }

  try {
    const local = localStorage.getItem('so_inventory');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_e) {
    // Ignore localStorage parse error
  }

  return MOCK_PRODUCTS;
}

export async function fetchStores() {
  try {
    const response = await fetch(`${API_BASE_URL}/stores`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (_e) {
    // Fallback to MOCK_STORES
  }
  return MOCK_STORES;
}

export function getLocalCart() {
  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    return Array.isArray(state.cart) ? state.cart : [];
  } catch (_e) {
    return [];
  }
}

export function saveLocalCart(cart) {
  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    state.cart = cart;
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
  } catch (_e) {
    // Fallback
  }
}

export function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem('so_session') || 'null');
  } catch (_e) {
    return null;
  }
}
