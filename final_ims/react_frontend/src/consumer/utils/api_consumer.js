/**
 * api_consumer.js - Centralized Backend API Service for React Consumer Frontend
 * 
 * IN LAYMAN'S TERMS:
 * This file is the primary bridge between our React customer storefront and the NestJS backend server.
 * It directly connects to the backend REST API running at http://localhost:3001/api (or through Vite's /api proxy).
 * 
 * What it connects:
 * 1. GET /products -> Live retailer product inventory & stock levels.
 * 2. GET /products/sku/:sku -> Single product technical specs & images.
 * 3. GET /products/sku/:sku/feedback & rating-summary -> Live verified reviews & star ratings.
 * 4. POST /products/sku/:sku/feedback -> Submits new customer reviews directly to backend DB.
 * 5. GET /stores -> Physical pickup store branches.
 * 6. POST /reservations/requests -> Places in-store pickup holds directly into backend DB.
 * 7. GET /reservations/requests -> Fetches pending/fulfilled pickup holds.
 * 8. GET /transactions/purchased-products -> Real order purchase history grouped by product.
 * 9. GET /transactions & /transactions/:orderId -> Real order receipts and printable invoice details.
 * 10. POST /returns -> Submits RMA return requests directly to backend DB.
 * 11. Graceful offline fallback: If the backend server is temporarily restarted or offline,
 *     it seamlessly falls back to cached data without crashing!
 */

import { emitDataSync } from '../../context/DataSyncContext';

