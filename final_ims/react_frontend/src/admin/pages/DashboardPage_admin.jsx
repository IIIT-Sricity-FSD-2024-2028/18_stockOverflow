/**
 * DashboardPage_admin.jsx - High-Performance Executive Admin Dashboard
 * 
 * Directly connected to backend endpoints:
 * 1. /api/admin/dashboard/stats
 * 2. /api/platform-revenue/summary
 * 3. /api/platform-revenue/commissions
 * 4. /api/admin/stores
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDataSync } from '../../context/DataSyncContext';
import {
  fetchAdminDashboardStats,
  fetchPlatformRevenueSummary,
  fetchPlatformCommissions,
  fetchAdminStores,
} from '../utils/api_admin';

export default function DashboardPage_admin({ onNavigate, onSwitchModule }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    totalStores: 0,
    lowStockAlerts: 0,
    pendingValidations: 0,
    settledTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stores, setStores] = useState([]);

  const [activeStoreId, setActiveStoreId] = useState(() => {
    try {
      return localStorage.getItem('stockoverflow_active_store_id') || 'all';
    } catch {
      return 'all';
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const id = localStorage.getItem('stockoverflow_active_store_id') || 'all';
        setActiveStoreId(id);
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const [dashStats, revSummary, commissions, storesList] = await Promise.all([
        fetchAdminDashboardStats().catch(() => ({})),
        fetchPlatformRevenueSummary().catch(() => ({})),
        fetchPlatformCommissions(undefined, 8).catch(() => []),
        fetchAdminStores().catch(() => []),
      ]);

      const totalRev = Number(
        revSummary?.totalGrossVolume ?? revSummary?.grossPlatformVolume ?? dashStats?.platformRevenue ?? 0
      );
      const commission = Number(
        revSummary?.totalCommissionEarned ?? revSummary?.netPlatformRevenue ?? (totalRev * 0.02) ?? 0
      );
      const storesCount = Array.isArray(storesList)
        ? storesList.length
        : Number(dashStats?.totalStores || 0);
      const settledCount = Number(
        revSummary?.totalTransactionsProcessed ??
        revSummary?.totalTransactions ??
        dashStats?.settledTransactions ??
        (Array.isArray(commissions) ? commissions.length : 0)
      );

      setStats({
        totalRevenue: totalRev,
        platformCommission: commission,
        totalStores: storesCount,
        settledTransactions: settledCount,
        pendingValidations: Number(dashStats?.pendingValidations || 0),
      });

      if (Array.isArray(commissions)) {
        setRecentTransactions(commissions);
      }
      if (Array.isArray(storesList)) {
        setStores(storesList);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard live data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time synchronization across modules
  useDataSync(['transactions', 'revenue', 'users', 'products', 'assignments', 'stores'], () => {
    loadDashboardData();
  });

  const activeStoreName =
    activeStoreId === 'all'
      ? 'Global Network (All Store Branches)'
      : stores.find((s) => s.id === activeStoreId || s.code === activeStoreId)?.name || 'Central Store';

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Command Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <p className="admin-page-subtitle" style={{ margin: 0 }}>
              Current operational scope: <strong>{activeStoreName}</strong>
            </p>
            {activeStoreId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('stockoverflow_active_store_id', 'all');
                    window.dispatchEvent(new Event('storage'));
                    setActiveStoreId('all');
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  cursor: 'pointer',
                }}
              >
                Reset to Global Scope ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {activeStoreId !== 'all' && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => onNavigate && onNavigate('store-dashboard', { storeId: activeStoreId })}
            >
              🏬 Open {activeStoreName} Dashboard →
            </button>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => onNavigate && onNavigate('revenue')}
          >
            💰 View Revenue Model
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => onNavigate && onNavigate('users')}
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
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e' }}>
              Pending Entity Onboarding Approvals ({stats.pendingValidations})
            </div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>
              Retailers &amp; suppliers are waiting in the verification queue.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-outline"
          style={{ borderColor: '#f59e0b', color: '#b45309', fontSize: '12px', fontWeight: 700 }}
          onClick={() => onNavigate && onNavigate('users')}
        >
          Review Users &amp; Staff →
        </button>
      </div>

      {/* ── Core Executive KPIs ── */}
      <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gross Platform Volume (GMV)
          </span>
          <div className="admin-metric-value" style={{ color: '#0f172a' }}>
            {loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
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
            {loading ? '...' : `₹${stats.platformCommission.toLocaleString('en-IN')}`}
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
            {loading ? '...' : `${stats.totalStores} Hubs`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Connected retailer branches
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #0891b2', backgroundColor: '#f0fdfa' }}>
          <span style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: 600, textTransform: 'uppercase' }}>
            Platform Order Throughput
          </span>
          <div className="admin-metric-value" style={{ color: '#0d9488' }}>
            {loading ? '...' : `${stats.settledTransactions} Processed`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0f766e', marginTop: '4px' }}>
            ⚡ 100% automated 2% take-rate settled
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
                {(() => {
                  const displayedTransactions = activeStoreId === 'all'
                    ? recentTransactions
                    : recentTransactions.filter((t) => {
                        const sid = String(t.storeId || '').toLowerCase();
                        const sname = String(t.storeName || t.store || '').toLowerCase();
                        const target = activeStoreId.toLowerCase();
                        return sid === target || sname.includes(target);
                      });

                  return displayedTransactions.length > 0 ? (
                    displayedTransactions.slice(0, 5).map((row, idx) => (
                      <tr key={row.orderId || row.id || idx}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                          {row.orderId || row.id}
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.storeName || row.store || 'Downtown Store'}</td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{Number(row.orderTotal || row.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#16a34a' }}>
                          +₹{Number(row.commissionAmount || row.commission || 0).toFixed(2)}
                        </td>
                        <td>
                          <span className="admin-badge success">{row.status || 'settled'}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                        {loading
                          ? 'Loading real transactions...'
                          : activeStoreId !== 'all'
                          ? `No orders recorded for ${activeStoreName} yet.`
                          : 'No orders recorded yet. Process a POS sale to see live 2% monetization.'}
                      </td>
                    </tr>
                  );
                })()}
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
            {stores.length > 0 ? (
              stores.slice(0, 5).map((store) => (
                <div
                  key={store.id || store.code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => onNavigate && onNavigate('store-dashboard', { storeId: store.id || store.code })}
                  title={`Open ${store.name} Scoped Dashboard`}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      🏬 {store.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {store.code} &bull; Mgr: {store.contactPerson || store.manager || 'Store Manager'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="admin-badge success">{store.status || 'active'}</span>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                      View Dashboard →
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                {loading ? 'Loading stores...' : 'No store branches configured.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
