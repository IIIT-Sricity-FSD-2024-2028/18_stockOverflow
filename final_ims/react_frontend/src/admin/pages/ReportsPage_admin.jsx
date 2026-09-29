/**
 * ReportsPage_admin.jsx - Admin Reports & Export Page View
 * 
 * Converted from final_ims/frontend/admin/reports.html
 */

import React, { useState } from 'react';

export default function ReportsPage_admin() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Report exported successfully! Download ready in CSV format.');
    }, 1200);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reports &amp; Analytics</h1>
          <p className="admin-page-subtitle">
            Generate and export inventory audits, transaction logs, and platform revenue breakdowns
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.25rem 0' }}>Export Report Data</h3>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            Report Category
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: '#fff',
              fontSize: '0.85rem',
            }}
          >
            <option value="sales">Sales &amp; POS Billing Receipts</option>
            <option value="inventory">Live Stock &amp; Warehouse Inventory</option>
            <option value="commission">Platform Commission &amp; Fees (2%)</option>
            <option value="lowstock">Low Stock Alerts &amp; Reorders</option>
            <option value="users">User Access &amp; Staff Audit Log</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            Time Period
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                type="button"
                className={`admin-btn ${dateRange === range ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setDateRange(range)}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last Quarter' : 'Past Year'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          style={{ width: '100%', padding: '12px' }}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Preparing Report...' : '📥 Download Report (CSV / Excel)'}
        </button>
      </div>
    </div>
  );
}
