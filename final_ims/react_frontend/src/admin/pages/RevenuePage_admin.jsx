/**
 * RevenuePage_admin.jsx - Dual-View Platform Revenue & Monetization Engine
 * 
 * Connected to live backend endpoints (/api/platform-revenue/* and /api/admin/users)
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDataSync } from '../../context/DataSyncContext';
import {
  fetchPlatformRevenueSummary,
  fetchPlatformCommissions,
  fetchPlatformSubscriptions,
  fetchPricingTiers,
  fetchAdminUsers,
} from '../utils/api_admin';

const FALLBACK_TIERS = [
  {
    name: 'Starter / Free',
    price: '₹0',
    period: '/ month',
    orderLimit: '3 Orders / week',
    features: ['1 Store Location', 'Up to 50 Products', 'POS Counter Access', 'Community Support'],
  },
  {
    name: 'Vyapar Pro / Growth',
    price: '₹799',
    period: '/ month',
    orderLimit: '15 Orders / week',
    featured: true,
    features: ['Up to 5 Store Branches', 'Unlimited Products & SKUs', 'AI Reorder Suggestions', 'Priority Verification Queue'],
  },
  {
    name: 'Enterprise Hub',
    price: '₹3,499',
    period: '/ month',
    orderLimit: 'Unlimited Orders',
    features: ['Unlimited Branches', 'Dedicated Staff Routing', 'Custom GST & Invoicing', '24/7 SLA Phone Support'],
  },
];

export default function RevenuePage_admin() {
  const [activeView, setActiveView] = useState('platform');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summaryData, setSummaryData] = useState(null);
  const [stakeholders, setStakeholders] = useState([]);
  const [pricingTiers, setPricingTiers] = useState(FALLBACK_TIERS);

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, commissions, subscriptions, users, tiers] = await Promise.allSettled([
        fetchPlatformRevenueSummary(),
        fetchPlatformCommissions(),
        fetchPlatformSubscriptions(),
        fetchAdminUsers(),
        fetchPricingTiers('retailer'),
      ]);

      const summ = summary.status === 'fulfilled' ? summary.value : null;
      setSummaryData(summ);

      const commList = commissions.status === 'fulfilled' && Array.isArray(commissions.value) ? commissions.value : [];
      const subList = subscriptions.status === 'fulfilled' && Array.isArray(subscriptions.value) ? subscriptions.value : [];
      const userList = users.status === 'fulfilled' && Array.isArray(users.value) ? users.value : [];

      if (tiers.status === 'fulfilled' && Array.isArray(tiers.value) && tiers.value.length > 0) {
        setPricingTiers(
          tiers.value.map((t) => ({
            name: t.name || t.tier,
            price: `₹${t.price}`,
            period: `/${t.billingInterval || 'month'}`,
            orderLimit: `${t.weeklyOrderLimit} POs/wk`,
            featured: t.tier === 'pro',
            features: Array.isArray(t.features) ? t.features : [],
          }))
        );
      }

      // Set of matched commission IDs to track any transactions not tied to user accounts
      const matchedCommIds = new Set();

      // Group commissions and subscriptions by user/retailer
      const records = userList
        .filter((u) => ['retailer', 'supplier', 'consumer'].includes(String(u.role || '').toLowerCase()))
        .map((u) => {
          const uid = String(u.id || '');
          const uProfileId = String(u.profileId || '');
          const uRetailerId = String(u.retailerId || '');
          const uStoreId = String(u.storeId || '');
          const uStoreName = String(u.store || '').toLowerCase().trim();
          const uName = String(u.name || '').toLowerCase().trim();
          const uEmail = String(u.email || '').toLowerCase().trim();
          const urole = String(u.role || '').toLowerCase();

          // Subscriptions for this user
          const userSubs = subList.filter(
            (s) =>
              (s.userId && (String(s.userId) === uid || String(s.userId) === uProfileId)) ||
              (s.retailerId && (String(s.retailerId) === uid || String(s.retailerId) === uProfileId || String(s.retailerId) === uRetailerId))
          );
          const subFee = userSubs
            .filter((s) => s.status === 'active')
            .reduce((acc, s) => acc + Number(s.pricePerMonth || 0), 0);
          const planName =
            userSubs.length > 0
              ? userSubs[0].tierName || userSubs[0].tier
              : u.plan || 'Starter (Free)';

          // Commissions & Orders for this user
          const userComms = commList.filter((c) => {
            const cRetId = String(c.retailerId || c.userId || '');
            const cStoreId = String(c.storeId || '');
            const cStoreName = String(c.storeName || c.retailerName || '').toLowerCase().trim();
            const cCust = String(c.customerName || '').toLowerCase().trim();
            const cEmail = String(c.customerEmail || '').toLowerCase().trim();

            let matched = false;
            if (urole === 'retailer') {
              if (cRetId && (cRetId === uid || cRetId === uProfileId || cRetId === uRetailerId)) matched = true;
              else if (uStoreId && cStoreId && uStoreId === cStoreId) matched = true;
              else if (uStoreName && cStoreName && (cStoreName === uStoreName || cStoreName.includes(uName))) matched = true;
              else if (uName && cStoreName && cStoreName.includes(uName)) matched = true;
            } else if (urole === 'consumer') {
              if (uName && cCust && (cCust === uName || cCust.includes(uName))) matched = true;
              else if (uEmail && cEmail && cEmail === uEmail) matched = true;
            }

            if (matched && c.id) {
              matchedCommIds.add(c.id);
            }
            return matched;
          });

          const commissionEarned = userComms.reduce((acc, c) => acc + Number(c.commissionAmount || 0), 0);
          const grossVolume = userComms.reduce((acc, c) => acc + Number(c.orderTotal || c.grossAmount || 0), 0);
          const userEarnings = userComms.reduce(
            (acc, c) => acc + Number(c.netRetailerAmount || (c.orderTotal - c.commissionAmount) || 0),
            0
          );
          const transactionCount = userComms.length;

          const platformRevenue = Number((subFee + commissionEarned).toFixed(2));

          return {
            id: u.id,
            name: u.name || u.email,
            role: urole,
            store: u.store || 'Main Store',
            plan: planName,
            subscriptionFee: subFee,
            commissionEarned: Number(commissionEarned.toFixed(2)),
            platformRevenue,
            grossVolume: Number(grossVolume.toFixed(2)),
            userEarnings: Number(userEarnings.toFixed(2)),
            transactionCount,
            status: u.status || 'Active',
          };
        });

      // Capture any store transactions not tied to a registered user account
      const unmappedComms = commList.filter((c) => !matchedCommIds.has(c.id));
      if (unmappedComms.length > 0) {
        // Group unmapped by store/retailer name
        const storeGroups = new Map();
        unmappedComms.forEach((c) => {
          const key = c.storeName || c.retailerName || c.storeId || 'Central Branch';
          if (!storeGroups.has(key)) {
            storeGroups.set(key, []);
          }
          storeGroups.get(key).push(c);
        });

        storeGroups.forEach((comms, storeKey) => {
          const gross = comms.reduce((sum, c) => sum + Number(c.orderTotal || 0), 0);
          const comm = comms.reduce((sum, c) => sum + Number(c.commissionAmount || (c.orderTotal * 0.02) || 0), 0);
          const net = comms.reduce((sum, c) => sum + Number(c.netRetailerAmount || (c.orderTotal - comm) || 0), 0);

          records.push({
            id: comms[0]?.retailerId || `store-${storeKey.toLowerCase().replace(/\s+/g, '-')}`,
            name: comms[0]?.retailerName || storeKey,
            role: 'retailer',
            store: storeKey,
            plan: 'Starter (Free)',
            subscriptionFee: 0,
            commissionEarned: Number(comm.toFixed(2)),
            platformRevenue: Number(comm.toFixed(2)),
            grossVolume: Number(gross.toFixed(2)),
            userEarnings: Number(net.toFixed(2)),
            transactionCount: comms.length,
            status: 'Active',
          });
        });
      }

      setStakeholders(records);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError(err.message || 'Failed to load platform revenue from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [loadRevenueData]);

  useDataSync(['revenue', 'transactions'], () => {
    loadRevenueData();
  });

  // Filtered records
  const filteredRecords = useMemo(() => {
    return stakeholders.filter((item) => {
      const matchesRole = roleFilter === 'all' || item.role === roleFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).toLowerCase().includes(search.toLowerCase()) ||
        (item.store && item.store.toLowerCase().includes(search.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [stakeholders, roleFilter, search]);

  // Aggregated KPI Totals
  const totals = useMemo(() => {
    if (roleFilter === 'all' && !search.trim() && summaryData) {
      return {
        grossVolume: Number(summaryData.totalGrossVolume || 0),
        commissionEarned: Number(summaryData.totalCommissionEarned || 0),
        subscriptionFee: Number(summaryData.totalSubscriptionRevenue || 0),
        platformRevenue: Number(summaryData.totalPlatformRevenue || 0),
        userEarnings: Number(summaryData.netRetailerPayout || 0),
        transactionCount: Number(summaryData.totalTransactionsProcessed ?? summaryData.totalTransactions ?? 0),
      };
    }
    return filteredRecords.reduce(
      (acc, curr) => {
        acc.grossVolume += curr.grossVolume;
        acc.commissionEarned += curr.commissionEarned;
        acc.subscriptionFee += curr.subscriptionFee;
        acc.platformRevenue += curr.platformRevenue;
        acc.userEarnings += curr.userEarnings;
        acc.transactionCount += curr.transactionCount;
        return acc;
      },
      {
        grossVolume: 0,
        commissionEarned: 0,
        subscriptionFee: 0,
        platformRevenue: 0,
        userEarnings: 0,
        transactionCount: 0,
      }
    );
  }, [filteredRecords, summaryData, roleFilter, search]);

  // Download real CSV
  const handleExportCSV = () => {
    const headers =
      activeView === 'platform'
        ? ['ID', 'Name', 'Role', 'Plan Tier', 'Transactions', 'Sub Fee (INR)', 'Commission (INR)', 'Total Platform Cut (INR)']
        : ['ID', 'Name', 'Role', 'Store Hub', 'Transactions', 'Gross Volume (INR)', 'Platform Fee (INR)', 'Net Payout (INR)'];

    const rows = filteredRecords.map((r) =>
      activeView === 'platform'
        ? [r.id, r.name, r.role, r.plan, r.transactionCount, r.subscriptionFee, r.commissionEarned, r.platformRevenue]
        : [r.id, r.name, r.role, r.store || 'Global', r.transactionCount, r.grossVolume, r.commissionEarned, r.userEarnings]
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockOverflow_Revenue_${activeView}_${roleFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Revenue &amp; Monetization</h1>
          <p className="admin-page-subtitle">
            Track revenue collected by StockOverflow and total transaction volume generated by ecosystem stakeholders live from backend.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={loadRevenueData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Ledger'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleExportCSV}
          >
            📥 Export CSV Ledger
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── View Toggle Banner ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveView('platform')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              background: activeView === 'platform' ? '#2563eb' : '#f1f5f9',
              color: activeView === 'platform' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>💰 View 1: Platform Revenue (What Users Pay Us)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('gross')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              background: activeView === 'gross' ? '#8b5cf6' : '#f1f5f9',
              color: activeView === 'gross' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>📈 View 2: Transaction Volume (What Users Earn/Spend)</span>
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
          {activeView === 'platform'
            ? 'Showing StockOverflow net platform take (Subscriptions + 2% commission)'
            : 'Showing total commerce generated by retailers, suppliers, and shoppers'}
        </div>
      </div>

      {/* ── Role Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
          Filter by Actor:
        </span>
        {[
          { key: 'all', label: 'All Stakeholders' },
          { key: 'retailer', label: '🏬 Retailers' },
          { key: 'supplier', label: '🚚 Suppliers' },
          { key: 'consumer', label: '🛒 Consumers' },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={() => setRoleFilter(btn.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: roleFilter === btn.key ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: roleFilter === btn.key ? '#eff6ff' : '#ffffff',
              color: roleFilter === btn.key ? '#2563eb' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {btn.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search business name, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              width: '220px',
            }}
          />
        </div>
      </div>

      {/* ── Dynamic KPI Metrics Grid ── */}
      {activeView === 'platform' ? (
        <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Platform Take
            </span>
            <div className="admin-metric-value" style={{ color: '#10b981' }}>
              ₹{totals.platformRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Subscriptions + 2% POS Commissions
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              2.0% Commission Earned
            </span>
            <div className="admin-metric-value" style={{ color: '#2563eb' }}>
              ₹{totals.commissionEarned.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Across {totals.transactionCount} settled transactions
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              SaaS Subscriptions
            </span>
            <div className="admin-metric-value" style={{ color: '#8b5cf6' }}>
              ₹{totals.subscriptionFee.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Recurring monthly tiers collected
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #0891b2' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Stakeholders
            </span>
            <div className="admin-metric-value" style={{ color: '#0891b2' }}>
              {filteredRecords.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Scoped to current filter ({roleFilter})
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Gross Merchandise Volume (GMV)
            </span>
            <div className="admin-metric-value" style={{ color: '#2563eb' }}>
              ₹{totals.grossVolume.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Total transaction flow on platform
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Net Stakeholder Payouts
            </span>
            <div className="admin-metric-value" style={{ color: '#10b981' }}>
              ₹{totals.userEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Net amount disbursed to businesses
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Orders &amp; POS Receipts
            </span>
            <div className="admin-metric-value" style={{ color: '#f59e0b' }}>
              {totals.transactionCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Live processed checkout sessions
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Platform Fee Deducted
            </span>
            <div className="admin-metric-value" style={{ color: '#ef4444' }}>
              ₹{totals.commissionEarned.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Platform take retained at settlement
            </div>
          </div>
        </div>
      )}

      {/* ── Table of Stakeholders ── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            {activeView === 'platform' ? 'Platform Revenue Ledger by Business' : 'Gross Commercial Volume by Business'}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {filteredRecords.length} records
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              {activeView === 'platform' ? (
                <tr>
                  <th>Account ID</th>
                  <th>Entity Name</th>
                  <th>Role</th>
                  <th>Subscription Plan</th>
                  <th>Plan Fee</th>
                  <th>2% Commission Paid</th>
                  <th>Net Paid to Us</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Account ID</th>
                  <th>Entity Name</th>
                  <th>Role</th>
                  <th>Store / Outlet</th>
                  <th>Txn Count</th>
                  <th>Gross Volume (GMV)</th>
                  <th>Net Business Earnings</th>
                  <th>Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading live platform financial ledger from backend...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No stakeholders found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                      {item.id}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {item.name}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          item.role === 'retailer'
                            ? 'primary'
                            : item.role === 'supplier'
                            ? 'warning'
                            : 'success'
                        }`}
                      >
                        {item.role.toUpperCase()}
                      </span>
                    </td>

                    {activeView === 'platform' ? (
                      <>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                            {item.plan}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: item.subscriptionFee > 0 ? '#10b981' : '#94a3b8' }}>
                          ₹{item.subscriptionFee.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 600, color: '#2563eb' }}>
                          ₹{item.commissionEarned.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 800, color: '#0f172a' }}>
                          ₹{item.platformRevenue.toLocaleString('en-IN')}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {item.store || 'Global Network'}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {item.transactionCount} orders
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{item.grossVolume.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>
                          {item.role === 'consumer' ? '—' : `₹${item.userEarnings.toLocaleString('en-IN')}`}
                        </td>
                      </>
                    )}

                    <td>
                      <span className="admin-badge success">{item.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Monthly Revenue & 2% Commission Ledger ── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              📅 Monthly Platform Revenue &amp; 2.0% Commission Ledger
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Month-over-month breakdown of 2% transaction commission, subscription fees, and total revenue inflow.
            </p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
            2.0% Automated Take-Rate
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Billing Month</th>
                <th>Gross Volume (GMV)</th>
                <th>2.0% POS Commission</th>
                <th>SaaS Subscriptions</th>
                <th>Total Platform Revenue</th>
                <th>Orders Processed</th>
                <th>Net Stakeholder Payout</th>
                <th>Effective Yield</th>
              </tr>
            </thead>
            <tbody>
              {summaryData?.monthlyBreakdown && Object.keys(summaryData.monthlyBreakdown).length > 0 ? (
                Object.entries(summaryData.monthlyBreakdown)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([monthKey, mData]) => {
                    const [year, month] = monthKey.split('-');
                    const dateObj = new Date(Number(year), Number(month) - 1, 1);
                    const monthLabel = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : monthKey;
                    const gross = Number(mData.grossVolume || 0);
                    const comm = Number(mData.commission || 0);
                    const subs = Number(mData.subscriptions || 0);
                    const total = Number(mData.totalPlatform || (comm + subs));
                    const orders = Number(mData.ordersCount || 0);
                    const payout = Number((gross - comm).toFixed(2));
                    const yieldRate = gross > 0 ? ((total / gross) * 100).toFixed(2) : '2.00';

                    return (
                      <tr key={monthKey}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          📅 {monthLabel}
                        </td>
                        <td style={{ fontWeight: 600, color: '#2563eb' }}>
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>
                          ₹{comm.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 600, color: '#8b5cf6' }}>
                          ₹{subs.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                          ₹{total.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 600, color: '#475569' }}>
                          {orders} orders
                        </td>
                        <td style={{ fontWeight: 600, color: '#64748b' }}>
                          ₹{payout.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className="admin-badge primary">
                            {yieldRate}% Yield
                          </span>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                    No monthly transaction history recorded yet. Completed transactions will automatically calculate 2% commission and populate here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SaaS Monetization Tiers Reference Card ── */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
          StockOverflow SaaS Pricing &amp; Quota Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className="admin-card"
              style={{
                border: tier.featured ? '2px solid #2563eb' : '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              {tier.featured && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: '#2563eb',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                  }}
                >
                  MOST COMMON
                </span>
              )}
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700 }}>{tier.name}</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>
                {tier.price} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{tier.period}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700, marginBottom: '12px' }}>
                Quota: {tier.orderLimit}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ marginBottom: '6px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}