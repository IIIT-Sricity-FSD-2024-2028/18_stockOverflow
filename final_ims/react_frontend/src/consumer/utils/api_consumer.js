/**
 * api_consumer.js - Centralized API Service for React Consumer Frontend
 * 
 * IN LAYMAN'S TERMS:
 * This file acts as our "messenger" between the React consumer frontend and the NestJS backend server.
 * It connects to customer-facing endpoints (separate from admin) at http://localhost:3001/api.
 * If the server is unreachable or offline, it gracefully falls back to mock data or browser localStorage
 * so the application keeps running smoothly without crashing!
 */

import { MOCK_PRODUCTS, MOCK_STORES } from '../data/mockProducts_consumer';

// Resolve backend API URL (defaults to port 3001)
const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Generic HTTP request helper with JSON parsing and error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMsg =
      data && typeof data === 'object'
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || data.error || 'Request failed'
        : String(data || 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRODUCTS & CATALOG (Customer Facing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the product catalog, optionally filtered by physical store branch.
 */
export async function fetchProducts(storeId = '') {
  try {
    const endpoint = storeId ? `/products?storeId=${encodeURIComponent(storeId)}` : '/products';
    const data = await apiRequest(endpoint);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (_err) {
    // Backend offline or error - try localStorage fallback
  }

  try {
    const local = localStorage.getItem('so_inventory') || localStorage.getItem('imsRetailerProductsV1');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {}

  return MOCK_PRODUCTS;
}

/**
 * Fetches a single product by SKU.
 */
export async function fetchProductBySku(sku) {
  if (!sku) return null;
  try {
    const data = await apiRequest(`/products/sku/${encodeURIComponent(sku)}`);
    if (data) return data;
  } catch (_err) {}

  const all = await fetchProducts();
  return all.find((p) => p.sku === sku) || null;
}

/**
 * Fetches verified customer star ratings and average breakdown for a product.
 */
export async function fetchRatingSummary(sku) {
  if (!sku) {
    return { avg: 4.8, total: 3, breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 } };
  }
  try {
    const data = await apiRequest(`/products/sku/${encodeURIComponent(sku)}/rating-summary`);
    if (data) return data;
  } catch (_err) {}

  return { avg: 4.8, total: 3, breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 } };
}

/**
 * Fetches verified customer reviews for a product.
 */
export async function fetchProductFeedback(sku) {
  if (!sku) return [];
  try {
    const data = await apiRequest(`/products/sku/${encodeURIComponent(sku)}/feedback`);
    if (Array.isArray(data)) return data;
  } catch (_err) {}

  // Fallback to local feedback
  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    const local = Array.isArray(state.feedback) ? state.feedback : [];
    return local.filter((f) => f.sku === sku);
  } catch (_e) {
    return [];
  }
}

/**
 * Submits a new verified review & star rating for a product.
 */
export async function submitProductFeedback(sku, feedbackData) {
  try {
    return await apiRequest(`/products/sku/${encodeURIComponent(sku)}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  } catch (err) {
    // Local fallback
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    if (!Array.isArray(state.feedback)) state.feedback = [];
    state.feedback.unshift({
      id: `fb-${Date.now()}`,
      sku,
      ...feedbackData,
      date: new Date().toISOString(),
    });
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
    return { success: true, message: 'Feedback saved locally' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STORES & PHYSICAL LOCATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all physical store fulfillment centers.
 */
export async function fetchStores() {
  try {
    const data = await apiRequest('/stores');
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_e) {}
  return MOCK_STORES;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. IN-STORE PICKUP RESERVATIONS & HOLDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an in-store hold (reservation request).
 */
export async function createReservationRequest(payload) {
  try {
    return await apiRequest('/reservations/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = {
      requestId,
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const local = JSON.parse(localStorage.getItem('ims_reservation_requests') || '[]');
    local.unshift(created);
    localStorage.setItem('ims_reservation_requests', JSON.stringify(local));
    return created;
  }
}

/**
 * Fetches customer reservation requests.
 */
export async function fetchReservationRequests(status = '', customer = '') {
  try {
    let query = '';
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (customer) params.set('customer', customer);
    const qStr = params.toString();
    if (qStr) query = `?${qStr}`;

    const data = await apiRequest(`/reservations/requests${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  try {
    const local = JSON.parse(localStorage.getItem('ims_reservation_requests') || '[]');
    return local.filter((r) => !status || r.status === status);
  } catch (_e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRANSACTIONS & ORDER INVOICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a direct sales transaction order.
 */
export async function createTransaction(payload) {
  try {
    return await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const orderId = `ORD-${Date.now()}`;
    const created = {
      orderId,
      ...payload,
      status: 'Delivered',
      timestamp: new Date().toISOString(),
    };
    const local = JSON.parse(localStorage.getItem('ims_transactions') || '[]');
    local.unshift(created);
    localStorage.setItem('ims_transactions', JSON.stringify(local));
    return created;
  }
}

/**
 * Fetches transactions list.
 */
export async function fetchTransactions(customer = '') {
  try {
    const query = customer ? `?customer=${encodeURIComponent(customer)}` : '';
    const data = await apiRequest(`/transactions${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  try {
    return JSON.parse(localStorage.getItem('ims_transactions') || '[]');
  } catch (_e) {
    return [];
  }
}

/**
 * Fetches a single transaction order by its Order ID (for printable receipt invoice).
 */
export async function fetchTransactionByOrderId(orderId) {
  if (!orderId) return null;
  try {
    return await apiRequest(`/transactions/${encodeURIComponent(orderId)}`);
  } catch (_e) {
    const local = JSON.parse(localStorage.getItem('ims_transactions') || '[]');
    return local.find((t) => t.orderId === orderId) || null;
  }
}

/**
 * Fetches purchased products summary for order history list.
 */
export async function fetchPurchasedProducts(customer = '') {
  try {
    const query = customer ? `?customer=${encodeURIComponent(customer)}` : '';
    const data = await apiRequest(`/transactions/purchased-products${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  const orders = await fetchTransactions(customer);
  const map = {};
  orders.forEach((ord) => {
    (ord.items || []).forEach((item) => {
      if (!map[item.sku]) {
        map[item.sku] = {
          sku: item.sku,
          name: item.name,
          totalQty: 0,
          totalSpent: 0,
          lastOrderedAt: ord.timestamp || new Date().toISOString(),
          orderId: ord.orderId,
          store: ord.store,
        };
      }
      map[item.sku].totalQty += item.quantity || 1;
      map[item.sku].totalSpent += item.total || item.price * (item.quantity || 1);
    });
  });
  return Object.values(map);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RETURNS & RMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits an RMA return request for a delivered product.
 */
export async function createReturnRequest(payload) {
  try {
    return await apiRequest('/returns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    if (!Array.isArray(state.returns)) state.returns = [];
    const created = {
      id: `RET-${Date.now()}`,
      ...payload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    state.returns.unshift(created);
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
    return created;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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
  } catch (_e) {}
}

export function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem('so_session') || 'null');
  } catch (_e) {
    return null;
  }
}
