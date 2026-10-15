/**
 * mockData_admin.js - Centralized Seed Data for Admin Module
 */

export const ADMIN_DASHBOARD_STATS = {
  totalRetailers: 18,
  totalSuppliers: 12,
  totalConsumers: 142,
  lowStockAlerts: 4,
  totalStores: 5,
  totalProducts: 164,
  totalRevenue: 348500,
  platformCommission: 6970, // 2% take-rate
  totalTransactions: 1289,
};

export const INITIAL_ADMIN_USERS = [
  { id: 'u-admin-1', name: 'Super User', email: 'admin@stockoverflow.com', role: 'admin', status: 'Active', store: 'Global Hub', phone: '+1 555-0100' },
  { id: 'u-retailer-1', name: 'Downtown Retail Corp', email: 'retailer@stockoverflow.com', role: 'retailer', status: 'Active', store: 'Downtown Store', phone: '+1 555-0101' },
  { id: 'u-supplier-1', name: 'Nordic Logistics Supply', email: 'supplier@stockoverflow.com', role: 'supplier', status: 'Active', store: 'Central Warehouse', phone: '+1 555-0102' },
  { id: 'u-emp-1', name: 'Sarah Connor', email: 'sarah.c@stockoverflow.com', role: 'employee', status: 'Active', store: 'Downtown Store', phone: '+1 555-0103' },
  { id: 'u-biller-1', name: 'David Kim', email: 'david.k@stockoverflow.com', role: 'biller', status: 'Warning', store: 'Uptown Mall', phone: '+1 555-0104' },
  { id: 'u-consumer-1', name: 'Primary Consumer', email: 'consumer@stockoverflow.com', role: 'consumer', status: 'Active', store: 'Downtown Store', phone: '+1 555-0105' },
  { id: 'u-emp-2', name: 'Priya Sharma', email: 'priya.s@stockoverflow.com', role: 'employee', status: 'Active', store: 'Westside Outlet', phone: '+1 555-0106' },
  { id: 'u-retailer-2', name: 'Vance Goods Ltd', email: 'marcus@vancegoods.com', role: 'retailer', status: 'Inactive', store: 'Westside Outlet', phone: '+1 555-0107' }
];

export const INITIAL_ROLES_PERMISSIONS = [
  {
    id: 'retailer',
    name: 'Retailer',
    description: 'Manage store inventory, POS billing, and customer orders',
    permissions: {
      viewInventory: true,
      editInventory: true,
      manageOrders: true,
      updateDeliveryStatus: false,
      viewReports: true,
      manageUsers: false
    }
  },
  {
    id: 'supplier',
    name: 'Supplier',
    description: 'Supply wholesale products and manage distribution logistics',
    permissions: {
      viewInventory: true,
      editInventory: false,
      manageOrders: false,
      updateDeliveryStatus: true,
      viewReports: true,
      manageUsers: false
    }
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Handle customer checkouts, validation queue, and stock auditing',
    permissions: {
      viewInventory: true,
      editInventory: true,
      manageOrders: true,
      updateDeliveryStatus: false,
      viewReports: false,
      manageUsers: false
    }
  },
  {
    id: 'biller',
    name: 'Biller',
    description: 'Process POS billing counters and store sales receipts',
    permissions: {
      viewInventory: true,
      editInventory: false,
      manageOrders: true,
      updateDeliveryStatus: false,
      viewReports: false,
      manageUsers: false
    }
  },
  {
    id: 'consumer',
    name: 'Consumer',
    description: 'Browse storefront catalog, reserve holds, and place orders',
    permissions: {
      viewInventory: true,
      editInventory: false,
      manageOrders: false,
      updateDeliveryStatus: false,
      viewReports: false,
      manageUsers: false
    }
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system control, financial oversight, and role governance',
    permissions: {
      viewInventory: true,
      editInventory: true,
      manageOrders: true,
      updateDeliveryStatus: true,
      viewReports: true,
      manageUsers: true
    }
  }
];

export const PERMISSION_DEFINITIONS = [
  { key: 'viewInventory', label: 'View Inventory', description: 'Browse and inspect live stock across designated stores' },
  { key: 'editInventory', label: 'Edit & Add Inventory', description: 'Modify pricing, stock levels, and add new SKUs' },
  { key: 'manageOrders', label: 'Manage Orders', description: 'Process, fulfill, cancel, and refund store orders' },
  { key: 'updateDeliveryStatus', label: 'Update Delivery Status', description: 'Change shipping and delivery dispatch records' },
  { key: 'viewReports', label: 'View Financial Reports', description: 'Access revenue metrics, analytics, and sales audit data' },
  { key: 'manageUsers', label: 'Manage Users & Roles', description: 'Create, update, assign stores, and delete system users' }
];

