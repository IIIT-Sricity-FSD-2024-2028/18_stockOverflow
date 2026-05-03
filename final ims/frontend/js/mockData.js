// Unified browser data engine for interactive modules.

const APP_SEED = {
  users: [
    { id: 'u-admin-1', name: 'System Administrator', email: 'admin@stockoverflow.com', password: 'pass1234', role: 'admin', status: 'Active', store: 'Global Hub' },
    { id: 'u-retailer-1', name: 'Primary Retailer', email: 'retailer@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Active', store: 'Downtown Store' },
    { id: 'u-supplier-1', name: 'Primary Supplier', email: 'supplier@stockoverflow.com', password: 'pass1234', role: 'supplier', status: 'Active', store: 'Global Hub' },
    { id: 'u-consumer-1', name: 'Primary Consumer', email: 'consumer@stockoverflow.com', password: 'pass1234', role: 'consumer', status: 'Active', store: 'Downtown Store' }
  ],
  roles: [
    {
      name: 'Retailer',
      description: 'Manage store inventory and orders',
      permissions: { viewInventory: true, editInventory: true, manageOrders: true, updateDeliveryStatus: false, viewReports: true, manageUsers: false }
    },
    {
      name: 'Supplier',
      description: 'Supply products and manage distribution',
      permissions: { viewInventory: true, editInventory: false, manageOrders: false, updateDeliveryStatus: true, viewReports: true, manageUsers: false }
    },
    {
      name: 'Consumer',
      description: 'Browse and purchase products',
      permissions: { viewInventory: true, editInventory: false, manageOrders: false, updateDeliveryStatus: false, viewReports: false, manageUsers: false }
    }
  ],
  inventory: [
    { sku: 'PT001', name: 'Lenovo IdeaPad 3', category: 'Computers', brand: 'Lenovo', priceUSD: 600, unit: 'Pc', qty: 100, max: 300, creator: 'James Kirwin', creatorImg: '', productImg: '', emoji: '💻', soldThisMonth: 22, trend: 'up', min: 20 },
    { sku: 'PT002', name: 'Beats Pro', category: 'Audio', brand: 'Beats', priceUSD: 160, unit: 'Pc', qty: 140, max: 300, creator: 'Francis Chang', creatorImg: '', productImg: '', emoji: '🎧', soldThisMonth: 38, trend: 'up', min: 24 },
    { sku: 'PT003', name: 'Nike Jordan', category: 'Footwear', brand: 'Nike', priceUSD: 110, unit: 'Pc', qty: 300, max: 500, creator: 'Antonio Engle', creatorImg: '', productImg: '', emoji: '👟', soldThisMonth: 54, trend: 'up', min: 50 },
    { sku: 'PT004', name: 'Apple Series 5 Watch', category: 'Wearables', brand: 'Apple', priceUSD: 120, unit: 'Pc', qty: 450, max: 500, creator: 'Leo Kelly', creatorImg: '', productImg: '', emoji: '⌚', soldThisMonth: 17, trend: 'down', min: 40 },
    { sku: 'PT005', name: 'Amazon Echo Dot', category: 'Smart Home', brand: 'Amazon', priceUSD: 80, unit: 'Pc', qty: 320, max: 500, creator: 'Annette Walker', creatorImg: '', productImg: '', emoji: '🔊', soldThisMonth: 29, trend: 'up', min: 40 },
    { sku: 'PT006', name: 'Sanford Chair Sofa', category: 'Furniture', brand: 'Modern Wave', priceUSD: 320, unit: 'Pc', qty: 650, max: 800, creator: 'John Weaver', creatorImg: '', productImg: '', emoji: '🛋️', soldThisMonth: 8, trend: 'down', min: 60 },
    { sku: 'PT007', name: 'Red Premium Satchel', category: 'Accessories', brand: 'Dior', priceUSD: 60, unit: 'Pc', qty: 700, max: 800, creator: 'Gary Hennessy', creatorImg: '', productImg: '', emoji: '👜', soldThisMonth: 41, trend: 'up', min: 50 },
    { sku: 'PT008', name: 'iPhone 14 Pro', category: 'Mobiles', brand: 'Apple', priceUSD: 540, unit: 'Pc', qty: 630, max: 800, creator: 'Eleanor Panek', creatorImg: '', productImg: '', emoji: '📱', soldThisMonth: 63, trend: 'up', min: 70 },
    { sku: 'PT009', name: 'Gaming Chair', category: 'Furniture', brand: 'Arlime', priceUSD: 200, unit: 'Pc', qty: 410, max: 500, creator: 'William Levy', creatorImg: '', productImg: '', emoji: '🪑', soldThisMonth: 12, trend: 'down', min: 40 },
    { sku: 'PT010', name: 'Borealis Backpack', category: 'Accessories', brand: 'The North Face', priceUSD: 45, unit: 'Pc', qty: 550, max: 800, creator: 'Charlotte Klotz', creatorImg: '', productImg: '', emoji: '🎒', soldThisMonth: 33, trend: 'up', min: 50 },
    { sku: 'PT011', name: 'Sony WH-1000XM6', category: 'Audio', brand: 'Sony', priceUSD: 349, unit: 'Pc', qty: 8, max: 300, creator: 'James Kirwin', creatorImg: '', productImg: '', emoji: '🎧', soldThisMonth: 55, trend: 'up', min: 12 },
    { sku: 'PT012', name: 'MacBook Air M4', category: 'Computers', brand: 'Apple', priceUSD: 1099, unit: 'Pc', qty: 0, max: 200, creator: 'Francis Chang', creatorImg: '', productImg: '', emoji: '💻', soldThisMonth: 19, trend: 'up', min: 10 },
    { sku: 'PT013', name: 'Levi\'s 512 Jeans', category: 'Fashion', brand: 'Levi\'s', priceUSD: 79, unit: 'Pc', qty: 480, max: 600, creator: 'Leo Kelly', creatorImg: '', productImg: '', emoji: '👖', soldThisMonth: 28, trend: 'up', min: 45 },
    { sku: 'PT014', name: 'Dyson V16 Vacuum', category: 'Appliances', brand: 'Dyson', priceUSD: 599, unit: 'Pc', qty: 5, max: 150, creator: 'Annette Walker', creatorImg: '', productImg: '', emoji: '🧹', soldThisMonth: 7, trend: 'down', min: 10 },
    { sku: 'PT015', name: 'Nike Air Max 2025', category: 'Footwear', brand: 'Nike', priceUSD: 189, unit: 'Pc', qty: 210, max: 400, creator: 'John Weaver', creatorImg: '', productImg: '', emoji: '👟', soldThisMonth: 47, trend: 'up', min: 35 }
  ]
};

