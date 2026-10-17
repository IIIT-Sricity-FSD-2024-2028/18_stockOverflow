/**
 * ReservationModal_consumer.jsx - In-Store Pickup Hold Dialog
 * 
 * IN LAYMAN'S TERMS:
 * This modal allows an online customer to "reserve" (put on hold) a product at a local store
 * so they can walk in, inspect it, and pay at the counter without the product selling out.
 */

import React, { useState, useEffect } from 'react';

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
      if (session.name) setCustomerName(session.name);
      if (session.email) setCustomerEmail(session.email);
    } catch (_e) {}
  }, [isOpen, userSession]);

  // ── IN-STORE AVAILABILITY CALCULATION (LAYMAN EXPLANATION) ──
  // In layman's terms: Calculate all available physical stores that currently have
  // units on hand for this specific product, including any central distribution hub.
  const availableStores = React.useMemo(() => {
    if (!product) return [];
    const list = [];
    const seenStoreIds = new Set();
    const inventory = Array.isArray(product.storeInventory) ? product.storeInventory : [];
    const totalStock = product.qty || 0;

    // 1. Check retailer stores
    stores.forEach((store) => {
      const entry = inventory.find(
        (inv) =>
          String(inv.storeId) === String(store.id) ||
          String(inv.storeId) === String(store.code) ||
          String(store.id).endsWith(':' + String(inv.storeId)) ||
          (product.retailerId &&
            store.retailerId === product.retailerId &&
            String(store.code || store.id) === String(inv.storeId)),
      );
      const count = entry ? Number(entry.qty) || 0 : (inventory.length === 0 && store.name === product.storeName ? totalStock : 0);
      if (count > 0) {
        list.push({ ...store, availableQty: count });
        seenStoreIds.add(String(store.id));
      }
    });

    // 2. Check store inventory entries (e.g. central default-store)
    inventory.forEach((inv) => {
      const sId = String(inv.storeId);
      if (!seenStoreIds.has(sId) && Number(inv.qty) > 0) {
        list.push({
          id: sId,
          name: sId === 'default-store' ? 'Central Fulfillment Store' : `Store #${sId}`,
          location: 'Main Distribution Center, India',
          availableQty: Number(inv.qty),
        });
        seenStoreIds.add(sId);
      }
    });

    return list;
  }, [stores, product]);

  useEffect(() => {
    if (!isOpen || !product) return;
    const defaultStore =
      availableStores.find((store) => String(store.id) === String(selectedStoreId)) ||
      availableStores.find((store) => store.name === selectedStore) ||
      availableStores[0];
    setStoreId(defaultStore?.id || '');
    setQty(1);
    setErrorMsg('');
  }, [isOpen, product, availableStores, selectedStore, selectedStoreId]);

  if (!isOpen || !product) return null;

  // Find local stock for the selected store
  const selectedStoreItem = availableStores.find((s) => String(s.id) === String(storeId));
  const maxAvailable = selectedStoreItem ? selectedStoreItem.availableQty : (product.qty || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (qty > maxAvailable) {
      setErrorMsg(`Only ${maxAvailable} unit(s) available at this store location.`);
      return;
    }

    setSubmitting(true);
    try {
      const storeObj = stores.find((s) => s.id === storeId) || { name: selectedStore };
      const payload = {
        sku: product.sku,
        productName: product.name,
        qty: Number(qty),
        storeId,
        store: storeObj.name || selectedStore,
        customer: customerName || 'Valued Customer',
        customerEmail,
        customerPhone,
        customerId: userSession?.id || undefined,
        paymentMethod,
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(520px, 94vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📦</span>
            <div>
              <h2 className="modal-title">Reserve for In-Store Pickup</h2>
              <p className="modal-subtitle">Hold this item at a local store branch without paying now.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close dialog">
            ✕
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="modal-product-summary">
          <div
            className="summary-thumb"
            style={{
              width: '56px',
              height: '56px',
              minWidth: '56px',
              minHeight: '56px',
              maxWidth: '56px',
              maxHeight: '56px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {product.productImg ? (
              <img
                src={product.productImg}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <span style={{ fontSize: '26px' }}>{product.emoji || '📦'}</span>
            )}
          </div>
          <div className="summary-details">
            <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700 }}>{product.name}</h4>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b' }}>
              SKU: {product.sku} · Category: {product.category}
            </p>
            <div className="summary-price" style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>
              ₹{Number(product.priceUSD || product.price || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            className="modal-error-banner"
            style={{
              background: '#fee2e2',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '8px',
              margin: '12px 24px 0',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Pickup Store Selector */}
          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              Select Pickup Store Branch <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              {availableStores.length === 0 && (
                <option value="">No stores currently stock this product</option>
              )}
              {availableStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location || 'Local Hub'}) — {s.availableQty} units available
                </option>
              ))}
            </select>
            <div style={{ fontSize: '12px', color: maxAvailable > 0 ? '#059669' : '#dc2626', fontWeight: 600, marginTop: '2px' }}>
              {maxAvailable > 0
                ? `✓ ${maxAvailable} unit(s) available for in-store pickup hold`
                : `✕ Out of stock at this location`}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Full Name */}
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            {/* Email Address */}
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Phone Number */}
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            {/* Quantity */}
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Quantity to Hold (Max: {maxAvailable}) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={Math.max(1, maxAvailable)}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
              />
            </div>
          </div>

          {/* Payment Preference at Counter */}
          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              Payment Mode at Store Counter
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI / QR Code (Google Pay, PhonePe, Paytm)</option>
              <option value="Card">Credit / Debit Card at POS</option>
              <option value="Cash">Cash at Register Counter</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || maxAvailable <= 0}
            >
              {submitting ? 'Placing Hold...' : 'Confirm In-Store Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
