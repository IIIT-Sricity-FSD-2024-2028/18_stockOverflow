/**
 * EmployeeLayout_employee.jsx - Universal Sidebar & Header Layout for Employee Pages
 * 
 * Follows the same pattern as CustomerLayout_consumer.jsx:
 * Provides the fixed left sidebar and top header bar for all employee views.
 */

import React from 'react';

export default function EmployeeLayout_employee({
  activeMenu = 'dashboard',
  onNavigate,
  onSwitchModule,
  onLogout,
  children,
}) {
  return (
    <div className="emp-shell">
      {/* ── Fixed Left Sidebar ── */}
      <aside className="emp-sidebar">
        <div className="emp-sidebar-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <span style={{ fontSize: '18px' }}>📦</span>
            <span>StockOverflow</span>
          </div>
        </div>

        <div className="emp-sidebar-body">
          {/* Group 1: Command Center */}
          <div className="emp-sb-group">
            <div className="emp-sb-group-label">Command Center</div>
            <button
              type="button"
              className={`emp-sb-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
              </svg>
              <span>Employee Dashboard</span>
            </button>
          </div>

          <div className="emp-sb-divider" />

          {/* Group 2: Validation Queue */}
          <div className="emp-sb-group">
            <div className="emp-sb-group-label">Validation Queue</div>
            <button
              type="button"
              className={`emp-sb-item ${activeMenu === 'validations' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('validations')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M14 5l-7 7-4-4"/><circle cx="8" cy="8" r="7"/>
              </svg>
              <span>All Validations</span>
              <span className="emp-sb-badge">2</span>
            </button>
          </div>

          <div className="emp-sb-divider" />

          {/* Group 3: Helpdesk */}
          <div className="emp-sb-group">
            <div className="emp-sb-group-label">Helpdesk &amp; Queries</div>
            <button
              type="button"
              className={`emp-sb-item ${activeMenu === 'queries' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('queries')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z"/>
              </svg>
              <span>User Queries</span>
              <span className="emp-sb-badge">3</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            className="emp-btn"
            style={{ width: '100%', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', fontSize: '12px', justifyContent: 'center', gap: '6px' }}
            onClick={() => onLogout && onLogout()}
            title="Log out of Employee Desk and authenticate into another module via Login"
          >
            <span>🔄</span> Switch Role / Account
          </button>

          {/* Prominent Sidebar Logout Button */}
          <button
            type="button"
            className="emp-btn"
            style={{
              width: '100%',
              fontSize: '12px',
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="emp-main">
        <header className="emp-topbar">
          <div className="emp-breadcrumb">
            Home / <span>{activeMenu === 'dashboard' ? 'Command Center' : activeMenu === 'validations' ? 'Validation Queue' : 'User Queries'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="emp-search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="#9ca3af">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Search desk..." />
            </div>
            <button type="button" className="emp-topbar-avatar" title="Employee Profile">EM</button>

            {/* Header Logout Button */}
            <button
              type="button"
              onClick={() => onLogout && onLogout()}
              title="Sign out of Employee Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </header>

        <div className="emp-content">
          {children}
        </div>
      </div>
    </div>
  );
}
