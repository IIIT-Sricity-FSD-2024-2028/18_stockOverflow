/**
 * billerApi.js - Comprehensive API Service for POS & Biller Operations
 */

import { emitDataSync } from '../../context/DataSyncContext';

const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('so_token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const msg = typeof data === 'object' && data
        ? (Array.isArray(data.message) ? data.message.join(', ') : data.message || data.error || 'Request failed')
        : String(data || 'Request failed');
      const err = new Error(msg);
      err.payload = data;
      throw err;
    }

    return data;
  } catch (err) {
    // Vite dev server proxy fallback
    if (url.startsWith('http://localhost:3001')) {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('so_token') : null;
        const proxyRes = await fetch(`/api${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
          },
        });
        if (proxyRes.ok) {
          const contentType = proxyRes.headers.get('content-type') || '';
          return contentType.includes('application/json') ? await proxyRes.json() : await proxyRes.text();
        }
      } catch (_proxyErr) {}
    }
    throw err;
  }
}

export const billerApi = {
  // Products
  getProducts: async () => {
    return await request('/products');
  },

  createProduct: async (product) => {
    const res = await request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    emitDataSync('products', res);
    emitDataSync('inventory', res);
    return res;
  },

  // Stores
  getStores: async () => {
    return await request('/stores');
  },

  // Customers
  getCustomers: async () => {
    return await request('/customers');
  },

  createCustomer: async (customerData) => {
    return await request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  // Reservations & Incoming Orders
  getReservations: async (storeId = '') => {
    const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
    return await request(`/reservations${query}`);
  },

  getReservationRequests: async (status = 'pending') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/reservations/requests${query}`);
  },

  // Transactions & POS Checkout
  createTransaction: async (txData) => {
    const res = await request('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
    emitDataSync('transactions', res);
    emitDataSync('inventory', res);
    emitDataSync('revenue', res);
    return res;
  },

  getTransactions: async (storeId = '', retailerId = '') => {
    const params = new URLSearchParams();
    if (storeId) params.set('storeId', storeId);
    if (retailerId) params.set('retailerId', retailerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/transactions${qs}`);
  },

  deleteTransaction: async (orderId) => {
    const res = await request(`/transactions/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
    emitDataSync('transactions', { orderId });
    emitDataSync('inventory', { orderId });
    emitDataSync('revenue', { orderId });
    return res;
  },
};
