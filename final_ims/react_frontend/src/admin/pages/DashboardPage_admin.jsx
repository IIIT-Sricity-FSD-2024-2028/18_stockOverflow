/**
 * DashboardPage_admin.jsx - Admin Dashboard Page View
 * 
 * Converted from final_ims/frontend/admin/dashboard.html
 */

import React from 'react';
import { ADMIN_DASHBOARD_STATS, STORES_DATA } from '../data/mockData_admin';

export default function DashboardPage_admin({ onNavigate }) {
  const stats = ADMIN_DASHBOARD_STATS;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin Dashboard</h1>
          <p className="admin-page-subtitle">Real-time overview of your inventory ecosystem.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => onNavigate('reports')}
          >
            📊 Export Reports
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => onNavigate('users')}
          >
            + Manage Users
          </button>
        </div>
      </div>

      {/* Row 1: User / Role Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Retailers
          </span>
          <div className="admin-metric-value">{stats.totalRetailers}</div>
          <div className="admin-metric-trend up">
            <span>↑ Active Retailers</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Suppliers
          </span>
          <div className="admin-metric-value">{stats.totalSuppliers}</div>
          <div className="admin-metric-trend up">
            <span>↑ Supply Chain Connected</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Consumers
          </span>
          <div className="admin-metric-value">{stats.totalConsumers}</div>
          <div className="admin-metric-trend up">
            <span>↑ Registered Buyers</span>
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>
            Low Stock Alerts
          </span>
          <div className="admin-metric-value" style={{ color: '#dc2626' }}>
            {stats.lowStockAlerts}
          </div>
          <div className="admin-metric-trend down">
            <span>⚠️ Needs Attention</span>
          </div>
        </div>
      </div>

      {/* Row 2: System-wide Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Stores
          </span>
          <div className="admin-metric-value" style={{ color: '#2563eb' }}>
            {stats.totalStores}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>
            ● All operational
          </div>
        </div>

        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Catalog Products
          </span>
          <div className="admin-metric-value">
            {stats.totalProducts}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Across all categories
          </div>
        </div>

        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gross Platform Volume
          </span>
          <div className="admin-metric-value" style={{ color: '#0f172a' }}>
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>
            +14.2% this month
          </div>
        </div>

        <div className="admin-metric-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Platform Commission (2%)
          </span>
          <div className="admin-metric-value" style={{ color: '#16a34a' }}>
            ₹{stats.platformCommission.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '4px' }}>
            Earned revenue
          </div>
        </div>
      </div>

      {/* Two Column Layout: Store Status & Quick Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Store Hubs */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Store Hubs</h3>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => onNavigate('stores')}
            >
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STORES_DATA.map((store) => (
              <div
                key={store.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{store.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Mgr: {store.manager} &bull; {store.location}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="admin-badge success">Active</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {store.stockCount} items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Shortcuts */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Quick System Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigate('users')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '6px' }}>👥</span>
              <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>User Governance</strong>
              <span style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '2px' }}>
                Manage roles and credentials
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('roles')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '6px' }}>🛡️</span>
              <strong style={{ fontSize: '0.85rem', color: '#5b21b6' }}>Roles &amp; Access</strong>
              <span style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '2px' }}>
                Permission matrix settings
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('revenue')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '6px' }}>💳</span>
              <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>Platform Revenue</strong>
              <span style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>
                Commission rates &amp; ledger
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('multistore')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '6px' }}>🏬</span>
              <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>Multi-Store Hub</strong>
              <span style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>
                Locations and stock sync
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
