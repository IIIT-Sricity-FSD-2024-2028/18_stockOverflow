(function () {
  var APP_STATE_KEY = 'imsAppStateV1';
  var POS_TRANSACTIONS_KEY = 'imsPosTransactionsV1';
  var RESERVATIONS_KEY = 'imsReservations';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed == null ? clone(fallback) : parsed;
    } catch (_err) {
      return clone(fallback);
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readAppState() {
    var state = readJson(APP_STATE_KEY, { alerts: [], returns: [], feedback: [], lastReceiptOrderId: null });
    state.alerts = Array.isArray(state.alerts) ? state.alerts : [];
    state.returns = Array.isArray(state.returns) ? state.returns : [];
    state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
    return state;
  }

  function saveAppState(state) {
    writeJson(APP_STATE_KEY, state);
  }

  function getCatalog() {
    if (window.RetailerProductsData && typeof window.RetailerProductsData.getMasterProducts === 'function') {
      return window.RetailerProductsData.getMasterProducts();
    }
    if (window.RetailerProductsData && Array.isArray(window.RetailerProductsData.masterProducts)) {
      return clone(window.RetailerProductsData.masterProducts);
    }
    if (window.DB && typeof window.DB.getInventory === 'function') {
      return clone(window.DB.getInventory());
    }
    return [];
  }

  function getProductBySku(sku) {
    if (!sku) return null;
    var products = getCatalog();
    return products.find(function (item) { return item && item.sku === sku; }) || null;
  }

  function getStores() {
    if (window.DB && typeof window.DB.getStores === 'function') {
      var stores = window.DB.getStores();
      if (Array.isArray(stores) && stores.length) return stores;
    }
    return [
      { id: 's1', name: 'Downtown Store' },
      { id: 's3', name: 'East Coast Hub' },
      { id: 's7', name: 'Global Hub' }
    ];
  }

  function normalizeStoreAvailability(product) {
    if (!product) return [];
    var stores = getStores();
    var source = Array.isArray(product.storeInventory) && product.storeInventory.length ? product.storeInventory : [];
    if (!source.length) {
      var qty = Math.max(0, Number(product.qty) || 0);
      var weights = [0.35, 0.28, 0.37];
      var remaining = qty;
      source = stores.slice(0, 3).map(function (store, index) {
        var amount = index === 2 ? remaining : Math.floor(qty * weights[index]);
        remaining -= amount;
        return { storeId: store.id, qty: amount };
      });
    }

    return source.map(function (entry, index) {
      var store = stores.find(function (candidate) { return candidate.id === entry.storeId; }) || stores[index] || { name: 'Store ' + (index + 1) };
      var qty = Math.max(0, Number(entry.qty) || 0);
      var status = qty === 0 ? 'Out of Stock' : (qty <= Math.max(1, Math.ceil((Number(product.min) || 10) / 2)) ? 'Low Stock' : 'In Stock');
      return {
        storeId: entry.storeId || store.id || ('store-' + index),
        storeName: store.name || 'Store ' + (index + 1),
        qty: qty,
        status: status
      };
    });
  }

  function normalizeReservation(entry) {
    return {
      sku: String(entry && entry.sku || '').trim(),
      name: String(entry && (entry.name || entry.productName) || '').trim(),
      qty: Math.max(1, Number(entry && (entry.qty || entry.quantity) || 1)),
      priceUSD: Number(entry && (entry.priceUSD || entry.price) || 0),
      productImg: String(entry && entry.productImg || '').trim(),
      emoji: String(entry && entry.emoji || '📦'),
      maxAvailable: Math.max(0, Number(entry && entry.maxAvailable || 0)),
      reservedAt: entry && entry.reservedAt ? entry.reservedAt : new Date().toISOString()
    };
  }

  function getReservations() {
    return readJson(RESERVATIONS_KEY, []).map(normalizeReservation).filter(function (entry) {
      return entry.sku && entry.name;
    });
  }

  function saveReservations(list) {
    writeJson(RESERVATIONS_KEY, list.map(normalizeReservation));
  }

  function addReservation(product, quantity) {
    if (!product || !product.sku) return null;
    var reservations = getReservations();
    var qty = Math.max(1, Number(quantity) || 1);
    var existing = reservations.find(function (entry) { return entry.sku === product.sku; });
    if (existing) {
      existing.qty += qty;
      existing.maxAvailable = Math.max(existing.maxAvailable, Number(product.qty) || 0);
      saveReservations(reservations);
      return existing;
    }

    var created = normalizeReservation({
      sku: product.sku,
      name: product.name,
      qty: qty,
      priceUSD: product.priceUSD,
      productImg: product.productImg,
      emoji: product.emoji,
      maxAvailable: product.qty,
      reservedAt: new Date().toISOString()
    });
    reservations.unshift(created);
    saveReservations(reservations);
    return created;
  }

  function removeReservationBySku(sku) {
    if (!sku) return;
    saveReservations(getReservations().filter(function (entry) { return entry.sku !== sku; }));
  }

  function normalizeTransactionItem(item) {
    var quantity = Math.max(1, Number(item && (item.quantity || item.qty) || 1));
    var price = Number(item && item.price || 0);
    return {
      sku: String(item && item.sku || '').trim(),
      name: String(item && item.name || '').trim(),
      quantity: quantity,
      price: price,
      total: Number(item && item.total || quantity * price),
      isReserved: Boolean(item && item.isReserved)
    };
  }

  function normalizeTransaction(entry, index) {
    var items = Array.isArray(entry && entry.items) ? entry.items.map(normalizeTransactionItem) : [];
    var subtotal = Number(entry && entry.subtotal);
    if (!Number.isFinite(subtotal)) {
      subtotal = items.reduce(function (sum, item) { return sum + (Number(item.total) || 0); }, 0);
    }
    var finalTotal = Number(entry && (entry.finalTotal || entry.total));
    if (!Number.isFinite(finalTotal)) {
      finalTotal = subtotal + (Number(entry && entry.shipping) || 0) + (Number(entry && entry.tax) || 0) - (Number(entry && entry.coupon) || 0) - (Number(entry && entry.discount) || 0) + (Number(entry && entry.roundoff) || 0);
    }

    return {
      orderId: String(entry && (entry.orderId || entry.id) || ('ORD-' + (index + 1))).trim(),
      timestamp: entry && (entry.timestamp || entry.date) ? new Date(entry.timestamp || entry.date).toISOString() : new Date().toISOString(),
      customer: String(entry && (entry.customer || entry.customerName) || 'Walk-in Customer').trim(),
      store: String(entry && (entry.store || entry.storeName) || 'Global Hub').trim(),
      paymentMethod: String(entry && entry.paymentMethod || 'Cash').trim(),
      items: items,
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(Number(entry && entry.shipping || 0).toFixed(2)),
      tax: Number(Number(entry && entry.tax || 0).toFixed(2)),
      coupon: Number(Number(entry && entry.coupon || 0).toFixed(2)),
      discount: Number(Number(entry && entry.discount || 0).toFixed(2)),
      roundoff: Number(Number(entry && entry.roundoff || 0).toFixed(2)),
      finalTotal: Number(finalTotal.toFixed(2)),
      status: String(entry && entry.status || 'Delivered').trim()
    };
  }

  function dedupeTransactions(entries) {
    var seen = {};
    return entries.filter(function (entry) {
      if (!entry.orderId) return false;
      if (seen[entry.orderId]) return false;
      seen[entry.orderId] = true;
      return true;
    }).sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  function getTransactions() {
    var dbTransactions = [];
    if (window.DB && typeof window.DB.getTransactions === 'function') {
      dbTransactions = window.DB.getTransactions();
    }
    var localTransactions = readJson(POS_TRANSACTIONS_KEY, []);
    return dedupeTransactions([].concat(dbTransactions || [], localTransactions || []).map(normalizeTransaction));
  }

  function saveTransactions(list) {
    var normalized = dedupeTransactions((Array.isArray(list) ? list : []).map(normalizeTransaction));
    if (window.DB && typeof window.DB.saveTransactions === 'function') {
      window.DB.saveTransactions(normalized);
    }
    writeJson(POS_TRANSACTIONS_KEY, normalized);
    return normalized;
  }

  function createTransaction(entry) {
    var next = getTransactions();
    var normalized = normalizeTransaction(entry, next.length);
    next.unshift(normalized);
    saveTransactions(next);

    var state = readAppState();
    state.lastReceiptOrderId = normalized.orderId;
    saveAppState(state);
    return normalized;
  }

  function getLatestTransaction() {
    return getTransactions()[0] || null;
  }

  function getTransactionByOrderId(orderId) {
    if (!orderId) return null;
    return getTransactions().find(function (entry) { return entry.orderId === orderId; }) || null;
  }

  function getSubmittedFeedback() {
    return readAppState().feedback.map(function (entry) {
      return {
        sku: String(entry && entry.sku || '').trim(),
        productName: String(entry && entry.productName || '').trim(),
        type: String(entry && entry.type || 'General').trim(),
        rating: Math.max(1, Math.min(5, Number(entry && entry.rating) || 0)),
        comment: String(entry && entry.comment || '').trim(),
        customer: String(entry && entry.customer || 'Recent Buyer').trim(),
        date: entry && entry.date ? entry.date : new Date().toISOString()
      };
    }).filter(function (entry) {
      return entry.sku || entry.productName;
    });
  }

  function getProductFeedback(sku) {
    var product = getProductBySku(sku);
    var seeded = product && Array.isArray(product.feedback) ? clone(product.feedback) : [];
    var submitted = getSubmittedFeedback().filter(function (entry) {
      if (sku && entry.sku) return entry.sku === sku;
      return product && entry.productName && entry.productName.toLowerCase() === String(product.name || '').toLowerCase();
    });
    return submitted.concat(seeded).sort(function (a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }

  function getRatingSummary(sku) {
    var feedback = getProductFeedback(sku);
    var breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach(function (entry) {
      var rating = Math.max(1, Math.min(5, Number(entry.rating) || 0));
      breakdown[rating] += 1;
    });
    var total = feedback.length;
    var weighted = (breakdown[1] * 1) + (breakdown[2] * 2) + (breakdown[3] * 3) + (breakdown[4] * 4) + (breakdown[5] * 5);
    return { avg: total ? Number((weighted / total).toFixed(1)) : 0, total: total, breakdown: breakdown };
  }

  function submitFeedback(entry) {
    var state = readAppState();
    state.feedback.unshift({
      sku: String(entry && entry.sku || '').trim(),
      productName: String(entry && entry.productName || '').trim(),
      type: String(entry && entry.type || 'General').trim(),
      rating: Math.max(1, Math.min(5, Number(entry && entry.rating) || 0)),
      comment: String(entry && entry.comment || '').trim(),
      customer: String(entry && entry.customer || ((window.DB && window.DB.getCurrentSession && window.DB.getCurrentSession() && window.DB.getCurrentSession().name) || 'Recent Buyer')).trim(),
      date: new Date().toISOString()
    });
    state.feedback = state.feedback.slice(0, 200);
    saveAppState(state);
    if (window.DB && typeof window.DB.updateProductFeedback === 'function' && entry && entry.sku) {
      window.DB.updateProductFeedback(entry.sku, state.feedback[0]);
    }
    return state.feedback[0];
  }

  function getAlerts() {
    return readAppState().alerts.map(function (entry, index) {
      return {
        id: entry.id || ('alert-' + index + '-' + String(entry.productSku || entry.product || '').replace(/\W+/g, '').toLowerCase()),
        productSku: String(entry.productSku || entry.sku || '').trim(),
        product: String(entry.product || entry.name || '').trim(),
        qty: Math.max(1, Number(entry.qty) || 1),
        priority: String(entry.priority || 'Medium').trim(),
        status: String(entry.status || 'Notified').trim(),
        date: entry.date || new Date().toISOString(),
        baselineQty: Math.max(0, Number(entry.baselineQty != null ? entry.baselineQty : entry.currentQty) || 0),
        lastKnownQty: Math.max(0, Number(entry.lastKnownQty != null ? entry.lastKnownQty : entry.qty) || 0),
        productImg: String(entry.productImg || '').trim(),
        emoji: String(entry.emoji || '📦').trim(),
        restockedAt: entry.restockedAt || '',
        storeInventory: Array.isArray(entry.storeInventory) ? clone(entry.storeInventory) : []
      };
    });
  }

  function saveAlerts(list) {
    var state = readAppState();
    state.alerts = list;
    saveAppState(state);
  }

  function addAlert(entry) {
    var alerts = getAlerts();
    var alert = {
      id: entry.id || ('alert-' + Date.now()),
      productSku: String(entry.productSku || '').trim(),
      product: String(entry.product || '').trim(),
      qty: Math.max(1, Number(entry.qty) || 1),
      priority: String(entry.priority || 'Medium').trim(),
      status: String(entry.status || 'Notified').trim(),
      date: entry.date || new Date().toISOString(),
      baselineQty: Math.max(0, Number(entry.baselineQty != null ? entry.baselineQty : entry.currentQty) || 0),
      lastKnownQty: Math.max(0, Number(entry.lastKnownQty != null ? entry.lastKnownQty : entry.qty) || 0),
      productImg: String(entry.productImg || '').trim(),
      emoji: String(entry.emoji || '📦').trim(),
      restockedAt: entry.restockedAt || '',
      storeInventory: Array.isArray(entry.storeInventory) ? clone(entry.storeInventory) : []
    };
    alerts.unshift(alert);
    saveAlerts(alerts.slice(0, 100));
    return alert;
  }

  function removeAlert(id) {
    saveAlerts(getAlerts().filter(function (entry) { return entry.id !== id; }));
  }

  function getReturns() {
    return readAppState().returns.map(function (entry, index) {
      return {
        id: entry.id || ('return-' + index + '-' + Date.now()),
        orderId: String(entry.orderId || '').trim(),
        customer: String(entry.customer || 'Recent Customer').trim(),
        email: String(entry.email || '').trim(),
        sku: String(entry.sku || '').trim(),
        productName: String(entry.productName || '').trim(),
        product: String(entry.product || entry.productName || '').trim(),
        productImg: String(entry.productImg || '').trim(),
        emoji: String(entry.emoji || '📦').trim(),
        reason: String(entry.reason || 'Defective / Not Working').trim(),
        condition: String(entry.condition || 'Opened but Unused').trim(),
        refundMethod: String(entry.refundMethod || 'Original Payment Method').trim(),
        method: String(entry.method || entry.refundMethod || 'Original Payment Method').trim(),
        notes: String(entry.notes || '').trim(),
        status: String(entry.status || 'Pending').trim(),
        date: entry.date || new Date().toISOString(),
        dateN: Number(entry.dateN || Date.now()),
        amount: Number(Number(entry.amount || 0).toFixed(2)),
        priority: String(entry.priority || 'Medium').trim(),
        storeId: String(entry.storeId || '').trim(),
        store: String(entry.store || '').trim(),
        source: String(entry.source || 'customer').trim()
      };
    });
  }

  function addReturn(entry) {
    var state = readAppState();
    var created = {
      id: 'return-' + Date.now(),
      orderId: String(entry.orderId || '').trim(),
      customer: String(entry.customer || 'Recent Customer').trim(),
      email: String(entry.email || '').trim(),
      sku: String(entry.sku || '').trim(),
      productName: String(entry.productName || '').trim(),
      product: String(entry.product || entry.productName || '').trim(),
      productImg: String(entry.productImg || '').trim(),
      emoji: String(entry.emoji || '📦').trim(),
      reason: String(entry.reason || 'Defective / Not Working').trim(),
      condition: String(entry.condition || 'Opened but Unused').trim(),
      refundMethod: String(entry.refundMethod || 'Original Payment Method').trim(),
      method: String(entry.method || entry.refundMethod || 'Original Payment Method').trim(),
      notes: String(entry.notes || '').trim(),
      status: 'Pending',
      date: new Date().toISOString(),
      dateN: Date.now(),
      amount: Number(Number(entry.amount || 0).toFixed(2)),
      priority: String(entry.priority || 'Medium').trim(),
      storeId: String(entry.storeId || '').trim(),
      store: String(entry.store || '').trim(),
      source: String(entry.source || 'customer').trim()
    };
    state.returns.unshift(created);
    state.returns = state.returns.slice(0, 100);
    saveAppState(state);
    return created;
  }

  function getPurchasedProducts() {
    var grouped = {};
    getTransactions().forEach(function (tx) {
      tx.items.forEach(function (item) {
        var key = item.sku || item.name;
        if (!key) return;
        if (!grouped[key]) {
          var product = getProductBySku(item.sku) || {};
          grouped[key] = {
            sku: item.sku,
            name: item.name,
            totalQty: 0,
            totalSpent: 0,
            lastOrderedAt: tx.timestamp,
            lastOrderId: tx.orderId,
            productImg: product.productImg || '',
            emoji: product.emoji || '📦'
          };
        }
        grouped[key].totalQty += item.quantity;
        grouped[key].totalSpent += Number(item.total) || 0;
        if (new Date(tx.timestamp) > new Date(grouped[key].lastOrderedAt)) {
          grouped[key].lastOrderedAt = tx.timestamp;
          grouped[key].lastOrderId = tx.orderId;
        }
      });
    });

    return Object.keys(grouped).map(function (key) { return grouped[key]; }).sort(function (a, b) {
      return new Date(b.lastOrderedAt) - new Date(a.lastOrderedAt);
    });
  }

  window.CommerceData = {
    getCatalog: getCatalog,
    getProductBySku: getProductBySku,
    getStores: getStores,
    getStoreAvailability: normalizeStoreAvailability,
    getReservations: getReservations,
    addReservation: addReservation,
    removeReservationBySku: removeReservationBySku,
    saveReservations: saveReservations,
    getTransactions: getTransactions,
    saveTransactions: saveTransactions,
    createTransaction: createTransaction,
    getLatestTransaction: getLatestTransaction,
    getTransactionByOrderId: getTransactionByOrderId,
    getPurchasedProducts: getPurchasedProducts,
    getProductFeedback: getProductFeedback,
    getRatingSummary: getRatingSummary,
    submitFeedback: submitFeedback,
    getAlerts: getAlerts,
    addAlert: addAlert,
    removeAlert: removeAlert,
    getReturns: getReturns,
    addReturn: addReturn,
    getAppState: readAppState,
    saveAppState: saveAppState
  };
})();
