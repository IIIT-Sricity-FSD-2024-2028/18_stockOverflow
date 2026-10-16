/**
 * RolesPage_admin.jsx - Admin Roles & Permissions Matrix Page View
 * 
 * Connected to live backend endpoints (/api/admin/roles)
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminRoles, updateAdminRole } from '../utils/api_admin';
import { PERMISSION_DEFINITIONS } from '../data/mockData_admin';

export default function RolesPage_admin() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminRoles();
      const roleList = Array.isArray(data) ? data : [];
      setRoles(roleList);
      if (roleList.length > 0 && !selectedRoleId) {
        setSelectedRoleId(roleList[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin roles:', err);
      setError(err.message || 'Failed to load roles from backend');
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || {
    id: '',
    name: 'Loading...',
    description: '',
    permissions: {},
  };

  const handleTogglePermission = (permKey) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === selectedRoleId) {
          return {
            ...role,
            permissions: {
              ...(role.permissions || {}),
              [permKey]: !(role.permissions && role.permissions[permKey]),
            },
          };
        }
        return role;
      })
    );
  };

  const handleSave = async () => {
    if (!currentRole.id) return;
    try {
      setSaving(true);
      setError(null);
      await updateAdminRole(currentRole.id, {
        name: currentRole.name,
        description: currentRole.description,
        permissions: currentRole.permissions || {},
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadRoles();
    } catch (err) {
      console.error('Failed to save role permissions:', err);
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
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
            onClick={loadRoles}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Roles'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
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
              System Roles
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
                  const hasAccess = !!(currentRole.permissions && currentRole.permissions[perm.key]);
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
