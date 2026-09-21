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
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // Load orders data
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      setLoading(true);
      try {
        const [purchased, pending, allCatalog] = await Promise.all([
          fetchPurchasedProducts(),
          fetchReservationRequests('pending'),
          fetchProducts(),
        ]);

        if (isMounted) {
          setPurchasedProducts(
            purchased.map((p) => {
              const matched = allCatalog.find((c) => c.sku === p.sku);
              return {
                ...p,
                productImg: matched?.productImg || '',
                emoji: matched?.emoji || '📦',
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
        console.error('Failed to load orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const allOrders = useMemo(() => {
    const combined = [...pendingReservations, ...purchasedProducts];
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
                    ₹{Number(order.totalSpent || 0).toLocaleString('en-IN')}
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
                      (Qty: {order.totalQty || 1} · SKU: {order.sku})
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="order-actions">
                  {order.orderId && (
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
                    ⭐ Write a Review
                  </button>

                  <button
                    type="button"
                    className="order-btn btn-return"
                    disabled={order.isPending}
                    onClick={() => onInitiateReturn && onInitiateReturn(order.sku, order.orderId)}
                  >
                    🔄 Return
                  </button>

                  {order.isPending && (
                    <div className="order-hint">
                      Actions unlock after store confirmation
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
