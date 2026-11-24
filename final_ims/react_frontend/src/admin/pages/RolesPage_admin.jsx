/**
 * RolesPage_admin.jsx - Admin Roles & Permissions Matrix (Redux connected)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRolesData,
  createRoleData,
  updateRoleData,
  deleteRoleData,
} from '../../store/roles-actions';

const PERMISSION_DEFINITIONS = [
  { key: 'viewInventory', label: 'View Inventory', description: 'Can inspect stock levels and warehouse items' },
  { key: 'editInventory', label: 'Edit Inventory', description: 'Can add, edit, or adjust product quantities' },
  { key: 'manageOrders', label: 'Manage Orders', description: 'Can create, approve, and cancel orders' },
  { key: 'updateDeliveryStatus', label: 'Update Delivery Status', description: 'Can mark shipments as dispatched or delivered' },
  { key: 'viewReports', label: 'View Reports', description: 'Can access sales, inventory, and revenue reports' },
  { key: 'manageUsers', label: 'Manage Users & Roles', description: 'Can add, edit, or delete user accounts and roles' },
];

export default function RolesPage_admin() {
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.roles.roles);
  const loading = useSelector((state) => state.roles.loading);
  const reduxError = useSelector((state) => state.roles.error);

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [draftPermissions, setDraftPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Add role modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const error = localError || reduxError;

  useEffect(() => {
    dispatch(fetchRolesData());
  }, [dispatch]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || {
    id: '',
    name: 'Loading...',
    description: '',
    permissions: {},
  };

  useEffect(() => {
    setDraftPermissions(currentRole.permissions || {});
  }, [currentRole.id, currentRole.permissions]);

  const handleTogglePermission = (permKey) => {
    setDraftPermissions((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleSave = async () => {
    if (!currentRole.id) return;
    try {
      setSaving(true);
      setLocalError(null);
      await dispatch(
        updateRoleData(currentRole.id, {
          name: currentRole.name,
          description: currentRole.description,
          permissions: draftPermissions,
        })
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setLocalError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleDesc.trim()) return;
    try {
      setSaving(true);
      setLocalError(null);
      const created = await dispatch(
        createRoleData({
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
          permissions: {
            viewInventory: true,
            editInventory: false,
            manageOrders: false,
            updateDeliveryStatus: false,
            viewReports: false,
            manageUsers: false,
          },
        })
      );
      setShowAddForm(false);
      setNewRoleName('');
      setNewRoleDesc('');
      if (created?.id) setSelectedRoleId(created.id);
    } catch (err) {
      setLocalError(err.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      setLocalError(null);
      await dispatch(deleteRoleData(role.id));
      setSelectedRoleId('');
    } catch (err) {
      setLocalError(err.message || 'Default system roles cannot be deleted unless customized first.');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage User Roles</h1>
          <p className="admin-page-subtitle">Define user roles and configure their access permissions live in backend</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saveSuccess && (
            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
              ✅ Permissions saved successfully!
            </span>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => dispatch(fetchRolesData())}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Roles'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setShowAddForm((v) => !v)}
          >
            + Add Role
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleCreateRole}
          className="admin-card"
          style={{ marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Role Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Auditor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '2 1 260px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read-only compliance auditor"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Role'}
          </button>
          <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {loading && roles.length === 0 ? (
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading roles and permissions matrix from backend...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Roles List */}
          <div className="admin-card" style={{ padding: 0 }}>
            <h3
              style={{
                padding: '1.25rem 1.25rem 0.5rem',
                fontSize: '0.75rem',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 700,
                margin: 0,
              }}
            >
              System Roles ({roles.length})
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <li
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? '#2563eb' : '#0f172a' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {role.description}
                      </div>
                    </div>
                    <span style={{ color: isSelected ? '#2563eb' : '#94a3b8' }}>›</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Permissions Configuration Area */}
          <div className="admin-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {currentRole.name} Permissions
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  {currentRole.description}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {currentRole.id && !String(currentRole.id).startsWith('role-') && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                    onClick={() => handleDeleteRole(currentRole)}
                  >
                    Delete Role
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  style={{ backgroundColor: '#10b981' }}
                  onClick={handleSave}
                  disabled={saving || !currentRole.id}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Access</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_DEFINITIONS.map((perm) => {
                  const hasAccess = !!draftPermissions[perm.key];
                  return (
                    <tr key={perm.key}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{perm.label}</td>
                      <td style={{ color: '#64748b' }}>{perm.description}</td>
                      <td style={{ textAlign: 'right' }}>
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={() => handleTogglePermission(perm.key)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
