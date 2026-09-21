/**
 * CheckoutPage_consumer.jsx - Exact Checkout & Reservation Finalization
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `checkout.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Shows the store pickup badge, Contact Information inputs,
 * Payment Preference dropdown, "Confirm Reservation" button, and "Return to Cart" link.
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { createTransaction, createReservationRequest } from '../utils/api_consumer';

export default function CheckoutPage_consumer({
  cart = [],
  selectedStore = 'Downtown Store',
  stores = [],
  userSession,
  onOrderPlaced,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from user session if available
  useEffect(() => {
    if (userSession?.name) setCustomerName(userSession.name);
    if (userSession?.email) setCustomerEmail(userSession.email);
  }, [userSession]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = Number(item.priceUSD || item.price || 0);
      const q = Number(item.qty || 1);
      return sum + p * q;
    }, 0);
  }, [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) {
      showToast('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const matchedStore = stores.find((s) => s.name === selectedStore) || { id: 's1', name: selectedStore };
      const orderId = `ORD-${Date.now()}`;

      const orderItems = cart.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: Number(item.qty || 1),
        price: Number(item.priceUSD || item.price || 0),
        total: Number(item.priceUSD || item.price || 0) * Number(item.qty || 1),
      }));

      // Create transaction record
      await createTransaction({
        orderId,
        storeId: matchedStore.id,
        store: selectedStore,
        customer: customerName || 'Valued Customer',
        customerEmail,
        items: orderItems,
        subtotal,
        tax: Math.round(subtotal * 0.05),
        discount: 0,
        finalTotal: subtotal + Math.round(subtotal * 0.05),
        paymentMethod,
        fulfillmentType: 'pickup',
        status: 'Delivered',
        timestamp: new Date().toISOString(),
      });

      // Create reservation hold requests
      for (const item of cart) {
        await createReservationRequest({
          sku: item.sku,
          productName: item.name,
          qty: Number(item.qty || 1),
          customer: customerName,
          customerEmail,
          storeId: matchedStore.id,
          store: selectedStore,
          paymentMethod,
          orderId,
        });
      }

      showToast('🎉 Reservation confirmed!');
      if (onOrderPlaced) {
        onOrderPlaced(orderId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to place reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout_consumer
      activeMenu="cart"
      pageTitle="Finalize Reservation"
      pageSub="Provide your contact info to complete your request"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '20px 0' }}>
        <div className="checkout-container">
          {/* Store Pickup Details Badge */}
          <div className="store-badge">
            📦 Pickup Store: <strong>{selectedStore}</strong> ({cartCount} items)
          </div>

          <form onSubmit={handleSubmit}>
            {/* Contact Information Section */}
            <div className="section-title">Contact Information</div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

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

            {/* Payment Preference Section */}
            <div className="section-title">Payment Preference</div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
              Payment will be collected at the store.
            </p>
            <div className="form-group">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="Card">Pay with Card at Store</option>
                <option value="Cash">Pay with Cash at Store</option>
                <option value="UPI">Pay with UPI at Store</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? 'Confirming Reservation...' : 'Confirm Reservation'}
            </button>
          </form>

          {/* Return to Cart Link */}
          <div
            className="back-link"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('cart')}
          >
            Return to Cart
          </div>
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
