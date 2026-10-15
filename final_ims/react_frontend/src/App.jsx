/**
 * App.jsx - Central Root Orchestrator for StockOverflow React Application
 * 
 * Supports:
 * 1. 🏠 Landing Page (`landing`)
 * 2. 🔐 Authentication (`login` & `register`)
 * 3. 🛡️ Admin Portal (`admin`)
 * 4. 👔 Employee Desk (`employee`)
 * 5. 🛒 Consumer Storefront (`consumer`)
 * 6. 🏬 Retailer POS (`retailer`)
 * 7. 🚚 Supplier Logistics (`supplier`)
 */

import React, { useState } from 'react';

// Landing & Auth
import LandingPage from './landing/LandingPage';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';

// Business Modules
import App_admin from './admin/App_admin';
import App_employee from './employee/App_employee';
import App_consumer from './consumer/App_consumer';
import App_retailer from './retailer/App_retailer';
import App_supplier from './supplier/App_supplier';

export default function App() {
  // Current active view: 'landing' | 'login' | 'register' | 'admin' | 'employee' | 'consumer' | 'retailer' | 'supplier'
  const [currentView, setCurrentView] = useState('landing');
  const [navParams, setNavParams] = useState({});
  const [showHubBar, setShowHubBar] = useState(true);

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setNavParams(params || {});
  };

  const handleSwitchModule = (moduleName) => {
    setCurrentView(moduleName);
    setNavParams({});
  };

  const handleLoginSuccess = (role) => {
    setCurrentView(role);
  };

  const handleRegisterSuccess = (role) => {
    setCurrentView(role);
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
      case 'admin':
        return <App_admin onSwitchModule={handleSwitchModule} />;
      case 'employee':
        return <App_employee onSwitchModule={handleSwitchModule} />;
      case 'consumer':
        return <App_consumer onSwitchModule={handleSwitchModule} />;
      case 'retailer':
        return <App_retailer onSwitchModule={handleSwitchModule} />;
      case 'supplier':
        return <App_supplier onSwitchModule={handleSwitchModule} />;
      default:
        return <LandingPage onNavigate={handleNavigate} onSwitchModule={handleSwitchModule} />;
    }
  };

  return (
    <div className="stockoverflow-root-app">
      {/* ── Top Evaluation Sticky Navigation Bar ── */}
      {showHubBar ? (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
            borderBottom: '1px solid #334155',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            fontSize: '12px',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px', cursor: 'pointer' }}
              onClick={() => setCurrentView('landing')}
            >
              📦 StockOverflow
            </span>
            <span
              style={{
                fontSize: '10.5px',
                background: '#2563eb',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              FDFED Project
            </span>
          </div>

          {/* Module Switcher Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Landing Link */}
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              style={{
                background: currentView === 'landing' ? '#334155' : 'transparent',
                color: currentView === 'landing' ? '#ffffff' : '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
                fontWeight: currentView === 'landing' ? 700 : 500,
              }}
            >
              🏠 Landing
            </button>

            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>
              My Modules:
            </span>

            {/* Admin Module Button */}
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              style={{
                background: currentView === 'admin' ? '#2563eb' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: currentView === 'admin' ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: currentView === 'admin' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>🛡️ Admin Portal</span>
              {currentView === 'admin' && <span style={{ fontSize: '9px' }}>●</span>}
            </button>

            {/* Employee Module Button */}
            <button
              type="button"
              onClick={() => setCurrentView('employee')}
              style={{
                background: currentView === 'employee' ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: currentView === 'employee' ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: currentView === 'employee' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>👔 Employee Desk</span>
              {currentView === 'employee' && <span style={{ fontSize: '9px' }}>●</span>}
            </button>

            <span style={{ color: '#475569', margin: '0 4px' }}>|</span>

            {/* Other System Portals */}
            <button
              type="button"
              onClick={() => setCurrentView('consumer')}
              style={{
                background: currentView === 'consumer' ? '#10b981' : 'transparent',
                color: currentView === 'consumer' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              🛒 Consumer
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('retailer')}
              style={{
                background: currentView === 'retailer' ? '#f59e0b' : 'transparent',
                color: currentView === 'retailer' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              🏬 Retailer POS
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('supplier')}
              style={{
                background: currentView === 'supplier' ? '#ec4899' : 'transparent',
                color: currentView === 'supplier' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              🚚 Supplier
            </button>

            <span style={{ color: '#475569', margin: '0 4px' }}>|</span>

            {/* Auth shortcuts */}
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              style={{
                background: currentView === 'login' ? '#334155' : 'transparent',
                color: currentView === 'login' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>

          {/* Hide Switcher Button */}
          <button
            type="button"
            onClick={() => setShowHubBar(false)}
            title="Minimize header bar"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowHubBar(true)}
          title="Open Module Switcher"
          style={{
            position: 'fixed',
            top: '8px',
            right: '12px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#38bdf8',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          ⚙️ Switch Module
        </button>
      )}

      {/* ── Render the Active View ── */}
      {renderCurrentView()}
    </div>
  );
}
