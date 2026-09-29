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
    name: 'Starter Bharat',
    price: '₹999',
    period: '/month',
    featured: false,
    features: [
      'Single store location',
      'Up to 500 SKUs',
      'Standard POS terminal',
      '2% Transaction commission',
      'Email support'
    ]
  },
  {
    name: 'Growth Retailer',
    price: '₹2,499',
    period: '/month',
    featured: true,
    features: [
      'Up to 3 store locations',
      'Up to 5,000 SKUs',
      'Multi-biller checkout counters',
      '1.5% Transaction commission',
      'Supplier auto-reordering',
      'Priority phone & chat support'
    ]
  },
  {
    name: 'Enterprise Hub',
    price: '₹5,999',
    period: '/month',
    featured: false,
    features: [
      'Unlimited store locations & hubs',
      'Unlimited SKUs & warehouses',
      'Full API & ERP webhook access',
      '1.0% Transaction commission',
      'Custom role-based permissions',
      'Dedicated account manager 24/7'
    ]
  }
];

export const REVENUE_LEDGER = [
  { orderId: 'ORD-9021', store: 'Downtown Store', amount: 3450, commission: 69.00, date: '2024-06-18', status: 'Settled' },
  { orderId: 'ORD-9022', store: 'Uptown Mall', amount: 8200, commission: 164.00, date: '2024-06-18', status: 'Settled' },
  { orderId: 'ORD-9023', store: 'Westside Outlet', amount: 1250, commission: 25.00, date: '2024-06-17', status: 'Settled' },
  { orderId: 'ORD-9024', store: 'Downtown Store', amount: 14600, commission: 292.00, date: '2024-06-17', status: 'Settled' },
  { orderId: 'ORD-9025', store: 'Central Warehouse', amount: 45000, commission: 900.00, date: '2024-06-16', status: 'Settled' },
  { orderId: 'ORD-9026', store: 'Uptown Mall', amount: 6700, commission: 134.00, date: '2024-06-16', status: 'Settled' }
];

export const STORES_DATA = [
  { id: 'store-1', name: 'Downtown Store', code: 'DWT-01', location: 'Commercial Ave, Block 4', manager: 'Sarah Connor', stockCount: 1420, staffCount: 12, status: 'Active' },
  { id: 'store-2', name: 'Uptown Mall', code: 'UPT-02', location: 'Skyline Mall Level 2', manager: 'David Kim', stockCount: 980, staffCount: 8, status: 'Active' },
  { id: 'store-3', name: 'Westside Outlet', code: 'WST-03', location: 'West End High Street', manager: 'Priya Sharma', stockCount: 650, staffCount: 6, status: 'Active' },
  { id: 'store-4', name: 'Central Warehouse', code: 'CWH-04', location: 'Logistics Industrial Park', manager: 'Elena Rostova', stockCount: 8400, staffCount: 24, status: 'Active' },
  { id: 'store-5', name: 'Global Hub', code: 'GLB-00', location: 'StockOverflow Tech Headquarters', manager: 'Super User', stockCount: 200, staffCount: 15, status: 'Active' }
];
