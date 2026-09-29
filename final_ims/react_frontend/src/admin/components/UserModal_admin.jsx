/**
 * UserModal_admin.jsx - Add & Edit User Dialog Modal for Admin
 */

import React from 'react';

export default function UserModal_admin({
  isOpen,
  editingUser,
  formData,
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
          maxWidth: '500px',
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
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </h3>
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
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
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
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => onChange('role', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="employee">Employee</option>
                <option value="retailer">Retailer</option>
                <option value="supplier">Supplier</option>
                <option value="biller">Biller</option>
                <option value="consumer">Consumer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => onChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Assigned Store
            </label>
            <select
              value={formData.store}
              onChange={(e) => onChange('store', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="Global Hub">Global Hub</option>
              <option value="Downtown Store">Downtown Store</option>
              <option value="Uptown Mall">Uptown Mall</option>
              <option value="Westside Outlet">Westside Outlet</option>
              <option value="Central Warehouse">Central Warehouse</option>
            </select>
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
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
