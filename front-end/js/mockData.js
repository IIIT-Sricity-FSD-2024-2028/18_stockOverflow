// Mock Backend Data Manager - Unified

const MOCK_DATA = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@stockoverflow.com', password: 'pass1234', role: 'admin', status: 'Active', store: 'Global Hub' },
    { id: '2', name: 'John Smith', email: 'john.smith@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Active', store: 'Downtown Store' },
    { id: '3', name: 'Sarah Johnson', email: 'sarah.j@stockoverflow.com', password: 'pass1234', role: 'supplier', status: 'Active', store: 'Global Hub' },
    { id: '4', name: 'Michael Brown', email: 'michael.b@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Active', store: 'East Coast Hub' },
    { id: '5', name: 'Emily Davis', email: 'emily.davis@stockoverflow.com', password: 'pass1234', role: 'consumer', status: 'Active', store: 'North Point Outlet' },
    { id: '6', name: 'David Wilson', email: 'david.w@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Warning', store: 'South Plaza Store' }
  ],
  stores: [
    { id: 's1', name: 'Downtown Store', location: '123 Main St, New York, NY', manager: 'John Smith', products: 1450, orders: 842, revenue: '$124,500', status: 'Active' },
    { id: 's2', name: 'West Side Branch', location: '456 West Ave, Los Angeles, CA', manager: 'Sarah Johnson', products: 890, orders: 418, revenue: '$72,300', status: 'Active' },
    { id: 's3', name: 'East Coast Hub', location: '789 Ocean Blvd, Miami, FL', manager: 'Michael Brown', products: 2100, orders: 1107, revenue: '$245,800', status: 'Active' },
    { id: 's4', name: 'North Point Outlet', location: '321 North Rd, Chicago, IL', manager: 'Emily Davis', products: 1540, orders: 595, revenue: '$69,400', status: 'Active' },
    { id: 's5', name: 'South Plaza Store', location: '654 South St, Houston, TX', manager: 'David Wilson', products: 1120, orders: 684, revenue: '$93,600', status: 'Pending' },
    { id: 's6', name: 'Central Market', location: '987 Central Ave, Phoenix, AZ', manager: 'Lisa Martinez', products: 1321, orders: 361, revenue: '$96,100', status: 'Active' },
    { id: 's7', name: 'Global Hub', location: '888 Broadway, New York, NY', manager: 'Admin User', products: 3200, orders: 1840, revenue: '$412,000', status: 'Active' }
  ],
  inventory: [
    { sku: 'PT001', name: 'Lenovo IdeaPad 3', category: 'Computers', brand: 'Lenovo', priceUSD: 600, unit: 'Pc', qty: 100, max: 300, creator: 'James Kirwin', creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4', productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2', emoji: '💻', soldThisMonth: 22, trend: 'up' },
    { sku: 'PT002', name: 'Beats Pro', category: 'Electronics', brand: 'Beats', priceUSD: 160, unit: 'Pc', qty: 140, max: 300, creator: 'Francis Chang', creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417', productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7', emoji: '🎧', soldThisMonth: 38, trend: 'up' },
    { sku: 'PT003', name: 'Nike Jordan', category: 'Shoe', brand: 'Nike', priceUSD: 110, unit: 'Pc', qty: 300, max: 500, creator: 'Antonio Engle', creatorImg: 'https://www.figma.com/api/mcp/asset/d5518c84-4bc4-4659-9958-20d59962e84b', productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d', emoji: '👟', soldThisMonth: 54, trend: 'up' },
    { sku: 'PT004', name: 'Apple Series 5 Watch', category: 'Electronics', brand: 'Apple', priceUSD: 120, unit: 'Pc', qty: 450, max: 500, creator: 'Leo Kelly', creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb', productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547', emoji: '⌚', soldThisMonth: 17, trend: 'down' },
    { sku: 'PT005', name: 'Amazon Echo Dot', category: 'Electronics', brand: 'Amazon', priceUSD: 80, unit: 'Pc', qty: 320, max: 500, creator: 'Annette Walker', creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268', productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85', emoji: '🔊', soldThisMonth: 29, trend: 'up' },
    { sku: 'PT006', name: 'Sanford Chair Sofa', category: 'Furniture', brand: 'Modern Wave', priceUSD: 320, unit: 'Pc', qty: 650, max: 800, creator: 'John Weaver', creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca', productImg: 'https://www.figma.com/api/mcp/asset/97dece36-1822-41e2-ac5d-abf55c224abd', emoji: '🛋️', soldThisMonth: 8, trend: 'down' },
    { sku: 'PT007', name: 'Red Premium Satchel', category: 'Bags', brand: 'Dior', priceUSD: 60, unit: 'Pc', qty: 700, max: 800, creator: 'Gary Hennessy', creatorImg: 'https://www.figma.com/api/mcp/asset/38d4ff50-b365-4010-89a3-c4c7970201ca', productImg: 'https://www.figma.com/api/mcp/asset/97044a6f-0f4a-486c-ac45-ad0f2c5a0c62', emoji: '👜', soldThisMonth: 41, trend: 'up' },
    { sku: 'PT008', name: 'iPhone 14 Pro', category: 'Phone', brand: 'Apple', priceUSD: 540, unit: 'Pc', qty: 630, max: 800, creator: 'Eleanor Panek', creatorImg: 'https://www.figma.com/api/mcp/asset/0ea47749-df36-4768-bff0-50654a1e9123', productImg: 'https://www.figma.com/api/mcp/asset/37ec56a8-ac9e-4371-a973-68a8a931703c', emoji: '📱', soldThisMonth: 63, trend: 'up' },
    { sku: 'PT009', name: 'Gaming Chair', category: 'Furniture', brand: 'Arlime', priceUSD: 200, unit: 'Pc', qty: 410, max: 500, creator: 'William Levy', creatorImg: 'https://www.figma.com/api/mcp/asset/c443dd72-8038-47b5-9154-94f8138db7d3', productImg: 'https://www.figma.com/api/mcp/asset/8d113917-5b4a-4693-94f4-98177c4d6cc6', emoji: '🪑', soldThisMonth: 12, trend: 'down' },
    { sku: 'PT010', name: 'Borealis Backpack', category: 'Bags', brand: 'The North Face', priceUSD: 45, unit: 'Pc', qty: 550, max: 800, creator: 'Charlotte Klotz', creatorImg: 'https://www.figma.com/api/mcp/asset/7aa74334-d316-48b9-9833-a00521f5ebc1', productImg: 'https://www.figma.com/api/mcp/asset/3cca4ac4-77e6-416c-9fc3-97d627b98218', emoji: '🎒', soldThisMonth: 33, trend: 'up' },
    { sku: 'PT011', name: 'Sony WH-1000XM6', category: 'Electronics', brand: 'Sony', priceUSD: 349, unit: 'Pc', qty: 8, max: 300, creator: 'James Kirwin', creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4', productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7', emoji: '🎧', soldThisMonth: 55, trend: 'up' },
    { sku: 'PT012', name: 'MacBook Air M4', category: 'Computers', brand: 'Apple', priceUSD: 1099, unit: 'Pc', qty: 0, max: 200, creator: 'Francis Chang', creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417', productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2', emoji: '💻', soldThisMonth: 19, trend: 'up' },
    { sku: 'PT013', name: "Levi's 512 Jeans", category: 'Fashion', brand: "Levi's", priceUSD: 79, unit: 'Pc', qty: 480, max: 600, creator: 'Leo Kelly', creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb', productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d', emoji: '👖', soldThisMonth: 28, trend: 'up' },
    { sku: 'PT014', name: 'Dyson V16 Vacuum', category: 'Appliances', brand: 'Dyson', priceUSD: 599, unit: 'Pc', qty: 5, max: 150, creator: 'Annette Walker', creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268', productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547', emoji: '🧹', soldThisMonth: 7, trend: 'down' },
    { sku: 'PT015', name: 'Nike Air Max 2025', category: 'Shoe', brand: 'Nike', priceUSD: 189, unit: 'Pc', qty: 210, max: 400, creator: 'John Weaver', creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca', productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85', emoji: '👟', soldThisMonth: 47, trend: 'up' }
  ],
  orders: [
    {
      id: "PO-2023-001",
      supplierName: "Tech Distributors Inc.",
      orderDate: "2026-03-20",
      status: "Delivered",
      totalAmount: 12500,
      items: 2
    },
    {
      id: "PO-2023-002",
      supplierName: "Global Electronics Ltd",
      orderDate: "2026-04-01",
      status: "Pending",
      totalAmount: 4500,
      items: 1
    }
  ],
  transactions: [],
  roles: [
    { 
      name: 'Retailer', 
      description: 'Manage store inventory and orders', 
      permissions: { viewInventory: true, editInventory: true, manageOrders: true, updateDeliveryStatus: false, viewReports: true, manageUsers: false } 
    },
    { 
      name: 'Supplier', 
      description: 'Supply products and manage distribution', 
      permissions: { viewInventory: true, editInventory: false, manageOrders: false, updateDeliveryStatus: true, viewReports: false, manageUsers: false } 
    },
    { 
      name: 'Consumer', 
      description: 'Browse and purchase products', 
      permissions: { viewInventory: true, editInventory: false, manageOrders: false, updateDeliveryStatus: false, viewReports: false, manageUsers: false } 
    }
  ]
};

// Initialization utility
function initMockDB() {
  if (!localStorage.getItem('so_users')) {
    localStorage.setItem('so_users', JSON.stringify(MOCK_DATA.users));
  }
  if (!localStorage.getItem('so_stores')) {
    localStorage.setItem('so_stores', JSON.stringify(MOCK_DATA.stores));
  }
  if (!localStorage.getItem('so_inventory')) {
    localStorage.setItem('so_inventory', JSON.stringify(MOCK_DATA.inventory));
  }
  if (!localStorage.getItem('so_roles')) {
    localStorage.setItem('so_roles', JSON.stringify(MOCK_DATA.roles));
  }
  if (!localStorage.getItem('so_orders')) {
    localStorage.setItem('so_orders', JSON.stringify(MOCK_DATA.orders));
  }
  if (!localStorage.getItem('so_transactions')) {
    localStorage.setItem('so_transactions', JSON.stringify(MOCK_DATA.transactions));
  }
  
  // Enrichment for existing stores to ensure they have the new mock stats
  try {
    let _stores = JSON.parse(localStorage.getItem('so_stores') || '[]');
    MOCK_DATA.stores.forEach(ms => {
      let existingIndex = _stores.findIndex(s => s.id === ms.id);
      if (existingIndex !== -1) {
        let existing = _stores[existingIndex];
        // Force update if metrics are zero or missing
        if (!existing.products || existing.products == 0 || !existing.revenue || existing.revenue === '$0') {
          _stores[existingIndex] = { ...existing, ...ms };
        }
      } else {
        _stores.push(ms);
      }
    });
    // Final check to remove any stores that still somehow have 0 products/revenue
    _stores = _stores.filter(s => s.products > 0 && s.revenue !== '$0');
    localStorage.setItem('so_stores', JSON.stringify(_stores));
  } catch(e) {}
  
  // Patch for existing localStorage consumers being Inactive
  try {
    let _users = JSON.parse(localStorage.getItem('so_users') || '[]');
    let _c = _users.find(u => u.email === 'emily.davis@stockoverflow.com');
    if (_c && _c.status === 'Inactive') {
      _c.status = 'Active';
      localStorage.setItem('so_users', JSON.stringify(_users));
    }
  } catch(e) {}
  
  // Also migrate the isolated retailer DB if it exists, otherwise it will be overwritten
  // We'll clean this up by just forcing it to read from so_inventory eventually.
}

function getTable(name) {
  try {
    return JSON.parse(localStorage.getItem(`so_${name}`)) || [];
  } catch(e) {
    return [];
  }
}

function saveTable(name, data) {
  localStorage.setItem(`so_${name}`, JSON.stringify(data));
  // Broadcast an event so other tabs/modules can update (optional, but good for local dev)
  window.dispatchEvent(new Event(`so_${name}_updated`));
}

// Simulated CRUD wrappers
window.applyUserIsolation = function() {
  if (typeof window.DB === 'undefined') return;
  const session = window.DB.getCurrentSession();
  // Check if session ID is essentially a new user ID (timestamp string) or explicitly marked
  if (session && (session.isFirstTime || (session.id && session.id.toString().length > 5))) {
    // Clear out conventional mock constants used globally in module dashboards
    if (typeof topSelling !== 'undefined') topSelling.length = 0;
    if (typeof lowStock !== 'undefined') lowStock.length = 0;
    if (typeof recentSales !== 'undefined') recentSales.length = 0;
    if (typeof transData !== 'undefined') Object.keys(transData).forEach(k => transData[k] = []);
    if (typeof topCustomers !== 'undefined') topCustomers.length = 0;
    if (typeof MOVEMENTS !== 'undefined') MOVEMENTS.length = 0;
    
    // Defer DOM clearing to execution hook
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.metric-value, .rev-stat-val, .ts-val, .overall-stat-val, .fin-card-val, .donut-center-val, .donut-center-total, .product-meta, .sale-sub, .top-cust-amount').forEach(el => {
        if (el.textContent.includes('$')) el.textContent = '$0';
        else if (el.textContent.includes('x')) el.textContent = '0x';
        else if (el.textContent.includes(' sold')) el.textContent = '0 sold';
        else el.textContent = '0';
      });
      document.querySelectorAll('.badge, .metric-badge, .ts-badge, .badge-up, .badge-down, .badge-warn').forEach(el => {
        el.innerHTML = '0.0%';
        el.className = 'badge neutral'; 
      });
      const ids = ['m-total-units', 'm-low-stock', 'm-out-stock', 'donut-total'];
      ids.forEach(id => {
        const _id = document.getElementById(id);
        if (_id) _id.textContent = '0';
      });
    });
  }
};

