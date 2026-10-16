/**
 * OrdersPage_consumer.jsx - Exact My Orders & Order History Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `orders.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Shows active holds and delivered orders, order search box,
 * and direct action buttons for "Write Review", "Return", and "View Invoice".
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import {
  fetchPurchasedProducts,
  fetchReservationRequests,
  fetchProducts,
} from '../utils/api_consumer';

export default function OrdersPage_consumer({
  cart = [],
  userSession,
  onWriteReview,
  onInitiateReturn,
  onViewInvoice,
  onNavigate,
  onLogout,
}) {
  // In layman's terms: This stores the real orders retrieved from the database.
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  
  // In layman's terms: This stores pending in-store pickup reservations awaiting store confirmation.
  const [pendingReservations, setPendingReservations] = useState([]);
  
  // In layman's terms: What the user is typing into the search bar.
  const [searchQuery, setSearchQuery] = useState('');
  
  // In layman's terms: Shows a smooth loading indicator while the data is loading.
  const [loading, setLoading] = useState(true);

  // In layman's terms: Calculates total number of items currently in the cart badge.
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // ── LOAD ORDERS FROM BACKEND / LOCAL STORAGE ──
  // In layman's terms: As soon as the page opens, fetch all orders from the server.
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      setLoading(true);
      try {
        const customerLookup = userSession?.name || userSession?.email || userSession?.id || '';
        const [purchased, pending, allCatalog] = await Promise.all([
          fetchPurchasedProducts(customerLookup),
          fetchReservationRequests('pending', customerLookup),
          fetchProducts(),
        ]);

        if (isMounted) {
          setPurchasedProducts(
            purchased.map((p) => {
              const matched = allCatalog.find((c) => c.sku === p.sku);
              return {
                ...p,
                orderId: p.orderId || p.lastOrderId || '',
                productImg: p.productImg || matched?.productImg || '',
                emoji: p.emoji || matched?.emoji || '📦',
                isPending: false,
              };
            })
          );

          setPendingReservations(
            pending.map((r) => {
              const matched = allCatalog.find((c) => c.sku === r.sku);
              return {
                sku: r.sku,
                name: r.productName || matched?.name || 'Reserved Product',
                totalQty: r.qty || 1,
                totalSpent: (Number(matched?.priceUSD || matched?.price || 0)) * (r.qty || 1),
                lastOrderedAt: r.createdAt || new Date().toISOString(),
                orderId: r.orderId || r.requestId,
                store: r.store || 'Downtown Store',
                productImg: matched?.productImg || '',
                emoji: matched?.emoji || '⏳',
                isPending: true,
              };
            })
          );
        }
      } catch (err) {
        console.error('Failed to load orders from backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();

    // Auto-refresh orders every 5 seconds to sync with backend updates (e.g. POS sales or holds)
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── COMBINE ORDERS ──
  const allOrders = useMemo(() => {
    let combined = [...pendingReservations, ...purchasedProducts];
    if (!searchQuery.trim()) return combined;
    const q = searchQuery.toLowerCase().trim();
    return combined.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.sku?.toLowerCase().includes(q) ||
        o.orderId?.toLowerCase().includes(q)
    );
  }, [pendingReservations, purchasedProducts, searchQuery]);

  return (
    <CustomerLayout_consumer
      activeMenu="orders"
      pageTitle="Orders"
      pageSub="products you ordered"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="orders-header">
        <div className="orders-title">My Orders</div>
        <div className="orders-sub">Track, review and return your purchased items</div>

        <div className="orders-search-row">
          <div className="orders-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search your orders by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner"></div>
          <p style={{ color: '#64748b' }}>Loading your orders history...</p>
        </div>
      ) : allOrders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders found</h2>
          <p>
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : "You haven't placed any orders or reservations yet."}
          </p>
          <button
            type="button"
            className="checkout-btn"
            style={{ display: 'inline-block', width: 'auto', padding: '12px 24px' }}
            onClick={() => onNavigate('search')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="order-list">
          {allOrders.map((order, idx) => {
            const dateStr = new Date(order.lastOrderedAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={order.orderId || order.sku + idx} className="order-card">
                {/* Thumbnail */}
                <div className="order-img">
                  {order.productImg ? (
                    <img
                      src={order.productImg}
                      alt={order.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="order-fallback"
                    style={{ display: order.productImg ? 'none' : 'flex' }}
                  >
                    {order.emoji || '📦'}
                  </div>
                </div>

                {/* Metadata */}
                <div className="order-meta">
                  <div className={`order-delivery ${order.isPending ? 'pending' : ''}`}>
                    {order.isPending
                      ? `⏳ Hold Pending Verification · ${order.store}`
                      : `✓ Delivered on ${dateStr}`}
                  </div>
                  <div className="order-name">{order.name}</div>
                  <div className="order-price">
                    ₹{Number(order.totalSpent || 0).toLocaleString('en-IN')} · Qty {order.totalQty || 1} · {order.sku}
                  </div>
                </div>

                {/* Action Buttons: Exact match to vanilla orders.html */}
                <div className="order-actions">
                  {order.orderId && !order.isPending && (
                    <button
                      type="button"
                      className="order-btn btn-review"
                      onClick={() => onViewInvoice && onViewInvoice(order.orderId)}
                    >
                      🧾 View Invoice
                    </button>
                  )}

                  <button
                    type="button"
                    className="order-btn btn-review"
                    disabled={order.isPending}
                    onClick={() => onWriteReview && onWriteReview(order.sku)}
                  >
                    Write a Review
                  </button>

                  <button
                    type="button"
                    className="order-btn btn-return"
                    disabled={order.isPending}
                    onClick={() => onInitiateReturn && onInitiateReturn(order.sku, order.orderId)}
                  >
                    Return
                  </button>

                  {order.isPending && (
                    <div className="order-hint">
                      Actions unlock after order confirmation.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CustomerLayout_consumer>
  );
}
