/**
 * App_admin.jsx - Main Application Controller for Admin Module
 * 
 * Follows the same architectural structure as App_consumer.jsx:
 * 1. Single Page Application (SPA) routing between administrative views:
 *    - Dashboard ('dashboard') -> matching dashboard.html
 *    - Users ('users') -> matching users.html
 *    - Roles & Permissions ('roles') -> matching roles.html
 *    - Platform Revenue ('revenue') -> matching revenue.html
 *    - Store Selection ('stores') -> matching stores.html
 *    - Multi-Store Setup ('multistore') -> matching multistore.html
 *    - Reports ('reports') -> matching reports.html
 *    - Settings ('settings') -> matching settings.html
 * 2. Universal layout shell via <AdminLayout_admin />.
 * 3. Centralized API and data services in `utils/api_admin.js` and `data/mockData_admin.js`.
 */

import React, { useState } from 'react';
import './admin.css';

// Layout
import AdminLayout_admin from './components/layout/AdminLayout_admin';

// Admin Page Views
import DashboardPage_admin from './pages/DashboardPage_admin';
import UsersPage_admin from './pages/UsersPage_admin';
import RolesPage_admin from './pages/RolesPage_admin';
import RevenuePage_admin from './pages/RevenuePage_admin';
import StoresPage_admin from './pages/StoresPage_admin';
import StoreDashboardPage_admin from './pages/StoreDashboardPage_admin';
import ReportsPage_admin from './pages/ReportsPage_admin';
import SettingsPage_admin from './pages/SettingsPage_admin';

export default function App_admin({ onSwitchModule, onLogout }) {
  // ─── 1. Navigation & View Routing State ───
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState({});

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage_admin onNavigate={handleNavigate} />;
      case 'users':
        return <UsersPage_admin />;
      case 'roles':
        return <RolesPage_admin />;
      case 'revenue':
        return <RevenuePage_admin />;
      case 'stores':
      case 'multistore':
        return <StoresPage_admin onNavigate={handleNavigate} />;
      case 'store-dashboard':
        return (
          <StoreDashboardPage_admin
            storeId={viewParams.storeId || (typeof window !== 'undefined' ? localStorage.getItem('stockoverflow_active_store_id') : '')}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('stores')}
          />
        );
      case 'reports':
        return <ReportsPage_admin />;
      case 'settings':
        return <SettingsPage_admin />;
      default:
        return <DashboardPage_admin onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminLayout_admin
      activeMenu={currentView === 'store-dashboard' ? 'stores' : currentView}
      onNavigate={handleNavigate}
      onSwitchModule={onSwitchModule}
      onLogout={onLogout}
    >
      {renderView()}
    </AdminLayout_admin>
  );
}
