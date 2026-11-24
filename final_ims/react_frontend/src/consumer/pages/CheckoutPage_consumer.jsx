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
import { useSelector, useDispatch } from 'react-redux';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { clearCart, selectCartItems, selectCartCount } from '../redux/slices/cartSlice';
import { submitReservationHold } from '../redux/slices/ordersSlice';
import { selectSelectedStoreName, selectStores } from '../redux/slices/catalogSlice';

export default function CheckoutPage_consumer({
  cart: propsCart,
  selectedStore: propsSelectedStore,
  stores: propsStores,
  userSession,
  onReservationsSubmitted,
  onNavigate,
  onLogout,
  showToast,
}) {
  const dispatch = useDispatch();

  // Redux state selectors with fallback to props
  const reduxCart = useSelector(selectCartItems);
  const reduxCartCount = useSelector(selectCartCount);
  const reduxSelectedStore = useSelector(selectSelectedStoreName);
  const reduxStores = useSelector(selectStores);

  const cart = (reduxCart && reduxCart.length > 0) ? reduxCart : (propsCart || []);
  const cartCount = reduxCartCount || cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  const selectedStore = reduxSelectedStore || propsSelectedStore || 'Downtown Store';
  const stores = (reduxStores && reduxStores.length > 0) ? reduxStores : (propsStores || []);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from user session if available
  useEffect(() => {
    if (userSession?.name) setCustomerName(userSession.name);
    if (userSession?.email) setCustomerEmail(userSession.email);
  }, [userSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) {
      showToast('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      // ── CHECKOUT RESERVATION SUBMISSION VIA REDUX (LAYMAN EXPLANATION) ──
      // In layman's terms: When the customer clicks "Confirm Reservation", we dispatch
      // submitReservationHold to create an in-store pickup hold for the cart items.
      const reservationItems = cart.map((item) => {
        let storeId = item.storeId;
        let storeName = item.storeName;

        const matchedStore =
          stores.find((store) => String(store.id) === String(storeId)) ||
          stores.find((store) => store.name === storeName || store.name === selectedStore) ||
          null;

        if (matchedStore) {
          storeId = matchedStore.id;
          storeName = matchedStore.name;
        } else if (!storeId || storeId === 's1' || storeId === 'undefined') {
          const invStore = Array.isArray(item.storeInventory) && item.storeInventory[0]?.storeId;
          storeId = invStore || 'default-store';
          storeName = selectedStore || 'Central Fulfillment Store';
        }

        return {
          sku: item.sku,
          qty: Number(item.qty || 1),
          storeId,
          store: storeName || selectedStore,
        };
      });

      const result = await dispatch(submitReservationHold({
        items: reservationItems,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerId: userSession?.id || undefined,
        paymentMethod,
      })).unwrap();

      // Clear cart in Redux
      dispatch(clearCart());

      showToast('🎉 Reservation confirmed!');
      if (onReservationsSubmitted) {
        onReservationsSubmitted(result);
      }
    } catch (err) {
      showToast(err.message || err || 'Failed to place reservation.');
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
              {isSubmitting ? 'Processing Reservation...' : 'Confirm Reservation'}
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
