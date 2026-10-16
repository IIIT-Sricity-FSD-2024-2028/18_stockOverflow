/**
 * App.jsx - Central Root Orchestrator for StockOverflow React Application
 * 
 * Supports:
 * 1. 🏠 Landing Page (`landing`)
 * 2. 🔐 Authentication (`login` & `register`)
 * 3. ⏳ Verification Gate (`verification-pending`)
 * 4. 🛡️ Admin Portal (`admin`)
 * 5. 👔 Employee Desk (`employee`)
 * 6. 🛒 Consumer Storefront (`consumer`)
 * 7. 🏬 Retailer POS (`retailer`)
 * 8. 🚚 Supplier Logistics (`supplier`)
 * 9. 🧾 Cashier Biller POS (`biller`)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Landing & Auth
import LandingPage from './landing/LandingPage';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import VerificationPendingPage from './auth/VerificationPendingPage';

// Business Modules
import App_admin from './admin/App_admin';
import App_employee from './employee/App_employee';
import App_consumer from './consumer/App_consumer';
import App_retailer from './retailer/App_retailer';
import App_supplier from './supplier/App_supplier';
import App_biller from './biller/App_biller';
import RetailerInitialWizard from './retailer/components/retailer/RetailerInitialWizard';
import SupplierSetup from './supplier/SupplierSetup';

export default function App() {
  const { user, logout, refreshUser } = useAuth();

  // Current active view: 'landing' | 'login' | 'register' | 'verification-pending' | 'admin' | 'employee' | 'consumer' | 'retailer' | 'supplier' | 'biller'
  const [currentView, setCurrentView] = useState('landing');
  const [navParams, setNavParams] = useState({});

  useEffect(() => {
    if (!user && !['landing', 'login', 'register'].includes(currentView)) {
      setCurrentView('login');
    }
  }, [user, currentView]);

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setNavParams(params || {});
  };

  const handleSwitchModule = (moduleName) => {
    // Admin and Employee cannot directly bypass authentication to enter other modules
    if (user && (user.role === 'admin' || user.role === 'employee')) {
      if (moduleName !== user.role) {
        logout();
        setCurrentView('login');
        setNavParams({ initialRole: moduleName });
        return;
      }
    }
    setCurrentView(moduleName);
    setNavParams({});
  };

  const handleLoginSuccess = (roleOrUser) => {
    const targetRole = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role || 'landing';
    setCurrentView(targetRole);
  };

  const handleRegisterSuccess = (roleOrUser) => {
    const targetRole = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role || 'landing';
    setCurrentView(targetRole);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('login');
    setNavParams({});
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} onSwitchModule={handleSwitchModule} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return (
          <RegisterPage 
            onNavigate={handleNavigate} 
            onRegisterSuccess={handleRegisterSuccess} 
            initialRole={navParams.role || 'retailer'}
            initialPlan={navParams.plan || 'free'}
          />
        );
      case 'verification-pending':
        return (
          <VerificationPendingPage
            user={user}
            onRefreshUser={refreshUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        );
      case 'retailer-wizard':
        return (
          <RetailerInitialWizard
            onCompleteSetup={async () => {
              await refreshUser();
              setCurrentView('verification-pending');
            }}
            onCancel={handleLogout}
          />
        );
      case 'supplier-wizard':
        return (
          <SupplierSetup
            onNavigateToDashboard={async () => {
              await refreshUser();
              setCurrentView('verification-pending');
            }}
            onLogout={handleLogout}
          />
        );
      case 'admin':
        if (!user || user.role !== 'admin') {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        return <App_admin onSwitchModule={handleSwitchModule} onLogout={handleLogout} />;
      case 'employee':
        if (!user || user.role !== 'employee') {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        return <App_employee onSwitchModule={handleSwitchModule} onLogout={handleLogout} />;
      case 'consumer':
        if (user && (user.role === 'admin' || user.role === 'employee')) {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        return <App_consumer onSwitchModule={handleSwitchModule} onLogout={handleLogout} />;
      case 'retailer': {
        if (!user || user.role !== 'retailer') {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        const hasProfile = Boolean(
          user && (
            user.profileId ||
            (user.profile && (user.profile.businessName || (Array.isArray(user.profile.stores) && user.profile.stores.length > 0)))
          )
        );
        if (!hasProfile) {
          return (
            <RetailerInitialWizard
              onCompleteSetup={async () => {
                await refreshUser();
                setCurrentView('verification-pending');
              }}
              onCancel={handleLogout}
            />
          );
        }
        const isPending = user && (
          String(user.profile?.profileStatus || '').toLowerCase() === 'pending' ||
          String(user.profile?.profileStatus || '').toLowerCase() === 'rejected' ||
          String(user.status || '').toLowerCase() === 'pending'
        );
        if (isPending) {
          return (
            <VerificationPendingPage
              user={user}
              onRefreshUser={refreshUser}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          );
        }
        return <App_retailer onSwitchModule={handleSwitchModule} onLogout={handleLogout} />;
      }
      case 'supplier': {
        if (!user || user.role !== 'supplier') {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        const hasProfile = Boolean(
          user && (
            user.profileId ||
            (user.profile && (user.profile.businessName || user.profile.companyName))
          )
        );
        if (!hasProfile) {
          return (
            <SupplierSetup
              onNavigateToDashboard={async () => {
                await refreshUser();
                setCurrentView('verification-pending');
              }}
              onLogout={handleLogout}
            />
          );
        }
        const isPending = user && (
          String(user.profile?.profileStatus || '').toLowerCase() === 'pending' ||
          String(user.profile?.profileStatus || '').toLowerCase() === 'rejected' ||
          String(user.status || '').toLowerCase() === 'pending'
        );
        if (isPending) {
          return (
            <VerificationPendingPage
              user={user}
              onRefreshUser={refreshUser}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          );
        }
        return <App_supplier onSwitchModule={handleSwitchModule} onLogout={handleLogout} />;
      }
      case 'biller':
        if (!user || user.role !== 'biller') {
          return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
        }
        return <App_biller onLogout={handleLogout} />;
      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onSwitchModule={handleSwitchModule}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <div className="stockoverflow-root-app">
      {renderCurrentView()}
    </div>
  );
}
