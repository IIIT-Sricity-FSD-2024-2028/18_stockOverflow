/**
 * App_biller.jsx - Root Controller for the Biller & POS Module
 * 
 * Directly serves the POS screen on cashier login, handling incoming customer
 * reservations, barcode/catalog lookups, cart charges, and invoice printing.
 */

import React, { useState } from 'react';
import PosScreen from './components/PosScreen';
import BillerTransactionsView from './components/BillerTransactionsView';

export default function App_biller({ onLogout }) {
  // Directly start on the POS screen
  const [currentView, setCurrentView] = useState('pos'); // 'pos' | 'transactions'

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9' }}>
      {currentView === 'pos' && (
        <PosScreen
          onSwitchView={(view) => setCurrentView(view)}
          onLogout={onLogout}
        />
      )}

      {currentView === 'transactions' && (
        <BillerTransactionsView
          onBackToPos={() => setCurrentView('pos')}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}
