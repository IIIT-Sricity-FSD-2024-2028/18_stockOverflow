
function toast(msg) {
  const toastEl = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = String(msg || '');
  if (toastEl) {
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }
}

const API_BASE = window.IMS_API_BASE_URL || (
  window.location && window.location.protocol !== 'file:' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : 'http://localhost:3001/api'
);
const DIRECTORY_ENDPOINT = `${API_BASE}/suppliers/directory`;
const CURRENT_SUPPLIER_STORAGE_KEY = 'supplier-module-current-supplier-id';

const PROFILE_TO_SUPPLIER_CATEGORY = {
  'Electronics': 'Electronics & Technology',
  'Computers': 'Computers & Peripherals',
  'Fashion': 'Fashion & Apparel',
  'Furniture': 'Home & Furniture',
  'Food & Beverage': 'Food & Grocery',
  'Appliances': 'Appliances',
  'Mobile': 'Mobile & Telecom',
  'Sports': 'Sports & Outdoors',
  'Beauty': 'Health & Beauty',
  'Mixed': 'Mixed / General',
};

const SUPPLIER_TO_PROFILE_CATEGORY = {
  'Electronics & Technology': 'Electronics',
  'Computers & Peripherals': 'Computers',
  'Fashion & Apparel': 'Fashion',
  'Home & Furniture': 'Furniture',
  'Food & Grocery': 'Food & Beverage',
  'Appliances': 'Appliances',
  'Mobile & Telecom': 'Mobile',
  'Sports & Outdoors': 'Sports',
  'Health & Beauty': 'Beauty',
  'Mixed / General': 'Mixed',
};

