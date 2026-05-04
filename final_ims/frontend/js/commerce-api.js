(function () {
  var cache = {
    products: null,
    stores: null,
    customers: null,
  };

  function clearProductsCache() {
    cache.products = null;
  }

  function clearPeopleCache() {
    cache.stores = null;
    cache.customers = null;
  }

  function clearAllCache() {
    clearProductsCache();
    clearPeopleCache();
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem('so_session') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function getCustomerLookup() {
    var session = readSession();
    if (!session) {
      return '';
    }

    var role = String(session.role || '').toLowerCase();
    if (role !== 'consumer' && role !== 'customer') {
      return '';
    }

    return String(session.name || session.email || session.id || '').trim();
  }

  function getStaffScope() {
    var session = readSession();
    if (!session) {
      return {};
    }

    var role = String(session.role || '').toLowerCase();
    if (role !== 'biller' && role !== 'retailer') {
      return {};
    }

    return {
      retailerId: String(session.retailerId || session.profileId || '').trim(),
      storeId: String(session.currentStoreId || session.storeId || '').trim(),
    };
  }

  function withQuery(path, params) {
    var search = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        search.set(key, String(value).trim());
      }
    });
    var suffix = search.toString();
    return suffix ? path + (path.indexOf('?') >= 0 ? '&' : '?') + suffix : path;
  }

  function withCustomerQuery(path) {
    var customerLookup = getCustomerLookup();
    if (!customerLookup) {
      return path;
    }
    var suffix = 'customer=' + encodeURIComponent(customerLookup);
    return path + (path.indexOf('?') >= 0 ? '&' : '?') + suffix;
  }

  function withStaffScopeQuery(path, extraParams) {
    return withQuery(path, { ...getStaffScope(), ...(extraParams || {}) });
  }

  function withCustomerOrStaffQuery(path) {
    return getCustomerLookup()
      ? withCustomerQuery(path)
      : withStaffScopeQuery(path);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  async function getProducts(force) {
    if (!force && Array.isArray(cache.products)) {
      return clone(cache.products);
    }

    cache.products = await window.IMS_HTTP.request(withStaffScopeQuery('/products'));
    return clone(cache.products);
  }

  async function getProductBySku(sku, force) {
    if (!sku) {
      return null;
    }

    if (!force && Array.isArray(cache.products)) {
      var cached = cache.products.find(function (entry) {
        return entry && entry.sku === sku;
      });
      if (cached) {
        return clone(cached);
      }
    }

    return window.IMS_HTTP.request(
      withStaffScopeQuery('/products/sku/' + encodeURIComponent(sku)),
    );
  }

  async function getStores(force) {
    if (!force && Array.isArray(cache.stores)) {
      return clone(cache.stores);
    }

    var scope = getStaffScope();
    cache.stores = await window.IMS_HTTP.request(
      withQuery('/stores', { retailerId: scope.retailerId }),
    );
    return clone(cache.stores);
  }

  async function getCustomers(force) {
    if (!force && Array.isArray(cache.customers)) {
      return clone(cache.customers);
    }

    cache.customers = await window.IMS_HTTP.request(withStaffScopeQuery('/customers'));
    return clone(cache.customers);
  }

  async function getReservations(storeId) {
    var scopedStoreId = storeId || getStaffScope().storeId;
    var suffix = scopedStoreId ? '?storeId=' + encodeURIComponent(scopedStoreId) : '';
    return window.IMS_HTTP.request('/reservations' + suffix);
  }

  async function getReservationRequests(status) {
    var path = status
      ? '/reservations/requests?status=' + encodeURIComponent(status)
      : '/reservations/requests';
    return window.IMS_HTTP.request(withCustomerQuery(path));
  }

  async function getReservationRequest(requestId) {
    if (!requestId) {
      return null;
    }
    return window.IMS_HTTP.request(
      '/reservations/requests/' + encodeURIComponent(requestId),
    );
  }

  async function createReservationRequest(payload) {
    return window.IMS_HTTP.request('/reservations/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function updateReservationRequest(requestId, payload) {
    return window.IMS_HTTP.request(
      '/reservations/requests/' + encodeURIComponent(requestId),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
  }

  async function getTransactions() {
    return window.IMS_HTTP.request(withCustomerOrStaffQuery('/transactions'));
  }

  async function getLatestTransaction() {
    return window.IMS_HTTP.request(withCustomerOrStaffQuery('/transactions/latest'));
  }

  async function getTransactionByOrderId(orderId) {
    if (!orderId) {
      return null;
    }
    return window.IMS_HTTP.request(
      withCustomerOrStaffQuery('/transactions/' + encodeURIComponent(orderId)),
    );
  }

  async function createTransaction(payload) {
    var created = await window.IMS_HTTP.request('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    clearProductsCache();
    return created;
  }

  async function updateTransaction(orderId, payload) {
    var updated = await window.IMS_HTTP.request(
      '/transactions/' + encodeURIComponent(orderId),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    clearProductsCache();
    return updated;
  }

  async function deleteTransaction(orderId) {
    var removed = await window.IMS_HTTP.request(
      '/transactions/' + encodeURIComponent(orderId),
      { method: 'DELETE' },
    );
    clearProductsCache();
    return removed;
  }

  async function reconcileInventory() {
    var result = await window.IMS_HTTP.request('/transactions/reconcile', {
      method: 'POST',
    });
    clearProductsCache();
    return result;
  }

  async function getPurchasedProducts() {
    return window.IMS_HTTP.request(
      withCustomerOrStaffQuery('/transactions/purchased-products'),
    );
  }

  async function getProductFeedback(sku) {
    if (!sku) {
      return [];
    }
    return window.IMS_HTTP.request(
      '/products/sku/' + encodeURIComponent(sku) + '/feedback',
    );
  }

  async function getRatingSummary(sku) {
    if (!sku) {
      return { avg: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
    return window.IMS_HTTP.request(
      '/products/sku/' + encodeURIComponent(sku) + '/rating-summary',
    );
  }

  async function submitFeedback(sku, payload) {
    var feedbackPayload = {
      productName: payload && payload.productName,
      customer: payload && payload.customer,
      type: payload && payload.type,
      rating: payload && payload.rating,
      comment: payload && payload.comment,
    };
    var created = await window.IMS_HTTP.request(
      '/products/sku/' + encodeURIComponent(sku) + '/feedback',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload),
      },
    );
    clearProductsCache();
    return created;
  }

  async function getReturns() {
    return window.IMS_HTTP.request(withCustomerOrStaffQuery('/returns'));
  }

  async function createReturn(payload) {
    var session = readSession();
    return window.IMS_HTTP.request('/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: session && session.name ? session.name : undefined,
        customerId: session && session.id ? session.id : undefined,
        email: session && session.email ? session.email : undefined,
        ...payload,
      }),
    });
  }

  window.ImsApi = {
    clearAllCache: clearAllCache,
    clearProductsCache: clearProductsCache,
    getProducts: getProducts,
    getProductBySku: getProductBySku,
    getStores: getStores,
    getCustomers: getCustomers,
    getReservations: getReservations,
    getReservationRequests: getReservationRequests,
    getReservationRequest: getReservationRequest,
    createReservationRequest: createReservationRequest,
    updateReservationRequest: updateReservationRequest,
    getTransactions: getTransactions,
    getLatestTransaction: getLatestTransaction,
    getTransactionByOrderId: getTransactionByOrderId,
    createTransaction: createTransaction,
    updateTransaction: updateTransaction,
    deleteTransaction: deleteTransaction,
    reconcileInventory: reconcileInventory,
    getPurchasedProducts: getPurchasedProducts,
    getProductFeedback: getProductFeedback,
    getRatingSummary: getRatingSummary,
    submitFeedback: submitFeedback,
    getReturns: getReturns,
    createReturn: createReturn,
  };
})();
