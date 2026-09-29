/**
 * StoreModal_admin.jsx - Add New Store Hub Dialog Modal for Admin
 */

import React from 'react';

export default function StoreModal_admin({
  isOpen,
  newStore,
  onChange,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add New Store Hub</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Store Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Northside Galleria Hub"
              value={newStore.name}
              onChange={(e) => onChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Store Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NTH-05"
                value={newStore.code}
                onChange={(e) => onChange('code', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Store Manager
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={newStore.manager}
                onChange={(e) => onChange('manager', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Address / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Galleria Mall, Sector 9"
              value={newStore.location}
              onChange={(e) => onChange('location', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Create Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
