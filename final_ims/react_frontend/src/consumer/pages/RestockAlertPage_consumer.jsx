/**
 * RestockAlertPage_consumer.jsx - Exact Restock Alerts Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `restockalert.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Top: 3 metric stat cards (Low Stock Products, Out of Stock, Active Alerts).
 * Left: Set Restock Alert form with product picker, quantity stepper, and priority buttons (High/Medium/Low).
 * Right: Saved customer alerts table and Recently Restocked products grid.
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { fetchProducts } from '../utils/api_consumer';

export default function RestockAlertPage_consumer({
  initialSku = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(initialSku);
  const [desiredQty, setDesiredQty] = useState(1);
  const [priority, setPriority] = useState('high');
  const [alertsList, setAlertsList] = useState(() => {
    try {
      const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
      return Array.isArray(state.alerts) ? state.alerts : [];
    } catch (_e) {
      return [];
    }
  });

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchProducts();
      setProducts(data);
      if (!selectedSku && data.length > 0) {
        const outOfStock = data.find((p) => (p.qty || 0) <= 0);
        setSelectedSku(outOfStock ? outOfStock.sku : data[0].sku);
      }
    }
    loadCatalog();
  }, [selectedSku]);

  const selectedProduct = products.find((p) => p.sku === selectedSku) || null;

  // Compute stat metrics
  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.qty || 0) > 0 && (p.qty || 0) <= 10).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => (p.qty || 0) <= 0).length;
  }, [products]);

  const handleSetAlert = (e) => {
    e.preventDefault();
    if (!selectedSku) {
      showToast('Please select a product.');
      return;
    }

    const newAlert = {
      id: `alert-${Date.now()}`,
      sku: selectedSku,
      productName: selectedProduct?.name || selectedSku,
      productImg: selectedProduct?.productImg || '',
      emoji: selectedProduct?.emoji || '📦',
      qty: desiredQty,
      priority,
      status: 'Active Watch',
      createdAt: new Date().toISOString(),
    };

    const updated = [newAlert, ...alertsList];
    setAlertsList(updated);

    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    state.alerts = updated;
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));

    showToast(`🔔 Restock alert created for ${selectedProduct?.name || selectedSku}!`);
  };

  const handleRemoveAlert = (alertId) => {
    const updated = alertsList.filter((a) => a.id !== alertId);
    setAlertsList(updated);

    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    state.alerts = updated;
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));

    showToast('Alert removed.');
  };

  return (
    <CustomerLayout_consumer
      activeMenu="restock"
      pageTitle="Restock Alerts"
      pageSub="Track the products you care about and see retailer restocks as they happen"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div>
        {/* ── Top Metric Stat Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Low Stock Products</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{lowStockCount}</div>
            <div className="stat-note">Products currently running low</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{outOfStockCount}</div>
            <div className="stat-note">Products waiting for retailer restock</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>{alertsList.length}</div>
            <div className="stat-note">Saved customer watch alerts</div>
          </div>
        </div>

        {/* ── Body Grid (Form + Active Alerts Table) ── */}
        <div className="body-grid">
          {/* Left Form: Set Alert */}
          <div className="card">
            <div className="card-title">Set a Restock Alert</div>
            <form onSubmit={handleSetAlert}>
              <div className="form-group">
                <label className="form-label">Choose Product</label>
                <select
                  className="form-input"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {products.map((p) => {
                    const q = p.qty !== undefined ? p.qty : 10;
                    return (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku}) — {q <= 0 ? '🔴 Out of Stock' : `${q} left`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedProduct && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e8e9f0', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {selectedProduct.productImg ? (
                      <img src={selectedProduct.productImg} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span>{selectedProduct.emoji || '📦'}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Current Stock: <strong>{selectedProduct.qty || 0} units</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="form-group">
                <label className="form-label">Desired Quantity</label>
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="qty-step-btn"
                    onClick={() => setDesiredQty(Math.max(1, desiredQty - 1))}
                  >
                    −
                  </button>
                  <div className="qty-step-val">{desiredQty}</div>
                  <button
                    type="button"
                    className="qty-step-btn"
                    onClick={() => setDesiredQty(desiredQty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="form-group">
                <label className="form-label">Alert Priority</label>
                <div className="priority-group">
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'high' ? 'active high' : ''}`}
                    onClick={() => setPriority('high')}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'medium' ? 'active medium' : ''}`}
                    onClick={() => setPriority('medium')}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'low' ? 'active low' : ''}`}
                    onClick={() => setPriority('low')}
                  >
                    Low
                  </button>
                </div>
              </div>

              <button type="submit" className="set-alert-btn">
                🔔 Set Restock Alert
              </button>
            </form>
          </div>

          {/* Right Section: Active Alerts Table */}
          <div className="card">
            <div className="card-title">Your Watchlist & Alerts</div>

            {alertsList.length === 0 ? (
              <div className="empty-state">
                You do not have any active product alerts saved.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Desired Units</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsList.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.productName}</strong>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>SKU: {a.sku}</div>
                      </td>
                      <td>{a.qty} units</td>
                      <td>
                        <span className={`badge badge-${a.priority}`}>
                          {a.priority.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-notified">{a.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => handleRemoveAlert(a.id)}
                          style={{ color: '#ef4444' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
