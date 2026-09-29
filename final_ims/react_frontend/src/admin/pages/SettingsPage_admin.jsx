/**
 * SettingsPage_admin.jsx - Admin Platform Settings Page View
 * 
 * Converted from final_ims/frontend/admin/settings.html
 */

import React, { useState } from 'react';

export default function SettingsPage_admin() {
  const [settings, setSettings] = useState({
    platformName: 'Stock Overflow IMS',
    commissionRate: 2.0,
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveRetailers: false,
    defaultCurrency: 'INR (₹)',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Settings</h1>
          <p className="admin-page-subtitle">Configure global platform policies, rates, and operational modes</p>
        </div>
        {saved && (
          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
            ✅ Settings updated successfully!
          </span>
        )}
      </div>

      <div className="admin-card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Platform Title
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Default Take-Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Operating Currency
              </label>
              <input
                type="text"
                disabled
                value={settings.defaultCurrency}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ padding: '1rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Maintenance Mode</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Temporarily disable storefront POS checkouts</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Auto-Approve Retailer Registrations</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bypass employee validation queue for registered partners</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproveRetailers}
                onChange={(e) => setSettings({ ...settings, autoApproveRetailers: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>System Email Alerts</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Send daily digests for low stock and pending validations</div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
              />
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary">
            Save Platform Settings
          </button>
        </form>
      </div>
    </div>
  );
}
