/**
 * OrderConfirmationPage_consumer.jsx - Exact Sale Confirmation & Printable Receipt
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `sale-confirmation.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Shows the official receipt card with Order ID, store details, itemized table,
 * subtotal, tax, grand total, and action buttons for Print (PDF), Email, WhatsApp, and Back to Dashboard.
 */

import React, { useState, useEffect } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import { fetchTransactionByOrderId, fetchTransactions } from '../utils/api_consumer';

export default function OrderConfirmationPage_consumer({
  orderId = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      setLoading(true);
      try {
        let found = null;
        if (orderId) {
          found = await fetchTransactionByOrderId(orderId);
        }
        if (!found) {
          const all = await fetchTransactions();
          found = all[0] || null;
        }
        if (isMounted) setOrder(found);
      } catch (err) {
        console.error('Failed to load receipt:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = Number(order?.subtotal || 0);
  const tax = Number(order?.tax || 0);
  const finalTotal = Number(order?.finalTotal || subtotal + tax);

  return (
    <CustomerLayout_consumer
      activeMenu="orders"
      pageTitle="Sale Confirmation"
      pageSub="Your purchase receipt"
      cartCount={cart.length}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '16px 0' }}>
        {/* Printable Receipt Card */}
        <div
          className="receipt-card"
          style={{
            background: '#fff',
            border: '1px solid #e8e9f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '22px', color: '#38BDF8' }}>
              StockOverflow
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              RECEIPT #{order?.orderId || 'ORD-00000'}
            </div>
          </div>

          {/* Meta Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12.5px',
              color: '#4b5563',
              marginBottom: '16px',
            }}
          >
            <div>
              <span style={{ color: '#9ca3af' }}>Date:</span>{' '}
              <strong>{new Date(order?.timestamp || Date.now()).toLocaleDateString()}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Store:</span>{' '}
              <strong>{order?.store || 'Downtown Store'}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Customer:</span>{' '}
              <strong>{order?.customer || 'Valued Customer'}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Payment:</span>{' '}
              <strong>{order?.paymentMethod || 'Card'}</strong>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e8e9f0', margin: '14px 0' }} />

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '14px' }}>
            <thead>
              <tr style={{ color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e8e9f0' }}>
                <th style={{ padding: '6px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '6px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '6px 0' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '6px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 0' }}>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.sku}</div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.quantity || item.qty || 1}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>
                    ₹{Number(item.price || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 700 }}>
                    ₹{(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ border: 'none', borderTop: '1px solid #e8e9f0', margin: '14px 0' }} />

          {/* Financials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Tax (5%):</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '16px',
                color: '#111827',
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '1px solid #e8e9f0',
              }}
            >
              <span>Total:</span>
              <span style={{ color: '#2563eb' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
            Thank you for shopping with StockOverflow!
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="reserve-btn"
            style={{ flex: 1, padding: '12px' }}
            onClick={() => window.print()}
          >
            🖨️ Print Receipt
          </button>
          <button
            type="button"
            className="view-btn"
            style={{ flex: 1, marginTop: 0, padding: '12px' }}
            onClick={() => showToast('Receipt sent to email.')}
          >
            ✉️ Email
          </button>
          <button
            type="button"
            className="view-btn"
            style={{ flex: 1, marginTop: 0, padding: '12px' }}
            onClick={() => showToast('WhatsApp link generated.')}
          >
            💬 WhatsApp
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('home')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
