/**
 * StoresPage_admin.jsx - Store Selection & Multi-Store Hub Setup
 * 
 * Clarifies and implements:
 * 1. Multi-Store Architecture: Retailers operate multiple physical branches under their brand.
 * 2. Active Store Selection: Selecting a store hub scopes the operational context, displays
 *    real-time branch analytics, POS terminal status, and updates the global store filter.
 * 3. Adding new regional fulfillment hubs and branches with validation.
 */

import React, { useState } from 'react';
import { STORES_DATA } from '../data/mockData_admin';
import StoreModal_admin from '../components/StoreModal_admin';

export default function StoresPage_admin({ onNavigate }) {
  const [stores, setStores] = useState(() => {
    try {
      const saved = localStorage.getItem('stockoverflow_admin_stores');
      return saved ? JSON.parse(saved) : STORES_DATA;
    } catch {
      return STORES_DATA;
    }
  });

  const [activeStoreId, setActiveStoreId] = useState(() => {
    try {
      return localStorage.getItem('stockoverflow_active_store_id') || 'store-1';
    } catch {
      return 'store-1';
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    code: '',
    location: '',
    retailerName: 'Downtown Retail Corp',
    manager: '',
    stockCount: 0,
    staffCount: 1,
  });

  const persistStores = (updatedStores) => {
    setStores(updatedStores);
    try {
      localStorage.setItem('stockoverflow_admin_stores', JSON.stringify(updatedStores));
    } catch (e) {
      console.warn('Could not save stores to localStorage', e);
    }
  };

  const handleSelectStore = (id) => {
    setActiveStoreId(id);
    try {
      localStorage.setItem('stockoverflow_active_store_id', id);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetStores = () => {
    if (window.confirm('Reset stores back to initial demo branches?')) {
      persistStores(STORES_DATA);
      handleSelectStore('store-1');
    }
  };

  const handleFormChange = (field, value) => {
    setNewStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStore = (e) => {
    e.preventDefault();
    if (!newStore.name || !newStore.code) {
      alert('Please provide store name and branch code.');
      return;
    }
    const store = {
      id: `store-${Date.now()}`,
      ...newStore,
      revenue: 0,
      status: 'Active',
    };
    persistStores([...stores, store]);
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
  };

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Selection &amp; Multi-Store Management</h1>
          <p className="admin-page-subtitle">
            Configure multi-store retail branches, manage warehouse inventory hubs, and set active store operational scope.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleResetStores}
            title="Reset to initial seed branches"
          >
            ↻ Reset Demo Stores
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

      {/* ── What Store Selection Does: Active Branch Scope Banner ── */}
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
            {activeStore.name} ({activeStore.code})
          </h2>
          <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
            📍 {activeStore.location} &bull; Retailer: <strong>{activeStore.retailerName || 'Downtown Retail Corp'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Live Branch Stock
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
              {activeStore.stockCount.toLocaleString()} units
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Branch Revenue
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              ₹{(activeStore.revenue || 185400).toLocaleString('en-IN')}
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
        <strong>🏬 How Multi-Store Support Works:</strong> A single retailer can own and manage multiple retail branches across different districts. Each branch maintains localized stock inventory, designated cashier POS terminals, and branch managers. Clicking <strong>"Select as Active Hub"</strong> scopes administrative and billing operations to that specific outlet.
      </div>

      {/* ── Grid of All Store Branches ── */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
        All Connected Branch Locations ({stores.length})
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {stores.map((store) => {
          const isActive = store.id === activeStoreId;
          return (
            <div
              key={store.id}
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                      {store.code}
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
                      {store.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Retailer: <strong>{store.retailerName || 'Downtown Retail Corp'}</strong>
                    </div>
                  </div>
                  <span className={`admin-badge ${isActive ? 'primary' : 'success'}`}>
                    {isActive ? 'CURRENT HUB' : store.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  📍 {store.location}
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
                      {store.manager}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Stock Units
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {store.stockCount.toLocaleString()} items
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Staff Count
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {store.staffCount} staff
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      POS Terminals
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
                  onClick={() => handleSelectStore(store.id)}
                >
                  {isActive ? '✓ Active Store Hub' : 'Set as Active Hub'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Modal */}
      <StoreModal_admin
        isOpen={isModalOpen}
        newStore={newStore}
        onChange={handleFormChange}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddStore}
      />
    </div>
  );
}
