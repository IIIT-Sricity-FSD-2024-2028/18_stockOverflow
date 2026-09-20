import { request } from './client';

export const retailerApi = {
  // Authentication
  login: (email, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: (id) => request(`/users/${id}`),

  updateUser: (id, data) =>
    request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Products
  getProducts: (retailerId) =>
    request(`/products${retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : ''}`),

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
  getSuppliers: () => request('/suppliers'),
  createSupplier: (data) =>
    request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stores
  getStores: () => request('/stores'),

  // Billers
  getBillers: () => request('/billers'),

  // Customers
  getCustomers: () => request('/customers'),

  // Purchase Orders
  getPurchaseOrders: () => request('/purchase-orders'),
  createPurchaseOrder: (data) =>
    request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Returns
  getReturns: () => request('/returns'),
  createReturn: (data) =>
    request('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stock Adjustments
  getStockAdjustments: () => request('/stock-adjustments'),
  createStockAdjustment: (data) =>
    request('/stock-adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Biller Request (from Landing Page)
  createBillerRequest: (data) =>
    request('/billers/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
