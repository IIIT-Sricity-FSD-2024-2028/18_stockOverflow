/**
 * App_retailer.jsx - Main Application Controller for Retailer Module
 * 
 * StockOverflow Retailer & Store Management Portal:
 * - Public/Retailer Landing Page & Quick Sign-in
 * - Cashier POS & Store Management
 * - Products, Inventory, Stock Adjustments, Low Stocks Alerts
 * - Suppliers, Purchase Orders, Supplier Performance Scorecard
 * - Customers & Billers Governance
 * - Multi-Store Hub & Store Switching
 * - Returns & RMAs
 * - Subscription Plans & Profile
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../components/landing/LandingPage';
import RetailerLayout from '../components/retailer/RetailerLayout';
import DashboardView from '../components/retailer/DashboardView';
import ProductListView from '../components/retailer/ProductListView';
import AddProductView from '../components/retailer/AddProductView';
import EditProductView from '../components/retailer/EditProductView';
import InventoryView from '../components/retailer/InventoryView';
import LowStocksView from '../components/retailer/LowStocksView';
import StockAdjustView from '../components/retailer/StockAdjustView';
import MultiStoreView from '../components/retailer/MultiStoreView';
import CustomersView from '../components/retailer/CustomersView';
import BillersView from '../components/retailer/BillersView';
import SuppliersView from '../components/retailer/SuppliersView';
import ReorderView from '../components/retailer/ReorderView';
import PurchaseOrdersView from '../components/retailer/PurchaseOrdersView';
import ReturnsView from '../components/retailer/ReturnsView';
import ProfileView from '../components/retailer/ProfileView';
import SubscriptionPlanView from '../components/retailer/SubscriptionPlanView';
import SupplierPerformanceView from '../components/retailer/SupplierPerformanceView';
import POProductsView from '../components/retailer/POProductsView';

export default function App_retailer({ onSwitchModule }) {
  const { user, login } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState(null);
  const [guestMode, setGuestMode] = useState(false);

  // If not authenticated and not in guest preview mode, render the Landing Page
  if (!user && !guestMode) {
    return (
      <LandingPage
        onEnterRetailer={() => {
          setGuestMode(true);
          setActiveView('dashboard');
        }}
        onSwitchModule={onSwitchModule}
      />
    );
  }

  // Render Full Retailer Module
  return (
    <RetailerLayout
      activeView={activeView}
      setActiveView={setActiveView}
      onSwitchModule={onSwitchModule}
    >
      {activeView === 'dashboard' && (
        <DashboardView onNavigate={setActiveView} />
      )}

      {activeView === 'products' && (
        <ProductListView
          onNavigate={setActiveView}
          onEditProduct={(product) => {
            setEditingProduct(product);
            setActiveView('edit-product');
          }}
        />
      )}

      {activeView === 'add-product' && (
        <AddProductView onNavigate={setActiveView} />
      )}

      {activeView === 'edit-product' && (
        <EditProductView
          product={editingProduct}
          onNavigate={setActiveView}
        />
      )}

      {activeView === 'inventory-overview' && (
        <InventoryView />
      )}

      {activeView === 'low-stocks' && (
        <LowStocksView onNavigate={setActiveView} />
      )}

      {activeView === 'stock-adjustment' && (
        <StockAdjustView />
      )}

      {activeView === 'stores' && (
        <MultiStoreView />
      )}

      {activeView === 'customers' && (
        <CustomersView />
      )}

      {activeView === 'billers' && (
        <BillersView />
      )}

      {activeView === 'suppliers' && (
        <SuppliersView
          onViewPerformance={(supplier) => {
            setSelectedSupplier(supplier);
            setActiveView('supplier-performance');
          }}
        />
      )}

      {activeView === 'supplier-performance' && (
        <SupplierPerformanceView
          supplier={selectedSupplier}
          onBack={() => setActiveView('suppliers')}
        />
      )}

      {activeView === 'reorder' && (
        <ReorderView onNavigate={setActiveView} />
      )}

      {activeView === 'purchase-orders' && (
        <PurchaseOrdersView
          onBrowseCatalogue={(sup) => {
            setSelectedSupplierForPO(sup);
            setActiveView('po-products');
          }}
        />
      )}

      {activeView === 'po-products' && (
        <POProductsView
          supplier={selectedSupplierForPO}
          onBack={() => setActiveView('purchase-orders')}
          onAddProducts={() => setActiveView('purchase-orders')}
        />
      )}

      {activeView === 'returns' && (
        <ReturnsView />
      )}

      {activeView === 'profile' && (
        <ProfileView />
      )}

      {activeView === 'subscription-plan' && (
        <SubscriptionPlanView onNavigate={setActiveView} />
      )}
    </RetailerLayout>
  );
}
