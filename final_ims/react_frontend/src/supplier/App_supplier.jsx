/**
 * App_supplier.jsx - Main Application Controller for Supplier Module
 * 
 * IN LAYMAN'S TERMS:
 * This will be the main entry point for the Supplier portal.
 * Suppliers can:
 * 1. View incoming purchase/replenishment orders from retailers.
 * 2. Manage wholesale product catalogs, minimum order quantities (MOQ), and bulk prices.
 * 3. Dispatch delivery shipments and update consignment tracking status.
 */

import React, { useState } from 'react';

export default function App_supplier({ onSwitchModule }) {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="supplier-portal-wrapper" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🚚</span>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Supplier Dispatch & Supply Portal
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Manage wholesale inventory shipments, retailer purchase requests, and dispatch manifests.
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

        {/* Placeholder Navigation & Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending Retailer Orders</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>14</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>5 ready for dispatch</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Catalog SKUs</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>48</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Across 8 categories</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Shipments In Transit</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>6</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Estimated delivery today</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>📦</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Supplier Module Components Ready for Migration</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            The dedicated folder <code>src/supplier/</code> has been created. Components, pages, and API hooks for wholesale supply can be dropped into this folder and will render right here.
          </p>
        </div>
      </div>
    </div>
  );
}
