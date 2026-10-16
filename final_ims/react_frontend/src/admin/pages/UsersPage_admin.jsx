/**
 * UsersPage_admin.jsx - Admin User & Staff Management Page View
 * 
 * Connected to live backend endpoints (/api/admin/users)
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../utils/api_admin';
import UserModal_admin from '../components/UserModal_admin';

export default function UsersPage_admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    store: 'Downtown Store',
    status: 'Active',
    phone: '',
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
      setError(err.message || 'Failed to load users from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = String(u.name || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      const s = search.toLowerCase();
      const matchesSearch = name.includes(s) || email.includes(s);
      const matchesRole = !roleFilter || String(u.role || '').toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = !statusFilter || String(u.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      store: 'Downtown Store',
      status: 'Active',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      store: user.store || 'Global Hub',
      status: user.status || 'Active',
      phone: user.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        await updateAdminUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          store: formData.store,
          status: formData.status,
        });
      } else {
        await createAdminUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          store: formData.store,
          status: formData.status,
          password: 'Password123!',
        });
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      alert(`Error saving user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteAdminUser(id);
        await loadUsers();
      } catch (err) {
        alert(`Error deleting user: ${err.message}`);
      }
    }
  };

  const getRoleBadge = (role) => {
    const r = String(role || '').toLowerCase();
    let badgeClass = 'primary';
    if (r === 'supplier') badgeClass = 'warning';
    if (r === 'consumer') badgeClass = 'success';
    if (r === 'biller') badgeClass = 'purple';
    if (r === 'employee') badgeClass = 'cyan';
    if (r === 'admin') badgeClass = 'danger';

    return (
      <span className={`admin-badge ${badgeClass}`}>
        {r.charAt(0).toUpperCase() + r.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    let badgeClass = 'success';
    if (s === 'warning' || s === 'pending') badgeClass = 'warning';
    if (s === 'inactive' || s === 'rejected') badgeClass = 'danger';

    return <span className={`admin-badge ${badgeClass}`}>{status || 'Active'}</span>;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Users</h1>
          <p className="admin-page-subtitle">View, edit, and manage all users live from backend</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={loadUsers}
            disabled={loading}
            title="Refresh from backend"
          >
            {loading ? 'Refreshing...' : '↻ Refresh Users'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters Area */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              width: '180px',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              background: '#fff',
              outline: 'none',
            }}
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="retailer">Retailer</option>
            <option value="supplier">Supplier</option>
            <option value="biller">Biller</option>
            <option value="consumer">Consumer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '180px',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              background: '#fff',
              outline: 'none',
            }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Warning">Warning</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Store</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Loading users from backend...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const nameStr = user.name || user.email || 'User';
                  const initials = nameStr
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                            }}
                          >
                            {initials}
                          </div>
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td style={{ color: '#64748b' }}>{user.store || '-'}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            onClick={() => handleOpenEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            color: '#64748b',
          }}
        >
          <span>Showing {filteredUsers.length} users</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="admin-btn admin-btn-outline admin-btn-sm">
              Previous
            </button>
            <button type="button" className="admin-btn admin-btn-outline admin-btn-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reusable User Modal Component */}
      <UserModal_admin
        isOpen={isModalOpen}
        editingUser={editingUser}
        formData={formData}
        onChange={handleFormChange}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        saving={saving}
      />
    </div>
  );
}
