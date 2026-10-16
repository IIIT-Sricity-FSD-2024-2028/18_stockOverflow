/**
 * AdminLayout_admin.jsx - Universal Sidebar & Header Layout for Admin Pages
 * 
 * Features:
 * 1. Clean, de-duplicated sidebar navigation.
 * 2. Active Store Scope Picker in topbar header.
 * 3. Quick module navigation to Employee Desk and Landing.
 */

import React, { useState } from 'react';
import { STORES_DATA } from '../../data/mockData_admin';

export default function AdminLayout_admin({
  activeMenu = 'dashboard',
  onNavigate,
  onSwitchModule,
  onLogout,
  children,
}) {
  const [activeStoreId, setActiveStoreId] = useState(() => {
    try {
      return localStorage.getItem('stockoverflow_active_store_id') || 'store-1';
    } catch {
      return 'store-1';
    }
  });

  const handleScopeChange = (e) => {
    const val = e.target.value;
    setActiveStoreId(val);
    try {
      localStorage.setItem('stockoverflow_active_store_id', val);
      // Trigger a window event so current page knows store scope changed
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="admin-shell">
      {/* ── Fixed Left Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand" onClick={() => onNavigate && onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="admin-brand-icon">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
              </svg>
            </div>
            <span>Stock Overflow</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'revenue' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('revenue')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v12M17 9.5a3.5 3.5 0 0 0-7 0c0 2.5 3.5 3.5 3.5 3.5s3.5 1 3.5 3.5a3.5 3.5 0 0 1-7 0"/>
            </svg>
            <span>Platform Revenue</span>
          </button>

          {/* Unified Stores Link */}
          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'stores' || activeMenu === 'multistore' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('stores')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>Stores &amp; Multi-Store</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('users')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Users &amp; Staff</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'roles' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('roles')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Roles &amp; Permissions</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'reports' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('reports')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Reports &amp; Audits</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('settings')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Settings</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center', color: '#475569', gap: '6px' }}
            onClick={() => onLogout && onLogout()}
            title="Log out of Admin and enter another module via Login"
          >
            <span>🔄</span> Switch Role / Account
          </button>

          {/* Prominent Sidebar Logout Button */}
          <button
            type="button"
            className="admin-btn"
            style={{
              width: '100%',
              fontSize: '0.82rem',
              justifyContent: 'center',
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
            onClick={() => onLogout && onLogout()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="admin-main">
        {/* Topbar Header */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Active Store Scope Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Store Scope:
              </span>
              <select
                value={activeStoreId}
                onChange={handleScopeChange}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">🌐 All Store Branches (Global)</option>
                {STORES_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    🏬 {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="admin-user-profile">
              <div className="admin-user-avatar">SA</div>
              <div className="admin-user-info">
                <span className="admin-user-name">Super Admin</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            </div>

            {/* Prominent Header Logout Button */}
            <button
              type="button"
              onClick={() => onLogout && onLogout()}
              title="Sign out of Admin Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
