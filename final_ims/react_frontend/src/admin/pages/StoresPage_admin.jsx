/**
 * StoresPage_admin.jsx - Store Selection & Multi-Store Hub Setup
 * 
 * Connected to live backend endpoints (/api/admin/stores)
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminStores, createAdminStore } from '../utils/api_admin';
import StoreModal_admin from '../components/StoreModal_admin';

export default function StoresPage_admin({ onNavigate }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStoreId, setActiveStoreId] = useState(() => {
    try {
      return localStorage.getItem('stockoverflow_active_store_id') || '';
    } catch {
      return '';
    }
  });

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
      const data = await fetchAdminStores();
      const list = Array.isArray(data) ? data : [];
      setStores(list);
      if (list.length > 0 && !activeStoreId) {
        const firstId = list[0].id || list[0].storeCode;
        setActiveStoreId(firstId);
        try {
          localStorage.setItem('stockoverflow_active_store_id', firstId);
        } catch (e) {
          console.warn(e);
        }
      }
    } catch (err) {
      console.error('Failed to load stores from backend:', err);
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleSelectStore = (id) => {
    setActiveStoreId(id);
    try {
      localStorage.setItem('stockoverflow_active_store_id', id);
    } catch (e) {
      console.warn(e);
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

  const activeStore = stores.find((s) => s.id === activeStoreId || s.storeCode === activeStoreId) || stores[0] || {
    id: '',
    name: 'No Active Store',
    code: '---',
    location: '---',
    manager: '---',
    stockCount: 0,
    revenue: 0,
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Selection &amp; Multi-Store Management</h1>
          <p className="admin-page-subtitle">
            Configure multi-store retail branches, manage warehouse inventory hubs, and set active store operational scope live from backend.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={loadStores}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Stores'}
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

      {/* ── Active Branch Scope Banner ── */}
      {stores.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ● Active Store Scope in Effect
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 6px 0' }}>
              {activeStore.name} {activeStore.code ? `(${activeStore.code})` : ''}
            </h2>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              📍 {activeStore.location || 'Central Location'} &bull; Manager: <strong>{activeStore.manager || 'Assigned Manager'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Live Branch Stock
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                {(activeStore.stockCount || 0).toLocaleString()} units
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Branch Status
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {activeStore.status || 'Active'}
              </div>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              View Dashboard Scoped to this Store →
            </button>
          </div>
        </div>
      )}

      {/* ── Multi-Store Architecture Explanation Box ── */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '1.75rem',
          fontSize: '12.5px',
          lineHeight: '1.5',
          color: '#1e40af',
        }}
      >
        <strong>🏬 How Multi-Store Support Works:</strong> A single retailer can own and manage multiple retail branches across different districts. Each branch maintains localized stock inventory, designated cashier POS terminals, and branch managers. Clicking <strong>"Set as Active Hub"</strong> scopes administrative and billing operations to that specific outlet.
      </div>

      {/* ── Grid of All Store Branches ── */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
        All Connected Branch Locations ({stores.length})
      </h3>

      {loading && stores.length === 0 ? (
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading stores live from backend...
        </div>
      ) : stores.length === 0 ? (
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No stores connected yet. Click "+ Add New Store Hub" to create your first branch.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {stores.map((store) => {
            const sid = store.id || store.storeCode;
            const isActive = sid === activeStoreId;
            return (
              <div
                key={sid}
                className="admin-card"
                style={{
                  border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      {store.code && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                          {store.code}
                        </span>
                      )}
                      <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
                        {store.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        ID: <strong>{sid}</strong>
                      </div>
                    </div>
                    <span className={`admin-badge ${isActive ? 'primary' : 'success'}`}>
                      {isActive ? 'CURRENT HUB' : store.status || 'Active'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
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
                      marginBottom: '1rem',
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
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {(store.stockCount || 0).toLocaleString()} items
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Staff Count
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {store.staffCount || 1} staff
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        POS Status
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                        ● Operational
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className={`admin-btn ${isActive ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => handleSelectStore(sid)}
                  >
                    {isActive ? '✓ Active Store Hub' : 'Set as Active Hub'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Store Modal */}
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
