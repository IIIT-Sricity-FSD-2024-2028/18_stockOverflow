/**
 * App_supplier.jsx - Main Application Controller for Supplier Module (Redux Integrated)
 * 
 * StockOverflow Supplier Module
 * Provides:
 * - Redux Provider Wrapping with supplierStore
 * - 5-Step Supplier Setup Wizard (<SupplierSetup />)
 * - Complete Supplier Operations Portal (<SupplierDashboard />)
 *    - Overview Metrics & Inventory Health
 *    - Profile Management & Legal Document Vault
 *    - Wholesale Product Catalog with Add/Edit/Delete & Stock Status
 *    - Purchase Orders Workflow with status transitions & CSV Export
 *    - Registered Retailers List & Details
 *    - Performance Scorecard & Verified Buyer Reviews
 *    - SaaS Growth & Subscription Plans with GST & Payment Simulation
 */

import React from 'react';
import { Provider } from 'react-redux';
import { supplierStore } from './redux';
import SupplierDashboard from './SupplierDashboard';
import '../css/supplier.css';

export default function App_supplier({ onSwitchModule, onLogout }) {
  return (
    <Provider store={supplierStore}>
      <div className="supplier-portal-container">
        <SupplierDashboard
          onSwitchModule={onSwitchModule}
          onLogout={onLogout}
        />
      </div>
    </Provider>
  );
}
