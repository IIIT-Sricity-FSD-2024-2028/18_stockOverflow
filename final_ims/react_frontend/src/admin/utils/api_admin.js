/**
 * api_admin.js - Real Backend API Service for React Admin Frontend
 * 
 * Directly connects to the NestJS administrative endpoints via Vite proxy (/api)
 * or window.IMS_API_BASE_URL (http://localhost:3001/api).
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import { emitDataSync } from '../../context/DataSyncContext';

const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : '/api';

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

// ─── 1. Dashboard & Reports ──────────────────────────────────────────────────
export async function fetchAdminDashboardStats() {
  return await apiRequest('/admin/dashboard/stats');
}

export async function fetchReportsSummary() {
  return await apiRequest('/admin/reports/summary');
}

// ─── 2. User Management (CRUD) ───────────────────────────────────────────────
export async function fetchAdminUsers() {
  return await apiRequest('/admin/users');
}

export async function fetchAdminUserById(id) {
  return await apiRequest(`/admin/users/${id}`);
}

export async function createAdminUser(userData) {
  const res = await apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  emitDataSync('users', res);
  return res;
}

export async function updateAdminUser(id, userData) {
  const res = await apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  emitDataSync('users', res);
  return res;
}

export async function deleteAdminUser(id) {
  const res = await apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  });
  emitDataSync('users', { id });
  return res;
}

// ─── 3. Role & Permission Management (CRUD) ──────────────────────────────────
export async function fetchAdminRoles() {
  return await apiRequest('/admin/roles');
}

export async function fetchAdminRoleById(id) {
  return await apiRequest(`/admin/roles/${id}`);
}

export async function createAdminRole(roleData) {
  const res = await apiRequest('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  });
  emitDataSync('users', res);
  return res;
}

export async function updateAdminRole(id, roleData) {
  const res = await apiRequest(`/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  });
  emitDataSync('users', res);
  return res;
}

export async function deleteAdminRole(id) {
  const res = await apiRequest(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
  emitDataSync('users', { id });
  return res;
}

// ─── 4. Store Branch Management (CRUD) ───────────────────────────────────────
export async function fetchAdminStores() {
  return await apiRequest('/admin/stores');
}

export async function fetchAdminStoreById(id) {
  return await apiRequest(`/admin/stores/${id}`);
}

export async function createAdminStore(storeData) {
  const res = await apiRequest('/admin/stores', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
  emitDataSync('stores', res);
  return res;
}

export async function updateAdminStore(id, storeData) {
  const res = await apiRequest(`/admin/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
  emitDataSync('stores', res);
  return res;
}

export async function deleteAdminStore(id) {
  const res = await apiRequest(`/admin/stores/${id}`, {
    method: 'DELETE',
  });
  emitDataSync('stores', { id });
  return res;
}

// ─── 5. Platform Revenue & Monetization ───────────────────────────────────────
export async function fetchPlatformRevenueSummary(retailerId) {
  const qs = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : '';
  return await apiRequest(`/platform-revenue/summary${qs}`);
}

export async function fetchPlatformCommissions(retailerId, limit = 50) {
  const params = new URLSearchParams();
  if (retailerId) params.set('retailerId', retailerId);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return await apiRequest(`/platform-revenue/commissions${qs ? `?${qs}` : ''}`);
}

export async function fetchPlatformSubscriptions(userId) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return await apiRequest(`/platform-revenue/subscriptions${qs}`);
}

export async function fetchPricingTiers(role) {
  const qs = role ? `?role=${encodeURIComponent(role)}` : '';
  return await apiRequest(`/platform-revenue/tiers${qs}`);
}

export async function fetchRevenueLedger() {
  return await fetchPlatformCommissions();
}

// ─── 6. System Settings ──────────────────────────────────────────────────────
export async function fetchAdminSettings() {
  return await apiRequest('/admin/settings');
}

export async function updateAdminSettings(settingsData) {
  return await apiRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
}

// ─── 7. Store-Scoped Catalog & Transactions ──────────────────────────────────
export async function fetchAdminProducts(storeId, retailerId) {
  const params = new URLSearchParams();
  if (storeId) params.set('storeId', storeId);
  if (retailerId) params.set('retailerId', retailerId);
  const qs = params.toString();
  return await apiRequest(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchAdminTransactions(storeId, retailerId) {
  const params = new URLSearchParams();
  if (storeId) params.set('storeId', storeId);
  if (retailerId) params.set('retailerId', retailerId);
  const qs = params.toString();
  return await apiRequest(`/transactions${qs ? `?${qs}` : ''}`);
}

