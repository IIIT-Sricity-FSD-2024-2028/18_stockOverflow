/**
 * ReturnManagementPage_consumer.jsx - Exact RMA Returns Management Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `return-management.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Features the signature `#00BCD4` cyan-bordered card, order lookup with "Fetch Order",
 * item picker, return reason dropdown, resolution options, notes, and file upload dropzone.
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import {
  fetchTransactions,
  fetchTransactionByOrderId,
  createReturnRequest,
} from '../utils/api_consumer';

export default function ReturnManagementPage_consumer({
  initialSku = '',
  initialOrderId = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [orderInput, setOrderInput] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSku, setSelectedSku] = useState(initialSku);
  const [returnReason, setReturnReason] = useState('Defective / Not Working');
  const [resolution, setResolution] = useState('Refund');
  const [conditionNotes, setConditionNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReturn, setSubmittedReturn] = useState(null);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  useEffect(() => {
    if (initialOrderId) {
      handleFetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleFetchOrder = async (searchId = '') => {
    const targetId = (searchId || orderInput).trim();
    if (!targetId) {
      showToast('Please enter an Order ID to fetch.');
      return;
    }

    setIsFetchingOrder(true);
    try {
      let found = await fetchTransactionByOrderId(targetId);
      if (!found) {
        const all = await fetchTransactions();
        found = all.find((o) => o.orderId === targetId) || null;
      }

      if (found) {
        setSelectedOrder(found);
        if (!selectedSku && found.items && found.items.length > 0) {
          setSelectedSku(found.items[0].sku);
        }
        showToast(`Order #${targetId} loaded.`);
      } else {
        showToast(`Order #${targetId} not found.`);
        setSelectedOrder(null);
      }
    } catch (err) {
      showToast('Failed to fetch order details.');
    } finally {
      setIsFetchingOrder(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(files);
      showToast(`${files.length} evidence photo(s) attached.`);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      showToast('Please fetch and select an order first.');
      return;
    }

    const matchedItem = (selectedOrder.items || []).find((i) => i.sku === selectedSku) || {
      name: 'Product',
      price: 0,
      quantity: 1,
    };

    setIsSubmitting(true);
    try {
      const payload = {
        orderId: selectedOrder.orderId,
        sku: selectedSku,
        productName: matchedItem.name,
        quantity: matchedItem.quantity || 1,
        amount: Number(matchedItem.total || matchedItem.price || 0),
        reason: returnReason,
        resolution,
        conditionNotes: conditionNotes.trim(),
        customer: selectedOrder.customer || userSession?.name || 'Valued Customer',
        customerEmail: selectedOrder.customerEmail || userSession?.email || '',
        customerPhone: selectedOrder.customerPhone || '',
        store: selectedOrder.store || 'Downtown Store',
        storeId: selectedOrder.storeId || 's1',
        photoCount: attachedFiles.length,
      };

      const result = await createReturnRequest(payload);
      setSubmittedReturn(result);
      showToast(`Return Request #${result.id} submitted!`);
    } catch (err) {
      showToast(err.message || 'Failed to submit return request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout_consumer
      activeMenu="returns"
      pageTitle="Returns Management"
      pageSub="Submit and manage RMA return requests"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="form-container">
        {submittedReturn ? (
          <div className="card" style={{ textAlign: 'center', borderColor: '#10b981' }}>
            <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '12px' }}>✓</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              Return Request Submitted
            </h2>
            <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: 700, marginBottom: '12px' }}>
              Claim ID: #{submittedReturn.id}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
              Your return request for <strong>{submittedReturn.productName}</strong> has been received. Our store inspection team will process your {submittedReturn.resolution.toLowerCase()} within 24–48 hours.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="fetch-btn"
                onClick={() => onNavigate('orders')}
              >
                Back to My Orders
              </button>
              <button
                type="button"
                className="view-btn"
                style={{ marginTop: 0, width: 'auto' }}
                onClick={() => {
                  setSubmittedReturn(null);
                  setSelectedOrder(null);
                }}
              >
                File Another Return
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-title">
              <span>🔄</span>
              <span>Submit Return / RMA Request</span>
            </div>

            {/* Step 1: Order Lookup */}
            <div className="form-group">
              <label className="form-label">Order / Receipt Number *</label>
              <div className="input-with-btn">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ORD-1788290123"
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                />
                <button
                  type="button"
                  className="fetch-btn"
                  onClick={() => handleFetchOrder()}
                  disabled={isFetchingOrder}
                >
                  {isFetchingOrder ? 'Fetching...' : 'Fetch Order'}
                </button>
              </div>
            </div>

            {selectedOrder && (
              <form onSubmit={handleSubmitReturn}>
                {/* Step 2: Item Selection */}
                <div className="form-group">
                  <label className="form-label">Select Item to Return *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedOrder.items || []).map((item) => (
                      <label
                        key={item.sku}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          background: selectedSku === item.sku ? '#e0f2fe' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="returnSku"
                          value={item.sku}
                          checked={selectedSku === item.sku}
                          onChange={() => setSelectedSku(item.sku)}
                        />
                        <div style={{ fontSize: '13px' }}>
                          <strong>{item.name}</strong> (SKU: {item.sku} · Qty: {item.quantity || 1})
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: Reason */}
                <div className="form-group">
                  <label className="form-label">Reason for Return *</label>
                  <select
                    className="form-input"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                  >
                    <option value="Defective / Not Working">Defective / Not Working</option>
                    <option value="Damaged in Transit">Damaged in Transit</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Item Doesn't Match Description">Item Doesn't Match Description</option>
                    <option value="Changed Mind">Changed Mind</option>
                  </select>
                </div>

                {/* Step 4: Resolution */}
                <div className="form-group">
                  <label className="form-label">Preferred Resolution *</label>
                  <select
                    className="form-input"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    required
                  >
                    <option value="Refund">Full Refund to Original Payment</option>
                    <option value="Replacement">Replacement with New Unit</option>
                    <option value="Store Credit">Store Credit Voucher</option>
                  </select>
                </div>

                {/* Step 5: Notes */}
                <div className="form-group">
                  <label className="form-label">Condition Notes</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="Describe the issue or condition in detail..."
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Step 6: File Upload */}
                <div className="form-group">
                  <label className="form-label">Attach Photo Evidence (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="form-input"
                    onChange={handleFileChange}
                  />
                  {attachedFiles.length > 0 && (
                    <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '4px' }}>
                      📎 {attachedFiles.length} file(s) selected
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="fetch-btn"
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                  disabled={isSubmitting || !selectedSku}
                >
                  {isSubmitting ? 'Submitting Return...' : 'Submit RMA Return Claim'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </CustomerLayout_consumer>
  );
}
