/**
 * App_retailer.jsx - Main Application Controller for Retailer Module
 * 
 * IN LAYMAN'S TERMS:
 * This will be the main entry point for the Retailer & In-Store Cashier portal.
 * Retailers can:
 * 1. View and update physical store branch stock levels.
 * 2. Process in-store customer sales, cashier billing (POS), and reservation pick-ups.
 * 3. Place restock replenishment orders to suppliers.
 */

import React, { useState } from 'react';

export default function App_retailer({ onSwitchModule }) {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="retailer-portal-wrapper" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🏬</span>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Retailer Store & Cashier POS Portal
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              In-store branch inventory management, cashier checkout, customer hold approvals, and supplier restocks.
            </p>
          </div>
          {onSwitchModule && (
            <button
              type="button"
              onClick={() => onSwitchModule('consumer')}
              style={{
                padding: '8px 16px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ← Back to Consumer
            </button>
          )}
        </header>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Today's Counter Sales</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>₹48,920</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>32 transactions processed</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending Store Holds</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>8</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Customers picking up today</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Low Stock Warnings</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>4</div>
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Needs supplier reorder</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🛒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Retailer Module Components Ready for Migration</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            The dedicated folder <code>src/retailer/</code> has been created. POS cashier, inventory adjustment tables, and barcode checkout components can be organized here.
          </p>
        </div>
      </div>
    </div>
  );
}