function readTable(name, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`so_${name}`));
    return Array.isArray(parsed) ? parsed : (fallback || []);
  } catch (_err) {
    return fallback || [];
  }
}

function writeTable(name, data) {
  localStorage.setItem(`so_${name}`, JSON.stringify(Array.isArray(data) ? data : []));
  window.dispatchEvent(new Event(`so_${name}_updated`));
}

function formatMoney(value) {
  return '$' + (Number(value) || 0).toLocaleString();
}

function ensureStoreValue(name) {
  const value = String(name || '').trim();
  return value || 'Global Hub';
}

function deriveOrdersFromPosTransactions() {
  let transactions = [];
  try {
    transactions = JSON.parse(localStorage.getItem('imsPosTransactionsV1') || '[]');
  } catch (_err) {
    transactions = [];
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return readTable('orders', []);
  }

  return transactions.map((tx, idx) => {
    const items = Array.isArray(tx.items) ? tx.items : [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    return {
      id: tx.orderId || `TX-${idx + 1}`,
      supplierName: tx.customerName || tx.source || 'Walk-in Customer',
      orderDate: tx.timestamp ? new Date(tx.timestamp).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: tx.status || 'Delivered',
      totalAmount: Number(totalAmount.toFixed(2)),
      items: items.length,
      store: ensureStoreValue(tx.storeName || tx.store)
    };
  });
}

function deriveStores(users, inventory, orders) {
  const countsByStore = {};

  users.forEach((user) => {
    const storeName = ensureStoreValue(user.store);
    if (!countsByStore[storeName]) {
      countsByStore[storeName] = {
        managers: [],
        orders: 0,
        revenue: 0,
        products: 0,
        inventoryWeight: 0
      };
    }

    if (String(user.role).toLowerCase() === 'retailer' || String(user.role).toLowerCase() === 'admin') {
      countsByStore[storeName].managers.push(user.name);
    }
  });

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  safeOrders.forEach((order) => {
    const storeName = ensureStoreValue(order.store);
    if (!countsByStore[storeName]) {
      countsByStore[storeName] = { managers: [], orders: 0, revenue: 0, products: 0, inventoryWeight: 0 };
    }
    countsByStore[storeName].orders += 1;
    countsByStore[storeName].revenue += Number(order.totalAmount) || 0;
  });

  const storeNames = Object.keys(countsByStore).length ? Object.keys(countsByStore) : ['Global Hub'];

  const inventoryWeightTotal = safeInventory.reduce((sum, item) => {
    return sum + Math.max(1, Number(item.qty) || 0);
  }, 0);

  storeNames.forEach((storeName) => {
    const ref = countsByStore[storeName];
    ref.inventoryWeight = Math.max(1, inventoryWeightTotal / storeNames.length);
    ref.products = safeInventory.length;
  });

  return storeNames.map((storeName, index) => {
    const ref = countsByStore[storeName];
    const manager = ref.managers[0] || 'Unassigned';
    const estimatedRevenue = ref.revenue;
    const status = ref.orders > 0 || ref.products > 0 ? 'Active' : 'Pending';
    return {
      id: `s${index + 1}`,
      name: storeName,
      location: 'Location configured in store profile',
      manager,
      products: ref.products,
      orders: ref.orders,
      revenue: formatMoney(estimatedRevenue),
      status
    };
  });
}

function initDataStore() {
  if (!localStorage.getItem('so_users')) {
    writeTable('users', APP_SEED.users);
  }

  if (!localStorage.getItem('so_roles')) {
    writeTable('roles', APP_SEED.roles);
  }

  if (!localStorage.getItem('so_inventory')) {
    writeTable('inventory', APP_SEED.inventory);
  }

  if (!localStorage.getItem('so_transactions')) {
    writeTable('transactions', []);
  }

  if (!localStorage.getItem('so_orders')) {
    writeTable('orders', []);
  }

  if (!localStorage.getItem('so_stores')) {
    writeTable('stores', []);
  }
}

function syncDerivedTables() {
  const users = readTable('users', APP_SEED.users);
  let inventory = readTable('inventory', APP_SEED.inventory);
  if (!Array.isArray(inventory) || inventory.length === 0) {
    inventory = APP_SEED.inventory.slice();
    writeTable('inventory', inventory);
  }
  const orders = deriveOrdersFromPosTransactions();
  const stores = deriveStores(users, inventory, orders);
  writeTable('orders', orders);
  writeTable('stores', stores);
}

window.applyUserIsolation = function () {
  if (typeof window.DB === 'undefined') return;
  const session = window.DB.getCurrentSession();
  if (!session || !session.isFirstTime) return;

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.metric-value, .rev-stat-val, .ts-val, .overall-stat-val, .fin-card-val, .donut-center-val, .donut-center-total, .product-meta, .sale-sub, .top-cust-amount').forEach((el) => {
      if (el.textContent.includes('$')) el.textContent = '$0';
      else if (el.textContent.includes('x')) el.textContent = '0x';
      else if (el.textContent.includes(' sold')) el.textContent = '0 sold';
      else el.textContent = '0';
    });
    document.querySelectorAll('.badge, .metric-badge, .ts-badge, .badge-up, .badge-down, .badge-warn').forEach((el) => {
      el.innerHTML = '0.0%';
      el.className = 'badge neutral';
    });
  });
};

