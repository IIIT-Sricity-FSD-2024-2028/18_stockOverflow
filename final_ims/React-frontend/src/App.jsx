/**
 * App.jsx - Root Application Controller & Secure Session Gatekeeper
 * 
 * StockOverflow Unified Frontend:
 * - Public Landing Page & Auth Modals (Sign In, Sign Up, Become a Biller)
 * - Strict Token & Session-Protected Module Access:
 *   1. Retailer Portal (App_retailer & RetailerInitialWizard)
 *   2. Supplier Dashboard (App_supplier)
 *   3. Consumer Storefront (App_consumer)
 *   4. Admin Master Control (App_admin)
 *   5. Biller Pending / Approval Gateway
 */

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// ── Public Auth & Setup Components ──
import LandingPage from './retailer/components/landing/LandingPage';
import AuthPage from './retailer/components/auth/AuthPage';
import BillerPendingPage from './retailer/components/auth/BillerPendingPage';
import RetailerInitialWizard from './retailer/components/retailer/RetailerInitialWizard';
import SupplierSetup from './supplier/SupplierSetup';

// ── Secure Module Entry Points ──
import App_consumer from './consumer/App_consumer';
import App_retailer from './retailer/App_retailer';
import App_supplier from './supplier/App_supplier';
import App_admin from './admin/App_admin';
import App_biller from './biller/App_biller';

export default function App() {
  const { user, logout, refreshUser } = useAuth();

  // Screen for unauthenticated visitors: 'landing' | 'login' | 'register' | 'biller-pending' | 'retailer-wizard'
  const [authScreen, setAuthScreen] = useState('landing');

  // Validate that user has a genuine authenticated session and token
  const token = user?.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('so_token') : null);
  const isAuthenticated = Boolean(user && user.id && user.role && token);

  // ── Unauthenticated State: Instant Landing Page & Auth Flow ──
  if (!isAuthenticated) {
    if (authScreen === 'login') {
      return (
        <AuthPage
          initialMode="login"
          onClose={() => setAuthScreen('landing')}
          onLoginSuccess={() => refreshUser()}
          onOpenBillerPending={() => setAuthScreen('biller-pending')}
          onOpenRetailerSetup={() => setAuthScreen('retailer-wizard')}
        />
      );
    }

    if (authScreen === 'register') {
      return (
        <AuthPage
          initialMode="register"
          onClose={() => setAuthScreen('landing')}
          onLoginSuccess={() => refreshUser()}
          onOpenBillerPending={() => setAuthScreen('biller-pending')}
          onOpenRetailerSetup={() => setAuthScreen('retailer-wizard')}
        />
      );
    }

    if (authScreen === 'biller-pending') {
      return (
        <BillerPendingPage
          onBackToHome={() => setAuthScreen('landing')}
          onGoToLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'retailer-wizard') {
      return (
        <RetailerInitialWizard
          onCancel={() => setAuthScreen('landing')}
          onCompleteSetup={() => {
            refreshUser();
            setAuthScreen('landing');
          }}
        />
      );
    }

    // Default: Public Landing Page
    return (
      <LandingPage
        onOpenLogin={() => setAuthScreen('login')}
        onOpenRegister={() => setAuthScreen('register')}
        onOpenBillerPending={() => setAuthScreen('biller-pending')}
      />
    );
  }

  // ── Authenticated State: Strict Role-Based Module Access ──
  const role = (user.role || 'consumer').toLowerCase();

  // 1. Retailer Module
  if (role === 'retailer') {
    const hasRetailerProfile = Boolean(
      (user.profile && (user.profile.businessName || (Array.isArray(user.profile.stores) && user.profile.stores.length > 0))) ||
      (user.store && user.profileId && user.profileId !== user.id)
    );

    if (!hasRetailerProfile) {
      return (
        <RetailerInitialWizard
          onCancel={logout}
          onCompleteSetup={() => refreshUser()}
        />
      );
    }

    return <App_retailer onLogout={logout} />;
  }

  // 2. Supplier Module
  if (role === 'supplier') {
    const hasSupplierProfile = Boolean(
      (user.profile && (user.profile.businessName || user.profile.supplierCode)) ||
      (user.profileId && user.profileId !== user.id) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem(`so_supplier_setup_completed_${user.id}`))
    );

    if (!hasSupplierProfile) {
      return (
        <SupplierSetup
          onNavigateToDashboard={() => refreshUser()}
          onLogout={logout}
        />
      );
    }

    return <App_supplier onLogout={logout} />;
  }

  // 3. Consumer / Shopper Module
  if (role === 'consumer' || role === 'customer') {
    return <App_consumer onLogout={logout} />;
  }

  // 4. Admin Module
  if (role === 'admin') {
    return <App_admin onLogout={logout} />;
  }

  // 5. Biller Module (POS Terminal)
  if (role === 'biller') {
    const isApproved = Boolean(
      (user.profileId || user.profile?.retailerId) &&
      (user.currentStoreId || user.storeId)
    );

    if (!isApproved) {
      return (
        <BillerPendingPage
          onBackToHome={logout}
          onGoToLogin={logout}
        />
      );
    }

    return <App_biller onLogout={logout} />;
  }

  // Fallback for unrecognized role
  return (
    <LandingPage
      onOpenLogin={() => setAuthScreen('login')}
      onOpenRegister={() => setAuthScreen('register')}
      onOpenBillerPending={() => setAuthScreen('biller-pending')}
    />
  );
}
