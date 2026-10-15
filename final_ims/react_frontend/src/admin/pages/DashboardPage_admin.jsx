/**
 * DashboardPage_admin.jsx - High-Performance Executive Admin Dashboard
 * 
 * Features:
 * 1. Meaningful real-time metrics (Gross Platform Volume, Net Commission, Stores, Low Stock Alerts).
 * 2. Cross-module verification badge directly linked to Employee Desk.
 * 3. Recent Real Transactions & 2% Commission Settled Activity table.
 * 4. Active Store Scope indicator.
 */

import React from 'react';
import { ADMIN_DASHBOARD_STATS, STORES_DATA, REVENUE_LEDGER } from '../data/mockData_admin';

export default function DashboardPage_admin({ onNavigate, onSwitchModule }) {
  const stats = ADMIN_DASHBOARD_STATS;

  // Active store scope from localStorage
  const activeStoreId = typeof window !== 'undefined'
    ? localStorage.getItem('stockoverflow_active_store_id') || 'all'
    : 'all';

  const activeStoreName =
    activeStoreId === 'all'
      ? 'Global Network (All Store Branches)'
      : STORES_DATA.find((s) => s.id === activeStoreId)?.name || 'Downtown Store';

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Command Dashboard</h1>
          <p className="admin-page-subtitle">
            Current operational scope: <strong>{activeStoreName}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => onNavigate('revenue')}
          >
            💰 View Revenue Model
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

      {/* ── Cross-Module Verification Alert ── */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e' }}>
              Pending Entity Onboarding Approvals
            </div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>
              New retailers &amp; suppliers are waiting in the verification queue.
            </div>
          </div>
        </div>

        {onSwitchModule && (
          <button
            type="button"
            className="admin-btn"
            style={{ background: '#f59e0b', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: 700 }}
            onClick={() => onSwitchModule('employee')}
          >
            Open Employee Desk →
          </button>
        )}
      </div>

      {/* ── Core Executive KPIs (Only meaningful, high-value data) ── */}
      <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gross Platform Volume (GMV)
          </span>
          <div className="admin-metric-value" style={{ color: '#0f172a' }}>
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ Total sales passing through platform
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Net Platform Commission (2%)
          </span>
          <div className="admin-metric-value" style={{ color: '#10b981' }}>
            ₹{stats.platformCommission.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            StockOverflow platform earnings
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Physical Outlets
          </span>
          <div className="admin-metric-value" style={{ color: '#8b5cf6' }}>
            {stats.totalStores} Hubs
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Across 18 connected retailers
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#fef2f2' }}>
          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>
            Low Stock Critical Alerts
          </span>
          <div className="admin-metric-value" style={{ color: '#dc2626' }}>
            {stats.lowStockAlerts}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px' }}>
            ⚠️ Reorder threshold reached
          </div>
        </div>
      </div>

      {/* ── Two Column: Recent Transactions & Store Branches ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Recent Transactions Table */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Recent POS Orders &amp; 2% Monetization</h3>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => onNavigate('revenue')}
            >
              Full Ledger →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Store Branch</th>
                  <th>Order Amount</th>
                  <th>2% Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_LEDGER.slice(0, 5).map((row) => (
                  <tr key={row.orderId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                      {row.orderId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.store}</td>
                    <td style={{ fontWeight: 700 }}>₹{row.amount.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      +₹{row.commission.toFixed(2)}
                    </td>
                    <td>
                      <span className="admin-badge success">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Hubs Overview */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Multi-Store Branch Hubs</h3>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => onNavigate('stores')}
            >
              Configure Hubs
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
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{store.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {store.code} &bull; Mgr: {store.manager}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="admin-badge success">{store.status}</span>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    {store.stockCount.toLocaleString()} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
