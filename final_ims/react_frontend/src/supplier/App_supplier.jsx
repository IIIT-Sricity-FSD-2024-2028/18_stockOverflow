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

import React from 'react';
import SupplierDashboard from './SupplierDashboard';
import '../css/supplier.css';

export default function App_supplier({ onSwitchModule, onLogout }) {
  return (
    <div className="supplier-portal-container">
      <SupplierDashboard
        onSwitchModule={onSwitchModule}
        onLogout={onLogout}
      />
    </div>
  );
}
