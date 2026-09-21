/**
 * App_admin.jsx - Main Application Controller for Admin Module
 * 
 * IN LAYMAN'S TERMS:
 * This will be the main entry point for the System Administrator portal.
 * Admins can:
 * 1. Oversee overall system health, total revenue analytics, and transaction logs.
 * 2. Manage user roles, biller approvals, and employee access.
 * 3. Configure store fulfillment hubs, categories, and system policies.
 */

import React, { useState } from 'react';

export default function App_admin({ onSwitchModule }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-portal-wrapper" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Admin Master Control Center
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Executive oversight, role governance, user management, and system-wide inventory auditing.
            </p>
          </div>
          {onSwitchModule && (
            <button
              type="button"
              onClick={() => onSwitchModule('consumer')}
              style={{
                padding: '8px 16px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ← Back to Consumer
            </button>
          )}
        </header>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Stores</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>4</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>All operational</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Registered Users</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>128</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Admins, Billers, Consumers</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending Approvals</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>3</div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>Biller registration requests</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>System Health</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>99.9%</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Backend API connected</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚙️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Admin Module Components Ready for Migration</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            The dedicated folder <code>src/admin/</code> has been created. Analytics charts, user governance tables, and system logs will be organized here.
          </p>
        </div>
      </div>
    </div>
  );
}
