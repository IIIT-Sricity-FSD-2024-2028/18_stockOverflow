/**
 * StoresPage_admin.jsx - Store Selection & Multi-Store Management
 * 
 * Connected to live backend endpoints (/api/admin/stores, /api/platform-revenue/summary)
 * Provides multi-store retail branch management and direct navigation to scoped store dashboards.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataSync } from '../../context/DataSyncContext';
import { fetchAdminStores, createAdminStore, fetchPlatformRevenueSummary } from '../utils/api_admin';
import StoreModal_admin from '../components/StoreModal_admin';

export default function StoresPage_admin({ onNavigate }) {
  const [stores, setStores] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newStore, setNewStore] = useState({
    name: '',
    code: '',
    location: '',
    retailerName: 'Downtown Retail Corp',
    manager: '',
    stockCount: 0,
    staffCount: 1,
  });

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [storesData, revData] = await Promise.allSettled([
        fetchAdminStores(),
        fetchPlatformRevenueSummary(),
      ]);

      const list = storesData.status === 'fulfilled' && Array.isArray(storesData.value) ? storesData.value : [];
      setStores(list);

      if (revData.status === 'fulfilled' && revData.value) {
        setRevenueSummary(revData.value);
      }
    } catch (err) {
      console.error('Failed to load stores from backend:', err);
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // Real-time synchronization
  useDataSync(['stores', 'transactions', 'revenue'], () => {
    loadStores();
  });

  // Navigate to Dashboard scoped to the chosen store
  const handleViewScopedDashboard = (storeObj) => {
    const targetId = storeObj?.id || storeObj?.storeCode || activeStoreId || 'all';
    try {
      localStorage.setItem('stockoverflow_active_store_id', targetId);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn(e);
    }
    if (onNavigate) {
      onNavigate('store-dashboard', { storeId: targetId });
    }
  };

  const handleFormChange = (field, value) => {
    setNewStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStore.name || !newStore.code) {
      alert('Please provide store name and branch code.');
      return;
    }
    try {
      setSaving(true);
      await createAdminStore({
        name: newStore.name,
        location: newStore.location,
        manager: newStore.manager,
        code: newStore.code,
      });
      setIsModalOpen(false);
      setNewStore({
        name: '',
        code: '',
        location: '',
        retailerName: 'Downtown Retail Corp',
        manager: '',
        stockCount: 0,
        staffCount: 1,
      });
      await loadStores();
    } catch (err) {
      alert(`Error creating store: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Map store revenue from backend platform summary
  const storeRevenueMap = useMemo(() => {
    const map = new Map();
    if (revenueSummary?.byStore && Array.isArray(revenueSummary.byStore)) {
      revenueSummary.byStore.forEach((s) => {
        map.set(String(s.storeId || ''), s);
        if (s.storeName) map.set(s.storeName.toLowerCase().trim(), s);
      });
    }
    return map;
  }, [revenueSummary]);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Network &amp; Multi-Branch Outlets</h1>
          <p className="admin-page-subtitle">
            Oversee multi-branch retail distribution networks, view live in-store stock, and access dedicated store dashboards.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={loadStores}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Branches'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Add New Store Hub
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Multi-Store Architecture Explanation Box ── */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '2rem',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#334155',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>🏬</span>
        <div>
          <strong style={{ color: '#0f172a' }}>Multi-Store Architecture:</strong>
          <span style={{ color: '#475569' }}>
            {' '}A single retail enterprise can operate multiple physical store locations and warehouse depots. Click <strong>"Open Store Dashboard →"</strong> on any branch below to view its localized stock inventory, cashier POS transactions, staff terminals, and 2% platform commission inflows.
          </span>
        </div>
      </div>

      {/* ── Grid of All Connected Store Branches ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Connected Branch Locations ({stores.length})
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Click "Open Store Dashboard →" on any card to access its complete operational metrics.
          </p>
        </div>
      </div>

      {loading && stores.length === 0 ? (
        <div className="admin-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
          Loading store network live from backend...
        </div>
      ) : stores.length === 0 ? (
        <div className="admin-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
          No stores connected yet. Click "+ Add New Store Hub" to register your first branch.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {stores.map((store) => {
            const sid = store.id || store.storeCode;
            const storeStats = storeRevenueMap.get(String(store.id || '')) ||
              storeRevenueMap.get(store.name?.toLowerCase().trim()) || {
                totalSales: 0,
                commission: 0,
                orderCount: 0,
              };

            return (
              <div
                key={sid}
                className="admin-card"
                style={{
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  background: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      {store.code && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          BRANCH {store.code}
                        </span>
                      )}
                      <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        {store.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        ID: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>{sid}</code>
                      </div>
                    </div>

                    <span
                      className={`admin-badge ${(store.status || 'Active').toLowerCase() === 'active' ? 'success' : 'warning'}`}
                      style={{ fontWeight: 700 }}
                    >
                      {store.status || 'Active'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', minHeight: '34px' }}>
                    📍 {store.location || 'Location Not Specified'}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '1.25rem',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Branch Manager
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {store.manager || 'Assigned Staff'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Stock Units
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                        {(store.stockCount || 0).toLocaleString()} items
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Gross Sales
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                        ₹{Number(storeStats.totalSales || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        2% Commission
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{Number(storeStats.commission || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    style={{
                      width: '100%',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      fontWeight: 700,
                      padding: '9px 16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleViewScopedDashboard(store)}
                    title={`Open ${store.name} Dashboard`}
                  >
                    Open Store Dashboard →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Store Hub Modal */}
      <StoreModal_admin
        isOpen={isModalOpen}
        newStore={newStore}
        onChange={handleFormChange}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddStore}
        saving={saving}
      />
    </div>
  );
}
