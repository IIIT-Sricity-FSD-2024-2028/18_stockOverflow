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
import App_employee from './employee/App_employee';

export default function App() {
  // Current active module: 'consumer' | 'retailer' | 'supplier' | 'admin' | 'employee'
  const [activeModule, setActiveModule] = useState('admin');

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
      case 'employee':
        return <App_employee onSwitchModule={handleSwitchModule} />;
      default:
        return <App_admin onSwitchModule={handleSwitchModule} />;
    }
  };

  return (
    <div className="stockoverflow-root-app">
      {/* Render the Active Module */}
      {renderModule()}
    </div>
  );
}