export const REVENUE_TIERS = [
  {
    name: 'Starter Free',
    price: '₹0',
    period: '/month',
    featured: false,
    orderLimit: '5 orders/week',
    features: [
      'Single physical store location',
      'Up to 50 active SKUs',
      'Standard cashier POS terminal',
      '2.0% Transaction commission',
      'Standard community support'
    ]
  },
  {
    name: 'Growth Partner',
    price: '₹799',
    period: '/month',
    featured: true,
    orderLimit: '30 orders/week',
    features: [
      'Up to 5 multi-store branches',
      'Up to 1,000 active SKUs',
      'Multi-cashier billing sync',
      '2.0% Transaction commission',
      'Wholesale supplier auto-reorder',
      'Priority employee verification'
    ]
  },
  {
    name: 'Enterprise Logistics',
    price: '₹3,499',
    period: '/month',
    featured: false,
    orderLimit: 'Unlimited capacity',
    features: [
      'Unlimited stores & warehouse hubs',
      'Unlimited SKUs & catalog listings',
      'Unlimited weekly order volume',
      '2.0% Transaction commission',
      'Full REST API & webhook web access',
      'Dedicated 24/7 account support'
    ]
  }
];

export const STAKEHOLDER_REVENUE_RECORDS = [
  // Retailers
  {
    id: 'RET-01',
    name: 'Downtown Retail Corp',
    role: 'retailer',
    store: 'Downtown Store',
    plan: 'Growth Partner',
    subscriptionFee: 799,
    grossVolume: 185400,
    transactionCount: 412,
    commissionRate: 0.02,
    commissionEarned: 3708, // 2% of 185,400
    platformRevenue: 4507, // 799 + 3708
    userEarnings: 181692, // 185,400 - 3,708
    status: 'Active',
    lastTransactionDate: '2024-06-18'
  },
  {
    id: 'RET-02',
    name: 'Apex Supermarket Ltd',
    role: 'retailer',
    store: 'Uptown Mall',
    plan: 'Enterprise Logistics',
    subscriptionFee: 3499,
    grossVolume: 342000,
    transactionCount: 780,
    commissionRate: 0.02,
    commissionEarned: 6840,
    platformRevenue: 10339,
    userEarnings: 335160,
    status: 'Active',
    lastTransactionDate: '2024-06-18'
  },
  {
    id: 'RET-03',
    name: 'Westside Provisions',
    role: 'retailer',
    store: 'Westside Outlet',
    plan: 'Starter Free',
    subscriptionFee: 0,
    grossVolume: 42100,
    transactionCount: 95,
    commissionRate: 0.02,
    commissionEarned: 842,
    platformRevenue: 842,
    userEarnings: 41258,
    status: 'Active',
    lastTransactionDate: '2024-06-17'
  },
  {
    id: 'RET-04',
    name: 'Kaveri Grocery & FMCG',
    role: 'retailer',
    store: 'Downtown Store',
    plan: 'Growth Partner',
    subscriptionFee: 799,
    grossVolume: 94800,
    transactionCount: 160,
    commissionRate: 0.02,
    commissionEarned: 1896,
    platformRevenue: 2695,
    userEarnings: 92904,
    status: 'Active',
    lastTransactionDate: '2024-06-16'
  },
  // Suppliers
  {
    id: 'SUP-01',
    name: 'Nordic Direct Logistics',
    role: 'supplier',
    store: 'Central Warehouse',
    plan: 'Enterprise Logistics',
    subscriptionFee: 3499,
    grossVolume: 490000, // Wholesale orders fulfilled
    transactionCount: 48,
    commissionRate: 0.015,
    commissionEarned: 7350, // Logistics platform fee
    platformRevenue: 10849, // 3499 + 7350
    userEarnings: 482650,
    status: 'Active',
    lastTransactionDate: '2024-06-18'
  },
  {
    id: 'SUP-02',
    name: 'Global Supply Chain Ltd',
    role: 'supplier',
    store: 'Central Warehouse',
    plan: 'Growth Partner',
    subscriptionFee: 799,
    grossVolume: 125000,
    transactionCount: 22,
    commissionRate: 0.015,
    commissionEarned: 1875,
    platformRevenue: 2674,
    userEarnings: 123125,
    status: 'Active',
    lastTransactionDate: '2024-06-17'
  },
  {
    id: 'SUP-03',
    name: 'Bharat Agro Wholesale',
    role: 'supplier',
    store: 'Central Warehouse',
    plan: 'Starter Free',
    subscriptionFee: 0,
    grossVolume: 32000,
    transactionCount: 5,
    commissionRate: 0.015,
    commissionEarned: 480,
    platformRevenue: 480,
    userEarnings: 31520,
    status: 'Active',
    lastTransactionDate: '2024-06-15'
  },
  // Consumers
  {
    id: 'CUST-01',
    name: 'Priya Sharma (Shopper)',
    role: 'consumer',
    store: 'Downtown Store',
    plan: 'Consumer Account',
    subscriptionFee: 0, // Consumers pay no subscription
    grossVolume: 14200, // Total purchases made on website
    transactionCount: 14,
    commissionRate: 0.02,
    commissionEarned: 284, // Commission generated to website
    platformRevenue: 284,
    userEarnings: 0, // Consumers are spenders
    status: 'Active',
    lastTransactionDate: '2024-06-18'
  },
  {
    id: 'CUST-02',
    name: 'Rahul Varma (Shopper)',
    role: 'consumer',
    store: 'Uptown Mall',
    plan: 'Consumer Account',
    subscriptionFee: 0,
    grossVolume: 28900,
    transactionCount: 26,
    commissionRate: 0.02,
    commissionEarned: 578,
    platformRevenue: 578,
    userEarnings: 0,
    status: 'Active',
    lastTransactionDate: '2024-06-17'
  },
  {
    id: 'CUST-03',
    name: 'Anita Desai (Shopper)',
    role: 'consumer',
    store: 'Westside Outlet',
    plan: 'Consumer Account',
    subscriptionFee: 0,
    grossVolume: 8400,
    transactionCount: 8,
    commissionRate: 0.02,
    commissionEarned: 168,
    platformRevenue: 168,
    userEarnings: 0,
    status: 'Active',
    lastTransactionDate: '2024-06-16'
  }
];