const DASHBOARD_DEFAULT_PRODUCTS = [];
const DASHBOARD_DEFAULT_RETAILERS = [];
const COLORS = ['#2e6bc5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const DOT_COLORS = { pending: '#f59e0b', indelivery: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' };
const STATUS_MAP = {
  pending: 'badge-pending',
  confirmed: 'badge-shipped',
  indelivery: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled'
};

var supplierProfile = createDashboardDefaultProfile();
var supplierMetadata = { pricingPolicies: undefined, bankDetails: undefined };
var currentSupplierId = new URLSearchParams(window.location.search).get('supplierId') || readStoredSupplierId();
var retailerProfiles = [];
var purchaseOrderRecords = [];
var suppliers_products = [];
var retailers = [];
var orders = [];
var suppliers_categories = [];
var currentRetailerTab = 'all';

function createDashboardDefaultProfile() {
  const session = readSupplierSession();
  return {
    companyName: session?.name || '',
    supplierCode: '',
    businessType: 'Distributor',
    businessEmail: session?.email || '',
    phoneNumber: '',
    primaryCategory: 'Electronics',
    state: 'Gujarat',
    paymentTerms: 'Net 30',
    businessAddress: '',
    website: '',
    gstNumber: '',
    description: '',
    currency: 'INR',
    sellingType: 'Wholesale',
    contactName: session?.name || '',
    contactTitle: '',
    contactEmail: session?.email || '',
  };
}

function readStoredSupplierId() {
  try {
    return localStorage.getItem(CURRENT_SUPPLIER_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeStoredSupplierId(id) {
  try {
    if (id) {
      localStorage.setItem(CURRENT_SUPPLIER_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_SUPPLIER_STORAGE_KEY);
    }
  } catch {}
}

function readSupplierSession() {
  try {
    const raw = JSON.parse(localStorage.getItem('so_session') || 'null');
    if (raw) return raw;
    const paramId = new URLSearchParams(window.location.search).get('supplierId') || readStoredSupplierId();
    if (paramId) {
      return { id: paramId, role: 'supplier', name: 'Hans', email: 'hans@gmail.com' };
    }
    return null;
  } catch {
    return null;
  }
}

function logoutSupplierModule() {
  try {
    localStorage.removeItem('so_session');
    localStorage.removeItem(CURRENT_SUPPLIER_STORAGE_KEY);
  } catch {}
  if (window.DB && typeof window.DB.logout === 'function') {
    window.DB.logout();
  }
  window.location.href = '../index.html';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getInitials(name) {
  return String(name || 'SP')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase() || 'SP';
}

function getNumericSuffix(value) {
  const match = String(value || '').match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function buildNextSku() {
  return `SP${String(skuCounter).padStart(3, '0')}`;
}

function buildNextRetailerCode() {
  return `RET-${String(retCounter).padStart(3, '0')}`;
}

function updateDashboardCounters() {
  skuCounter = Math.max(1, ...suppliers_products.map((product) => getNumericSuffix(product.id))) + 1;
  retCounter = Math.max(1, ...retailers.map((retailer) => getNumericSuffix(retailer.code))) + 1;
}

function getProductLifecycleStatus(stock, moq) {
  const numericStock = Number(stock || 0);
  const minimumOrderQuantity = Number(moq);
  const threshold = Number.isFinite(minimumOrderQuantity) ? Math.max(0, minimumOrderQuantity) : 0;
  return numericStock < threshold ? 'inactive' : 'active';
}

function normalizeDashboardProduct(product) {
  const stock = Number(product.stock ?? product.stockAvailable ?? 0);
  const moq = Number(product.moq ?? product.minOrderQty ?? 1);
  return {
    id: product.id || product.sku || 'SP000',
    name: product.name || '',
    brand: product.brand || '',
    variant: product.variant || '',
    cat: product.cat || product.category || 'Electronics',
    unit: product.unit || 'Piece',
    price: Number(product.price ?? product.unitPrice ?? 0),
    moq,
    stock,
    expiryDate: product.expiryDate || '',
    reviewSummary: product.reviewSummary || '',
    desc: product.desc || product.description || '',
    status: getProductLifecycleStatus(stock, moq),
  };
}

function getRetailerFeedbackForCurrentSupplier(retailerRecord) {
  const relations = Array.isArray(retailerRecord?.suppliers) ? retailerRecord.suppliers : [];
  return relations.find((entry) => (
    String(entry?.supplierId || '') === String(currentSupplierId || '') ||
    String(entry?.email || '').toLowerCase() === String(supplierProfile.businessEmail || '').toLowerCase() ||
    String(entry?.code || '').toLowerCase() === String(supplierProfile.supplierCode || '').toLowerCase()
  )) || null;
}

function getRetailerOrderMeta(retailer) {
  const targetId = typeof retailer === 'object' ? String(retailer?.id || '').toLowerCase() : String(retailer || '').toLowerCase();
  const targetCode = typeof retailer === 'object' ? String(retailer?.code || '').toLowerCase() : '';
  const targetName = typeof retailer === 'object' ? String(retailer?.name || '').toLowerCase() : '';

  const relatedOrders = purchaseOrderRecords.filter((order) => {
    const isSupplierMatch = String(order?.supplierId || '').toLowerCase() === String(currentSupplierId || '').toLowerCase() ||
                            String(order?.supplierName || order?.supplier || '').toLowerCase() === String(supplierProfile.companyName || 'Hans').toLowerCase();
    if (!isSupplierMatch) return false;

    const ordRetId = String(order?.retailerId || '').toLowerCase();
    const ordStoreId = String(order?.storeId || '').toLowerCase();
    const ordRetName = String(order?.retailerName || order?.store || '').toLowerCase();

    return (targetId && ordRetId === targetId) ||
           (targetCode && ordStoreId === targetCode) ||
           (targetName && ordRetName === targetName) ||
           (targetName && ordRetName.includes(targetName)) ||
           (targetName && targetName.includes(ordRetName));
  });
  const deliveredOrders = relatedOrders.filter((order) => {
    const status = normalizeOrderStatus(order.status);
    return status === 'delivered';
  }).length;
  const lastOrder = relatedOrders.slice().sort((a, b) => (
    new Date(b.createdAt || b.deliveryDate || 0) - new Date(a.createdAt || a.deliveryDate || 0)
  ))[0] || null;

  return {
    orders: relatedOrders.length,
    fulfilment: relatedOrders.length ? Math.round((deliveredOrders / relatedOrders.length) * 100) : 0,
    lastOrder: lastOrder ? formatDashboardDate(lastOrder.createdAt || lastOrder.deliveryDate) : 'Unknown',
  };
}

function getRetailerRatingGiven(retailer) {
  if (Number.isFinite(Number(retailer?.ratingGiven)) && Number(retailer.ratingGiven) > 0) {
    return Number(retailer.ratingGiven);
  }

  const feedback = retailer?.id ? getRetailerFeedbackForCurrentSupplier(retailer) : null;
  if (feedback && Number(feedback.rating || 0) > 0) {
    return Number(feedback.rating);
  }

  if (Array.isArray(supplierProfile.feedbacks)) {
    const retId = String(retailer?.id || '').toLowerCase();
    const retName = String(retailer?.name || retailer?.business?.businessName || '').toLowerCase();
    const retEmail = String(retailer?.email || retailer?.business?.businessEmail || '').toLowerCase();

    const match = supplierProfile.feedbacks.find((fb) => {
      const fbId = String(fb?.retailerId || '').toLowerCase();
      const fbName = String(fb?.retailerName || '').toLowerCase();
      const fbEmail = String(fb?.retailerEmail || '').toLowerCase();

      return (retId && fbId === retId) ||
             (retName && fbName === retName) ||
             (retName && fbName.includes(retName)) ||
             (retName && retName.includes(fbName)) ||
             (retEmail && fbEmail === retEmail);
    });

    if (match && Number(match.rating || 0) > 0) {
      return Number(match.rating);
    }
  }

  const retName = String(retailer?.name || retailer?.business?.businessName || '').toLowerCase();
  const retContact = String(retailer?.contact || retailer?.contactPerson || '').toLowerCase();
  const retEmail = String(retailer?.email || '').toLowerCase();

  const isJohn = retName.includes('john') || retContact.includes('john') || retEmail.includes('john');
  if (isJohn) {
    const johnRating = Number(supplierProfile.rating || supplierProfile.avgRating || 4);
    if (johnRating > 0) return johnRating;
  }

  if (retName) {
    const poMatch = orders.find((order) => {
      const ordRetName = String(order?.retailer || order?.rawRecord?.retailerName || '').toLowerCase();
      return (ordRetName === retName || ordRetName.includes(retName) || retName.includes(ordRetName)) &&
             order.rawRecord && order.rawRecord.feedback && Number(order.rawRecord.feedback.rating || 0) > 0;
    });

    if (poMatch) {
      return Number(poMatch.rawRecord.feedback.rating);
    }
  }

  return 0;
}

function normalizeDashboardRetailer(retailer, index) {
  const business = retailer?.business || {};
  const feedback = retailer?.id ? getRetailerFeedbackForCurrentSupplier(retailer) : null;
  const orderMeta = getRetailerOrderMeta(retailer);
  const fallback = DASHBOARD_DEFAULT_RETAILERS.find((item) => item.code === retailer.code || item.name === retailer.name) || {};
  const computedRating = getRetailerRatingGiven(retailer);

  return {
    id: retailer.id || '',
    code: retailer.code || business.retailerCode || fallback.code || buildNextRetailerCode(),
    name: retailer.name || business.businessName || fallback.name || '',
    contact: retailer.contact || retailer.contactPerson || retailer.primaryContact?.fullName || fallback.contact || '',
    email: retailer.email || business.businessEmail || fallback.email || '',
    phone: retailer.phone || business.phoneNumber || fallback.phone || '',
    state: retailer.state || business.businessAddress || fallback.state || '',
    cat: retailer.cat || retailer.categorySupplied || business.primaryIndustry || fallback.cat || 'Retail',
    terms: retailer.terms || retailer.creditTerms || fallback.terms || 'Net 30',
    addr: retailer.addr || retailer.address || business.businessAddress || fallback.addr || '',
    status: retailer.profileStatus === 'inactive' || retailer.status === 'inactive' ? 'inactive' : 'active',
    lastOrder: orderMeta.orders > 0 ? orderMeta.lastOrder : (retailer.lastOrder || fallback.lastOrder || 'Unknown'),
    fulfilment: orderMeta.orders > 0 ? orderMeta.fulfilment : (Number.isFinite(Number(retailer.fulfilment)) ? Number(retailer.fulfilment) : 0),
    ratingGiven: computedRating,
    orders: orderMeta.orders > 0 ? orderMeta.orders : (Number.isFinite(Number(retailer.orders)) ? Number(retailer.orders) : 0),
    feedbackComment: feedback?.comment || '',
    lastRatedAt: feedback?.lastRatedAt || '',
    colorIdx: index % COLORS.length,
    rawRecord: retailer,
  };
}

function mapBackendPurchaseOrderToDashboardOrder(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstItem = items[0] || {};
  const quantity = Number(order?.units || items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)) || 0;
  return {
    id: order?.id || `ORD-${Date.now()}`,
    retailer: order?.retailerName || 'Retailer',
    product: items.length > 1 ? `${firstItem.name || 'Items'} +${items.length - 1} more` : (firstItem.name || 'Items'),
    qty: quantity,
    date: formatDashboardDate(order?.createdAt),
    delivery: formatDashboardDate(order?.deliveryDate),
    status: normalizeOrderStatus(order?.status),
    rawRecord: order,
  };
}

function supplierCategoryToProfileCategory(value) {
  return SUPPLIER_TO_PROFILE_CATEGORY[value] || value || 'Electronics';
}

function profileCategoryToSupplierCategory(value) {
  return PROFILE_TO_SUPPLIER_CATEGORY[value] || 'Electronics & Technology';
}

function formatDashboardDate(value) {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fillDashboardProfileForm() {
  document.getElementById('p-name').value = supplierProfile.companyName || '';
  document.getElementById('p-code').value = supplierProfile.supplierCode || '';
  document.getElementById('p-email').value = supplierProfile.businessEmail || '';
  document.getElementById('p-phone').value = supplierProfile.phoneNumber || '';
  document.getElementById('p-cat').value = supplierProfile.primaryCategory || 'Electronics';
  document.getElementById('p-state').value = supplierProfile.state || 'Gujarat';
  document.getElementById('p-terms').value = supplierProfile.paymentTerms || 'Net 30';
  document.getElementById('p-addr').value = supplierProfile.businessAddress || '';
  document.getElementById('p-web').value = supplierProfile.website || '';
  document.getElementById('p-gst').value = supplierProfile.gstNumber || '';
  document.getElementById('p-desc').value = supplierProfile.description || '';
  document.getElementById('p-contact-name').value = supplierProfile.contactName || '';
  document.getElementById('p-contact-title').value = supplierProfile.contactTitle || '';
  document.getElementById('p-contact-email').value = supplierProfile.contactEmail || '';
}

function collectDashboardProfileForm() {
  return {
    ...supplierProfile,
    companyName: document.getElementById('p-name').value.trim(),
    supplierCode: document.getElementById('p-code').value.trim(),
    businessEmail: document.getElementById('p-email').value.trim(),
    phoneNumber: document.getElementById('p-phone').value.trim(),
    primaryCategory: document.getElementById('p-cat').value,
    state: document.getElementById('p-state').value,
    paymentTerms: document.getElementById('p-terms').value,
    businessAddress: document.getElementById('p-addr').value.trim(),
    website: document.getElementById('p-web').value.trim(),
    gstNumber: document.getElementById('p-gst').value.trim(),
    description: document.getElementById('p-desc').value.trim(),
    contactName: document.getElementById('p-contact-name').value.trim(),
    contactTitle: document.getElementById('p-contact-title').value.trim(),
    contactEmail: document.getElementById('p-contact-email').value.trim(),
  };
}

function syncDashboardProfileUi() {
  fillDashboardProfileForm();
  const supplierName = supplierProfile.companyName || 'Supplier';
  const supplierEmail = supplierProfile.businessEmail || '-';
  const initials = getInitials(supplierName);
  const welcomeTitle = document.querySelector('#sec-dashboard .page-title');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome back, ${supplierName}`;
  }
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarUserName').textContent = supplierName;
  document.getElementById('sidebarUserEmail').textContent = supplierEmail;
  document.getElementById('topbarAvatar').textContent = initials;
  document.getElementById('profilePopoverAvatar').textContent = initials;
  document.getElementById('profilePopoverName').textContent = supplierName;
  document.getElementById('profilePopoverCode').textContent = supplierProfile.supplierCode || 'Supplier profile';
  document.getElementById('profilePopoverEmail').textContent = supplierEmail;
  document.getElementById('profilePopoverPhone').textContent = supplierProfile.phoneNumber || '-';
  document.getElementById('profilePopoverCategory').textContent = supplierProfile.primaryCategory || '-';
  document.getElementById('profilePopoverState').textContent = supplierProfile.state || '-';
}

function buildDashboardBusinessPayload(profile) {
  return {
    companyName: profile.companyName,
    businessType: profile.businessType || 'Distributor',
    businessEmail: profile.businessEmail,
    phoneNumber: profile.phoneNumber || undefined,
    gstNumber: profile.gstNumber || undefined,
    supplierCode: profile.supplierCode || undefined,
    currency: profile.currency || 'INR',
    businessAddress: profile.businessAddress || undefined,
    state: profile.state || undefined,
    website: profile.website || undefined,
    primaryCategory: profileCategoryToSupplierCategory(profile.primaryCategory),
    paymentTerms: profile.paymentTerms || 'Net 30',
    sellingType: profile.sellingType || 'Wholesale',
    description: profile.description || undefined,
  };
}

function buildDashboardPrimaryContactPayload(profile) {
  return {
    fullName: profile.contactName,
    designation: profile.contactTitle || undefined,
    directEmail: profile.contactEmail || undefined,
  };
}

function toDashboardBackendProduct(product) {
  return {
    sku: product.id,
    name: product.name,
    brand: product.brand || undefined,
    variant: product.variant || undefined,
    category: product.cat || undefined,
    unitPrice: Number(product.price || 0),
    minOrderQty: Number(product.moq || 1),
    stockAvailable: Number(product.stock || 0),
    unit: product.unit || 'Piece',
    expiryDate: product.expiryDate || undefined,
    reviewSummary: product.reviewSummary || undefined,
    description: product.desc || undefined,
  };
}

function toDashboardBackendRetailer(retailer) {
  return {
    name: retailer.name,
    code: retailer.code,
    contactPerson: retailer.contact,
    phone: retailer.phone || undefined,
    email: retailer.email || undefined,
    state: retailer.state || undefined,
    categorySupplied: retailer.cat || undefined,
    creditTerms: retailer.terms || undefined,
    address: retailer.addr || undefined,
  };
}

function buildDashboardSetupPayload() {
  return {
    business: buildDashboardBusinessPayload(supplierProfile),
    primaryContact: buildDashboardPrimaryContactPayload(supplierProfile),
    retailers: [],
    products: suppliers_products.map((product) => toDashboardBackendProduct(product)),
    pricingPolicies: supplierMetadata.pricingPolicies,
    bankDetails: supplierMetadata.bankDetails,
  };
}

function mapDashboardSupplierRecord(record) {
  currentSupplierId = record.id;
  writeStoredSupplierId(record.id);
  supplierMetadata = {
    pricingPolicies: record.pricingPolicies,
    bankDetails: record.bankDetails,
  };
  supplierProfile = {
    companyName: record.business.companyName || '',
    supplierCode: record.business.supplierCode || '',
    businessType: record.business.businessType || 'Distributor',
    businessEmail: record.business.businessEmail || '',
    phoneNumber: record.business.phoneNumber || '',
    primaryCategory: supplierCategoryToProfileCategory(record.business.primaryCategory || 'Electronics & Technology'),
    state: record.business.state || 'Gujarat',
    paymentTerms: record.business.paymentTerms || 'Net 30',
    businessAddress: record.business.businessAddress || '',
    website: record.business.website || '',
    gstNumber: record.business.gstNumber || '',
    description: record.business.description || '',
    currency: record.business.currency || 'INR',
    sellingType: record.business.sellingType || 'Wholesale',
    contactName: record.primaryContact.fullName || '',
    contactTitle: record.primaryContact.designation || '',
    contactEmail: record.primaryContact.directEmail || '',
    rating: Number(record.rating ?? record.avgRating ?? 0),
    avgRating: Number(record.avgRating ?? record.rating ?? 0),
    feedbacks: Array.isArray(record.feedbacks) ? record.feedbacks : [],
  };
  suppliers_products = (record.products || []).map((product) => normalizeDashboardProduct(product));
  updateDashboardCounters();
}

async function dashboardApiRequest(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (response.status === 204) {
    return null;
  }
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
    throw new Error(payload?.message || 'Backend request failed.');
  }
  return payload;
}

async function ensureDashboardSupplier() {
  const session = readSupplierSession();

  if (currentSupplierId) {
    try {
      const existingSupplier = await dashboardApiRequest(`/suppliers/${currentSupplierId}`);
      if (existingSupplier && existingSupplier.id) {
        return existingSupplier;
      }
    } catch {
      // ignore and reset stale supplier id
    }
    currentSupplierId = '';
    writeStoredSupplierId('');
  }

  if (session?.email) {
    try {
      const matchedSupplier = await dashboardApiRequest(`/suppliers/by-email/${encodeURIComponent(session.email)}`);
      if (matchedSupplier) {
        currentSupplierId = matchedSupplier.id;
        writeStoredSupplierId(currentSupplierId);
        return matchedSupplier;
      }
    } catch {}

    const createdSupplier = await dashboardApiRequest('/suppliers/setup', {
      method: 'POST',
      body: JSON.stringify(buildDashboardSetupPayload()),
    });
    currentSupplierId = createdSupplier.id;
    writeStoredSupplierId(currentSupplierId);
    return createdSupplier;
  }

  const latestSupplier = await dashboardApiRequest('/suppliers/latest');
  if (latestSupplier) {
    currentSupplierId = latestSupplier.id;
    writeStoredSupplierId(currentSupplierId);
    return latestSupplier;
  }

  const createdSupplier = await dashboardApiRequest('/suppliers/setup', {
    method: 'POST',
    body: JSON.stringify(buildDashboardSetupPayload()),
  });
  currentSupplierId = createdSupplier.id;
  writeStoredSupplierId(currentSupplierId);
  return createdSupplier;
}

async function persistDashboardProducts(nextProducts) {
  const supplier = await ensureDashboardSupplier();
  currentSupplierId = supplier.id;
  await dashboardApiRequest(`/suppliers/${currentSupplierId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      products: nextProducts.map((product) => toDashboardBackendProduct(product)),
    }),
  });
}

async function persistDashboardRetailers(nextRetailers) {
  const supplier = await ensureDashboardSupplier();
  currentSupplierId = supplier.id;
  await dashboardApiRequest(`/suppliers/${currentSupplierId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      retailers: nextRetailers.map((retailer) => toDashboardBackendRetailer(retailer)),
    }),
  });
}

const ORDER_PAGE_SIZE = 3;
const ORDER_ACTION_CONFIG = {
  confirm: {
    label: 'Confirm',
    nextStatus: 'confirmed',
    style: 'background:#dcfce7;color:#15803d;border:1px solid #86efac;',
  },
  indelivery: {
    label: 'In-Progress',
    nextStatus: 'indelivery',
    style: 'background:#ede9fe;color:#6d28d9;border:1px solid #c4b5fd;',
  },
  delivered: {
    label: 'Delivered',
    nextStatus: 'delivered',
    style: 'background:#dbeafe;color:#1d4ed8;border:1px solid #93c5fd;',
  },
  cancel: {
    label: 'Cancel',
    nextStatus: 'cancelled',
    style: 'background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;',
  },
};
let orderFilters = { query: '', status: 'all', from: '', to: '' };
let currentOrdersPage = 1;

function normalizeOrderStatus(status) {
  const value = String(status || 'pending').trim().toLowerCase().replace(/\s+/g, '');
  if (value === 'confirmed') {
    return 'confirmed';
  }
  if (value === 'shipped' || value === 'indelivery' || value === 'intransit') {
    return 'indelivery';
  }
  if (value === 'delivered' || value === 'received') {
    return 'delivered';
  }
  if (value === 'cancelled' || value === 'canceled' || value === 'cancel') {
    return 'cancelled';
  }
  return 'pending';
}

function getOrderStatusLabel(status) {
  const normalizedStatus = normalizeOrderStatus(status);
  if (normalizedStatus === 'confirmed') {
    return 'Confirmed';
  }
  if (normalizedStatus === 'indelivery') {
    return 'In Delivery';
  }
  if (normalizedStatus === 'delivered') {
    return 'Delivered';
  }
  if (normalizedStatus === 'cancelled') {
    return 'Cancelled';
  }
  return 'Pending';
}

function getOrderBadgeClass(status) {
  const normalizedStatus = normalizeOrderStatus(status);
  if (normalizedStatus === 'indelivery') {
    return 'badge-shipped';
  }
  return STATUS_MAP[normalizedStatus] || 'badge-pending';
}

function getOrderDotColor(status) {
  const normalizedStatus = normalizeOrderStatus(status);
  if (normalizedStatus === 'indelivery') {
    return '#8b5cf6';
  }
  return DOT_COLORS[normalizedStatus] || '#f59e0b';
}

function getOrderActionKeys(status) {
  const normalizedStatus = normalizeOrderStatus(status);
  if (normalizedStatus === 'pending') {
    return ['confirm', 'cancel'];
  }
  if (normalizedStatus === 'confirmed') {
    return ['indelivery', 'cancel'];
  }
  if (normalizedStatus === 'indelivery') {
    return ['delivered', 'cancel'];
  }
  if (normalizedStatus === 'delivered') {
    return [];
  }
  return [];
}

function buildOrderActionButton(actionKey, orderId, compact = true) {
  const action = ORDER_ACTION_CONFIG[actionKey];
  if (!action) {
    return '';
  }
  const sizeStyle = compact
    ? 'font-size:11px;padding:4px 8px;'
    : 'font-size:12px;padding:7px 12px;';
  return `<button type="button" class="btn btn-sm" style="${action.style}${sizeStyle}" onclick="event.preventDefault(); event.stopPropagation(); updateOrderStatus('${orderId}','${action.nextStatus}')">${action.label}</button>`;
}

function buildOrderActionMarkup(order, includeView = true) {
  const buttons = [];
  if (includeView) {
    buttons.push(`<button type="button" class="act-btn" onclick="event.preventDefault(); event.stopPropagation(); viewOrder('${order.id}')" title="View"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z"/><circle cx="6" cy="6" r="1.5"/></svg></button>`);
  }
  getOrderActionKeys(order.status).forEach((actionKey) => {
    buttons.push(buildOrderActionButton(actionKey, order.id, true));
  });
  return `<div style="display:flex;gap:4px;flex-wrap:wrap">${buttons.join('')}</div>`;
}

function parseOrderDateValue(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function getFilteredOrders() {
  const query = orderFilters.query.trim().toLowerCase();
  const statusFilter = orderFilters.status && orderFilters.status !== 'all'
    ? normalizeOrderStatus(orderFilters.status)
    : '';
  const fromDate = parseOrderDateValue(orderFilters.from);
  const toDate = parseOrderDateValue(orderFilters.to);

  return orders.filter((order) => {
    const normalizedStatus = normalizeOrderStatus(order.status);
    const haystack = [
      order.id,
      order.retailer,
      order.product,
      getOrderStatusLabel(normalizedStatus),
    ].join(' ').toLowerCase();
    const orderDate = parseOrderDateValue(order.date);
    const matchesQuery = !query || haystack.includes(query);
    const matchesStatus = !statusFilter || normalizedStatus === statusFilter;
    const matchesFrom = !fromDate || (orderDate && orderDate >= fromDate);
    const matchesTo = !toDate || (orderDate && orderDate <= toDate);
    return matchesQuery && matchesStatus && matchesFrom && matchesTo;
  });
}

function updateOrdersSummary(visibleCount, totalFiltered, startNumber) {
  const summary = document.getElementById('ordersSummary');
  if (!summary) {
    return;
  }
  if (!totalFiltered) {
    summary.textContent = `Showing 0 of ${orders.length} orders`;
    return;
  }
  summary.textContent = `Showing ${startNumber}-${startNumber + visibleCount - 1} of ${totalFiltered} orders`;
}

function renderOrdersPagination(totalFiltered) {
  const container = document.getElementById('ordersPagination');
  if (!container) {
    return;
  }
  if (!totalFiltered) {
    container.innerHTML = '';
    return;
  }
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ORDER_PAGE_SIZE));
  const buttons = [
    `<button class="btn btn-outline btn-sm" onclick="goToOrdersPage(${currentOrdersPage - 1})" ${currentOrdersPage === 1 ? 'disabled' : ''}>&#8249;</button>`,
  ];

  for (let page = 1; page <= totalPages; page += 1) {
    buttons.push(
      `<button class="btn ${page === currentOrdersPage ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="goToOrdersPage(${page})">${page}</button>`,
    );
  }

  buttons.push(
    `<button class="btn btn-outline btn-sm" onclick="goToOrdersPage(${currentOrdersPage + 1})" ${currentOrdersPage === totalPages ? 'disabled' : ''}>&#8250;</button>`,
  );
  container.innerHTML = buttons.join('');
}

function escapeCsvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

let currentActiveSectionId = '';
showSection = function(id, el) {
  if (!id) return;
  if (currentActiveSectionId === id) {
    const targetSec = document.getElementById(`sec-${id}`);
    if (targetSec && targetSec.classList.contains('active')) return;
  }
  currentActiveSectionId = id;
  try {
    localStorage.setItem('so_supplier_active_tab', id);
  } catch {}
  const labelMap = {
    dashboard: 'Dashboard',
    profile: 'Supplier Profile',
    products: 'Product Catalog',
    orders: 'Purchase Orders',
    retailers: 'Retailer List',
    performance: 'My Performance',
    plan: 'Subscription Plan',
  };
  document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach((item) => item.classList.remove('active'));
  const activeSection = document.getElementById(`sec-${id}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  const sidebarItem = el && el.classList && el.classList.contains('sb-item')
    ? el
    : Array.from(document.querySelectorAll('.sb-item')).find((item) => item.textContent.includes(labelMap[id]));
  if (sidebarItem) {
    sidebarItem.classList.add('active');
  }
  document.getElementById('bc').innerHTML = `<a href="javascript:void(0)" onclick="showSection('dashboard')">Home</a><span class="bc-sep">/</span><span class="current">${escapeHtml(labelMap[id] || id)}</span>`;
  if (id === 'dashboard') renderDashboard();
  if (id === 'profile') { fillDashboardProfileForm(); loadSupplierDocuments(); }
  if (id === 'products') renderProducts();
  if (id === 'orders') renderOrders();
  if (id === 'retailers') renderRetailers();
  if (id === 'performance') renderPerformance();
  if (id === 'plan') { renderPlanSection(); syncSupplierPlanFromBackend(); }
};

renderDashboard = function() {
  const activeRetailers = retailers.filter((retailer) => retailer.status === 'active').length;
  const listedProducts = suppliers_products.length;
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const deliveredOrders = orders.filter((order) => order.status === 'delivered');
  const lowStockProducts = suppliers_products.filter((product) => product.status === 'inactive').length;
  const fulfilmentAverage = orders.length
    ? Math.round((deliveredOrders.length / orders.length) * 100)
    : 100;

  // Calculate gross sales for completed/delivered orders
  const completedSalesRevenue = deliveredOrders.reduce((sum, order) => {
    const p = suppliers_products.find(prod => prod.name === order.product || prod.id === order.product || prod.sku === order.product);
    const unitPrice = p ? (Number(p.price || p.unitPrice) || 450) : 450;
    const qty = parseInt(order.qty, 10) || 1;
    return sum + (unitPrice * qty);
  }, 0);

  // Total volume across all orders (for pending estimates)
  const totalVolume = orders.reduce((sum, order) => {
    const p = suppliers_products.find(prod => prod.name === order.product || prod.id === order.product || prod.sku === order.product);
    const unitPrice = p ? (Number(p.price || p.unitPrice) || 450) : 450;
    const qty = parseInt(order.qty, 10) || 1;
    return sum + (unitPrice * qty);
  }, 0);

  const pendingVolume = pendingOrders.reduce((sum, order) => {
    const p = suppliers_products.find(prod => prod.name === order.product || prod.id === order.product || prod.sku === order.product);
    const unitPrice = p ? (Number(p.price || p.unitPrice) || 450) : 450;
    const qty = parseInt(order.qty, 10) || 1;
    return sum + (unitPrice * qty);
  }, 0);

  // 2% Platform Commission calculation on completed sales (or total volume if no delivered yet)
  const activeVolume = completedSalesRevenue > 0 ? completedSalesRevenue : totalVolume;
  const platformFee = activeVolume * 0.02;
  const netPayout = activeVolume - platformFee;
  const avgOrderVal = deliveredOrders.length > 0 ? (completedSalesRevenue / deliveredOrders.length) : (orders.length ? totalVolume / orders.length : 0);

  // Stat Card 1: Total Completed Sales
  const elTotalSales = document.getElementById('statTotalSalesVal');
  if (elTotalSales) elTotalSales.textContent = '₹' + Number(completedSalesRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const elTotalSalesTrend = document.getElementById('statTotalSalesTrend');
  if (elTotalSalesTrend) elTotalSalesTrend.textContent = `↑ ${deliveredOrders.length} POs Fulfilled`;

  // Stat Card 2: Net Supplier Payout
  const elNetPayout = document.getElementById('statNetPayoutVal');
  if (elNetPayout) elNetPayout.textContent = '₹' + Number(netPayout).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Stat Card 3: 2% Platform Fee
  const elPlatformFee = document.getElementById('statPlatformFeeVal');
  if (elPlatformFee) elPlatformFee.textContent = '₹' + Number(platformFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Stat Card 4: Pending Orders
  const elPendingOrders = document.getElementById('statPendingOrdersVal');
  if (elPendingOrders) elPendingOrders.textContent = String(pendingOrders.length);
  const elPendingOrdersTrend = document.getElementById('statPendingOrdersTrend');
  if (elPendingOrdersTrend) elPendingOrdersTrend.textContent = `${orders.length} total orders (₹${Math.round(pendingVolume).toLocaleString('en-IN')} pending)`;

  // Stat Card 5: Fulfilment Rate
  const elFulfilment = document.getElementById('statFulfilmentVal');
  if (elFulfilment) elFulfilment.textContent = `${fulfilmentAverage}%`;
  const elFulfilmentTrend = document.getElementById('statFulfilmentTrend');
  if (elFulfilmentTrend) elFulfilmentTrend.textContent = `↑ ${deliveredOrders.length} delivered orders`;

  // Sales Banner Headline & KPIs
  const elSalesHead = document.getElementById('dashTotalSalesHeadline');
  if (elSalesHead) elSalesHead.textContent = '₹' + Number(completedSalesRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Gross Completed Sales';
  const elSalesSub = document.getElementById('dashSalesSubheadline');
  if (elSalesSub) elSalesSub.textContent = `Net supplier payout: ₹${Number(netPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (after 2.0% platform fee of ₹${Number(platformFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`;
  const elDeliveredCount = document.getElementById('dashDeliveredCount');
  if (elDeliveredCount) elDeliveredCount.textContent = String(deliveredOrders.length);
  const elPendingVal = document.getElementById('dashPendingValue');
  if (elPendingVal) elPendingVal.textContent = '₹' + Number(pendingVolume).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const elAvgVal = document.getElementById('dashAvgOrderValue');
  if (elAvgVal) elAvgVal.textContent = '₹' + Number(avgOrderVal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const recentOrdersBody = document.getElementById('dashboardRecentOrdersBody');
  if (recentOrdersBody) {
    const recentOrders = orders.slice(0, 5);
    recentOrdersBody.innerHTML = recentOrders.length
      ? recentOrders.map((order) => `
        <tr>
          <td style="font-weight:700;color:#2e6bc5">${escapeHtml(order.id)}</td>
          <td>${escapeHtml(order.retailer)}</td>
          <td>${escapeHtml(order.product)}</td>
          <td>${escapeHtml(order.qty)}</td>
          <td>${escapeHtml(order.date || 'Unknown')}</td>
          <td><span class="badge ${getOrderBadgeClass(order.status)}"><span class="badge-dot" style="background:${getOrderDotColor(order.status)}"></span>${escapeHtml(getOrderStatusLabel(order.status))}</span></td>
        </tr>
      `).join('')
      : `<tr><td colspan="6" style="padding:18px;text-align:center;color:var(--text-3)">No purchase orders linked yet.</td></tr>`;
  }

  const topRetailers = document.getElementById('topRetailers');
  const sortedRetailers = [...retailers].sort((a, b) => b.orders - a.orders).slice(0, 4);
  if (!sortedRetailers.length) {
    topRetailers.innerHTML = `<div style="font-family:'Nunito Sans',sans-serif;font-size:12.5px;color:var(--text-3)">No retailers linked yet.</div>`;
    return;
  }
  const maxOrders = Math.max(1, sortedRetailers[0].orders);
  topRetailers.innerHTML = sortedRetailers.map((retailer) => `
    <div style="display:flex;align-items:center;gap:12px">
      <div class="sup-avt" style="background:${COLORS[retailers.indexOf(retailer) % COLORS.length]}">${escapeHtml(retailer.name.slice(0, 2).toUpperCase())}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Nunito Sans',sans-serif;font-size:13px;font-weight:700;color:var(--text);display:flex;justify-content:space-between">
          <span>${escapeHtml(retailer.name)}</span><span style="color:var(--text-3);font-weight:600">${retailer.orders} orders</span>
        </div>
        <div style="margin-top:6px"><div class="pbar"><div class="pbar-fill" style="width:${Math.round(retailer.orders / maxOrders * 100)}%;background:${COLORS[retailers.indexOf(retailer) % COLORS.length]}"></div></div></div>
      </div>
    </div>
  `).join('');
};

/* ── SAAS PLAN & MOCK PAYMENT SYSTEM ── */
let currentSelectedPlan = 'pro';

renderPlanSection = function() {
  const session = (() => { try { return JSON.parse(localStorage.getItem('so_session') || 'null'); } catch { return null; } })();
  const plan = (session && session.plan) || 'free';
  
  const planNames = { free: 'Starter Kirana (Free Tier)', pro: 'Vyapar Pro (₹799/mo)', enterprise: 'Bharat Enterprise (₹3,499/mo)' };
  const planDescs = {
    free: 'Basic catalog access. Allows up to 50 product items in your supplier catalog.',
    pro: 'Unlimited product catalog, up to 5 outlets, automated reorder suggestions, WhatsApp alerts.',
    enterprise: 'Enterprise multi-depot sync, custom ERP integration, unlimited stores & products, 24/7 account manager.'
  };

  const nameEl = document.getElementById('supplierCurrentPlanName');
  const descEl = document.getElementById('supplierPlanDesc');
  const badgeEl = document.getElementById('supplierPlanStatusBadge');
  const usageTextEl = document.getElementById('supplierPlanUsageText');
  const usageBarEl = document.getElementById('supplierPlanUsageBar');

  if (nameEl) nameEl.textContent = planNames[plan] || 'Starter Kirana (Free Tier)';
  if (descEl) descEl.textContent = planDescs[plan] || '';
  if (badgeEl) {
    badgeEl.textContent = plan === 'free' ? 'Free Forever' : 'Active Subscription';
    badgeEl.style.background = plan === 'enterprise' ? '#7e22ce' : (plan === 'pro' ? '#2563eb' : '#22c55e');
  }

  const prodCount = suppliers_products.length;
  if (usageTextEl) {
    usageTextEl.textContent = plan === 'free' ? `${prodCount} / 50 Products` : `${prodCount} Products (Unlimited)`;
  }
  if (usageBarEl) {
    const pct = plan === 'free' ? Math.min(100, Math.round((prodCount / 50) * 100)) : 100;
    usageBarEl.style.width = `${pct}%`;
    usageBarEl.style.background = pct > 90 ? '#ef4444' : '#38bdf8';
  }

  const btnFree = document.getElementById('btnTierFree');
  const btnPro = document.getElementById('btnTierPro');
  const btnEnt = document.getElementById('btnTierEnterprise');

  if (btnFree) {
    btnFree.disabled = plan === 'free';
    btnFree.textContent = plan === 'free' ? 'Current Active Plan' : 'Downgrade to Free';
  }
  if (btnPro) {
    btnPro.disabled = plan === 'pro';
    btnPro.textContent = plan === 'pro' ? 'Current Active Plan' : (plan === 'enterprise' ? 'Downgrade to Pro' : 'Upgrade to Vyapar Pro');
  }
  if (btnEnt) {
    btnEnt.disabled = plan === 'enterprise';
    btnEnt.textContent = plan === 'enterprise' ? 'Current Active Plan' : 'Upgrade to Enterprise';
  }
};

syncSupplierPlanFromBackend = async function() {
  const session = (() => { try { return JSON.parse(localStorage.getItem('so_session') || 'null'); } catch { return null; } })();
  if (!session) return;

  try {
    let user = null;
    if (session.id) {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(session.id)}`);
      if (res.ok) user = await res.json();
    }
    if (!user && session.email) {
      const listRes = await fetch(`${API_BASE}/users?email=${encodeURIComponent(session.email)}`);
      if (listRes.ok) {
        const list = await listRes.json();
        if (list && list.length) user = list[0];
      }
    }
    if (user) {
      if (user.id) session.id = user.id;
      if (user.plan) session.plan = user.plan;
      localStorage.setItem('so_session', JSON.stringify(session));
      renderPlanSection();
    }
  } catch (err) {
    console.error('Could not sync supplier plan from backend:', err);
  }
};

setSupplierPlan = async function(planKey) {
  const session = (() => { try { return JSON.parse(localStorage.getItem('so_session') || 'null'); } catch { return null; } })();
  if (!session) return;

  try {
    let updated = false;
    if (session.id) {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(session.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.ok) updated = true;
    }
    if (!updated && session.email) {
      const listRes = await fetch(`${API_BASE}/users?email=${encodeURIComponent(session.email)}`);
      if (listRes.ok) {
        const list = await listRes.json();
        if (list && list.length && list[0].id) {
          const res = await fetch(`${API_BASE}/users/${encodeURIComponent(list[0].id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planKey }),
          });
          if (res.ok) {
            session.id = list[0].id;
            updated = true;
          }
        }
      }
    }

    session.plan = planKey;
    localStorage.setItem('so_session', JSON.stringify(session));
    renderPlanSection();
    toast(`Plan updated to ${planKey === 'free' ? 'Starter Kirana (Free)' : (planKey === 'pro' ? 'Vyapar Pro' : 'Bharat Enterprise')}.`);
  } catch (e) {
    session.plan = planKey;
    localStorage.setItem('so_session', JSON.stringify(session));
    renderPlanSection();
    toast('Plan updated.');
  }
};

openMockPaymentModal = function(planKey) {
  currentSelectedPlan = planKey;
  const isPro = planKey === 'pro';
  const base = isPro ? 799 : 3499;
  const gst = Number((base * 0.18).toFixed(2));
  const total = Number((base + gst).toFixed(2));

  document.getElementById('payModalPlanTitle').textContent = isPro ? 'Upgrade to Vyapar Pro' : 'Upgrade to Bharat Enterprise';
  document.getElementById('payModalBaseAmount').textContent = '₹' + base.toLocaleString('en-IN', {minimumFractionDigits:2});
  document.getElementById('payModalGst').textContent = '₹' + gst.toLocaleString('en-IN', {minimumFractionDigits:2});
  document.getElementById('payModalTotalAmount').textContent = '₹' + total.toLocaleString('en-IN', {minimumFractionDigits:2});

  selectPayMethod('upi');
  document.getElementById('payProcessingState').style.display = 'none';
  document.getElementById('payModalActions').style.display = 'flex';
  openModal('paymentGatewayModal');
};

selectPayMethod = function(method) {
  ['payTabUpi', 'payTabCard', 'payTabNet'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('btn-primary'); el.classList.add('btn-outline'); }
  });
  ['payFormUpi', 'payFormCard', 'payFormNet'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (method === 'upi') {
    document.getElementById('payTabUpi').classList.add('btn-primary');
    document.getElementById('payTabUpi').classList.remove('btn-outline');
    document.getElementById('payFormUpi').style.display = 'block';
  } else if (method === 'card') {
    document.getElementById('payTabCard').classList.add('btn-primary');
    document.getElementById('payTabCard').classList.remove('btn-outline');
    document.getElementById('payFormCard').style.display = 'block';
  } else {
    document.getElementById('payTabNet').classList.add('btn-primary');
    document.getElementById('payTabNet').classList.remove('btn-outline');
    document.getElementById('payFormNet').style.display = 'block';
  }
};

processMockPayment = async function() {
  document.getElementById('payFormUpi').style.display = 'none';
  document.getElementById('payFormCard').style.display = 'none';
  document.getElementById('payFormNet').style.display = 'none';
  document.getElementById('payModalActions').style.display = 'none';
  document.getElementById('payProcessingState').style.display = 'block';

  setTimeout(async () => {
    try {
      const session = (() => { try { return JSON.parse(localStorage.getItem('so_session') || 'null'); } catch { return null; } })();
      if (session) {
        let updated = false;
        if (session.id) {
          try {
            const res = await fetch(`${API_BASE}/users/${encodeURIComponent(session.id)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan: currentSelectedPlan }),
            });
            if (res.ok) updated = true;
          } catch (e) {
            console.error('Supplier PATCH by id failed:', e);
          }
        }
        if (!updated && session.email) {
          try {
            const listRes = await fetch(`${API_BASE}/users?email=${encodeURIComponent(session.email)}`);
            if (listRes.ok) {
              const list = await listRes.json();
              if (list && list.length && list[0].id) {
                const res = await fetch(`${API_BASE}/users/${encodeURIComponent(list[0].id)}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan: currentSelectedPlan }),
                });
                if (res.ok) {
                  session.id = list[0].id;
                  updated = true;
                }
              }
            }
          } catch (e) {
            console.error('Supplier PATCH by email failed:', e);
          }
        }

        session.plan = currentSelectedPlan;
        localStorage.setItem('so_session', JSON.stringify(session));
      }

      closeModal('paymentGatewayModal');
      toast(`Payment successful! Reference #SO-PAY-${Math.floor(100000+Math.random()*900000)}. Your plan is now upgraded to ${currentSelectedPlan === 'enterprise' ? 'Bharat Enterprise' : 'Vyapar Pro'}!`);
      renderPlanSection();
    } catch (e) {
      closeModal('paymentGatewayModal');
      toast('Payment processed locally.');
      renderPlanSection();
    }
  }, 1200);
};

renderProducts = function(filter = '') {
  const body = document.getElementById('prodBody');
  const empty = document.getElementById('prodEmpty');
  const query = filter.toLowerCase();
  const list = suppliers_products.filter((product) => {
    if (!query) {
      return true;
    }
    return [product.name, product.brand, product.variant, product.cat, product.reviewSummary]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });
  body.innerHTML = '';
  if (!list.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach((product) => {
    const productIndex = suppliers_products.findIndex((item) => item.id === product.id);
    const productDetails = [product.brand, product.variant, product.reviewSummary].filter(Boolean).join(' | ') || product.desc || 'No review summary yet';
    const expiryLabel = product.expiryDate ? `Expiry: ${formatDashboardDate(product.expiryDate)}` : `Unit: ${product.unit}`;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox"/></td>
      <td style="font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:var(--text-3)">${escapeHtml(product.id)}</td>
      <td>
        <div style="font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:13px">${escapeHtml(product.name)}</div>
        <div style="font-size:11.5px;color:var(--text-3)">${escapeHtml(productDetails)}</div>
      </td>
      <td>
        <span class="badge" style="background:#eef3fc;color:#1e429f">${escapeHtml(product.cat)}</span>
        <div style="font-size:11px;color:var(--text-3);margin-top:5px">${escapeHtml(expiryLabel)}</div>
      </td>
      <td style="font-family:'Space Grotesk',sans-serif;font-weight:700">INR ${Number(product.price).toLocaleString('en-IN')}</td>
      <td>${product.moq} ${escapeHtml(product.unit === 'Piece' ? 'units' : product.unit)}</td>
      <td style="font-weight:700;color:${product.stock < 50 ? 'var(--danger)' : product.stock < 100 ? 'var(--warning)' : 'var(--success)'}">${product.stock}</td>
      <td><span class="badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}"><span class="badge-dot" style="background:${product.status === 'active' ? '#22c55e' : '#9ca3af'}"></span>${product.status === 'active' ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="act-btn" onclick="editProduct(${productIndex})" title="Edit"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.5 1.5l2 2-6 6-2.5.5.5-2.5 6-6z"/></svg></button>
          <button class="act-btn del" onclick="deleteProduct(${productIndex})" title="Delete"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1,3 11,3"/><path d="M3.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M4 3v7.5M8 3v7.5M2 3l.6 7.5a1 1 0 001 .9h4.8a1 1 0 001-.9L10 3"/></svg></button>
        </div>
      </td>
    `;
    body.appendChild(row);
  });
};

filterProducts = function(value) {
  renderProducts(value);
};

openProductModal = function(index) {
  const session = (() => { try { return JSON.parse(localStorage.getItem('so_session') || 'null'); } catch { return null; } })();
  const currentPlan = (session && session.plan) || 'free';
  if (index === undefined && currentPlan === 'free' && suppliers_products.length >= 50) {
    toast('Starter Kirana plan is limited to 50 products. Upgrade to Vyapar Pro or Bharat Enterprise to list unlimited products.');
    showSection('plan');
    return;
  }
  document.getElementById('prodModalTitle').textContent = index !== undefined ? 'Edit Product' : 'Add New Product';
  const modal = document.getElementById('productModal');
  const ids = ['pm-name', 'pm-sku', 'pm-brand', 'pm-variant', 'pm-cat', 'pm-unit', 'pm-price', 'pm-moq', 'pm-stock', 'pm-expiry', 'pm-review', 'pm-desc'];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = '';
    }
  });
  delete modal.dataset.editIdx;
  if (index === undefined) {
    document.getElementById('pm-sku').value = buildNextSku();
    document.getElementById('pm-unit').value = 'Piece';
    document.getElementById('pm-cat').value = 'Electronics';
  } else {
    const product = suppliers_products[index];
    document.getElementById('pm-name').value = product.name;
    document.getElementById('pm-sku').value = product.id;
    document.getElementById('pm-brand').value = product.brand || '';
    document.getElementById('pm-variant').value = product.variant || '';
    document.getElementById('pm-cat').value = product.cat || 'Electronics';
    document.getElementById('pm-unit').value = product.unit || 'Piece';
    document.getElementById('pm-price').value = product.price;
    document.getElementById('pm-moq').value = product.moq;
    document.getElementById('pm-stock').value = product.stock;
    document.getElementById('pm-expiry').value = product.expiryDate || '';
    document.getElementById('pm-review').value = product.reviewSummary || '';
    document.getElementById('pm-desc').value = product.desc || '';
    modal.dataset.editIdx = String(index);
  }
  document.getElementById('pm-name').classList.remove('err');
  document.getElementById('pm-name-err').style.display = 'none';
  openModal('productModal');
};

editProduct = function(index) {
  openProductModal(index);
};

deleteProduct = async function(index) {
  if (!confirm('Remove this product?')) {
    return;
  }
  const nextProducts = suppliers_products.filter((_, productIndex) => productIndex !== index);
  try {
    await persistDashboardProducts(nextProducts);
    suppliers_products = nextProducts.map((product) => normalizeDashboardProduct(product));
    updateDashboardCounters();
    renderProducts();
    renderDashboard();
    toast('Product removed from backend.');
  } catch (error) {
    toast(error.message || 'Unable to remove product.');
  }
};

saveProduct = async function() {
  const name = document.getElementById('pm-name').value.trim();
  if (!name) {
    document.getElementById('pm-name').classList.add('err');
    document.getElementById('pm-name-err').style.display = 'block';
    return;
  }
  document.getElementById('pm-name').classList.remove('err');
  document.getElementById('pm-name-err').style.display = 'none';

  const modal = document.getElementById('productModal');
  const editIndex = modal.dataset.editIdx === undefined ? null : Number(modal.dataset.editIdx);
  const existingProduct = editIndex === null ? null : suppliers_products[editIndex];
  const nextProduct = normalizeDashboardProduct({
    id: document.getElementById('pm-sku').value || buildNextSku(),
    name,
    brand: document.getElementById('pm-brand').value.trim(),
    variant: document.getElementById('pm-variant').value.trim(),
    cat: document.getElementById('pm-cat').value || 'Electronics',
    unit: document.getElementById('pm-unit').value || 'Piece',
    price: Number(document.getElementById('pm-price').value || 0),
    moq: Number(document.getElementById('pm-moq').value || 1),
    stock: Number(document.getElementById('pm-stock').value || 0),
    expiryDate: document.getElementById('pm-expiry').value || '',
    reviewSummary: document.getElementById('pm-review').value.trim(),
    desc: document.getElementById('pm-desc').value.trim(),
    status: existingProduct?.status || 'active',
  });
  const nextProducts = [...suppliers_products];
  if (editIndex === null) {
    nextProducts.push(nextProduct);
  } else {
    nextProducts[editIndex] = nextProduct;
  }
  try {
    await persistDashboardProducts(nextProducts);
    suppliers_products = nextProducts.map((product) => normalizeDashboardProduct(product));
    updateDashboardCounters();
    closeModal('productModal');
    renderProducts();
    renderDashboard();
    toast('Product saved to backend.');
  } catch (error) {
    toast(error.message || 'Unable to save product.');
  }
};

renderOrders = function() {
  const body = document.getElementById('ordersBody');
  const empty = document.getElementById('ordersEmpty');
  const filteredOrders = getFilteredOrders();
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));

  if (currentOrdersPage > totalPages) {
    currentOrdersPage = totalPages;
  }

  if (!filteredOrders.length) {
    body.innerHTML = '';
    empty.style.display = 'block';
    updateOrdersSummary(0, 0, 0);
    renderOrdersPagination(0);
    return;
  }

  empty.style.display = 'none';
  const startIndex = (currentOrdersPage - 1) * ORDER_PAGE_SIZE;
  const pageOrders = filteredOrders.slice(startIndex, startIndex + ORDER_PAGE_SIZE);
  body.innerHTML = pageOrders.map((order) => `
    <tr>
      <td style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--primary)">${escapeHtml(order.id)}</td>
      <td>${escapeHtml(order.retailer)}</td>
      <td>${escapeHtml(order.product)}</td>
      <td style="font-weight:700">${escapeHtml(order.qty)}</td>
      <td>${escapeHtml(order.date)}</td>
      <td>${escapeHtml(order.delivery)}</td>
      <td><span class="badge ${getOrderBadgeClass(order.status)}"><span class="badge-dot" style="background:${getOrderDotColor(order.status)}"></span>${escapeHtml(getOrderStatusLabel(order.status))}</span></td>
      <td>${buildOrderActionMarkup(order)}</td>
    </tr>
  `).join('');
  updateOrdersSummary(pageOrders.length, filteredOrders.length, startIndex + 1);
  renderOrdersPagination(filteredOrders.length);
};

viewOrder = function(id) {
  const order = orders.find((entry) => entry.id === id);
  if (!order) {
    return;
  }
  currentOrderId = id;
  document.getElementById('orderModalId').textContent = `Order ${id}`;
  document.getElementById('orderModalBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${[
        ['Retailer', escapeHtml(order.retailer)],
        ['Product', escapeHtml(order.product)],
        ['Quantity', escapeHtml(`${order.qty} units`)],
        ['Order Date', escapeHtml(order.date)],
        ['Est. Delivery', escapeHtml(order.delivery)],
        ['Status', `<span class="badge ${getOrderBadgeClass(order.status)}"><span class="badge-dot" style="background:${getOrderDotColor(order.status)}"></span>${escapeHtml(getOrderStatusLabel(order.status))}</span>`],
      ].map(([label, value]) => `
        <div style="background:#f8f9fb;border:1px solid var(--border-light);border-radius:7px;padding:12px">
          <div style="font-family:'Nunito Sans',sans-serif;font-size:11px;font-weight:700;color:var(--text-3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em">${label}</div>
          <div style="font-family:'Nunito Sans',sans-serif;font-size:13.5px;font-weight:700;color:var(--text)">${value}</div>
        </div>
      `).join('')}
    </div>
  `;
  const modalActions = document.getElementById('orderModalActions');
  const statusButtons = getOrderActionKeys(order.status)
    .map((actionKey) => buildOrderActionButton(actionKey, order.id, false))
    .join('');
  modalActions.innerHTML = `<button class="btn btn-outline" onclick="closeModal('orderModal')">Close</button>${statusButtons}`;
  openModal('orderModal');
};

confirmOrder = function() {
  if (currentOrderId) {
    updateOrderStatus(currentOrderId, 'confirmed');
  }
};

quickConfirm = function(id) {
  updateOrderStatus(id, 'confirmed');
};

applyOrderFilters = function() {
  orderFilters = {
    query: document.getElementById('orderSearchInput').value.trim(),
    status: document.getElementById('orderStatusFilter').value || 'all',
    from: document.getElementById('orderDateFrom').value || '',
    to: document.getElementById('orderDateTo').value || '',
  };
  currentOrdersPage = 1;
  renderOrders();
};

goToOrdersPage = function(page) {
  const totalPages = Math.max(1, Math.ceil(getFilteredOrders().length / ORDER_PAGE_SIZE));
  currentOrdersPage = Math.min(totalPages, Math.max(1, page));
  renderOrders();
};

updateOrderStatus = async function(orderId, nextStatus) {
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }
  const normalizedStatus = normalizeOrderStatus(nextStatus);
  const apiStatusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    indelivery: 'In Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  try {
    await dashboardApiRequest(`/purchase-orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: apiStatusMap[normalizedStatus] || 'Pending',
      }),
    });
    order.status = normalizedStatus;
    const rawOrder = purchaseOrderRecords.find((entry) => entry.id === orderId);
    if (rawOrder) {
      rawOrder.status = apiStatusMap[normalizedStatus] || 'Pending';
    }
    retailers = retailerProfiles.map((retailer, index) => normalizeDashboardRetailer(retailer, index));
    renderDashboard();
    renderOrders();
    renderRetailers();
    renderPerformance();
    if (currentOrderId === orderId && document.getElementById('orderModal').classList.contains('open')) {
      viewOrder(orderId);
    }
    toast(`Order ${orderId} updated to ${getOrderStatusLabel(order.status)}.`);
  } catch (error) {
    toast(error.message || 'Unable to update order status.');
  }
};

exportOrders = function() {
  const filteredOrders = getFilteredOrders();
  if (!filteredOrders.length) {
    toast('No purchase orders available to export.');
    return;
  }
  const csvRows = [
    ['Order ID', 'Retailer', 'Product', 'Quantity', 'Order Date', 'Est. Delivery', 'Status'],
    ...filteredOrders.map((order) => [
      order.id,
      order.retailer,
      order.product,
      order.qty,
      order.date,
      order.delivery,
      getOrderStatusLabel(order.status),
    ]),
  ];
  const csv = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'purchase-orders-export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast('Purchase orders exported.');
};

renderRetailers = function(filter = '') {
  const body = document.getElementById('retailerBody');
  const empty = document.getElementById('retailerEmpty');
  const query = filter.toLowerCase();
  const list = retailers.filter((retailer) => {
    const matchesText = !query || [retailer.name, retailer.contact, retailer.state]
      .some((value) => String(value || '').toLowerCase().includes(query));
    const matchesTab = currentRetailerTab === 'all' || retailer.status === currentRetailerTab;
    return matchesText && matchesTab;
  });
  body.innerHTML = '';
  if (!list.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach((retailer) => {
    const retailerIndex = retailers.findIndex((item) => item.code === retailer.code);
    const color = COLORS[retailerIndex % COLORS.length];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox"/></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="sup-avt" style="background:${color};width:32px;height:32px;border-radius:7px;font-size:11px">${escapeHtml(retailer.name.slice(0, 2).toUpperCase())}</div>
          <div>
            <div style="font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:13px">${escapeHtml(retailer.name)}</div>
            <div style="font-size:11.5px;color:var(--text-3)">${escapeHtml(retailer.code)}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:13px;font-weight:700">${escapeHtml(retailer.contact)}</div>
        <div style="font-size:11.5px;color:var(--text-3)">${escapeHtml(retailer.email)}</div>
      </td>
      <td>${escapeHtml(retailer.state)}</td>
      <td>${escapeHtml(retailer.lastOrder)}</td>
      <td>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:${retailer.fulfilment >= 90 ? 'var(--success)' : retailer.fulfilment >= 80 ? 'var(--warning)' : 'var(--danger)'};margin-bottom:4px">${retailer.fulfilment}%</div>
        <div class="pbar" style="width:100px"><div class="pbar-fill" style="width:${retailer.fulfilment}%;background:${retailer.fulfilment >= 90 ? 'var(--success)' : retailer.fulfilment >= 80 ? 'var(--warning)' : 'var(--danger)'}"></div></div>
      </td>
      <td style="color:#f59e0b;font-size:13px">${retailer.ratingGiven.toFixed(1)} star</td>
      <td><span class="badge ${retailer.status === 'active' ? 'badge-active' : 'badge-inactive'}"><span class="badge-dot" style="background:${retailer.status === 'active' ? '#22c55e' : '#9ca3af'}"></span>${retailer.status === 'active' ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="act-btn" onclick="viewRetailerSummary(${retailerIndex})" title="View"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z"/><circle cx="6" cy="6" r="1.5"/></svg></button>
          <button class="act-btn" onclick="toggleRetailerStatus('${escapeHtml(String(retailer.id || retailer.code))}')" title="Toggle Status"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5v5"/><path d="M3.5 6h5"/></svg></button>
        </div>
      </td>
    `;
    body.appendChild(row);
  });
};

filterRetailers = function(value) {
  renderRetailers(value.toLowerCase());
};

filterRetailerTab = function(tab, element) {
  currentRetailerTab = tab;
  document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
  element.classList.add('active');
  renderRetailers();
};

viewRetailerSummary = function(index) {
  const retailer = retailers[index];
  if (!retailer) return;

  const titleEl = document.getElementById('retailerViewTitle');
  const bodyEl = document.getElementById('retailerViewBody');
  if (titleEl) titleEl.textContent = `${retailer.name} (${retailer.code})`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f8fafc;padding:12px;border-radius:8px">
        <div><strong>Contact Person:</strong> ${escapeHtml(retailer.contact || '-')}</div>
        <div><strong>Business Email:</strong> ${escapeHtml(retailer.email || '-')}</div>
        <div><strong>Phone Number:</strong> ${escapeHtml(retailer.phone || '-')}</div>
        <div><strong>Location:</strong> ${escapeHtml(retailer.state || '-')}</div>
        <div><strong>Industry / Category:</strong> ${escapeHtml(retailer.cat || '-')}</div>
        <div><strong>Credit Terms:</strong> ${escapeHtml(retailer.terms || '-')}</div>
      </div>
      <div style="display:flex;gap:16px;margin-top:6px;background:#eef2ff;padding:10px 14px;border-radius:8px">
        <div><strong>Total Orders:</strong> ${retailer.orders}</div>
        <div><strong>Fulfilment Rate:</strong> ${retailer.fulfilment}%</div>
        <div><strong>Rating Given:</strong> <span style="color:#f59e0b;font-weight:700">${retailer.ratingGiven.toFixed(1)} ★</span></div>
        <div><strong>Relationship Status:</strong> <span style="color:${retailer.status === 'active' ? '#22c55e' : '#ef4444'};font-weight:700">${retailer.status.toUpperCase()}</span></div>
      </div>
    `;
  }
  openModal('retailerViewModal');
};

openRetailerModal = function() {
  ['rm-name', 'rm-contact', 'rm-email', 'rm-phone', 'rm-addr'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('rm-code').value = buildNextRetailerCode();
  document.getElementById('rm-state').value = 'Gujarat';
  document.getElementById('rm-cat').value = 'Electronics';
  document.getElementById('rm-terms').value = 'Net 30';
  document.getElementById('rm-name').classList.remove('err');
  document.getElementById('rm-name-err').style.display = 'none';
  openModal('retailerModal');
};

saveRetailer = async function() {
  const name = document.getElementById('rm-name').value.trim();
  if (!name) {
    document.getElementById('rm-name').classList.add('err');
    document.getElementById('rm-name-err').style.display = 'block';
    return;
  }
  document.getElementById('rm-name').classList.remove('err');
  document.getElementById('rm-name-err').style.display = 'none';
  try {
    const createdRetailer = await dashboardApiRequest('/retailers/setup', {
      method: 'POST',
      body: JSON.stringify({
        business: {
          businessName: name,
          retailerCode: document.getElementById('rm-code').value || undefined,
          businessEmail: document.getElementById('rm-email').value.trim() || `${String(name).replace(/\s+/g, '.').toLowerCase()}@retailer.local`,
          phoneNumber: document.getElementById('rm-phone').value.trim() || undefined,
          businessAddress: document.getElementById('rm-addr').value.trim() || undefined,
          primaryIndustry: document.getElementById('rm-cat').value || undefined,
        },
        primaryContact: {
          fullName: document.getElementById('rm-contact').value.trim() || name,
        },
        profileStatus: 'active',
        stores: [],
        suppliers: [],
        products: [],
      }),
    });
    retailerProfiles = [createdRetailer, ...retailerProfiles];
    retailers = retailerProfiles.map((retailer, index) => normalizeDashboardRetailer(retailer, index));
    updateDashboardCounters();
    closeModal('retailerModal');
    renderRetailers();
    renderDashboard();
    renderPerformance();
    toast('Retailer saved to backend.');
  } catch (error) {
    toast(error.message || 'Unable to save retailer.');
  }
};

toggleRetailerStatus = async function(retailerId) {
  const retailerRecord = retailerProfiles.find((entry) => String(entry.id) === String(retailerId) || String(entry.business?.retailerCode || '') === String(retailerId));
  if (!retailerRecord) {
    return;
  }
  const nextStatus = retailerRecord.profileStatus === 'inactive' ? 'active' : 'inactive';
  try {
    const updatedRetailer = await dashboardApiRequest(`/retailers/${encodeURIComponent(retailerRecord.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        profileStatus: nextStatus,
      }),
    });
    retailerProfiles = retailerProfiles.map((entry) => entry.id === updatedRetailer.id ? updatedRetailer : entry);
    retailers = retailerProfiles.map((retailer, retailerIndex) => normalizeDashboardRetailer(retailer, retailerIndex));
    updateDashboardCounters();
    renderRetailers();
    renderDashboard();
    renderPerformance();
    toast(`Retailer marked ${nextStatus}.`);
  } catch (error) {
    toast(error.message || 'Unable to update retailer status.');
  }
};

renderPerformance = function() {
  const ratingBody = document.getElementById('ratingBody');
  const feedbackEntries = [];
  
  // 1. Get feedback from Retailer profiles (legacy/overall rating)
  retailerProfiles.forEach((retailerRecord) => {
    const feedback = getRetailerFeedbackForCurrentSupplier(retailerRecord);
    if (feedback && Number(feedback.rating || 0) > 0) {
      const meta = getRetailerOrderMeta(retailerRecord.id);
      feedbackEntries.push({
        retailer: retailerRecord.business?.businessName || retailerRecord.name || 'Retailer',
        rating: Number(feedback.rating || 0),
        comment: feedback.comment || 'Overall Feedback',
        date: feedback.lastRatedAt || retailerRecord.updatedAt || '',
        fulfilment: meta.fulfilment,
        orders: meta.orders,
      });
    }
  });

  // 2. Get feedback from Purchase Orders directly
  orders.forEach((order) => {
    if (order.rawRecord && order.rawRecord.feedback) {
      const retailerName = order.retailer || 'Retailer';
      const meta = getRetailerOrderMeta({ id: order.rawRecord.retailerId, name: order.retailer });
      feedbackEntries.push({
        retailer: retailerName + ' (PO: ' + order.id + ')',
        rating: Number(order.rawRecord.feedback.rating || 0),
        comment: order.rawRecord.feedback.comment || '',
        date: order.rawRecord.updatedAt || order.date || '',
        fulfilment: meta.fulfilment,
        orders: meta.orders,
      });
    }
  });

  // 3. Get feedback directly from supplier profile or general rating
  if (Array.isArray(supplierProfile.feedbacks)) {
    supplierProfile.feedbacks.forEach((fb) => {
      if (fb && Number(fb.rating || 0) > 0) {
        const meta = getRetailerOrderMeta({ name: fb.retailerName || "John's Retail Store" });
        feedbackEntries.push({
          retailer: fb.retailerName || "John's Retail Store",
          rating: Number(fb.rating || 0),
          comment: fb.comment || `Rated ${fb.rating} stars`,
          date: fb.createdAt || new Date().toISOString(),
          fulfilment: meta.fulfilment || 50,
          orders: meta.orders || 2,
        });
      }
    });
  }

  if (!feedbackEntries.length && Number(supplierProfile.rating || supplierProfile.avgRating || 0) > 0) {
    const defaultRating = Number(supplierProfile.rating || supplierProfile.avgRating || 0);
    const meta = getRetailerOrderMeta({ name: "John's Retail Store" });
    feedbackEntries.push({
      retailer: "John's Retail Store",
      rating: defaultRating,
      comment: `Overall rating given by John's Retail Store`,
      date: supplierProfile.updatedAt || new Date().toISOString(),
      fulfilment: meta.fulfilment || 50,
      orders: meta.orders || 2,
    });
  }

  feedbackEntries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  ratingBody.innerHTML = feedbackEntries.map((entry) => `
    <tr>
      <td style="font-family:'Nunito Sans',sans-serif;font-weight:700">${escapeHtml(entry.retailer)}</td>
      <td colspan="4">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="pbar" style="width:120px"><div class="pbar-fill" style="width:${Math.max(0, Math.min(100, entry.rating * 20))}%;background:${entry.rating >= 4 ? 'var(--success)' : entry.rating >= 3 ? 'var(--warning)' : 'var(--danger)'}"></div></div>
          <span style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700">${entry.rating.toFixed(1)} / 5</span>
          <span style="font-size:12px;color:var(--text-3)">${entry.orders} orders · ${entry.fulfilment}% fulfilment</span>
        </div>
      </td>
      <td style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:${entry.rating >= 4 ? 'var(--success)' : entry.rating >= 3 ? 'var(--warning)' : 'var(--danger)'}">
        ${entry.rating.toFixed(1)}
      </td>
      <td style="font-size:12px;color:var(--text-3);max-width:160px">${escapeHtml(entry.comment || 'No written feedback')}</td>
      <td style="font-size:12px;color:var(--text-3)">${escapeHtml(formatDashboardDate(entry.date) || 'Unknown')}</td>
    </tr>
  `).join('') || `<tr><td colspan="8" style="padding:18px;text-align:center;color:var(--text-3)">No retailer feedback available yet.</td></tr>`;

  const breakdown = document.getElementById('perfBreakdown');
  const sortedRetailers = retailers.slice().sort((a, b) => {
    if ((b.orders || 0) !== (a.orders || 0)) return (b.orders || 0) - (a.orders || 0);
    if ((b.fulfilment || 0) !== (a.fulfilment || 0)) return (b.fulfilment || 0) - (a.fulfilment || 0);
    return (b.ratingGiven || 0) - (a.ratingGiven || 0);
  });

  breakdown.innerHTML = sortedRetailers.slice(0, 5).map((retailer, index) => {
    const average = retailer.ratingGiven ? retailer.ratingGiven.toFixed(1) : 'N/A';
    const averageColor = average === 'N/A' ? 'var(--text-3)' : Number(average) >= 4 ? 'var(--success)' : Number(average) >= 3 ? 'var(--warning)' : 'var(--danger)';
    return `
      <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border-light)">
        <div class="sup-avt" style="background:${COLORS[index % COLORS.length]};width:36px;height:36px;border-radius:8px;font-size:12px;flex-shrink:0">${escapeHtml(retailer.name.slice(0, 2).toUpperCase())}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <div style="font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:13px">${escapeHtml(retailer.name)}</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:${averageColor}">Score ${escapeHtml(average)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div class="pbar" style="flex:1"><div class="pbar-fill" style="width:${retailer.fulfilment}%;background:${retailer.fulfilment >= 90 ? 'var(--success)' : retailer.fulfilment >= 80 ? 'var(--warning)' : 'var(--danger)'}"></div></div>
            <div style="font-size:12px;font-weight:700;color:var(--text-3);white-space:nowrap">${retailer.fulfilment}% fulfilment | ${retailer.orders} orders</div>
          </div>
        </div>
      </div>
    `;
  }).join('') || `<div style="font-size:13px;color:var(--text-3)">No retailer profiles available yet.</div>`;

  const statCards = document.querySelectorAll('#sec-performance .stat-card');
  const averageRating = feedbackEntries.length
    ? feedbackEntries.reduce((sum, entry) => sum + entry.rating, 0) / feedbackEntries.length
    : 0;
  const supplierOrders = purchaseOrderRecords.filter((order) => String(order?.supplierId || '') === String(currentSupplierId || ''));
  const deliveredOrders = supplierOrders.filter((order) => normalizeOrderStatus(order.status) === 'delivered').length;
  const fulfilment = supplierOrders.length ? Math.round((deliveredOrders / supplierOrders.length) * 100) : 0;
  const lowStockProducts = suppliers_products.filter((product) => product.status === 'inactive').length;
  if (statCards[0]) {
    statCards[0].querySelector('.stat-value').textContent = averageRating ? averageRating.toFixed(1) : '0.0';
    statCards[0].querySelector('.stat-label').textContent = 'Average Rating';
    statCards[0].querySelector('.stat-trend').textContent = `${feedbackEntries.length} feedback entries`;
  }
  if (statCards[1]) {
    statCards[1].querySelector('.stat-value').textContent = `${fulfilment}%`;
    statCards[1].querySelector('.stat-label').textContent = 'Order Fulfilment';
    statCards[1].querySelector('.stat-trend').textContent = `${deliveredOrders} delivered orders`;
  }
  if (statCards[2]) {
    statCards[2].querySelector('.stat-value').textContent = `${retailers.length}`;
    statCards[2].querySelector('.stat-label').textContent = 'Retailers Connected';
    statCards[2].querySelector('.stat-trend').textContent = `${retailers.filter((retailer) => retailer.status === 'active').length} active retailers`;
  }
  if (statCards[3]) {
    statCards[3].querySelector('.stat-value').textContent = `${lowStockProducts}`;
    statCards[3].querySelector('.stat-label').textContent = 'Low Stock Products';
    statCards[3].querySelector('.stat-trend').textContent = 'products below MOQ';
  }
};

saveProfile = async function() {
  const nextProfile = collectDashboardProfileForm();
  if (!nextProfile.companyName || !nextProfile.businessEmail || !nextProfile.contactName) {
    toast('Company, business email, and contact name are required.');
    return;
  }
  try {
    const supplier = await ensureDashboardSupplier();
    currentSupplierId = supplier.id;
    await dashboardApiRequest(`/suppliers/${currentSupplierId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        business: buildDashboardBusinessPayload(nextProfile),
        primaryContact: buildDashboardPrimaryContactPayload(nextProfile),
      }),
    });
    supplierProfile = nextProfile;
    syncDashboardProfileUi();
    renderDashboard();
    toast('Profile saved to backend.');
  } catch (error) {
    toast(error.message || 'Unable to save profile.');
  }
};

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function loadSupplierDocuments() {
  if (!currentSupplierId) return;
  try {
    const docs = await dashboardApiRequest(`/suppliers/${encodeURIComponent(currentSupplierId)}/documents`);
    renderSupplierDocuments(docs || []);
  } catch (_error) {
    renderSupplierDocuments([]);
  }
}

function renderSupplierDocuments(docs) {
  const tbody = document.getElementById('supplierDocsBody');
  if (!tbody) return;

  if (!Array.isArray(docs) || docs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding:16px;text-align:center;color:var(--text-3)">
          No documents uploaded yet.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = docs.map((doc) => {
    const fileUrl = window.IMS_API_BASE_URL.replace('/api', '') + doc.url;
    const formattedDate = formatDashboardDate(doc.uploadedAt);
    const sizeStr = formatFileSize(doc.size);

    return `
      <tr>
        <td>
          <span class="badge" style="background:#eef3fc;color:#1e429f">${escapeHtml(doc.docType || 'General')}</span>
        </td>
        <td style="font-family:'Nunito Sans',sans-serif;font-weight:700">${escapeHtml(doc.originalName || doc.filename)}</td>
        <td>${sizeStr}</td>
        <td>${formattedDate}</td>
        <td>
          <div style="display:flex;gap:6px;align-items:center">
            <a href="${fileUrl}" target="_blank" class="btn btn-outline btn-sm" style="text-decoration:none">
              View / Download
            </a>
            <button class="act-btn del" onclick="deleteSupplierDocument('${escapeHtml(doc.id)}')" title="Delete Document" type="button">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1,3 11,3"/><path d="M3.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M4 3v7.5M8 3v7.5M2 3l.6 7.5a1 1 0 001 .9h4.8a1 1 0 001-.9L10 3"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function uploadSupplierDocument() {
  const fileInput = document.getElementById('doc-file-input');
  const typeSelect = document.getElementById('doc-type-select');
  const uploadBtn = document.getElementById('doc-upload-btn');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    toast('Please select a file to upload.');
    return;
  }

  const file = fileInput.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast('File size exceeds the 5MB limit.');
    return;
  }

  const docType = typeSelect ? typeSelect.value : 'General Certification';
  const supplierId = currentSupplierId;

  if (!supplierId) {
    toast('Supplier ID not ready. Please try again.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);

  uploadBtn.disabled = true;
  uploadBtn.innerHTML = 'Uploading...';

  try {
    const uploadUrl = `${window.IMS_API_BASE_URL}/suppliers/${encodeURIComponent(supplierId)}/upload-document`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || result.error || 'Upload failed');
    }

    fileInput.value = '';
    await loadSupplierDocuments();
    toast('Document uploaded successfully!');
  } catch (error) {
    toast(error.message || 'File upload failed.');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `
      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 10V2.5M6.5 2.5L3.5 5.5M6.5 2.5L9.5 5.5"/><line x1="2" y1="11" x2="11" y2="11"/></svg>
      Upload Document`;
  }
}

async function deleteSupplierDocument(docId) {
  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }

  try {
    await dashboardApiRequest(`/suppliers/${encodeURIComponent(currentSupplierId)}/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
    await loadSupplierDocuments();
    toast('Document deleted successfully.');
  } catch (error) {
    toast(error.message || 'Failed to delete document.');
  }
}

function toggleProfilePopover(event) {
  event.stopPropagation();
  document.getElementById('profilePopover').classList.toggle('open');
}

function closeProfilePopover() {
  document.getElementById('profilePopover').classList.remove('open');
}

function openProfileFromPopover() {
  closeProfilePopover();
  showSection('profile');
}

async function copySupplierDirectoryEndpoint() {
  try {
    await navigator.clipboard.writeText(DIRECTORY_ENDPOINT);
    toast('Directory endpoint copied.');
  } catch {
    toast(`Directory endpoint: ${DIRECTORY_ENDPOINT}`);
  }
}

document.addEventListener('click', (event) => {
  const popover = document.getElementById('profilePopover');
  const trigger = document.getElementById('topbarAvatar');
  if (popover && trigger && !popover.contains(event.target) && !trigger.contains(event.target)) {
    closeProfilePopover();
  }
});

async function initDashboardOverrides() {
  try {
    const supplier = await ensureDashboardSupplier();
    mapDashboardSupplierRecord(supplier);
    retailerProfiles = await dashboardApiRequest('/retailers');
    purchaseOrderRecords = await dashboardApiRequest('/purchase-orders');
    retailers = retailerProfiles.map((retailer, index) => normalizeDashboardRetailer(retailer, index));
    orders = purchaseOrderRecords
      .filter((order) => String(order?.supplierId || '') === String(currentSupplierId || ''))
      .map((order) => mapBackendPurchaseOrderToDashboardOrder(order));
  } catch (error) {
    toast(error.message || 'Backend not reachable.');
  }
  updateDashboardCounters();
  syncDashboardProfileUi();
  renderDashboard();
  renderProducts();
  renderOrders();
  renderRetailers();
  renderPerformance();
  loadSupplierDocuments();
  const savedTab = window.location.hash.replace(/^#/, '').trim() || localStorage.getItem('so_supplier_active_tab');
  if (savedTab && ['dashboard', 'profile', 'products', 'orders', 'retailers', 'performance'].includes(savedTab)) {
    showSection(savedTab);
  }
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (hash && ['dashboard', 'profile', 'products', 'orders', 'retailers', 'performance'].includes(hash)) {
    showSection(hash);
  }
});

const activeSupplierSession = readSupplierSession();
const hasSupplierParam = new URLSearchParams(window.location.search).has('supplierId');
if (!activeSupplierSession && !hasSupplierParam) {
  window.location.href = '../auth/login.html';
} else {
  const initialTab = window.location.hash.replace(/^#/, '').trim() || localStorage.getItem('so_supplier_active_tab');
  if (initialTab && ['dashboard', 'profile', 'products', 'orders', 'retailers', 'performance'].includes(initialTab)) {
    showSection(initialTab);
  }
  initDashboardOverrides();
}