// Resolve backend API URL (defaults to port 3001 or Vite proxy)
const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Generic HTTP request helper with dual fallback (Direct -> Proxy -> Local).
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
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
  } catch (err) {
    // If direct port 3001 connection failed, try relative /api proxy (Vite dev server)
    if (API_BASE_URL.startsWith('http://localhost:3001')) {
      try {
        const proxyResponse = await fetch(`/api${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
          ...options,
        });
        if (proxyResponse.ok) {
          const contentType = proxyResponse.headers.get('content-type') || '';
          return contentType.includes('application/json')
            ? await proxyResponse.json()
            : await proxyResponse.text();
        }
      } catch (_proxyErr) {}
    }
    throw err;
  }
}

function getCustomerLookup(customer = '') {
  if (customer) return String(customer).trim();
  const session = getLocalSession();
  if (!session) return '';
  const role = String(session.role || '').toLowerCase();
  if (role && role !== 'consumer' && role !== 'customer') {
    return '';
  }
  return String(session.name || session.email || session.id || '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRODUCTS & CATALOG (Customer Facing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the product catalog from the backend, optionally filtered by physical store branch.
 */
export async function fetchProducts(storeId = '') {
  try {
    const endpoint = storeId ? `/products?storeId=${encodeURIComponent(storeId)}` : '/products';
    const data = await apiRequest(endpoint);
    if (Array.isArray(data)) {
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

  return [];
}

/**
 * Fetches a single product by SKU from the backend.
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
 * Fetches verified customer star ratings and average breakdown for a product from the backend.
 */
export async function fetchRatingSummary(sku) {
  const emptySummary = { avg: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  if (!sku) return emptySummary;
  try {
    const data = await apiRequest(`/products/sku/${encodeURIComponent(sku)}/rating-summary`);
    if (data && typeof data.avg === 'number') return data;
  } catch (_err) {}

  return emptySummary;
}

/**
 * Fetches verified customer reviews for a product from the backend.
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
 * Submits a new verified review & star rating for a product directly to the backend.
 */
export async function submitProductFeedback(sku, feedbackData) {
  // Sanitize payload to match backend CreateProductFeedbackDto strictly
  const dto = {
    sku: String(sku || '').trim(),
    productName: feedbackData.productName ? String(feedbackData.productName).trim() : undefined,
    customer: feedbackData.customer ? String(feedbackData.customer).trim() : 'Verified Customer',
    type: feedbackData.type ? String(feedbackData.type).trim() : 'Product Quality',
    rating: Math.max(1, Math.min(5, Number(feedbackData.rating) || 5)),
    comment: String(feedbackData.comment || '').trim(),
  };

  try {
    const res = await apiRequest(`/products/sku/${encodeURIComponent(sku)}/feedback`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    emitDataSync('products', { sku, dto });
    return res;
  } catch (err) {
    console.warn('Backend feedback offline, saving locally:', err.message);
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    if (!Array.isArray(state.feedback)) state.feedback = [];
    const item = {
      id: `fb-${Date.now()}`,
      sku,
      ...dto,
      date: new Date().toISOString(),
    };
    state.feedback.unshift(item);
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
    emitDataSync('products', { sku, dto });
    return item;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STORES & PHYSICAL LOCATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all physical store fulfillment centers from the backend.
 */
export async function fetchStores() {
  try {
    const data = await apiRequest('/stores');
    if (Array.isArray(data)) return data;
  } catch (_e) {}
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. IN-STORE PICKUP RESERVATIONS & HOLDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an in-store hold (reservation request) on the backend.
 */
export async function createReservationRequest(payload) {
  // Sanitize payload to match backend CreateReservationRequestDto strictly
  const dto = {
    sku: String(payload.sku || '').trim(),
    qty: Math.max(1, Number(payload.qty) || 1),
    customer: payload.customer ? String(payload.customer).trim() : undefined,
    customerEmail: payload.customerEmail ? String(payload.customerEmail).trim() : undefined,
    customerId: payload.customerId ? String(payload.customerId).trim() : undefined,
    storeId: String(payload.storeId || 's1').trim(),
    store: payload.store ? String(payload.store).trim() : undefined,
    paymentMethod: String(payload.paymentMethod || 'Cash').trim(),
  };

  try {
    const res = await apiRequest('/reservations/requests', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    emitDataSync('transactions', res);
    emitDataSync('inventory', res);
    return res;
  } catch (err) {
    console.warn('Backend /reservations/requests offline, saving locally:', err.message);
    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created = {
      requestId,
      ...dto,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const local = JSON.parse(localStorage.getItem('ims_reservation_requests') || '[]');
    local.unshift(created);
    localStorage.setItem('ims_reservation_requests', JSON.stringify(local));
    emitDataSync('transactions', created);
    emitDataSync('inventory', created);
    return created;
  }
}

/**
 * Fetches customer reservation requests from the backend.
 */
export async function fetchReservationRequests(status = '', customer = '') {
  try {
    let query = '';
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const customerLookup = getCustomerLookup(customer);
    if (customerLookup) params.set('customer', customerLookup);
    const qStr = params.toString();
    if (qStr) query = `?${qStr}`;

    const data = await apiRequest(`/reservations/requests${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  try {
    const local = JSON.parse(localStorage.getItem('ims_reservation_requests') || '[]');
    const customerLookup = getCustomerLookup(customer).toLowerCase();
    return local.filter((r) => {
      const matchesStatus = !status || String(r.status || '').toLowerCase() === String(status).toLowerCase();
      const matchesCustomer =
        !customerLookup ||
        [r.customer, r.customerEmail, r.customerId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase() === customerLookup);
      return matchesStatus && matchesCustomer;
    });
  } catch (_e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRANSACTIONS & ORDER INVOICES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a direct sales transaction order on the backend.
 */
export async function createTransaction(payload) {
  // Sanitize payload to match CreateTransactionDto strictly
  const dto = {
    customer: String(payload.customer || 'Walk-in Customer').trim(),
    customerEmail: payload.customerEmail || undefined,
    customerId: payload.customerId || undefined,
    store: String(payload.store || 'Downtown Store').trim(),
    storeId: payload.storeId ? String(payload.storeId).trim() : undefined,
    paymentMethod: String(payload.paymentMethod || 'Card').trim(),
    items: (payload.items || []).map((it) => ({
      sku: String(it.sku || '').trim(),
      name: String(it.name || 'Product').trim(),
      quantity: Math.max(1, Number(it.quantity || it.qty || 1)),
      price: Number(it.price || 0),
      total: Number(it.total || (Number(it.price || 0) * Number(it.quantity || it.qty || 1))),
      isReserved: Boolean(it.isReserved),
      requestIds: Array.isArray(it.requestIds) ? it.requestIds : undefined,
    })),
    shipping: payload.shipping !== undefined ? Number(payload.shipping) : undefined,
    tax: payload.tax !== undefined ? Number(payload.tax) : undefined,
    coupon: payload.coupon !== undefined ? Number(payload.coupon) : undefined,
    discount: payload.discount !== undefined ? Number(payload.discount) : undefined,
    status: payload.status || 'Delivered',
  };

  try {
    const res = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    emitDataSync('transactions', res);
    emitDataSync('inventory', res);
    emitDataSync('revenue', res);
    return res;
  } catch (err) {
    console.warn('Backend /transactions offline, saving locally:', err.message);
    const orderId = `ORD-${Date.now()}`;
    const created = {
      orderId,
      ...dto,
      timestamp: new Date().toISOString(),
    };
    const local = JSON.parse(localStorage.getItem('ims_transactions') || '[]');
    local.unshift(created);
    localStorage.setItem('ims_transactions', JSON.stringify(local));
    emitDataSync('transactions', created);
    emitDataSync('inventory', created);
    emitDataSync('revenue', created);
    return created;
  }
}

/**
 * Fetches transactions list from the backend.
 */
export async function fetchTransactions(customer = '') {
  try {
    const customerLookup = getCustomerLookup(customer);
    const query = customerLookup ? `?customer=${encodeURIComponent(customerLookup)}` : '';
    const data = await apiRequest(`/transactions${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  try {
    const customerLookup = getCustomerLookup(customer).toLowerCase();
    const transactions = JSON.parse(localStorage.getItem('ims_transactions') || '[]');
    return customerLookup
      ? transactions.filter((transaction) =>
          [transaction.customer, transaction.customerEmail, transaction.customerId]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase() === customerLookup)
        )
      : transactions;
  } catch (_e) {
    return [];
  }
}

/**
 * Fetches a single transaction order by its Order ID from the backend.
 */
export async function fetchTransactionByOrderId(orderId) {
  if (!orderId) return null;
  try {
    const customerLookup = getCustomerLookup();
    const query = customerLookup ? `?customer=${encodeURIComponent(customerLookup)}` : '';
    const data = await apiRequest(`/transactions/${encodeURIComponent(orderId)}${query}`);
    if (data) return data;
  } catch (_e) {}

  const local = JSON.parse(localStorage.getItem('ims_transactions') || '[]');
  const customerLookup = getCustomerLookup().toLowerCase();
  return (
    local.find(
      (transaction) =>
        transaction.orderId === orderId &&
        (!customerLookup ||
          [transaction.customer, transaction.customerEmail, transaction.customerId]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase() === customerLookup))
    ) || null
  );
}

/**
 * Fetches purchased products summary from the backend for the order history view.
 */
export async function fetchPurchasedProducts(customer = '') {
  const customerLookup = getCustomerLookup(customer);
  if (!customerLookup && !customer) {
    return [];
  }

  const target = customerLookup || customer;
  try {
    const data = await apiRequest(`/transactions/purchased-products?customer=${encodeURIComponent(target)}`);
    if (Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        orderId: item.lastOrderId || item.orderId || '',
      }));
    }
  } catch (_e) {}

  const orders = await fetchTransactions(target);
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
 * Submits an RMA return request directly to the backend.
 */
export async function createReturnRequest(payload) {
  // Sanitize payload to match backend CreateReturnDto strictly
  const dto = {
    orderId: payload.orderId ? String(payload.orderId).trim() : undefined,
    customer: payload.customer ? String(payload.customer).trim() : undefined,
    customerId: payload.customerId ? String(payload.customerId).trim() : undefined,
    email: payload.email || payload.customerEmail ? String(payload.email || payload.customerEmail).trim() : undefined,
    sku: String(payload.sku || '').trim(),
    productName: String(payload.productName || payload.product || 'Product').trim(),
    product: String(payload.product || payload.productName || 'Product').trim(),
    productImg: payload.productImg || undefined,
    emoji: payload.emoji || undefined,
    reason: payload.reason ? String(payload.reason).trim() : 'Defective / Not Working',
    condition: payload.condition ? String(payload.condition).trim() : 'Opened but Unused',
    refundMethod: payload.refundMethod || payload.resolution || payload.method || 'Refund',
    method: payload.refundMethod || payload.resolution || payload.method || 'Refund',
    notes: payload.notes || payload.conditionNotes || '',
    amount: Number(payload.amount || 0),
    priority: payload.priority || 'Medium',
    storeId: payload.storeId ? String(payload.storeId).trim() : undefined,
    store: payload.store ? String(payload.store).trim() : undefined,
    source: 'customer',
  };

  try {
    return await apiRequest('/returns', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  } catch (err) {
    console.warn('Backend /returns offline or error, saving locally:', err.message);
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    if (!Array.isArray(state.returns)) state.returns = [];
    const created = {
      id: `RET-${Date.now()}`,
      ...dto,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    state.returns.unshift(created);
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));
    return created;
  }
}

/**
 * Fetches customer return requests from the backend.
 */
export async function fetchReturns(customer = '') {
  try {
    const customerLookup = getCustomerLookup(customer);
    const query = customerLookup ? `?customer=${encodeURIComponent(customerLookup)}` : '';
    const data = await apiRequest(`/returns${query}`);
    if (Array.isArray(data)) return data;
  } catch (_e) {}

  try {
    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    return Array.isArray(state.returns) ? state.returns : [];
  } catch (_e) {
    return [];
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
