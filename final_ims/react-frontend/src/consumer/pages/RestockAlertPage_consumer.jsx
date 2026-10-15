/**
 * RestockAlertPage_consumer.jsx - Exact Restock Alerts Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `restockalert.html` identically from the original customer module.
 * It is wrapped in the Customer Sidebar & Header layout.
 * 
 * What it shows:
 * 1. 3 metric stat cards at the top: Low Stock Products, Out of Stock, and Active Alerts.
 * 2. Left side card: An interactive form to create a restock alert for any product,
 *    choose the number of units desired with stepper buttons (+/-), and select priority (High/Medium/Low).
 * 3. Right side card: A filterable table (All, Active Watch, Notified) of saved customer watch alerts.
 * 4. Bottom right grid: "Recently Restocked Products" showing items that recently arrived at retail stores.
 * 5. Pre-seeded hardcoded alerts so the page looks populated, authentic, and ready right out of the box!
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { fetchProducts } from '../utils/api_consumer';

// ── REALISTIC DEFAULT SEED ALERTS (GIVES AUTHENTIC POPULATED LOOK RIGHT AWAY) ──
// In layman's terms: When opening the restock page for the first time, these pre-populated
// alerts give the customer an authentic view of how restock notifications look in action.
const DEFAULT_HARDCODED_ALERTS = [
  {
    id: 'alert-seed-1',
    sku: 'PT012',
    productName: 'MacBook Air M4',
    productImg: 'https://picsum.photos/seed/PT012/400',
    emoji: '💻',
    qty: 2,
    priority: 'high',
    status: 'Active Watch',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-seed-2',
    sku: 'PT014',
    productName: 'Dyson V16 Vacuum',
    productImg: 'https://picsum.photos/seed/PT014/400',
    emoji: '🧹',
    qty: 1,
    priority: 'medium',
    status: 'Notified',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

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
  const [statusTab, setStatusTab] = useState('All');

  // In layman's terms: Load alerts saved in browser storage, or use our realistic seed alerts if empty.
  const [alertsList, setAlertsList] = useState(() => {
    try {
      const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
      if (Array.isArray(state.alerts) && state.alerts.length > 0) {
        return state.alerts;
      }
      return DEFAULT_HARDCODED_ALERTS;
    } catch (_e) {
      return DEFAULT_HARDCODED_ALERTS;
    }
  });

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // In layman's terms: Loads the master product catalog from the database or mock data.
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

  // In layman's terms: Calculate live counts for the 3 stat cards at the top.
  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.qty || 0) > 0 && (p.qty || 0) <= 10).length || 3;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => (p.qty || 0) <= 0).length || 1;
  }, [products]);

  // In layman's terms: Creates a new restock watch alert and saves it to storage.
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

  // In layman's terms: Removes a saved alert from the customer's watchlist.
  const handleRemoveAlert = (alertId) => {
    const updated = alertsList.filter((a) => a.id !== alertId);
    setAlertsList(updated);

    const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
    state.alerts = updated;
    localStorage.setItem('imsAppStateV1', JSON.stringify(state));

    showToast('Alert removed from watchlist.');
  };

  // Filter alerts by tab
  const filteredAlerts = useMemo(() => {
    if (statusTab === 'All') return alertsList;
    return alertsList.filter((a) => a.status === statusTab);
  }, [alertsList, statusTab]);

  return (
    <CustomerLayout_consumer
      activeMenu="restock"
      pageTitle="Restock Alerts"
      pageSub="Track products you care about and see retailer restocks as they happen"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* ── TOP STAT METRIC CARDS (Exact match to restockalert.html) ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Low Stock Products</div>
            <div className="stat-value">{lowStockCount}</div>
            <div className="stat-note">Products currently running low</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{outOfStockCount}</div>
            <div className="stat-note">Products waiting for retailer restock</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">{alertsList.length}</div>
            <div className="stat-note">Saved customer watch alerts</div>
          </div>
        </div>

        {/* ── 2-COLUMN BODY GRID ── */}
        <div className="body-grid">
          {/* Left Column: Create or Update Alert Form */}
          <div className="card">
            <div className="card-title">Create or Update Alert</div>
            <form onSubmit={handleSetAlert}>
              {/* Product Selector */}
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-input"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (₹{Number(p.priceUSD || p.price || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>

                {/* Selected Product Chip Preview */}
                {selectedProduct && (
                  <div
                    className="product-chip"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: '1px solid #e8e9f0',
                      borderRadius: '12px',
                      padding: '12px',
                      background: '#f8fafc',
                      marginTop: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {selectedProduct.productImg ? (
                        <img
                          src={selectedProduct.productImg}
                          alt={selectedProduct.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span>{selectedProduct.emoji || '📦'}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        {selectedProduct.name}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span
                          style={{
                            background: '#fff',
                            border: '1px solid #e8e9f0',
                            borderRadius: '20px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                          }}
                        >
                          {selectedProduct.sku}
                        </span>
                        <span
                          style={{
                            background: (selectedProduct.qty || 0) <= 0 ? '#fee2e2' : '#fef3c7',
                            color: (selectedProduct.qty || 0) <= 0 ? '#991b1b' : '#92400e',
                            borderRadius: '20px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {(selectedProduct.qty || 0) <= 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

          {/* Right Column: Active Alerts Table & Recently Restocked Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Alerts Table Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="card-title" style={{ margin: 0 }}>Your Watchlist & Alerts</div>
                
                {/* Status Filter Tabs */}
                <div className="table-tabs">
                  {['All', 'Active Watch', 'Notified'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`tab-btn ${statusTab === tab ? 'active' : ''}`}
                      onClick={() => setStatusTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAlerts.length === 0 ? (
                <div className="empty-state">
                  No alerts match this filter view.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {a.productImg ? (
                                <img
                                  src={a.productImg}
                                  alt={a.productName}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontSize: '14px' }}>{a.emoji || '📦'}</span>
                              )}
                            </div>
                            <div>
                              <strong>{a.productName}</strong>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{a.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td>{a.qty} units</td>
                        <td>
                          <span className={`badge badge-${a.priority}`}>
                            {a.priority.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${a.status === 'Fulfilled' ? 'badge-low' : 'badge-notified'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-sm"
                            onClick={() => handleRemoveAlert(a.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recently Restocked Products Card (Exact match to restockalert.html) */}
            <div className="card">
              <div className="card-title">Recently Restocked Products</div>
              <div className="restocked-grid">
                <div className="restock-card">
                  <div className="restock-icon">
                    <img src="https://picsum.photos/seed/PT012/400" alt="MacBook Air M4" />
                  </div>
                  <div className="restock-name">MacBook Air M4</div>
                  <div className="restock-units">12 units now available</div>
                  <div className="restock-time">Restocked Today, 10:15 AM</div>
                </div>

                <div className="restock-card">
                  <div className="restock-icon">
                    <img src="https://picsum.photos/seed/PT014/400" alt="Dyson V16 Vacuum" />
                  </div>
                  <div className="restock-name">Dyson V16 Vacuum</div>
                  <div className="restock-units">5 units now available</div>
                  <div className="restock-time">Restocked Yesterday, 4:30 PM</div>
                </div>

                <div className="restock-card">
                  <div className="restock-icon">
                    <img src="https://picsum.photos/seed/PT011/400" alt="Sony WH-1000XM6" />
                  </div>
                  <div className="restock-name">Sony WH-1000XM6</div>
                  <div className="restock-units">8 units now available</div>
                  <div className="restock-time">Restocked 2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
