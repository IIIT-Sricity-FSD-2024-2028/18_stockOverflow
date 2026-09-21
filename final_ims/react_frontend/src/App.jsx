/**
 * App.jsx - Central Multi-Module Root Hub & Dispatcher
 * 
 * IN LAYMAN'S TERMS:
 * This is the central hub for the entire StockOverflow React application.
 * It coordinates and routes between all 4 distinct business modules:
 * 
 * 1. 🛒 CONSUMER MODULE (`src/consumer/`):
 *    - Handled by `<App_consumer />`.
 *    - Full customer storefront, product catalog, cart holds, and reviews.
 * 
 * 2. 🚚 SUPPLIER MODULE (`src/supplier/`):
 *    - Handled by `<App_supplier />`.
 *    - Wholesale inventory dispatch, bulk orders, and shipment tracking.
 * 
 * 3. 🏬 RETAILER MODULE (`src/retailer/`):
 *    - Handled by `<App_retailer />`.
 *    - Storefront POS billing, branch inventory, and store pickup counter.
 * 
 * 4. 🛡️ ADMIN MODULE (`src/admin/`):
 *    - Handled by `<App_admin />`.
 *    - System oversight, role management, and performance analytics.
 */

import React, { useState } from 'react';

// ── Module Entry Points ──
import App_consumer from './consumer/App_consumer';
import App_supplier from './supplier/App_supplier';
import App_retailer from './retailer/App_retailer';
import App_admin from './admin/App_admin';

export default function App() {
  // Current active module: 'consumer' | 'retailer' | 'supplier' | 'admin'
  const [activeModule, setActiveModule] = useState('consumer');
  const [showDevSwitcher, setShowDevSwitcher] = useState(true);

  // Switch active business module
  const handleSwitchModule = (moduleName) => {
    setActiveModule(moduleName);
  };

  // Render the selected module component
  const renderModule = () => {
    switch (activeModule) {
      case 'consumer':
        return <App_consumer onSwitchModule={handleSwitchModule} />;
      case 'retailer':
        return <App_retailer onSwitchModule={handleSwitchModule} />;
      case 'supplier':
        return <App_supplier onSwitchModule={handleSwitchModule} />;
      case 'admin':
        return <App_admin onSwitchModule={handleSwitchModule} />;
      default:
        return <App_consumer onSwitchModule={handleSwitchModule} />;
    }
  };

  return (
    <div className="stockoverflow-root-app">
      {/* ── Top Multi-Module Quick Switcher (Helpful for pair-programming & dev) ── */}
      {showDevSwitcher && (
        <div
          style={{
            background: '#0f172a',
            color: '#fff',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            borderBottom: '1px solid #334155',
            position: 'sticky',
            top: 0,
            zIndex: 99999,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#38BDF8', letterSpacing: '0.5px' }}>
              STOCKOVERFLOW HUB
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#94a3b8' }}>Switch Portal:</span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleSwitchModule('consumer')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeModule === 'consumer' ? '#2563eb' : '#1e293b',
                  color: activeModule === 'consumer' ? '#fff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                🛒 Consumer
              </button>

              <button
                type="button"
                onClick={() => handleSwitchModule('retailer')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeModule === 'retailer' ? '#2563eb' : '#1e293b',
                  color: activeModule === 'retailer' ? '#fff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                🏬 Retailer
              </button>

              <button
                type="button"
                onClick={() => handleSwitchModule('supplier')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeModule === 'supplier' ? '#2563eb' : '#1e293b',
                  color: activeModule === 'supplier' ? '#fff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                🚚 Supplier
              </button>

              <button
                type="button"
                onClick={() => handleSwitchModule('admin')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeModule === 'admin' ? '#2563eb' : '#1e293b',
                  color: activeModule === 'admin' ? '#fff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#64748b' }}>
              Active: <strong style={{ color: '#38BDF8' }}>{activeModule.toUpperCase()}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowDevSwitcher(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '11px',
              }}
              title="Hide switcher bar"
            >
              ✕ Hide
            </button>
          </div>
        </div>
      )}

      {/* Render the Active Module */}
      {renderModule()}
    </div>
  );
}
