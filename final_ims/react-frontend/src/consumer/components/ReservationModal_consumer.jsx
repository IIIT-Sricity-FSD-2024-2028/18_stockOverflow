/**
 * ReservationModal_consumer.jsx - High Polish In-Store Pickup Hold Dialog
 * 
 * IN LAYMAN'S TERMS:
 * This modal opens whenever a customer clicks the "+ Reserve" button on the Product Detail page.
 * It lets the shopper place an item on physical hold at their local retail store branch without
 * needing to pay in advance.
 * 
 * KEY FEATURES:
 * 1. Product Snapshot Pill:
 *    - Displays the product photo or emoji, category tag, SKU, and unit price in INR.
 * 2. Real-Time Store Branch Selector:
 *    - Shows physical stores, locations, and units currently in stock for immediate hold.
 * 3. Quantity Stepper (+/-):
 *    - Allows shoppers to increment or decrement units with safe boundaries clamped to available stock.
 * 4. Payment Preference at Counter:
 *    - Options for UPI / QR Code, Card at POS, or Cash at Cashier.
 * 5. Dynamic Stock Availability Banner:
 *    - Visual green or red indicator showing real-time store stock availability.
 * 6. Customer Details:
 *    - Pre-populates shopper name and email from active session.
 * 7. Keyboard & Backdrop Accessibility:
 *    - Pressing Escape or clicking the dark backdrop closes the modal safely.
 */

import React, { useState, useEffect, useMemo } from 'react';

