/**
 * DashboardPage_admin.jsx - High-Performance Executive Admin Dashboard
 * 
 * Directly connected to backend endpoints:
 * 1. /api/admin/dashboard/stats
 * 2. /api/platform-revenue/summary
 * 3. /api/platform-revenue/commissions
 * 4. /api/admin/stores
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStatsData } from '../../store/admin-reports-actions';
import { fetchPlatformRevenueData } from '../../store/revenue-actions';
import { fetchStoresData } from '../../store/stores-actions';
import { fetchEmployeeStatsData } from '../../store/employee-stats-actions';

export default function DashboardPage_admin({ onNavigate }) {
  const dispatch = useDispatch();
  const dashStats = useSelector((state) => state.adminReports.dashboardStats);
  const revSummary = useSelector((state) => state.revenue.summary);
  const commissions = useSelector((state) => state.revenue.commissions);
  const stores = useSelector((state) => state.stores.stores);
  const employeeStats = useSelector((state) => state.employeeStats.stats);
  const loading = useSelector(
    (state) => state.adminReports.loading || state.revenue.loading || state.stores.loading
  );

  useEffect(() => {
    dispatch(fetchDashboardStatsData());
    dispatch(fetchPlatformRevenueData());
    dispatch(fetchStoresData());
    dispatch(fetchEmployeeStatsData());
  }, [dispatch]);

  const totalRev = Number(
    revSummary?.totalGrossVolume ?? revSummary?.grossPlatformVolume ?? dashStats?.platformRevenue ?? 0
  );
  const commission = Number(
    revSummary?.totalCommissionEarned ?? revSummary?.netPlatformRevenue ?? totalRev * 0.02 ?? 0
  );
  const stats = {
    totalRevenue: totalRev,
    platformCommission: commission,
    totalStores: stores.length || Number(dashStats?.totalStores || 0),
    settledTransactions: Number(
      revSummary?.totalTransactionsProcessed ??
        revSummary?.totalTransactions ??
        dashStats?.settledTransactions ??
        commissions.length
    ),
    pendingValidations: Number(employeeStats?.pendingValidations ?? dashStats?.pendingValidations ?? 0),
  };
  const recentTransactions = commissions.slice(0, 8);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Command Dashboard</h1>
          <p className="admin-page-subtitle" style={{ marginTop: '4px' }}>
            Global Network Overview across all connected stores
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
            Orders Processed
          </span>
          <div className="admin-metric-value" style={{ color: '#0d9488' }}>
            {loading ? '...' : `${stats.settledTransactions} Processed`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0f766e', marginTop: '4px' }}>
            2% commission auto-applied
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
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((row, idx) => (
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
                        : 'No orders recorded yet. Process a POS sale to see live 2% monetization.'}
                    </td>
                  </tr>
                )}
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
