import React, { useState, useEffect } from 'react';
import { request } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function LowStocksView({ onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await request('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load low stocks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const lowStockItems = products.filter((p) => Number(p.qty || 0) <= Number(p.min || 10));
  const outOfStockItems = products.filter((p) => Number(p.qty || 0) === 0);
  const criticalItems = products.filter(
    (p) => Number(p.qty || 0) > 0 && Number(p.qty || 0) < 10
  );
  const moderateLowItems = products.filter(
    (p) => Number(p.qty || 0) >= 10 && Number(p.qty || 0) <= Number(p.min || 10)
  );

  const filteredItems = lowStockItems.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 28px 40px', maxWidth: '1200px' }}>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div>
          <div className="page-title">Low Stocks</div>
          <div className="page-subtitle">Inventory / Low Stocks — Monitor and restock critical inventory</div>
        </div>
        <div className="page-head-actions">
          <button
            className="btn btn-warning"
            onClick={() => onNavigate('reorder')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Auto Reorder All
          </button>
          <button
            className="pl-btn-primary"
            onClick={() => onNavigate('purchase-orders')}
          >
            Create PO
          </button>
        </div>
      </div>

      {/* ALERT BANNER */}
      <div className="alert-banner">
        <div className="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <div className="alert-title">Low stock items need attention</div>
          <div className="alert-sub">
            {lowStockItems.length > 0
              ? `${lowStockItems.length} product(s) are below safety stock levels. Restock now to prevent stockouts.`
              : 'All catalog items are currently stocked above their minimum thresholds.'}
          </div>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-left">
            <div className="kpi-label">Out of Stock</div>
            <div className="kpi-value" style={{ color: '#ef4444' }}>
              {outOfStockItems.length}
            </div>
            <div className="kpi-sub">Immediate restock required</div>
          </div>
          <div className="kpi-icon kpi-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <div className="kpi-label">Critical (&lt;10 units)</div>
            <div className="kpi-value" style={{ color: '#f59e0b' }}>
              {criticalItems.length}
            </div>
            <div className="kpi-sub">Depleting fast</div>
          </div>
          <div className="kpi-icon kpi-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <div className="kpi-label">Low Stock (Threshold reached)</div>
            <div className="kpi-value" style={{ color: '#d97706' }}>
              {moderateLowItems.length}
            </div>
            <div className="kpi-sub">At or near safety line</div>
          </div>
          <div className="kpi-icon kpi-yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <div className="kpi-label">Total Alert Items</div>
            <div className="kpi-value" style={{ color: '#5b67ca' }}>
              {lowStockItems.length}
            </div>
            <div className="kpi-sub">Active alerts monitored</div>
          </div>
          <div className="kpi-icon kpi-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="pl-table-card">
        <div className="pl-table-toolbar">
          <div className="pl-search">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" />
              <line x1="9.5" y1="9.5" x2="13" y2="13" />
            </svg>
            <input
              type="text"
              placeholder="Search low stock items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="pl-table-wrap">
          <table className="pl-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Qty</th>
                <th>Min Threshold</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Loading alerts...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#16a34a', fontWeight: 600 }}>
                    ✓ All products are well stocked above minimum thresholds!
                  </td>
                </tr>
              ) : (
                filteredItems.map((p) => {
                  const qty = Number(p.qty || 0);
                  const min = Number(p.min || 10);
                  const isOut = qty === 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-cell">
                          <div className="prod-img-wrap">
                            <span style={{ fontSize: '16px' }}>{p.emoji || '📦'}</span>
                          </div>
                          <span className="prod-name">{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="sku-text">{p.sku || '—'}</span>
                      </td>
                      <td>
                        <span className="cell-text">{p.category || 'General'}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '14px',
                            color: isOut ? '#dc2626' : '#d97706',
                          }}
                        >
                          {qty} {p.unit || 'pcs'}
                        </span>
                      </td>
                      <td>
                        <span className="cell-text">{min} {p.unit || 'pcs'}</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${isOut ? 'cancelled' : 'pending'}`}
                          style={{ fontSize: '11.5px', padding: '3px 10px' }}
                        >
                          {isOut ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="pl-btn-primary"
                          onClick={() => onNavigate('reorder')}
                          style={{ fontSize: '12px', padding: '5px 12px' }}
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
