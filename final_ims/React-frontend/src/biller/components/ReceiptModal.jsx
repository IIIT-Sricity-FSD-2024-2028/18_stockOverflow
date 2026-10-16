import React from 'react';

export default function ReceiptModal({ isOpen, transaction, onClose }) {
  if (!isOpen || !transaction) return null;

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const formatInr = (num) => currencyFormatter.format(num || 0);

  const orderId = transaction.orderId || `ORD-${Date.now().toString().slice(-6)}`;
  const dateStr = transaction.timestamp
    ? new Date(transaction.timestamp).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const items = Array.isArray(transaction.items) ? transaction.items : [];
  const subtotal = Number(transaction.subtotal || 0);
  const shipping = Number(transaction.shipping || 0);
  const tax = Number(transaction.tax || 0);
  const discount = Number(transaction.discount || 0);
  const coupon = Number(transaction.coupon || 0);
  const roundoff = Number(transaction.roundoff || 0);
  const finalTotal = Number(transaction.finalTotal || (subtotal + shipping + tax - discount - coupon + roundoff));

  const handlePrint = () => {
    const printWindow = window.open('', 'ReceiptPrint', 'height=650,width=450');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsRows = items
      .map(
        (it) => `
        <tr>
          <td style="padding: 4px 0; font-size: 12px;">${it.name || 'Item'}</td>
          <td style="padding: 4px 0; text-align: center; font-size: 12px;">${it.quantity || 1}</td>
          <td style="padding: 4px 0; text-align: right; font-size: 12px;">${formatInr(it.price)}</td>
          <td style="padding: 4px 0; text-align: right; font-size: 12px; font-weight: 600;">${formatInr(it.total || (it.price * (it.quantity || 1)))}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${orderId}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 24px;
            margin: 0;
            color: #111;
            font-size: 12px;
            line-height: 1.4;
          }
          .header { text-align: center; margin-bottom: 16px; border-bottom: 1px dashed #666; padding-bottom: 12px; }
          .header h2 { margin: 0 0 4px; font-size: 18px; letter-spacing: 1px; }
          .meta { margin-bottom: 12px; font-size: 11px; }
          .meta div { display: flex; justify-content: space-between; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th { border-bottom: 1px solid #111; padding-bottom: 4px; font-size: 11px; text-align: left; }
          .summary { border-top: 1px dashed #666; padding-top: 8px; margin-bottom: 16px; }
          .summary div { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px; }
          .summary .total { font-size: 14px; font-weight: bold; border-top: 1px solid #111; padding-top: 4px; margin-top: 4px; }
          .footer { text-align: center; font-size: 10px; color: #555; border-top: 1px dashed #666; padding-top: 12px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>STOCK OVERFLOW</h2>
          <div style="font-size: 11px; color: #444;">STORE POS RECEIPT / TAX INVOICE</div>
          <div style="font-weight: 600; margin-top: 4px;">${transaction.store || 'Retail Store'}</div>
        </div>

        <div class="meta">
          <div><span>Order ID:</span> <strong>${orderId}</strong></div>
          <div><span>Date:</span> <span>${dateStr}</span></div>
          <div><span>Customer:</span> <strong>${transaction.customer || 'Walk-in Customer'}</strong></div>
          <div><span>Cashier:</span> <span>${transaction.billerName || 'Store Cashier'}</span></div>
          <div><span>Payment:</span> <span>${transaction.paymentMethod || 'Cash'}</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <div><span>Subtotal:</span> <span>${formatInr(subtotal)}</span></div>
          ${shipping > 0 ? `<div><span>Shipping:</span> <span>${formatInr(shipping)}</span></div>` : ''}
          ${tax > 0 ? `<div><span>Tax:</span> <span>${formatInr(tax)}</span></div>` : ''}
          ${discount > 0 ? `<div><span>Discount:</span> <span>-${formatInr(discount)}</span></div>` : ''}
          ${coupon > 0 ? `<div><span>Coupon:</span> <span>-${formatInr(coupon)}</span></div>` : ''}
          ${roundoff !== 0 ? `<div><span>Roundoff:</span> <span>${roundoff > 0 ? '+' : ''}${formatInr(roundoff)}</span></div>` : ''}
          <div class="total"><span>TOTAL PAID:</span> <span>${formatInr(finalTotal)}</span></div>
        </div>

        <div class="footer">
          <div>* OFFICIAL STORE INVOICE *</div>
          <div style="margin-top: 4px;">Thank you for shopping with us!</div>
          <div style="margin-top: 6px; font-family: monospace; letter-spacing: 2px;">||||| | |||| || |||||| | ||||</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt Visual Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            color: '#fff',
            padding: '20px 24px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontSize: '22px',
            }}
          >
            ✓
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800 }}>Purchase Approved!</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Receipt #{orderId} generated successfully
          </p>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '22px',
              cursor: 'pointer',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            &times;
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            background: '#fafbfc',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '12.5px',
            color: '#1e293b',
          }}
        >
          {/* Header Info */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>STOCK OVERFLOW</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>STORE POS INVOICE</div>
            <div style={{ fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
              {transaction.store || 'Retail Store'}
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', marginBottom: '14px', color: '#475569' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Order ID:</span> <strong style={{ color: '#0f172a' }}>{orderId}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8' }}>Date:</span> {dateStr}
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Customer:</span> <strong style={{ color: '#0f172a' }}>{transaction.customer || 'Walk-in'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8' }}>Payment:</span> <span style={{ fontWeight: 700, color: '#16a34a' }}>{transaction.paymentMethod || 'Cash'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '8px 0', marginBottom: '12px' }}>
            <div style={{ display: 'flex', fontWeight: 700, fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: '40px', textAlign: 'center' }}>Qty</span>
              <span style={{ width: '70px', textAlign: 'right' }}>Price</span>
              <span style={{ width: '75px', textAlign: 'right' }}>Total</span>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '4px 0', borderBottom: idx < items.length - 1 ? '1px dotted #f1f5f9' : 'none' }}>
                <div style={{ flex: 1, paddingRight: '6px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                  {item.isReserved && (
                    <span style={{ fontSize: '9px', background: '#fef3c7', color: '#92400e', padding: '1px 4px', borderRadius: '3px' }}>
                      Reserved Order
                    </span>
                  )}
                </div>
                <div style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{item.quantity || 1}</div>
                <div style={{ width: '70px', textAlign: 'right', color: '#64748b' }}>{formatInr(item.price)}</div>
                <div style={{ width: '75px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                  {formatInr(item.total || (item.price * (item.quantity || 1)))}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{formatInr(subtotal)}</span>
            </div>
            {shipping > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Shipping:</span>
                <span>{formatInr(shipping)}</span>
              </div>
            )}
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tax / GST:</span>
                <span>{formatInr(tax)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>-{formatInr(discount)}</span>
              </div>
            )}
            {coupon > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Coupon:</span>
                <span>-{formatInr(coupon)}</span>
              </div>
            )}
            {roundoff !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Roundoff:</span>
                <span>{roundoff > 0 ? '+' : ''}{formatInr(roundoff)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px dashed #0f172a',
                paddingTop: '8px',
                marginTop: '4px',
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              <span>TOTAL PAID:</span>
              <span style={{ color: '#059669' }}>{formatInr(finalTotal)}</span>
            </div>
          </div>

          {/* Barcode Mock */}
          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '18px', letterSpacing: '4px', color: '#334155' }}>
              ||||| | |||| || |||||| | ||||
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
              * INVENTORY & ORDERS SYNCED ACROSS RETAILER & CONSUMER *
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: '14px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Close / Next Order
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <span>🖨️</span> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
