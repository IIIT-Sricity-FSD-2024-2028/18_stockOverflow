/**
 * CartPage_consumer.jsx - Exact Shopping & Reservation Cart View
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `cart.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Left Side: Cart items list with quantity steppers (`−` `+`) and red Remove button.
 * Right Side: Reservation summary card with subtotal, estimated total, and "Proceed to Checkout" button.
 */

import React, { useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';

export default function CartPage_consumer({
  cart = [],
  userSession,
  onUpdateQty,
  onRemoveItem,
  onNavigate,
  onLogout,
}) {
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

  return (
    <CustomerLayout_consumer
      activeMenu="cart"
      pageTitle="Reservation Cart"
      pageSub="Review and finalize your items for pickup"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="cart-container">
        {/* Left Side: Cart Items List */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state">
              <h2>No items reserved</h2>
              <p>Looks like you haven't added anything to reserve yet.</p>
              <button
                type="button"
                className="checkout-btn"
                style={{ display: 'inline-block', width: 'auto', padding: '12px 24px' }}
                onClick={() => onNavigate('search')}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = Number(item.priceUSD || item.price || 0);
              const itemQty = Number(item.qty || 1);

              return (
                <div key={item.sku} className="cart-item">
                  {/* Thumbnail */}
                  <div className="item-img">
                    {item.productImg ? (
                      <img
                        src={item.productImg}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span>{item.emoji || '📦'}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-sku">SKU: {item.sku}</div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="qty-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onUpdateQty(item.sku, itemQty - 1)}
                    >
                      −
                    </button>
                    <span className="qty-val">{itemQty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onUpdateQty(item.sku, itemQty + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="item-price">
                    ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => onRemoveItem(item.sku)}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Reservation Summary Card */}
        <div className="summary-card">
          <div className="summary-title">Reservation Summary</div>
          <div className="summary-row">
            <span>Estimated Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row total">
            <span>Est. Total</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', lineHeight: '1.4' }}>
            * Payment is not required now. Final amount will be collected at your selected store during pickup.
          </p>
          <button
            type="button"
            className="checkout-btn"
            disabled={cart.length === 0}
            style={{
              opacity: cart.length === 0 ? 0.5 : 1,
              pointerEvents: cart.length === 0 ? 'none' : 'auto',
            }}
            onClick={() => onNavigate('checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
