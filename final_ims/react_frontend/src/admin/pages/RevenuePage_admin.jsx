/**
 * RevenuePage_admin.jsx - Admin Platform Revenue Model Page View
 */

import React, { useState, useMemo } from 'react';
import { REVENUE_TIERS, REVENUE_LEDGER, ADMIN_DASHBOARD_STATS } from '../data/mockData_admin';

export default function RevenuePage_admin() {
  const [search, setSearch] = useState('');
  const stats = ADMIN_DASHBOARD_STATS;

  const filteredLedger = useMemo(() => {
    return REVENUE_LEDGER.filter(
      (item) =>
        item.orderId.toLowerCase().includes(search.toLowerCase()) ||
        item.store.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Revenue Model</h1>
          <p className="admin-page-subtitle">
            Commission rates, subscription tiers, and transaction fee settlements
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Commission Earned
          </span>
          <div className="admin-metric-value" style={{ color: '#10b981' }}>
            ₹{stats.platformCommission.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>2.0% platform take-rate</div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gross Platform Volume
          </span>
          <div className="admin-metric-value" style={{ color: '#3b82f6' }}>
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all retail branches</div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Store Subscriptions
          </span>
          <div className="admin-metric-value" style={{ color: '#8b5cf6' }}>
            35
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bharat retail partners</div>
        </div>

        <div className="admin-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Avg. Transaction Fee
          </span>
          <div className="admin-metric-value" style={{ color: '#f59e0b' }}>
            ₹54.00
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Per POS receipt</div>
        </div>
      </div>

      {/* Subscription Tiers Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
          SaaS Pricing &amp; Tier Plans
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {REVENUE_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="admin-card"
              style={{
                border: tier.featured ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-11px',
                    right: '16px',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 10px',
                    borderRadius: '10px',
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                {tier.name}
              </h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 1rem' }}>
                {tier.price} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>{tier.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1 }}>
                {tier.features.map((feat, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '0.82rem',
                      padding: '6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#334155',
                    }}
                  >
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`admin-btn ${tier.featured ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                style={{ width: '100%' }}
              >
                Configure Tier
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Fee Ledger */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Transaction Fee Settlement Ledger</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Automatic 2% commission collected per store billing order
            </span>
          </div>
          <input
            type="text"
            placeholder="Search by order or store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.82rem',
              outline: 'none',
              width: '240px',
            }}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Store Location</th>
              <th>Order Amount</th>
              <th>Platform Commission (2%)</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No transaction records match search.
                </td>
              </tr>
            ) : (
              filteredLedger.map((tx) => (
                <tr key={tx.orderId}>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{tx.orderId}</td>
                  <td>{tx.store}</td>
                  <td style={{ fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td style={{ color: '#16a34a', fontWeight: 700 }}>+₹{tx.commission.toFixed(2)}</td>
                  <td style={{ color: '#64748b' }}>{tx.date}</td>
                  <td>
                    <span className="admin-badge success">{tx.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

}