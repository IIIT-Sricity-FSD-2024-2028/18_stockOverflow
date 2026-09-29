/**
 * api_admin.js - Centralized API Service for React Admin Frontend
 * 
 * Provides communication with backend administrative endpoints at http://localhost:3001/api.
 * Falls back to local storage and mockData_admin.js when backend is unreachable.
 */

import {
  ADMIN_DASHBOARD_STATS,
  INITIAL_ADMIN_USERS,
  INITIAL_ROLES_PERMISSIONS,
  REVENUE_LEDGER,
  STORES_DATA
} from '../data/mockData_admin';

const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : 'http://localhost:3001/api';

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

export async function fetchAdminDashboardStats() {
  try {
    return await apiRequest('/admin/stats');
  } catch (_err) {
    return ADMIN_DASHBOARD_STATS;
  }
}

export async function fetchAdminUsers() {
  try {
    return await apiRequest('/admin/users');
  } catch (_err) {
    return INITIAL_ADMIN_USERS;
  }
}

export async function fetchAdminRoles() {
  try {
    return await apiRequest('/admin/roles');
  } catch (_err) {
    return INITIAL_ROLES_PERMISSIONS;
  }
}

export async function fetchAdminStores() {
  try {
    return await apiRequest('/stores');
  } catch (_err) {
    return STORES_DATA;
  }
}

export async function fetchRevenueLedger() {
  try {
    return await apiRequest('/admin/revenue/ledger');
  } catch (_err) {
    return REVENUE_LEDGER;
  }
}
