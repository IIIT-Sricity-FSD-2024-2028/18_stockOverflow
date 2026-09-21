/**
 * ReservationModal.jsx - In-Store Pickup Hold Dialog
 * 
 * IN LAYMAN'S TERMS:
 * This modal allows an online customer to "reserve" (put on hold) a product at a local store
 * so they can walk in, inspect it, and pay at the counter without the product selling out.
 */

import React, { useState, useEffect } from 'react';

export default function ReservationModal({
  isOpen = false,
  product = null,
  selectedStore = 'Downtown Store',
  stores = [],
  onClose,
  onConfirmReservation,
}) {
  const [storeId, setStoreId] = useState('s1');
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
      const session = JSON.parse(localStorage.getItem('so_session') || '{}');
      if (session.name) setCustomerName(session.name);
      if (session.email) setCustomerEmail(session.email);
    } catch (_e) {}
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Find local stock for the selected store
  const storeInventory = Array.isArray(product.storeInventory) ? product.storeInventory : [];
  const currentStoreEntry = storeInventory.find((s) => s.storeId === storeId) || {
    qty: product.qty || 0,
  };
  const maxAvailable = currentStoreEntry.qty || 0;

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📦</span>
            <div>
              <h2 className="modal-title">Reserve for In-Store Pickup</h2>
              <p className="modal-subtitle">Hold this item at a local store branch without paying now.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="modal-product-summary">
          <div className="summary-thumb">
            {product.productImg ? (
              <img src={product.productImg} alt={product.name} />
            ) : (
              <span>{product.emoji || '📦'}</span>
            )}
          </div>
          <div className="summary-details">
            <h4>{product.name}</h4>
            <p>SKU: {product.sku} · Category: {product.category}</p>
            <div className="summary-price">₹{Number(product.priceUSD || product.price || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {errorMsg && <div className="modal-error-banner">{errorMsg}</div>}

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Pickup Store Selector */}
          <div className="form-group">
            <label>Select Pickup Store Branch</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              {stores.map((s) => {
                const sEntry = storeInventory.find((entry) => entry.storeId === s.id);
                const count = sEntry ? sEntry.qty : 0;
                return (
                  <option key={s.id} value={s.id} disabled={count <= 0}>
                    {s.name} ({s.location || 'Local Hub'}) — {count > 0 ? `${count} in stock` : 'Out of Stock'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-row">
            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>
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
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            {/* Quantity */}
            <div className="form-group">
              <label>Quantity to Hold (Max: {maxAvailable})</label>
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
            <label>Payment Mode at Store Counter</label>
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
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
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
