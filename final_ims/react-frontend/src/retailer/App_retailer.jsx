/**
 * App_retailer.jsx - Main Application Controller for Retailer Module
 * 
 * StockOverflow Retailer & Store Management Portal:
 * - Public/Retailer Landing Page & Quick Sign-in
 * - Dedicated Sign In & Sign Up Auth Page (matching vanilla frontend)
 * - Biller Application & Real-time Pending Approval Waiting Page
 * - Retailer Initial Setup Wizard (matching vanilla frontend wizard)
 * - Retailer Dashboard, Products, Inventory, Stores, Billers, Suppliers, etc.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

export default function App_retailer({ onSwitchModule, onLogout }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectProductModalOpen, setSelectProductModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState(null);

  const handleNavigate = (view) => {
    if (view === 'edit-product' && !editingProduct) {
      setActiveView('products');
      setSelectProductModalOpen(true);
      return;
    }
    if (view !== 'edit-product') {
      setEditingProduct(null);
    }
    setActiveView(view);
  };

  // If unauthenticated, App.jsx handles the landing page
  if (!user) {
    return null;
  }


  // Render Full Retailer Module
  return (
    <>
      <RetailerLayout
        activeView={activeView}
        setActiveView={handleNavigate}
        onSwitchModule={onSwitchModule}
      >
        {activeView === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} />
        )}

        {activeView === 'products' && (
          <ProductListView
            onNavigate={handleNavigate}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setActiveView('edit-product');
            }}
          />
        )}

        {activeView === 'add-product' && (
          <AddProductView onNavigate={handleNavigate} />
        )}

        {activeView === 'edit-product' && (
          <EditProductView
            product={editingProduct}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'inventory-overview' && (
          <InventoryView />
        )}

        {activeView === 'low-stocks' && (
          <LowStocksView onNavigate={handleNavigate} />
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
              handleNavigate('supplier-performance');
            }}
          />
        )}

        {activeView === 'supplier-performance' && (
          <SupplierPerformanceView
            supplier={selectedSupplier}
            onBack={() => handleNavigate('suppliers')}
          />
        )}

        {activeView === 'reorder' && (
          <ReorderView onNavigate={handleNavigate} />
        )}

        {activeView === 'purchase-orders' && (
          <PurchaseOrdersView
            onBrowseCatalogue={(sup) => {
              setSelectedSupplierForPO(sup);
              handleNavigate('po-products');
            }}
          />
        )}

        {activeView === 'po-products' && (
          <POProductsView
            supplier={selectedSupplierForPO}
            onBack={() => handleNavigate('purchase-orders')}
            onAddProducts={() => handleNavigate('purchase-orders')}
          />
        )}

        {activeView === 'returns' && (
          <ReturnsView />
        )}

        {activeView === 'profile' && (
          <ProfileView />
        )}

        {activeView === 'subscription-plan' && (
          <SubscriptionPlanView onNavigate={handleNavigate} />
        )}
      </RetailerLayout>

      {/* Select Product Dialog Modal */}
      {selectProductModalOpen && (
        <div
          id="select-product-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setSelectProductModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '430px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              padding: '28px 24px',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectProductModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.15s',
              }}
              title="Close"
            >
              ✕
            </button>

            {/* Badge Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '6px solid #f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#2563eb',
              }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>

            {/* Modal Title */}
            <h3
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 8px 0',
                fontFamily: "'Nunito Sans', sans-serif",
                letterSpacing: '-0.3px',
              }}
            >
              Select a Product to Edit
            </h3>

            {/* Subtitle / Explanation */}
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748b',
                lineHeight: 1.55,
                margin: '0 0 20px 0',
              }}
            >
              To edit a product, please choose an item from the product list and click its <strong>edit icon (✏️)</strong> in the actions column.
            </p>

            {/* Instruction Tip */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: '#475569',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '22px',
                lineHeight: 1.45,
              }}
            >
              <span style={{ fontSize: '17px', flexShrink: 0 }}>💡</span>
              <span>Find your product in the catalog table below and click the edit pencil icon to modify its price, stock, or details.</span>
            </div>

            {/* Primary Action Button */}
            <button
              id="select-product-confirm-btn"
              onClick={() => setSelectProductModalOpen(false)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.1s, background 0.15s',
              }}
            >
              Got it, Select Product
            </button>
          </div>
        </div>
      )}
    </>
  );
}
