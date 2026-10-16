/**
 * StoreDashboardPage_admin.jsx - Scoped Store Command & Audit Dashboard
 * 
 * Provides an in-depth, dedicated operational view for any individual store branch:
 * - Scoped Store Gross Revenue & 2.0% Platform Commission
 * - Scoped In-Store Product Inventory & Stock Health
 * - Scoped POS Cashier Receipts & Customer Orders
 * - Assigned Store Staff & Counter Terminals
 * - Quick Store Switcher & Operational Status Management
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataSync } from '../../context/DataSyncContext';
import {
  fetchAdminStores,
  updateAdminStore,
  fetchAdminProducts,
  fetchAdminTransactions,
  fetchAdminUsers,
  fetchPlatformRevenueSummary,
} from '../utils/api_admin';

export default function StoreDashboardPage_admin({ storeId, onNavigate, onBack }) {
  const [allStores, setAllStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    return storeId || (typeof window !== 'undefined' ? localStorage.getItem('stockoverflow_active_store_id') : '') || '';
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store scoped datasets
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inventory' | 'orders' | 'staff'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Keep selectedStoreId in sync with props
  useEffect(() => {
    if (storeId && storeId !== selectedStoreId) {
      setSelectedStoreId(storeId);
    }
  }, [storeId]);

  // Load all data
  const loadScopedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [storesRes, prodsRes, txRes, usersRes, revRes] = await Promise.allSettled([
        fetchAdminStores(),
        fetchAdminProducts(),
        fetchAdminTransactions(),
        fetchAdminUsers(),
        fetchPlatformRevenueSummary(),
      ]);

      const storeList = storesRes.status === 'fulfilled' && Array.isArray(storesRes.value) ? storesRes.value : [];
      setAllStores(storeList);

      const allProds = prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) ? prodsRes.value : [];
      const allTx = txRes.status === 'fulfilled' && Array.isArray(txRes.value) ? txRes.value : [];
      const allUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];

      if (revRes.status === 'fulfilled') {
        setRevenueSummary(revRes.value);
      }

      // Identify active store
      let current = null;
      if (selectedStoreId) {
        current = storeList.find(
          (s) =>
            String(s.id || '').toLowerCase() === String(selectedStoreId).toLowerCase() ||
            String(s.storeCode || s.code || '').toLowerCase() === String(selectedStoreId).toLowerCase() ||
            String(s.name || '').toLowerCase() === String(selectedStoreId).toLowerCase()
        );
      }
      if (!current && storeList.length > 0) {
        current = storeList[0];
        setSelectedStoreId(current.id || current.storeCode);
      }

      setStoreData(current);

      if (current) {
        const curId = String(current.id || '').toLowerCase();
        const curCode = String(current.code || current.storeCode || '').toLowerCase();
        const curName = String(current.name || '').toLowerCase();

        // Filter products scoped to this store
        const scopedProds = allProds.filter((p) => {
          if (!p.storeId && !p.store) return true; // Global catalog item available
          const pStoreId = String(p.storeId || '').toLowerCase();
          const pStoreName = String(p.store || '').toLowerCase();
          return pStoreId === curId || pStoreId === curCode || pStoreName === curName;
        });
        setProducts(scopedProds);

        // Filter transactions scoped to this store
        const scopedTx = allTx.filter((t) => {
          const tStoreId = String(t.storeId || '').toLowerCase();
          const tStoreName = String(t.store || t.storeName || '').toLowerCase();
          return tStoreId === curId || tStoreId === curCode || tStoreName === curName || tStoreName.includes(curName);
        });
        setTransactions(scopedTx);

        // Filter staff assigned to this store or retailer
        const scopedStaff = allUsers.filter((u) => {
          const uStoreId = String(u.storeId || '').toLowerCase();
          const uStoreName = String(u.store || '').toLowerCase();
          const role = String(u.role || '').toLowerCase();
          return (
            (role === 'biller' || role === 'employee' || role === 'retailer') &&
            (uStoreId === curId || uStoreId === curCode || uStoreName === curName || uStoreName.includes(curName))
          );
        });
        setUsers(scopedStaff);
      }
    } catch (err) {
      console.error('Failed to load scoped store dashboard:', err);
      setError(err.message || 'Failed to load store dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    loadScopedData();
  }, [loadScopedData]);

  // Real-time synchronization
  useDataSync(['stores', 'products', 'transactions', 'revenue', 'users'], () => {
    loadScopedData();
  });

  // Switch store handler
  const handleSwitchStore = (newId) => {
    setSelectedStoreId(newId);
    try {
      localStorage.setItem('stockoverflow_active_store_id', newId);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn(e);
    }
  };

  // Toggle store operating status
  const handleToggleStatus = async () => {
    if (!storeData?.id) return;
    try {
      setStatusUpdating(true);
      const nextStatus = (storeData.status || 'Active').toLowerCase() === 'active' ? 'Maintenance' : 'Active';
      await updateAdminStore(storeData.id, {
        ...storeData,
        status: nextStatus,
      });
      setStoreData((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      alert(`Failed to update store status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Compute live scoped KPIs
  const kpis = useMemo(() => {
    const grossVolume = transactions.reduce((sum, t) => sum + Number(t.finalTotal || t.amount || 0), 0);
    const platformCommission = Number((grossVolume * 0.02).toFixed(2));
    const netRetailerEarnings = Number((grossVolume - platformCommission).toFixed(2));
    const totalOrders = transactions.length;

    const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stock ?? p.quantity ?? 0), 0);
    const totalSkus = products.length;

    return {
      grossVolume,
      platformCommission,
      netRetailerEarnings,
      totalOrders,
      totalStockUnits,
      totalSkus,
    };
  }, [transactions, products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.sku || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        String(t.orderId || t.id || '').toLowerCase().includes(q) ||
        String(t.customer || '').toLowerCase().includes(q) ||
        String(t.paymentMethod || '').toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Export Store Scoped CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Items Count', 'Gross Total (INR)', '2% Platform Commission (INR)', 'Net Retailer (INR)', 'Payment Method', 'Timestamp', 'Status'];
    const rows = transactions.map((t) => [
      t.orderId || t.id,
      t.customer || 'Customer',
      Array.isArray(t.items) ? t.items.length : 1,
      t.finalTotal || 0,
      Number(((t.finalTotal || 0) * 0.02).toFixed(2)),
      Number(((t.finalTotal || 0) * 0.98).toFixed(2)),
      t.paymentMethod || 'Cash',
      t.timestamp || new Date().toISOString(),
      t.status || 'Delivered',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Store_${storeData?.code || 'Branch'}_Audit_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* ── Top Breadcrumbs & Store Switcher Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px', color: '#475569' }}
            onClick={() => (onBack ? onBack() : onNavigate && onNavigate('stores'))}
          >
            ← Back to Stores List
          </button>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            🏬 {storeData?.name || 'Store Branch'} Dashboard
          </span>
        </div>

        {/* Quick Switch Store Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Switch Branch:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => handleSwitchStore(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {allStores.map((s) => (
              <option key={s.id || s.storeCode} value={s.id || s.storeCode}>
                🏬 {s.name} {s.code ? `(${s.code})` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={handleExportCSV}
            title="Download CSV report of this store"
          >
            📥 Export Branch Ledger
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Main Store Header Hero Card (High-Contrast Dark Aesthetic) ── */}
      {storeData && (
        <div
          style={{
            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            marginBottom: '1.75rem',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {storeData.code && (
                  <span
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                  >
                    BRANCH CODE: {storeData.code}
                  </span>
                )}
                <span
                  style={{
                    background: (storeData.status || 'Active').toLowerCase() === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: (storeData.status || 'Active').toLowerCase() === 'active' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${(storeData.status || 'Active').toLowerCase() === 'active' ? '#10b981' : '#f59e0b'}`,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: (storeData.status || 'Active').toLowerCase() === 'active' ? '#34d399' : '#fbbf24' }} />
                  {(storeData.status || 'Active').toUpperCase()}
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
                {storeData.name}
              </h1>

              <div style={{ fontSize: '13.5px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span>📍 <strong>Location:</strong> {storeData.location || 'Central Market, Main Street'}</span>
                <span>&bull;</span>
                <span>👤 <strong>Branch Manager:</strong> <span style={{ color: '#f8fafc' }}>{storeData.manager || 'Assigned Manager'}</span></span>
                <span>&bull;</span>
                <span>🏢 <strong>Store ID:</strong> <code style={{ background: '#334155', color: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px' }}>{storeData.id || storeData.storeCode}</code></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-btn"
                style={{
                  background: (storeData.status || 'Active').toLowerCase() === 'active' ? '#f59e0b' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  padding: '9px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
                onClick={handleToggleStatus}
                disabled={statusUpdating}
              >
                {statusUpdating ? 'Updating...' : (storeData.status || 'Active').toLowerCase() === 'active' ? 'Set to Maintenance' : 'Activate Branch'}
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-outline"
                style={{
                  background: '#334155',
                  color: '#ffffff',
                  border: '1px solid #475569',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  padding: '9px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
                onClick={loadScopedData}
              >
                ↻ Refresh Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scoped KPI Cards Grid ── */}
      <div className="admin-metrics-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Branch Gross Sales (GMV)
          </span>
          <div className="admin-metric-value" style={{ color: '#0f172a' }}>
            {loading ? '...' : `₹${kpis.grossVolume.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px' }}>
            Across {kpis.totalOrders} live POS transactions
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            2.0% Platform Take-Rate
          </span>
          <div className="admin-metric-value" style={{ color: '#10b981' }}>
            {loading ? '...' : `₹${kpis.platformCommission.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Net commission earned from this branch
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            In-Store Live Stock Units
          </span>
          <div className="admin-metric-value" style={{ color: '#8b5cf6' }}>
            {loading ? '...' : `${kpis.totalStockUnits.toLocaleString()} units`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Available across {kpis.totalSkus} SKUs in catalog
          </div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #0891b2' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Net Retailer Disbursed
          </span>
          <div className="admin-metric-value" style={{ color: '#0891b2' }}>
            {loading ? '...' : `₹${kpis.netRetailerEarnings.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            98.0% merchant earnings after take-rate
          </div>
        </div>
      </div>

      {/* ── Tabbed View Switcher ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'overview', label: '📊 Store Overview & Summary' },
          { key: 'inventory', label: `📦 Live Branch Stock (${products.length})` },
          { key: 'orders', label: `🧾 POS Orders & Receipts (${transactions.length})` },
          { key: 'staff', label: `👥 Cashiers & Staff (${users.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setSearchQuery('');
            }}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingBottom: '6px' }}>
          <input
            type="text"
            placeholder="Search items or orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              width: '220px',
            }}
          />
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & PERFORMANCE METRICS ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Recent Orders in this Store */}
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Recent POS Cashier Checkouts
              </h3>
              <button
                type="button"
                className="admin-btn admin-btn-outline admin-btn-sm"
                onClick={() => setActiveTab('orders')}
              >
                View All {transactions.length} Orders →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>2% Commission</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((t) => (
                      <tr key={t.orderId || t.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                          {t.orderId || t.id}
                        </td>
                        <td style={{ fontWeight: 600 }}>{t.customer || 'Walk-in Customer'}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{Number(t.finalTotal || t.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#16a34a' }}>
                          +₹{Number(((t.finalTotal || t.amount || 0) * 0.02).toFixed(2))}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{t.paymentMethod || 'Cash'}</span>
                        </td>
                        <td>
                          <span className="admin-badge success">{t.status || 'settled'}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No orders recorded at this store yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Branch Operational Specifications Card */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Branch Operational Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Store Branch Name:</span>
                <strong>{storeData?.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Branch Identification Code:</span>
                <strong style={{ fontFamily: 'monospace' }}>{storeData?.code || '---'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Physical Depot Address:</span>
                <strong>{storeData?.location || 'Central Location'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Appointed Branch Manager:</span>
                <strong>{storeData?.manager || 'Assigned Staff'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Stock Settlement Rate:</span>
                <strong style={{ color: '#16a34a' }}>2.0% Automated Commission Cut</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Assigned Cashiers / Staff:</span>
                <strong>{users.length} registered users</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Operating State:</span>
                <span className={`admin-badge ${(storeData?.status || 'Active').toLowerCase() === 'active' ? 'success' : 'warning'}`}>
                  {storeData?.status || 'Active'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                onClick={() => setActiveTab('inventory')}
              >
                Inspect Stock Catalog →
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-outline"
                style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                onClick={() => onNavigate && onNavigate('revenue')}
              >
                Platform Revenue Ledger →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE INVENTORY CATALOG TABLE ── */}
      {activeTab === 'inventory' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                In-Store Live Inventory Units
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Showing stock items available at {storeData?.name}.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {filteredProducts.length} products
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock In Depot</th>
                  <th>Stock Health Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const stock = Number(p.stock ?? p.quantity ?? 0);
                    const isLow = stock <= 10 && stock > 0;
                    const isOut = stock <= 0;

                    return (
                      <tr key={p.id || p.sku}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                          {p.sku}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {p.emoji ? `${p.emoji} ` : ''}{p.name}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{Number(p.price || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '13.5px', color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a' }}>
                          {stock} units
                        </td>
                        <td>
                          <span className={`admin-badge ${isOut ? 'danger' : isLow ? 'warning' : 'success'}`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Inventory' : 'Adequate Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No product SKUs found matching "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: POS ORDERS & RECEIPTS TABLE ── */}
      {activeTab === 'orders' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                POS Checkout Orders &amp; 2% Commission Receipts
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Live settlement records for checkout transactions originating from {storeData?.name}.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {filteredTransactions.length} orders
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Items Purchased</th>
                  <th>Gross Total</th>
                  <th>2.0% Commission Cut</th>
                  <th>Net Retailer Amount</th>
                  <th>Payment Method</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => {
                    const gross = Number(t.finalTotal || t.amount || 0);
                    const comm = Number((gross * 0.02).toFixed(2));
                    const net = Number((gross - comm).toFixed(2));
                    const itemCount = Array.isArray(t.items) ? t.items.length : 1;
                    const dateStr = t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'Today';

                    return (
                      <tr key={t.orderId || t.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                          {t.orderId || t.id}
                        </td>
                        <td style={{ fontWeight: 600 }}>{t.customer || 'Walk-in Customer'}</td>
                        <td style={{ color: '#64748b' }}>{itemCount} items</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#16a34a' }}>
                          +₹{comm.toFixed(2)}
                        </td>
                        <td style={{ fontWeight: 700, color: '#2563eb' }}>
                          ₹{net.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                            {t.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {dateStr}
                        </td>
                        <td>
                          <span className="admin-badge success">{t.status || 'settled'}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No transactions found matching "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: ASSIGNED STAFF & CASHIERS ── */}
      {activeTab === 'staff' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Store Staff &amp; Cashier Terminals
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Authorized billing clerks, cashiers, and managers operating at this branch.
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => onNavigate && onNavigate('users')}
            >
              Manage Users &amp; Permissions →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Operational Role</th>
                  <th>Email Address</th>
                  <th>Assigned Store</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                        {u.id}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                      <td>
                        <span className={`admin-badge ${u.role === 'retailer' ? 'primary' : u.role === 'biller' ? 'success' : 'warning'}`}>
                          {String(u.role || '').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ fontWeight: 600 }}>{u.store || storeData?.name}</td>
                      <td>
                        <span className="admin-badge success">{u.status || 'Active'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No staff accounts specifically mapped to this branch yet. Default billing terminals are operational.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