export default function ReservationModal_consumer({
  isOpen = false,
  product = null,
  selectedStore = 'Downtown Store',
  selectedStoreId = '',
  stores = [],
  userSession,
  onClose,
  onConfirmReservation,
}) {
  const [storeId, setStoreId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-populate customer details from active session if logged in
  useEffect(() => {
    try {
      const session = userSession || JSON.parse(localStorage.getItem('so_session') || '{}');
      if (session?.name) setCustomerName(session.name);
      if (session?.email) setCustomerEmail(session.email);
    } catch (_e) {}
  }, [isOpen, userSession]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── IN-STORE AVAILABILITY CALCULATION ──
  // In layman's terms: Calculate all store locations that currently have
  // units on hand for this specific product, matching product-detail.html.
  const availableStores = useMemo(() => {
    if (!product) return [];
    const list = [];
    const seenStoreIds = new Set();
    const inventory = Array.isArray(product.storeInventory) ? product.storeInventory : [];
    const totalStock = Number(product.qty || 0);

    // 1. Check retailer stores
    (Array.isArray(stores) ? stores : []).forEach((store) => {
      const entry = inventory.find((inv) => String(inv.storeId).toLowerCase() === String(store.id).toLowerCase());
      const count = entry ? Number(entry.qty) || 0 : (inventory.length > 0 ? 0 : totalStock);
      list.push({
        id: store.id,
        name: store.name,
        location: store.location || 'Local Retail Hub',
        availableQty: count,
      });
      seenStoreIds.add(String(store.id).toLowerCase());
    });

    // 2. Check store inventory entries that might not be in the retailer stores list (e.g. central default-store)
    inventory.forEach((inv, idx) => {
      const sId = String(inv.storeId || `s-${idx}`);
      if (!seenStoreIds.has(sId.toLowerCase())) {
        list.push({
          id: sId,
          name: sId === 'default-store' ? 'Central Fulfillment Store' : `Store #${sId}`,
          location: 'Main Distribution Center, India',
          availableQty: Number(inv.qty || 0),
        });
        seenStoreIds.add(sId.toLowerCase());
      }
    });

    return list;
  }, [stores, product]);

  // Select initial store branch on open
  useEffect(() => {
    if (!isOpen || !product) return;
    const defaultStore =
      availableStores.find((store) => String(store.id) === String(selectedStoreId)) ||
      availableStores.find((store) => store.name === selectedStore) ||
      availableStores.find((store) => store.availableQty > 0) ||
      availableStores[0];
    setStoreId(defaultStore?.id || '');
    setQty(1);
    setErrorMsg('');
  }, [isOpen, product, availableStores, selectedStore, selectedStoreId]);

  if (!isOpen || !product) return null;

  // Selected store object & local available units
  const currentStore = availableStores.find((s) => String(s.id) === String(storeId)) || availableStores[0];
  const maxAvailable = currentStore ? currentStore.availableQty : Number(product.qty || 0);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (maxAvailable <= 0) {
      setErrorMsg('This store branch currently has 0 units in stock. Please select another store.');
      return;
    }

    if (qty > maxAvailable) {
      setErrorMsg(`Only ${maxAvailable} unit(s) available at ${currentStore?.name || 'this branch'}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sku: product.sku,
        productName: product.name,
        qty: Number(qty),
        storeId: currentStore?.id || storeId,
        store: currentStore?.name || selectedStore,
        customer: customerName || 'Valued Customer',
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerId: userSession?.id || undefined,
        paymentMethod: paymentMethod || 'Cash',
        status: 'pending',
      };

      await onConfirmReservation(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place reservation hold.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reserve-modal" onClick={onClose}>
      <div className="reserve-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="reserve-header">
          <div>
            <div className="reserve-title">
              <span>📦</span>
              <span>Reserve for In-Store Pickup</span>
            </div>
            <p className="reserve-sub">
              Hold this item at a local store branch without paying online now. Inspect and pay at the counter!
            </p>
          </div>
          <button
            type="button"
            className="reserve-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Product Snapshot Pill */}
        <div className="reserve-prod-pill">
          <div className="reserve-prod-img">
            {product.productImg ? (
              <img src={product.productImg} alt={product.name} />
            ) : (
              <span>{product.emoji || '📦'}</span>
            )}
          </div>
          <div className="reserve-prod-info">
            <div className="reserve-prod-name" title={product.name}>
              {product.name}
            </div>
            <div className="reserve-prod-meta">
              SKU: {product.sku} · {product.category || 'General'}
            </div>
          </div>
          <div className="reserve-prod-price">
            ₹{Number(product.priceUSD || product.price || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Dynamic Error Banner */}
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="reserve-grid">
            {/* Pickup Store Branch Selector */}
            <div className="reserve-field reserve-field-full">
              <label htmlFor="reserveStoreSelect">
                <span>Select Store to Reserve From</span>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>In-Store Pickup</span>
              </label>
              <select
                id="reserveStoreSelect"
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setQty(1);
                  setErrorMsg('');
                }}
                required
              >
                {availableStores.length === 0 && (
                  <option value="">No stores currently stock this item</option>
                )}
                {availableStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location}) — {s.availableQty} units available
                  </option>
                ))}
              </select>
            </div>

            {/* Live Stock Status Indicator */}
            <div className="reserve-field reserve-field-full">
              <div
                className={`reserve-availability ${maxAvailable > 0 ? 'in-stock' : 'out-stock'}`}
              >
                {maxAvailable > 0 ? (
                  <>
                    <span style={{ fontSize: '14px' }}>✓</span>
                    <span>
                      <strong>{currentStore?.name || 'Selected branch'}</strong> has <strong>{maxAvailable}</strong> units ready for hold.
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '14px' }}>✕</span>
                    <span>Out of stock at this location. Please choose another store branch above.</span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="reserve-field">
              <label htmlFor="reserveQty">
                <span>Quantity to Hold</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Max: {maxAvailable}</span>
              </label>
              <div className="reserve-qty-stepper">
                <button
                  type="button"
                  className="reserve-stepper-btn"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="reserveQty"
                  type="number"
                  min="1"
                  max={Math.max(1, maxAvailable)}
                  value={qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) setQty(1);
                    else setQty(Math.max(1, Math.min(maxAvailable, val)));
                  }}
                  required
                />
                <button
                  type="button"
                  className="reserve-stepper-btn"
                  onClick={() => setQty(Math.min(maxAvailable, qty + 1))}
                  disabled={qty >= maxAvailable || maxAvailable <= 0}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Payment Method at Store Counter */}
            <div className="reserve-field">
              <label htmlFor="reservePayment">
                <span>Payment Mode at Counter</span>
              </label>
              <select
                id="reservePayment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI / QR Code (GPay, PhonePe)</option>
                <option value="Card">Credit / Debit Card at POS</option>
                <option value="Cash">Cash at Store Register</option>
              </select>
            </div>

            {/* Customer Full Name */}
            <div className="reserve-field">
              <label htmlFor="reserveCustName">Your Name *</label>
              <input
                id="reserveCustName"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* Customer Email */}
            <div className="reserve-field">
              <label htmlFor="reserveCustEmail">Email Address</label>
              <input
                id="reserveCustEmail"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            {/* Customer Phone */}
            <div className="reserve-field reserve-field-full">
              <label htmlFor="reserveCustPhone">Phone Number (For SMS pickup pin)</label>
              <input
                id="reserveCustPhone"
                type="tel"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="reserve-actions">
            <button
              type="button"
              className="reserve-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="reserve-btn-primary"
              disabled={submitting || maxAvailable <= 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: '#fff #fff transparent transparent' }}></span>
                  <span>Placing Hold...</span>
                </>
              ) : (
                <>
                  <span>📦</span>
                  <span>Confirm In-Store Hold</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
