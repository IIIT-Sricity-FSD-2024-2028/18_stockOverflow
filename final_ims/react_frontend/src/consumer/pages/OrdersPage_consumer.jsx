/**
 * OrdersPage_consumer.jsx - Exact My Orders & Order History Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `orders.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Shows active holds and delivered orders, order search box,
 * and direct action buttons for "Write Review", "Return", and "View Invoice".
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { useDataSync } from '../../context/DataSyncContext';
import {
  fetchPurchasedProducts,
  fetchReservationRequests,
  fetchProducts,
  cancelReservationRequest,
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
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonCategory, setCancelReasonCategory] = useState('Changed my mind');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [cancelError, setCancelError] = useState('');

  // In layman's terms: Calculates total number of items currently in the cart badge.
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // ── LOAD ORDERS FROM BACKEND / LOCAL STORAGE ──
  const loadOrders = useCallback(async () => {
    try {
      const customerLookup = userSession?.name || userSession?.email || userSession?.id || '';
      const [purchased, pending, allCatalog] = await Promise.all([
        fetchPurchasedProducts(customerLookup),
        fetchReservationRequests('', customerLookup),
        fetchProducts(),
      ]);

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
        pending
          .filter((r) => r.status !== 'completed')
          .map((r) => {
            const matched = allCatalog.find((c) => c.sku === r.sku);
            const isCancelled = r.status === 'cancelled';
            return {
              sku: r.sku,
              name: r.productName || matched?.name || 'Pre-ordered Product',
              totalQty: r.qty || 1,
              totalSpent: (Number(matched?.priceUSD || matched?.price || 0)) * (r.qty || 1),
              lastOrderedAt: r.createdAt || new Date().toISOString(),
              orderId: r.orderId || r.requestId,
              requestId: r.requestId,
              store: r.store || 'Downtown Store',
              productImg: matched?.productImg || '',
              emoji: isCancelled ? '❌' : (matched?.emoji || '⏳'),
              isPending: r.status === 'pending',
              isCancelled: isCancelled,
              cancelReason: r.cancelReason,
              cancelledAt: r.cancelledAt,
            };
          })
      );
    } catch (err) {
      console.error('Failed to load orders from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [userSession]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReasonCategory('Changed my mind');
    setOtherReasonText('');
    setCancelError('');
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    let finalReason = cancelReasonCategory;
    if (cancelReasonCategory === 'Other') {
      if (!otherReasonText.trim()) {
        setCancelError('Please write your specific reason for cancelling.');
        return;
      }
      finalReason = otherReasonText.trim();
    } else if (otherReasonText.trim()) {
      finalReason = `${cancelReasonCategory} (${otherReasonText.trim()})`;
    }

    try {
      setCancellingId(cancelModalOrder.requestId);
      await cancelReservationRequest(cancelModalOrder.requestId, finalReason);
      setCancelModalOrder(null);
      await loadOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setCancelError(err.message || 'Server error occurred while cancelling.');
    } finally {
      setCancellingId(null);
    }
  };

  useDataSync(['transactions', 'inventory', 'orders'], () => {
    loadOrders();
  });

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
              : "You haven't placed any orders or pre-orders yet."}
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
                  <div className={`order-delivery ${order.isCancelled ? 'cancelled' : order.isPending ? 'pending' : ''}`}>
                    {order.isCancelled
                      ? `❌ Pre-order Cancelled · ${order.store}`
                      : order.isPending
                      ? `⏳ Pre-order Placed · Store Pickup Pending · ${order.store}`
                      : `✓ Delivered on ${dateStr}`}
                  </div>
                  <div className="order-name">{order.name}</div>
                  <div className="order-price">
                    ₹{Number(order.totalSpent || 0).toLocaleString('en-IN')} · Qty {order.totalQty || 1} · {order.sku}
                  </div>
                </div>

                {/* Action Buttons: Exact match to vanilla orders.html */}
                <div className="order-actions">
                  {order.orderId && !order.isPending && !order.isCancelled && (
                    <button
                      type="button"
                      className="order-btn btn-review"
                      onClick={() => onViewInvoice && onViewInvoice(order.orderId)}
                    >
                      🧾 View Invoice
                    </button>
                  )}

                  {!order.isCancelled && (
                    <button
                      type="button"
                      className="order-btn btn-review"
                      disabled={order.isPending}
                      onClick={() => onWriteReview && onWriteReview(order.sku)}
                    >
                      Write a Review
                    </button>
                  )}

                  {!order.isCancelled && (
                    <button
                      type="button"
                      className="order-btn btn-return"
                      disabled={order.isPending}
                      onClick={() => onInitiateReturn && onInitiateReturn(order.sku, order.orderId)}
                    >
                      Return
                    </button>
                  )}

                  {order.isPending && !order.isCancelled && (
                    <button
                      type="button"
                      className="order-btn"
                      style={{
                        backgroundColor: '#fff',
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        cursor: cancellingId === order.requestId ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #ef4444',
                      }}
                      disabled={cancellingId === order.requestId}
                      onClick={() => handleOpenCancelModal(order)}
                    >
                      {cancellingId === order.requestId ? 'Cancelling...' : '✕ Cancel Pre-order'}
                    </button>
                  )}

                  {order.isPending && !order.isCancelled && (
                    <div className="order-hint">
                      Actions unlock after store pickup & confirmation.
                    </div>
                  )}

                  {order.isCancelled && (
                    <div className="order-hint" style={{ color: '#ef4444' }}>
                      Cancelled {order.cancelReason ? `(${order.cancelReason})` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ── CANCELLATION REASON MODAL ── */}
      {cancelModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => !cancellingId && setCancelModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Cancel Pre-order
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Hold ID: {cancelModalOrder.requestId || cancelModalOrder.orderId}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !cancellingId && setCancelModalOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '28px' }}>{cancelModalOrder.emoji || '📦'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {cancelModalOrder.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Store: {cancelModalOrder.store} · Qty: {cancelModalOrder.totalQty || 1}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Select a reason for cancellation <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={cancelReasonCategory}
                  onChange={(e) => {
                    setCancelReasonCategory(e.target.value);
                    setCancelError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found a lower price elsewhere">Found a lower price elsewhere</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delay in pickup / Need it sooner">Delay in pickup / Need it sooner</option>
                  <option value="Selected wrong store or product">Selected wrong store or product</option>
                  <option value="Need different size / variant">Need different size / variant</option>
                  <option value="Other">Other (Please specify)</option>
                </select>
              </div>

              {/* Other / Additional Details Field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  {cancelReasonCategory === 'Other' ? (
                    <>
                      Please specify your reason <span style={{ color: '#ef4444' }}>*</span>
                    </>
                  ) : (
                    'Additional comments / feedback (Optional)'
                  )}
                </label>
                <textarea
                  rows={3}
                  value={otherReasonText}
                  onChange={(e) => {
                    setOtherReasonText(e.target.value);
                    if (cancelError) setCancelError('');
                  }}
                  placeholder={
                    cancelReasonCategory === 'Other'
                      ? 'Tell us why you are cancelling this pre-order...'
                      : 'Provide any additional details or context...'
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: cancelError && cancelReasonCategory === 'Other' ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {cancelError && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#b91c1c',
                    marginBottom: '14px',
                  }}
                >
                  {cancelError}
                </div>
              )}

              <div
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  lineHeight: 1.4,
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px',
                }}
              >
                ℹ️ Once cancelled, your inventory hold will be released back to store stock immediately.
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={Boolean(cancellingId)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Keep Pre-order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={Boolean(cancellingId)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#fff',
                  cursor: cancellingId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout_consumer>
  );
}
