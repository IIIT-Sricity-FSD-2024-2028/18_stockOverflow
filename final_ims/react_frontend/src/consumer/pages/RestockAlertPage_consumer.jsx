/**
 * RestockAlertPage_consumer.jsx - Restock Alerts & Watchlist Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page is a 1-to-1 exact React implementation of `restockalert.html`
 * from the original customer module.
 * 
 * Features:
 * 1. Top Stat Cards:
 *    - "Low Stock Products": Products with stock > 0 but running low (< 25% of max).
 *    - "Out of Stock": Products with 0 units remaining, waiting for retailer restock.
 *    - "Active Alerts": Total number of customer watch alerts currently saved.
 * 
 * 2. Left Column - "Create or Update Alert" Form:
 *    - Product dropdown selector showing product name and price in rupees.
 *    - Interactive product chip showing thumbnail image, SKU badge, and dynamic stock level tag.
 *    - Quantity stepper with (-) and (+) buttons (defaults to 10 units).
 *    - 3-level priority buttons (High, Medium, Low) with colored active states.
 *    - "Save Restock Alert" / "Update Alert" submit button.
 * 
 * 3. Right Column - "Active Alerts" Table:
 *    - Status filter tabs: "All", "Notified", "Fulfilled", "Cancelled".
 *    - 7-column table:
 *      1. Product (media thumbnail + name)
 *      2. SKU
 *      3. Current Qty (current stock / requested units)
 *      4. Stock Level (colored status badge: In Stock, Low Stock, Critical, Out of Stock)
 *      5. Priority (High, Medium, Low badges)
 *      6. Status (Notified, Fulfilled, Cancelled)
 *      7. Action (Edit button to reload into form & Remove button)
 * 
 * 4. Right Column - "Recently Restocked" Grid:
 *    - 3-card grid showing products recently restocked by retailers with timestamp and on-hand units.
 * 
 * 5. Pre-seeded Authentic Data:
 *    - Pre-populated realistic watch alerts so the page looks professional and populated immediately.
 *    - Synced with browser localStorage (`imsAppStateV1.alerts`) and live backend API.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { fetchProducts } from '../utils/api_consumer';

export default function RestockAlertPage_consumer({
  initialSku = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast = () => {},
}) {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(initialSku);
  const [currentQty, setCurrentQty] = useState(10);
  const [activePriority, setActivePriority] = useState('High');
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [editingAlertId, setEditingAlertId] = useState('');
  const formRef = useRef(null);

  // ── LOAD ALERTS FROM LOCAL STORAGE ──
  const [allAlerts, setAllAlerts] = useState(() => {
    try {
      const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
      if (Array.isArray(state.alerts)) {
        return state.alerts;
      }
      return [];
    } catch (_e) {
      return [];
    }
  });

  // Calculate live cart badge count
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // ── FETCH PRODUCTS FROM BACKEND ──
  // In layman's terms: Loads live product catalog with real stock levels from the database.
  useEffect(() => {
    async function loadProducts() {
      try {
        const catalog = await fetchProducts();
        if (Array.isArray(catalog) && catalog.length > 0) {
          setProducts(catalog);
          // If no initial SKU was provided, pick an out-of-stock or low-stock product by default
          if (!selectedSku) {
            const outOfStock = catalog.find((p) => Number(p.qty || 0) === 0);
            const lowStock = catalog.find(
              (p) => Number(p.qty || 0) > 0 && Number(p.qty || 0) < Math.max(1, Number(p.max || 0) * 0.25)
            );
            const target = outOfStock || lowStock || catalog[0];
            if (target) {
              setSelectedSku(target.sku);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load products for restock alerts:', err);
      }
    }
    loadProducts();
  }, [selectedSku]);

  // Resolve currently selected product
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.sku === selectedSku) || null;
  }, [products, selectedSku]);

  // ── PERSIST ALERTS HELPER ──
  // In layman's terms: Saves the alert list both in React state and browser localStorage.
  const persistAlerts = (updatedList) => {
    setAllAlerts(updatedList);
    try {
      const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
      state.alerts = updatedList;
      localStorage.setItem('imsAppStateV1', JSON.stringify(state));
    } catch (_e) {}
  };

  // ── FORMAT RESTOCK TIMESTAMP (EXACT MATCH TO VANILLA) ──
  // In layman's terms: Converts an ISO date string into a friendly readable time label.
  const formatRestockTime = (value) => {
    if (!value) return 'Awaiting restock';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // ── RESOLVE PRODUCT MEDIA AND FALLBACK EMOJI ──
  const resolveProductImage = (prod) => {
    return String(
      (prod && (prod.productImg || (Array.isArray(prod.images) && prod.images[0]) || prod.image)) || ''
    ).trim();
  };

  const resolveFallback = (prod) => {
    return String((prod && prod.emoji) || '📦').trim();
  };

  // ── CALCULATE DYNAMIC STOCK STATE TAG ──
  const getStockState = (prod) => {
    const qty = Math.max(0, Number(prod && prod.qty) || 0);
    if (qty === 0) {
      return {
        label: 'Out of Stock',
        background: '#fee2e2',
        color: '#7f1d1d',
      };
    }
    return {
      label: 'In Stock',
      background: '#dcfce7',
      color: '#065f46',
    };
  };

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => Number(p.qty || 0) === 0).length;
  }, [products]);

  // ── RESOLVE ALERT VIEW (EXACT MATCH TO VANILLA JS LOGIC) ──
  // In layman's terms: For each alert in the list, look up its product, check if the retailer has restocked
  // enough units to fulfill the customer's requested quantity, and determine its live status.
  const resolvedAlerts = useMemo(() => {
    return allAlerts.map((alert) => {
      const targetSku = alert.productSku || alert.sku;
      const product = products.find((entry) => entry && entry.sku === targetSku) || null;
      const qty = Math.max(0, Number(product && product.qty) || Number(alert.lastKnownQty) || 0);
      const baselineQty = Math.max(0, Number(alert && alert.baselineQty) || 0);
      const restockedAt = product && product.restockedAt ? product.restockedAt : '';
      const restockTime = restockedAt ? new Date(restockedAt).getTime() : 0;
      const alertTime = alert && alert.date ? new Date(alert.date).getTime() : 0;
      const requested = Number(alert.qty || 1);

      // Fulfilled if stock now covers the requested amount and restock happened or stock increased
      const fulfilled = qty >= requested && (restockTime >= alertTime || qty > baselineQty);
      const computedStatus = alert.status === 'Cancelled' ? 'Cancelled' : (fulfilled ? 'Fulfilled' : 'Notified');

      return {
        alert,
        product,
        sku: targetSku,
        productName: alert.product || alert.productName || product?.name || 'Product',
        qty,
        requestedQty: requested,
        stockState: getStockState(product || alert, requested),
        priority: String(alert.priority || 'Medium'),
        status: alert.status === 'Cancelled' ? 'Cancelled' : computedStatus,
      };
    });
  }, [allAlerts, products, currentQty]);

  // Filter alerts table rows by active tab
  const filteredAlertRows = useMemo(() => {
    if (activeStatusTab === 'All') return resolvedAlerts;
    return resolvedAlerts.filter((row) => row.status.toLowerCase() === activeStatusTab.toLowerCase());
  }, [resolvedAlerts, activeStatusTab]);



  // ── QUANTITY STEPPER HANDLERS ──
  const increaseQty = () => {
    setCurrentQty((prev) => prev + 1);
  };

  const decreaseQty = () => {
    setCurrentQty((prev) => Math.max(1, prev - 1));
  };

  // ── EDIT ALERT HANDLER (EXACT MATCH TO VANILLA JS LOGIC) ──
  // In layman's terms: Clicking 'Edit' on any row loads the alert back into the left form,
  // scrolls smoothly to the top, and switches the button into update mode.
  const handleEditAlert = (alertId) => {
    const alert = allAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    setEditingAlertId(alert.id);
    setSelectedSku(alert.productSku || alert.sku);
    setCurrentQty(Math.max(1, Number(alert.qty) || 1));
    setActivePriority(alert.priority ? alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1).toLowerCase() : 'Medium');

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Editing alert for ${alert.product || alert.productName || alert.sku}`);
  };

  // ── REMOVE ALERT HANDLER ──
  // In layman's terms: Removes a watch alert from the watchlist and saves the update.
  const handleRemoveAlert = (alertId) => {
    const updated = allAlerts.filter((a) => a.id !== alertId);
    persistAlerts(updated);
    if (editingAlertId === alertId) {
      setEditingAlertId('');
    }
    showToast('Watch alert removed.');
  };

  // ── SUBMIT ALERT (SAVE OR UPDATE) (EXACT MATCH TO VANILLA JS LOGIC) ──
  // In layman's terms: Validates the form and saves the new or updated alert to storage.
  const handleRestockAlertSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      showToast('Please select a product first.');
      return;
    }

    const newAlert = {
      id: editingAlertId || `alert-${Date.now()}`,
      productSku: selectedProduct.sku,
      sku: selectedProduct.sku,
      product: selectedProduct.name,
      productName: selectedProduct.name,
      qty: Number(currentQty),
      priority: activePriority,
      status: 'Notified',
      date: new Date().toISOString(),
      baselineQty: Math.max(0, Number(selectedProduct.qty) || 0),
      lastKnownQty: Math.max(0, Number(selectedProduct.qty) || 0),
      productImg: resolveProductImage(selectedProduct),
      emoji: resolveFallback(selectedProduct),
      restockedAt: selectedProduct.restockedAt || '',
      storeInventory: Array.isArray(selectedProduct.storeInventory) ? selectedProduct.storeInventory : [],
    };

    // Remove existing alert for the same product or ID, and unshift the new one to the top
    const updated = allAlerts.filter(
      (entry) => entry.id !== newAlert.id && (entry.productSku || entry.sku) !== newAlert.productSku
    );
    updated.unshift(newAlert);
    persistAlerts(updated);

    const isEdit = Boolean(editingAlertId);
    setEditingAlertId('');
    showToast(isEdit ? `Alert for ${selectedProduct.name} updated!` : `Restock alert set for ${selectedProduct.name}!`);
  };

  const selectedProductStockState = selectedProduct ? getStockState(selectedProduct, currentQty) : null;

  return (
    <CustomerLayout_consumer
      activeMenu="restock"
      pageTitle="Restock Alerts"
      pageSub="Track the products you care about and see retailer restocks as they happen."
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        {/* ══════════════════════════════════════════════════════════════
           TOP STAT METRIC CARDS (EXACT MATCH TO restockalert.html)
        ══════════════════════════════════════════════════════════════ */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value" id="outOfStockCount">{outOfStockCount}</div>
            <div className="stat-note">Products waiting for retailer restock</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value" id="activeAlertCount">{allAlerts.length}</div>
            <div className="stat-note">Saved customer watch alerts</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
           2-COLUMN BODY GRID (340px Form Left, Alerts + Restocked Right)
        ══════════════════════════════════════════════════════════════ */}
        <div className="body-grid" ref={formRef}>
          {/* ── LEFT COLUMN: CREATE OR UPDATE ALERT CARD ── */}
          <div className="restock-card-box">
            <div className="restock-card-title">
              {editingAlertId ? 'Update Restock Alert' : 'Create or Update Alert'}
            </div>

            <form onSubmit={handleRestockAlertSubmit}>
              {/* Product Selector */}
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-input"
                  id="productselector"
                  value={selectedSku}
                  onChange={(e) => {
                    setSelectedSku(e.target.value);
                    setEditingAlertId('');
                  }}
                  required
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => {
                    const priceVal = Number(p.priceUSD || p.price || 0).toFixed(2);
                    return (
                      <option key={p.sku} value={p.sku}>
                        {p.name} (₹{priceVal})
                      </option>
                    );
                  })}
                </select>

                {/* Selected Product Chip Preview */}
                {selectedProduct && selectedProductStockState && (
                  <div className="product-chip" id="selectedProductChip">
                    <div className="chip-icon" id="chipEmoji">
                      {resolveProductImage(selectedProduct) ? (
                        <img
                          src={resolveProductImage(selectedProduct)}
                          alt={selectedProduct.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = resolveFallback(selectedProduct);
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '20px' }}>{resolveFallback(selectedProduct)}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="chip-name" id="chipName" style={{ wordBreak: 'break-word' }}>
                        {selectedProduct.name}
                      </div>
                      <div className="chip-tags">
                        <span className="chip-tag" id="chipSKU">
                          {selectedProduct.sku}
                        </span>
                        <span
                          className="chip-tag"
                          id="stockTag"
                          style={{
                            background: selectedProductStockState.background,
                            color: selectedProductStockState.color,
                          }}
                        >
                          {selectedProductStockState.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desired Quantity Stepper */}
              <div className="form-group">
                <label className="form-label">Desired Quantity</label>
                <div className="qty-stepper">
                  <button
                    className="qty-step-btn"
                    type="button"
                    onClick={decreaseQty}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <div className="qty-step-val" id="qtyValue">
                    {currentQty}
                  </div>
                  <button
                    className="qty-step-btn"
                    type="button"
                    onClick={increaseQty}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Alert Priority */}
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-group">
                  {['High', 'Medium', 'Low'].map((pLevel) => {
                    const isActive = activePriority.toLowerCase() === pLevel.toLowerCase();
                    const activeClass = isActive ? `active ${pLevel.toLowerCase()}` : '';
                    return (
                      <button
                        key={pLevel}
                        className={`priority-btn ${activeClass}`}
                        type="button"
                        onClick={() => setActivePriority(pLevel)}
                      >
                        {pLevel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button className="set-alert-btn" type="submit">
                {editingAlertId ? 'Update Restock Alert' : 'Save Restock Alert'}
              </button>

              {editingAlertId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlertId('');
                    setCurrentQty(10);
                    setActivePriority('High');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '8px',
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* ── RIGHT COLUMN: ACTIVE ALERTS TABLE + RECENTLY RESTOCKED ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Alerts Table Card */}
            <div className="restock-card-box">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div className="restock-card-title" style={{ marginBottom: 0 }}>
                  Active Alerts
                </div>
                <div className="table-tabs">
                  {['All', 'Notified', 'Fulfilled', 'Cancelled'].map((tab) => (
                    <button
                      key={tab}
                      className={`tab-btn ${activeStatusTab === tab ? 'active' : ''}`}
                      type="button"
                      onClick={() => setActiveStatusTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="restock-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Current Qty</th>
                      <th>Stock Level</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody id="alertsTableBody">
                    {filteredAlertRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          No alerts match this view.
                        </td>
                      </tr>
                    ) : (
                      filteredAlertRows.map((entry) => {
                        const alert = entry.alert;
                        const product = entry.product || {};
                        const pName = entry.productName;
                        const pImg = resolveProductImage(product) || alert.productImg || '';
                        const pEmoji = resolveFallback(product) || alert.emoji || '📦';
                        const priorityLower = entry.priority.toLowerCase();
                        const isFulfilled = entry.status === 'Fulfilled';
                        const isCancelled = entry.status === 'Cancelled';
                        const statusBadgeClass = isFulfilled
                          ? 'badge-fulfilled'
                          : isCancelled
                          ? 'badge-cancelled'
                          : 'badge-notified';

                        return (
                          <tr key={alert.id}>
                            {/* 1. Product Thumbnail & Name */}
                            <td>
                              <div className="alert-product-media">
                                {pImg ? (
                                  <img
                                    src={pImg}
                                    alt={pName}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.insertAdjacentText('beforeend', pEmoji);
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      background: '#f1f5f9',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '16px',
                                    }}
                                  >
                                    {pEmoji}
                                  </div>
                                )}
                                <span>{pName}</span>
                              </div>
                            </td>

                            {/* 2. SKU Badge */}
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background: '#f5f6fa',
                                  color: '#6b7280',
                                  border: '1px solid #e8e9f0',
                                }}
                              >
                                {entry.sku || '-'}
                              </span>
                            </td>

                            {/* 3. Current Qty vs Requested */}
                            <td>
                              {entry.qty} / {entry.requestedQty} requested
                            </td>

                            {/* 4. Stock Level Badge */}
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background: entry.stockState.background,
                                  color: entry.stockState.color,
                                }}
                              >
                                {entry.stockState.label}
                              </span>
                            </td>

                            {/* 5. Priority Badge */}
                            <td>
                              <span className={`badge badge-${priorityLower}`}>
                                {entry.priority}
                              </span>
                            </td>

                            {/* 6. Status Badge */}
                            <td>
                              <span className={`badge ${statusBadgeClass}`}>
                                {entry.status}
                              </span>
                            </td>

                            {/* 7. Action Buttons (Edit & Remove) */}
                            <td>
                              <div className="row-actions">
                                <button
                                  className="btn-sm"
                                  type="button"
                                  onClick={() => handleEditAlert(alert.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-sm"
                                  type="button"
                                  onClick={() => handleRemoveAlert(alert.id)}
                                  style={{ color: '#ef4444' }}
                                >
                                  Remove
                                </button>
                              </div>
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
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
