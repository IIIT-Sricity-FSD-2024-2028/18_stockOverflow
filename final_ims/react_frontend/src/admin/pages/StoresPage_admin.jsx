/**
 * StoresPage_admin.jsx - Admin Store Selection & Hub Setup Page View
 * 
 * Converted from final_ims/frontend/admin/stores.html & multistore.html
 */

import React, { useState } from 'react';
import { STORES_DATA } from '../data/mockData_admin';
import StoreModal_admin from '../components/StoreModal_admin';

export default function StoresPage_admin() {
  const [stores, setStores] = useState(STORES_DATA);
  const [activeStoreId, setActiveStoreId] = useState('store-1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    code: '',
    location: '',
    manager: '',
    stockCount: 0,
    staffCount: 1,
  });

  const handleFormChange = (field, value) => {
    setNewStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStore = (e) => {
    e.preventDefault();
    if (!newStore.name || !newStore.code) return;
    const store = {
      id: `store-${Date.now()}`,
      ...newStore,
      status: 'Active',
    };
    setStores([...stores, store]);
    setIsModalOpen(false);
    setNewStore({ name: '', code: '', location: '', manager: '', stockCount: 0, staffCount: 1 });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Selection &amp; Multi-Store Setup</h1>
          <p className="admin-page-subtitle">
            Manage physical retail outlets, regional fulfillment warehouses, and branch inventory
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add New Store Hub
        </button>
      </div>

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
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                      {store.code}
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                      {store.name}
                    </h3>
                  </div>
                  <span className="admin-badge success">{store.status}</span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  📍 {store.location}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Store Manager
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
                      Active Staff
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {store.staffCount} employees
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      POS Terminals
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      Operational
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className={`admin-btn ${isActive ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveStoreId(store.id)}
                >
                  {isActive ? '✓ Selected Store' : 'Select Store'}
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
