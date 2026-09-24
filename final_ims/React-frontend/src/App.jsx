/**
 * App.jsx - Central Multi-Module Root Hub & Dispatcher
 * 
 * StockOverflow Unified React Frontend
 * Coordinating 4 integrated business modules:
 * 1. 🛒 CONSUMER MODULE (`src/consumer/`):
 *    - Handled by `<App_consumer />` (merged from Krish React).
 *    - Full customer storefront, product catalog, cart holds, and reviews.
 * 2. 🏬 RETAILER MODULE (`src/retailer/`):
 *    - Handled by `<App_retailer />` (Abhiraj's functional implementation).
 *    - Storefront POS billing, branch inventory, stock adjustments, suppliers,
 *      purchase orders, scorecards, billers, and customers.
 * 3. 🚚 SUPPLIER MODULE (`src/supplier/`):
 *    - Handled by `<App_supplier />`.
 *    - Wholesale inventory dispatch, bulk orders, and shipment tracking.
 * 4. 🛡️ ADMIN MODULE (`src/admin/`):
 *    - Handled by `<App_admin />`.
 *    - System oversight, role management, and performance analytics.
 */

import React, { useState } from 'react';

// ── Module Entry Points ──
import App_consumer from './consumer/App_consumer';
import App_retailer from './retailer/App_retailer';
import App_supplier from './supplier/App_supplier';
import App_admin from './admin/App_admin';

export default function App() {
  // Current active module: 'retailer' | 'consumer' | 'supplier' | 'admin'
  const [activeModule, setActiveModule] = useState(() => {
    try {
      return localStorage.getItem('so_active_module') || 'retailer';
    } catch {
      return 'retailer';
    }
  });

  const [showDevSwitcher, setShowDevSwitcher] = useState(true);

  // Switch active business module
  const handleSwitchModule = (moduleName) => {
    try {
      localStorage.setItem('so_active_module', moduleName);
    } catch {}
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
        return <App_retailer onSwitchModule={handleSwitchModule} />;
    }
  };

  return (
    <div className="stockoverflow-root-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Top Multi-Module Quick Switcher (StockOverflow Hub) ── */}
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
                id="hubBtnRetailer"
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
                Retailer
              </button>

              <button
                type="button"
                id="hubBtnConsumer"
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
                Consumer
              </button>

              <button
                type="button"
                id="hubBtnSupplier"
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
                Supplier
              </button>

              <button
                type="button"
                id="hubBtnAdmin"
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
                Admin
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
