/**
 * App_supplier.jsx - Main Application Controller for Supplier Module
 * 
 * StockOverflow Supplier Module
 * Provides:
 * 1. 5-Step Supplier Setup Wizard (<SupplierSetup />)
 *    Ported from vanilla supplier-landing-page.html & supplier-initial.html
 * 2. Complete Supplier Operations Portal (<SupplierDashboard />)
 *    Ported from vanilla supplier-dashboard.html
 *    - Overview Metrics & Inventory Health
 *    - Profile Management & Legal Document Vault
 *    - Wholesale Product Catalog with Add/Edit/Delete & Stock Status
 *    - Purchase Orders Workflow with status transitions & CSV Export
 *    - Registered Retailers List & Details
 *    - Performance Scorecard & Verified Buyer Reviews
 *    - SaaS Growth & Subscription Plans with GST & Payment Simulation
 */

import React, { useState, useEffect } from 'react';
import SupplierSetup from './SupplierSetup';
import SupplierDashboard from './SupplierDashboard';
import '../css/supplier.css';
import { readSupplierId } from '../api/supplierApi';

export default function App_supplier({ onSwitchModule }) {
  // Current view: 'dashboard' | 'setup'
  const [currentView, setCurrentView] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'setup') return 'setup';
      if (urlParams.get('view') === 'dashboard') return 'dashboard';
      const storedView = localStorage.getItem('so_supplier_active_view');
      if (storedView === 'setup' || storedView === 'dashboard') {
        return storedView;
      }
      return 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const handleSwitchView = (viewName) => {
    setCurrentView(viewName);
    try {
      localStorage.setItem('so_supplier_active_view', viewName);
    } catch {}
  };

  return (
    <div className="supplier-portal-container">
      {currentView === 'setup' ? (
        <SupplierSetup
          onNavigateToDashboard={() => handleSwitchView('dashboard')}
          onSwitchModule={onSwitchModule}
        />
      ) : (
        <SupplierDashboard
          onNavigateToSetup={() => handleSwitchView('setup')}
          onSwitchModule={onSwitchModule}
        />
      )}
    </div>
  );
}