window.DB = {
  getUsers: () => getTable('users'),
  saveUsers: (data) => saveTable('users', data),
  
  getRoles: () => getTable('roles'),
  saveRoles: (data) => saveTable('roles', data),

  getStores: () => getTable('stores'),
  saveStores: (data) => saveTable('stores', data),
  
  getInventory: () => getTable('inventory'),
  saveInventory: (data) => saveTable('inventory', data),
  
  getOrders: () => getTable('orders'),
  saveOrders: (data) => saveTable('orders', data),
  
  getTransactions: () => getTable('transactions'),
  saveTransactions: (data) => saveTable('transactions', data),

  // Session handling
  login: (email, password) => {
    const users = DB.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if(user.status !== 'Active') {
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
      // Clear the isFirstTime flag after first login so next login shows normal data
      if (user.isFirstTime) {
        user.isFirstTime = false;
        const allUsers = DB.getUsers();
        const idx = allUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) { allUsers[idx].isFirstTime = false; saveTable('users', allUsers); }
      }
      return user;
    }
    throw new Error('Invalid email or password');
  },
  
  logout: () => {
    localStorage.removeItem('so_session');
  },
  
  getCurrentSession: () => {
    try {
      return JSON.parse(localStorage.getItem('so_session'));
    } catch(e) {
      return null;
    }
  },
  
  resetDB: () => {
    if(confirm('Are you sure you want to reset all data? This will restore the system to its initial mock state and clear all your changes.')) {
      Object.keys(localStorage).forEach(key => {
        if(key.startsWith('so_')) localStorage.removeItem(key);
      });
      window.location.reload(); 
    }
  }
};

// Run initialize on load
initMockDB();