function normalizeFeedbackEntry(entry) {
  return {
    rating: Math.max(1, Math.min(5, Number(entry.rating) || 0)),
    type: String(entry.type || 'General').trim() || 'General',
    comment: String(entry.comment || '').trim(),
    date: entry.date || new Date().toISOString(),
    productName: String(entry.productName || '').trim(),
    sku: String(entry.sku || '').trim()
  };
}

window.DB = {
  getUsers: () => readTable('users', APP_SEED.users),
  saveUsers: (data) => {
    writeTable('users', data);
    syncDerivedTables();
  },

  getRoles: () => readTable('roles', APP_SEED.roles),
  saveRoles: (data) => writeTable('roles', data),

  getStores: () => readTable('stores', []),
  saveStores: (data) => writeTable('stores', data),

  getInventory: () => readTable('inventory', []),
  saveInventory: (data) => {
    writeTable('inventory', data);
    syncDerivedTables();
  },

  getOrders: () => readTable('orders', []),
  saveOrders: (data) => writeTable('orders', data),

  getTransactions: () => {
    const dbTransactions = readTable('transactions', []);
    if (dbTransactions.length) return dbTransactions;
    try {
      const posTransactions = JSON.parse(localStorage.getItem('imsPosTransactionsV1') || '[]');
      return Array.isArray(posTransactions) ? posTransactions : [];
    } catch (_err) {
      return [];
    }
  },
  saveTransactions: (data) => {
    writeTable('transactions', data);
    localStorage.setItem('imsPosTransactionsV1', JSON.stringify(Array.isArray(data) ? data : []));
  },

  login: (email, password) => {
    const users = readTable('users', APP_SEED.users);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (user.status !== 'Active') {
      throw new Error('Account is inactive.');
    }

    localStorage.setItem('so_session', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store,
      isFirstTime: user.isFirstTime === true
    }));

    if (user.isFirstTime) {
      user.isFirstTime = false;
      writeTable('users', users);
    }

    return user;
  },

  logout: () => {
    localStorage.removeItem('so_session');
  },

  getCurrentSession: () => {
    try {
      return JSON.parse(localStorage.getItem('so_session'));
    } catch (_err) {
      return null;
    }
  },

  updateProductFeedback: (sku, feedbackEntry) => {
    if (!sku) return false;
    const items = readTable('inventory', []);
    const idx = items.findIndex((product) => product && product.sku === sku);
    if (idx < 0) return false;

    const product = Object.assign({}, items[idx]);
    const feedback = normalizeFeedbackEntry(Object.assign({}, feedbackEntry, { sku }));
    const feedbackList = Array.isArray(product.feedback) ? product.feedback.slice() : [];

    feedbackList.unshift(feedback);
    product.feedback = feedbackList.slice(0, 100);

    const breakdown = Object.assign({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, product.ratingBreakdown || {});
    breakdown[feedback.rating] = (Number(breakdown[feedback.rating]) || 0) + 1;
    product.ratingBreakdown = breakdown;

    const ratingCount = Object.keys(breakdown).reduce((sum, key) => sum + (Number(breakdown[key]) || 0), 0);
    const weighted = (breakdown[1] * 1) + (breakdown[2] * 2) + (breakdown[3] * 3) + (breakdown[4] * 4) + (breakdown[5] * 5);
    product.ratingCount = ratingCount;
    product.ratingAvg = ratingCount ? Number((weighted / ratingCount).toFixed(1)) : 0;

    items[idx] = product;
    writeTable('inventory', items);
    return true;
  },

  getProductFeedback: (sku) => {
    if (!sku) return [];
    const items = readTable('inventory', []);
    const product = items.find((p) => p && p.sku === sku);
    if (!product || !Array.isArray(product.feedback)) return [];
    return product.feedback.slice();
  },

  getRatingSummary: (sku) => {
    if (!sku) {
      return { avg: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const items = readTable('inventory', []);
    const product = items.find((p) => p && p.sku === sku);
    if (!product) {
      return { avg: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const breakdown = Object.assign({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, product.ratingBreakdown || {});
    const total = Object.keys(breakdown).reduce((sum, key) => sum + (Number(breakdown[key]) || 0), 0);
    const weighted = (breakdown[1] * 1) + (breakdown[2] * 2) + (breakdown[3] * 3) + (breakdown[4] * 4) + (breakdown[5] * 5);
    const avg = total ? Number((weighted / total).toFixed(1)) : 0;
    return { avg, total, breakdown };
  },

  resetDB: () => {
    if (confirm('Are you sure you want to reset all project data? This removes all saved users, orders, products, and feedback.')) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('so_') || key.startsWith('ims')) {
          localStorage.removeItem(key);
        }
      });
      initDataStore();
      syncDerivedTables();
      window.location.reload();
    }
  }
};

initDataStore();
syncDerivedTables();
