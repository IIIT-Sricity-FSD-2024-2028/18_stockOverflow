/**
 * ReportsPage_admin.jsx - Admin Reports & Analytics Page (Redux connected)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportsSummaryData } from '../../store/admin-reports-actions';

export default function ReportsPage_admin() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.adminReports.reportsSummary);
  const loading = useSelector((state) => state.adminReports.loading);
  const error = useSelector((state) => state.adminReports.error);

  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    dispatch(fetchReportsSummaryData());
  }, [dispatch]);

  const handleDownload = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Report Type', reportType],
      ['Date Range', dateRange],
      ['Total Revenue', summary?.totalRevenue ?? 0],
      ['Platform Commission (2%)', summary?.platformCommission ?? 0],
      ['Total Orders', summary?.totalOrders ?? 0],
      ['Products Sold', summary?.productsSold ?? 0],
      ['Low Stock Items', summary?.lowStockItems ?? 0],
      ['Total Stores', summary?.totalStores ?? 0],
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `StockOverflow_${reportType}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reports &amp; Analytics</h1>
          <p className="admin-page-subtitle">
            Live backend summary metrics and CSV report exports
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={() => dispatch(fetchReportsSummaryData())}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh Summary'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {summary && (
        <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL REVENUE</span>
            <div className="admin-metric-value">₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PLATFORM COMMISSION</span>
            <div className="admin-metric-value" style={{ color: '#10b981' }}>
              ₹{Number(summary.platformCommission || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL ORDERS</span>
            <div className="admin-metric-value">{summary.totalOrders ?? 0}</div>
          </div>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LOW STOCK ITEMS</span>
            <div className="admin-metric-value" style={{ color: '#d97706' }}>{summary.lowStockItems ?? 0}</div>
          </div>
        </div>
      )}

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
        >
          📥 Download Report (CSV)
        </button>
      </div>
    </div>
  );
}
