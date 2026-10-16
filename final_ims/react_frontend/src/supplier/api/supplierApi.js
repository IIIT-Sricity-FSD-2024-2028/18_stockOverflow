// Supplier API client – mirrors the vanilla frontend's LANDING_API_BASE & dashboard logic
const API_BASE = '/api';

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('so_session') || 'null');
  } catch {
    return null;
  }
}

export function getApiBase() {
  if (window.IMS_API_BASE_URL) return window.IMS_API_BASE_URL;
  if (window.location && window.location.protocol !== 'file:' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
}

export async function supplierRequest(path, options = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options?.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options?.headers || {}) };

  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (response.status === 204) return null;
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    if (Array.isArray(payload?.message)) {
      throw new Error(payload.message.join(', '));
    }
    throw new Error(payload?.message || 'Request failed');
  }
  return payload;
}

// ── Supplier Storage & Session ──

export function readSupplierId() {
  try {
    return localStorage.getItem('supplier-module-current-supplier-id') || '';
  } catch {
    return '';
  }
}

export function writeSupplierId(id) {
  try {
    if (id) localStorage.setItem('supplier-module-current-supplier-id', id);
    else localStorage.removeItem('supplier-module-current-supplier-id');
  } catch {}
}

export function readSession() {
  return getSession();
}

export function writeSession(session) {
  try {
    localStorage.setItem('so_session', JSON.stringify(session));
  } catch {}
  return session;
}

// ── API Operations ──

export async function createSupplierSetup(payload) {
  return supplierRequest('/suppliers/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSupplier(id, payload) {
  return supplierRequest(`/suppliers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getSupplier(id) {
  return supplierRequest(`/suppliers/${encodeURIComponent(id)}`);
}

export async function getSupplierByEmail(email) {
  return supplierRequest(`/suppliers/by-email/${encodeURIComponent(email)}`);
}

export async function fetchRetailers() {
  return supplierRequest('/retailers');
}

export async function fetchPurchaseOrders() {
  return supplierRequest('/purchase-orders');
}

export async function updatePurchaseOrder(orderId, payload) {
  return supplierRequest(`/purchase-orders/${encodeURIComponent(orderId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function fetchSupplierDocuments(supplierId) {
  return supplierRequest(`/suppliers/${encodeURIComponent(supplierId)}/documents`);
}

export async function deleteSupplierDocument(supplierId, docId) {
  return supplierRequest(`/suppliers/${encodeURIComponent(supplierId)}/documents/${encodeURIComponent(docId)}`, {
    method: 'DELETE',
  });
}

export async function uploadSupplierDocument(supplierId, formData) {
  return supplierRequest(`/suppliers/${encodeURIComponent(supplierId)}/documents`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateUser(userId, payload) {
  return supplierRequest(`/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function buildSupplierProfileSummary(record, session) {
  const business = record?.business || {};
  const primaryContact = record?.primaryContact || {};
  return {
    businessName: business.companyName || session?.name || '',
    businessEmail: business.businessEmail || session?.email || '',
    businessPhone: business.phoneNumber || '',
    supplierCode: business.supplierCode || '',
    address: business.businessAddress || '',
    website: business.website || '',
    businessType: business.businessType || '',
    currency: business.currency || 'INR',
    primaryCategory: business.primaryCategory || '',
    paymentTerms: business.paymentTerms || '',
    sellingType: business.sellingType || '',
    description: business.description || '',
    state: business.state || '',
    ownerName: primaryContact.fullName || session?.name || '',
    ownerTitle: primaryContact.designation || '',
    ownerEmail: primaryContact.directEmail || business.businessEmail || session?.email || '',
    profileStatus: record?.profileStatus || 'active',
    retailers: Array.isArray(record?.retailers) ? record.retailers : [],
    productCount: Array.isArray(record?.products) ? record.products.length : 0,
  };
}
