import { request } from './client';

export const retailerApi = {
  // Authentication
  login: (email, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: (id) => request(`/users/${id}`),

  updateUser: (id, data) =>
    request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Products
  getProducts: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductById: (id) => request(`/products/${id}`),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Suppliers
  getSuppliers: async () => {
    const list = await request('/suppliers');
    if (!Array.isArray(list)) return [];
    return list.map((s) => {
      const name =
        s.name ||
        s.companyName ||
        s.business?.companyName ||
        s.company ||
        s.primaryContact?.fullName ||
        'Supplier';
      const category =
        s.category ||
        s.primaryCategory ||
        s.business?.primaryCategory ||
        'General';
      const email =
        s.email ||
        s.businessEmail ||
        s.business?.businessEmail ||
        s.primaryContact?.directEmail ||
        '';
      const phone =
        s.phone ||
        s.phoneNumber ||
        s.business?.phoneNumber ||
        s.primaryContact?.mobileNumber ||
        s.primaryContact?.directPhone ||
        '';
      const code =
        s.code ||
        s.supplierCode ||
        s.business?.supplierCode ||
        (s.id ? `SUP-${String(s.id).slice(0, 6).toUpperCase()}` : 'SUP');
      const paymentTerms =
        s.paymentTerms ||
        s.business?.paymentTerms ||
        'Net 30';
      const rating =
        s.rating ||
        s.avgRating ||
        '4.8';

      return {
        ...s,
        id: s.id || code,
        name,
        companyName: name,
        category,
        email,
        phone,
        code,
        paymentTerms,
        rating,
      };
    });
  },
  getSupplierById: (id) => request(`/suppliers/${id}`),
  createSupplier: (data) =>
    request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stores
  getStores: (retailerId) => {
    const qs = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : '';
    return request(`/stores${qs}`);
  },

  // Billers
  getBillers: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/billers${qs ? `?${qs}` : ''}`);
  },
  createBiller: (data) =>
    request('/billers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBiller: (id, data) =>
    request(`/billers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBiller: (id) =>
    request(`/billers/${id}`, {
      method: 'DELETE',
    }),

  // Customers
  getCustomers: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  createCustomer: (data) =>
    request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCustomer: (id, data) =>
    request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id) =>
    request(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // Purchase Orders
  getPurchaseOrders: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/purchase-orders${qs ? `?${qs}` : ''}`);
  },
  createPurchaseOrder: (data) =>
    request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Returns
  getReturns: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/returns${qs ? `?${qs}` : ''}`);
  },
  createReturn: (data) =>
    request('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReturn: (id, data) =>
    request(`/returns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Stock Adjustments
  getStockAdjustments: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/stock-adjustments${qs ? `?${qs}` : ''}`);
  },
  createStockAdjustment: (data) =>
    request('/stock-adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteStockAdjustment: (id) =>
    request(`/stock-adjustments/${id}`, {
      method: 'DELETE',
    }),

  // Transactions
  getTransactions: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },
  getPurchasedProducts: (retailerId, storeId) => {
    const params = new URLSearchParams();
    if (retailerId) params.set('retailerId', retailerId);
    if (storeId) params.set('storeId', storeId);
    const qs = params.toString();
    return request(`/transactions/purchased-products${qs ? `?${qs}` : ''}`);
  },

  // Biller Request (from Landing Page / Biller Portal)
  createBillerRequest: (data) =>
    request('/billers/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBillerRequests: () => request('/billers/requests'),
  approveBillerRequest: (id, scope) =>
    request(`/billers/requests/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(scope || {}),
    }),
  rejectBillerRequest: (id) =>
    request(`/billers/requests/${id}/reject`, {
      method: 'PUT',
    }),

  // Retailer Setup Wizard & Profile
  setupRetailer: (data) =>
    request('/retailers/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRetailer: (id, data) =>
    request(`/retailers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getRetailerById: (id) => request(`/retailers/${id}`),
};