export const REVENUE_LEDGER = [
  { orderId: 'ORD-9021', store: 'Downtown Store', retailer: 'Downtown Retail Corp', amount: 3450, commission: 69.00, date: '2024-06-18', status: 'Settled' },
  { orderId: 'ORD-9022', store: 'Uptown Mall', retailer: 'Apex Supermarket Ltd', amount: 8200, commission: 164.00, date: '2024-06-18', status: 'Settled' },
  { orderId: 'ORD-9023', store: 'Westside Outlet', retailer: 'Westside Provisions', amount: 1250, commission: 25.00, date: '2024-06-17', status: 'Settled' },
  { orderId: 'ORD-9024', store: 'Downtown Store', retailer: 'Downtown Retail Corp', amount: 14600, commission: 292.00, date: '2024-06-17', status: 'Settled' },
  { orderId: 'ORD-9025', store: 'Central Warehouse', retailer: 'Nordic Direct Logistics', amount: 45000, commission: 900.00, date: '2024-06-16', status: 'Settled' },
  { orderId: 'ORD-9026', store: 'Uptown Mall', retailer: 'Apex Supermarket Ltd', amount: 6700, commission: 134.00, date: '2024-06-16', status: 'Settled' }
];

export const STORES_DATA = [
  { id: 'store-1', name: 'Downtown Store', code: 'DWT-01', location: 'Commercial Ave, Block 4', retailerId: 'RET-01', retailerName: 'Downtown Retail Corp', manager: 'Sarah Connor', stockCount: 1420, staffCount: 12, revenue: 185400, status: 'Active' },
  { id: 'store-2', name: 'Uptown Mall', code: 'UPT-02', location: 'Skyline Mall Level 2', retailerId: 'RET-02', retailerName: 'Apex Supermarket Ltd', manager: 'David Kim', stockCount: 980, staffCount: 8, revenue: 342000, status: 'Active' },
  { id: 'store-3', name: 'Westside Outlet', code: 'WST-03', location: 'West End High Street', retailerId: 'RET-03', retailerName: 'Westside Provisions', manager: 'Priya Sharma', stockCount: 650, staffCount: 6, revenue: 42100, status: 'Active' },
  { id: 'store-4', name: 'Central Warehouse', code: 'CWH-04', location: 'Logistics Industrial Park', retailerId: 'SUP-01', retailerName: 'Nordic Direct Logistics', manager: 'Elena Rostova', stockCount: 8400, staffCount: 24, revenue: 490000, status: 'Active' },
  { id: 'store-5', name: 'Global Hub', code: 'GLB-00', location: 'StockOverflow Tech Headquarters', retailerId: 'ADM-01', retailerName: 'StockOverflow Admin Corp', manager: 'Super User', stockCount: 200, staffCount: 15, revenue: 32910, status: 'Active' }
];
