import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import RetailerLayout from './components/retailer/RetailerLayout';
import DashboardView from './components/retailer/DashboardView';
import ProductListView from './components/retailer/ProductListView';
import AddProductView from './components/retailer/AddProductView';
import EditProductView from './components/retailer/EditProductView';
import InventoryView from './components/retailer/InventoryView';
import LowStocksView from './components/retailer/LowStocksView';
import StockAdjustView from './components/retailer/StockAdjustView';
import MultiStoreView from './components/retailer/MultiStoreView';
import CustomersView from './components/retailer/CustomersView';
import BillersView from './components/retailer/BillersView';
import SuppliersView from './components/retailer/SuppliersView';
import ReorderView from './components/retailer/ReorderView';
import PurchaseOrdersView from './components/retailer/PurchaseOrdersView';
import ReturnsView from './components/retailer/ReturnsView';
import ProfileView from './components/retailer/ProfileView';

export default function App() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);

  // If not authenticated, render the converted Landing Page
  if (!user) {
    return (
      <LandingPage
        onEnterRetailer={() => {
          setActiveView('dashboard');
        }}
      />
    );
  }

  // Render Retailer Module
  return (
    <RetailerLayout activeView={activeView} setActiveView={setActiveView}>
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
        <SuppliersView />
      )}

      {activeView === 'reorder' && (
        <ReorderView onNavigate={setActiveView} />
      )}

      {activeView === 'purchase-orders' && (
        <PurchaseOrdersView />
      )}

      {activeView === 'returns' && (
        <ReturnsView />
      )}

      {activeView === 'profile' && (
        <ProfileView />
      )}
    </RetailerLayout>
  );
}
