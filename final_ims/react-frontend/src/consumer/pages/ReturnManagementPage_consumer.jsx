/**
 * ReturnManagementPage_consumer.jsx - 1-to-1 Exact RMA Returns Management Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `return-management.html` from the vanilla customer module down to every pixel.
 * It is wrapped in the Customer Sidebar & Header layout.
 * 
 * Features:
 * 1. Signature `#00BCD4` cyan-bordered card ("Submit Return / RMA Request").
 * 2. Real recent orders chips (with `(Returned)` badge if already returned).
 * 3. Strict single-return enforcement:
 *    - If an order has already been returned, displays the vanilla amber warning banner:
 *      "⚠️ Return Request Already Submitted [Status Badge]"
 *      and disables the submit button.
 * 4. Item selection checkboxes with photos, SKU, price in ₹, quantity, and order date.
 * 5. Dropdowns for Return Reason, Item Condition, and Resolution / Refund Method.
 * 6. Detailed notes textarea and photo evidence file attachment.
 * 7. Live submitted return requests list ("Your Return Requests") rendered from backend `GET /api/returns`.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import {
  fetchTransactions,
  fetchTransactionByOrderId,
  fetchReturns,
  createReturnRequest,
} from '../utils/api_consumer';

export default function ReturnManagementPage_consumer({
  initialSku = '',
  initialOrderId = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast = () => {},
}) {
  const [orderInput, setOrderInput] = useState(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [existingReturn, setExistingReturn] = useState(null);
  const [notFoundQuery, setNotFoundQuery] = useState('');
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form selections
  const [reason, setReason] = useState('Defective / Not Working');
  const [condition, setCondition] = useState('Opened but Unused');
  const [refundMethod, setRefundMethod] = useState('Original Payment Method');
  const [notes, setNotes] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  // Live collections from backend
  const [userOrders, setUserOrders] = useState([]);
  const [userReturns, setUserReturns] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const cartCount = useMemo(() => {
    return (Array.isArray(cart) ? cart : []).reduce(
      (total, item) => total + (Number(item.qty) || 1),
      0
    );
  }, [cart]);

  // Load user return history and order transactions from the live backend
  const loadData = useCallback(async () => {
    try {
      const [returnsData, ordersData] = await Promise.all([
        fetchReturns(),
        fetchTransactions(),
      ]);
      setUserReturns(Array.isArray(returnsData) ? returnsData : []);
      setUserOrders(Array.isArray(ordersData) ? ordersData : []);
      return { returnsData, ordersData };
    } catch (err) {
      console.error('Failed to load returns data:', err);
      return { returnsData: [], ordersData: [] };
    }
  }, []);

  // Fetch and inspect a specific order ID
  const fetchOrderItems = useCallback(
    async (orderNumToSearch, customReturnsList = null, customOrdersList = null) => {
      const rawInput = (orderNumToSearch || orderInput || '').trim();
      const cleanNum = rawInput.replace(/^#/, '').trim().toUpperCase();

      if (!cleanNum) {
        setCurrentOrder(null);
        setExistingReturn(null);
        setNotFoundQuery('');
        setSelectedItems({});
        return;
      }

      setIsFetchingOrder(true);
      setNotFoundQuery('');

      const returnsList = customReturnsList || userReturns;
      let ordersList = customOrdersList || userOrders;

      try {
        let order = (ordersList || []).find(
          (o) => String(o.orderId || '').replace(/^#/, '').trim().toUpperCase() === cleanNum
        );

        if (!order) {
          try {
            order = await fetchTransactionByOrderId(cleanNum);
          } catch (_e) {}
        }

        if (!order) {
          setCurrentOrder(null);
          setExistingReturn(null);
          setNotFoundQuery(rawInput);
          setSelectedItems({});
          return;
        }

        setCurrentOrder(order);
        setOrderInput(order.orderId);

        // Check if a return has already been submitted for this order
        const alreadySubmitted = (returnsList || []).find(
          (r) =>
            String(r.orderId || '')
              .replace(/^#/, '')
              .trim()
              .toUpperCase() === String(order.orderId || '').replace(/^#/, '').trim().toUpperCase()
        );

        if (alreadySubmitted) {
          setExistingReturn(alreadySubmitted);
          setSelectedItems({});
        } else {
          setExistingReturn(null);
          // Pre-select items (if initialSku was passed, check that item; otherwise check all items)
          const itemsMap = {};
          (order.items || []).forEach((item) => {
            const shouldCheck = initialSku ? String(item.sku).trim() === initialSku.trim() : true;
            itemsMap[item.sku] = shouldCheck;
          });
          setSelectedItems(itemsMap);
        }
      } catch (err) {
        console.error('Error fetching order items:', err);
        setNotFoundQuery(rawInput);
      } finally {
        setIsFetchingOrder(false);
      }
    },
    [orderInput, userReturns, userOrders, initialSku]
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoadingInitial(true);
      const { returnsData, ordersData } = await loadData();
      if (!isMounted) return;

      const targetId = initialOrderId || (ordersData && ordersData[0]?.orderId) || '';
      if (targetId) {
        setOrderInput(targetId);
        await fetchOrderItems(targetId, returnsData, ordersData);
      }
      setLoadingInitial(false);
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [initialOrderId, loadData]);

  // Handle chip click
  const handleSelectOrderChip = (orderId) => {
    setOrderInput(orderId);
    fetchOrderItems(orderId);
  };

  // Toggle item checkbox
  const handleToggleItem = (sku) => {
    setSelectedItems((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }));
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
      showToast('Evidence photo attached');
    }
  };

  // Handle form submission
  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (!currentOrder) {
      showToast('Please fetch an order first');
      return;
    }

    // Strict duplicate check
    const cleanCurrent = String(currentOrder.orderId || '').replace(/^#/, '').trim().toUpperCase();
    const alreadyReturned = (userReturns || []).some(
      (r) => String(r.orderId || '').replace(/^#/, '').trim().toUpperCase() === cleanCurrent
    );

    if (alreadyReturned || existingReturn) {
      showToast('A return request has already been submitted for this order.');
      return;
    }

    const itemsToReturn = (currentOrder.items || []).filter((it) => selectedItems[it.sku]);
    if (!itemsToReturn.length) {
      showToast('Please select at least one item to return');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const item of itemsToReturn) {
        const itemAmount = Number(item.total || (item.price * (item.quantity || 1)) || 0);
        const payload = {
          orderId: currentOrder.orderId,
          sku: item.sku,
          productName: item.name || 'Product',
          product: item.name || 'Product',
          amount: itemAmount,
          retailerId: currentOrder.retailerId || '',
          storeId: currentOrder.storeId || '',
          store: currentOrder.store || '',
          reason: reason,
          condition: condition,
          refundMethod: refundMethod,
          method: refundMethod,
          notes: notes,
          customer: userSession?.name || currentOrder.customer || 'James',
          email: userSession?.email || currentOrder.customerEmail || 'james@gmail.com',
          customerId: userSession?.id || currentOrder.customerId || undefined,
          status: 'Pending',
        };

        await createReturnRequest(payload);
      }

      showToast('Return request submitted successfully!');
      setNotes('');
      setAttachedFileName('');

      // Refresh return history and re-fetch current order to display the amber lock banner
      const { returnsData, ordersData } = await loadData();
      await fetchOrderItems(currentOrder.orderId, returnsData, ordersData);
    } catch (err) {
      console.error('Failed to submit return request:', err);
      showToast(err.message || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasCheckedItems = Object.values(selectedItems).some(Boolean);
  const isSubmitDisabled = !currentOrder || Boolean(existingReturn) || !hasCheckedItems || isSubmitting;

  const returnedOrderIds = useMemo(() => {
    return new Set(
      (userReturns || []).map((r) => String(r.orderId || '').replace(/^#/, '').trim().toUpperCase())
    );
  }, [userReturns]);

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
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* ── Main RMA Form Card (Signature #00BCD4 Cyan Border) ── */}
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #00BCD4',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: '0 4px 18px rgba(0, 188, 212, 0.08)',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>↩️</span>
            <span>Submit Return / RMA Request</span>
          </div>

          <form onSubmit={handleSubmitReturn}>
            {/* 1. Order Number Input + Fetch Button + Recent Chips */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Order / Receipt Number *
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. ORD154403, ORD820239..."
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchOrderItems(orderInput);
                    }
                  }}
                  style={{
                    flex: 1,
                    border: '1.5px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    outline: 'none',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchOrderItems(orderInput)}
                  disabled={isFetchingOrder}
                  style={{
                    padding: '10px 20px',
                    background: '#00BCD4',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isFetchingOrder ? 'not-allowed' : 'pointer',
                    opacity: isFetchingOrder ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {isFetchingOrder ? 'Fetching...' : 'Fetch Order'}
                </button>
              </div>

              {/* Recent Orders Chips */}
              {userOrders && userOrders.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '6px' }}>
                    Recent Orders:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {userOrders.slice(0, 5).map((o) => {
                      const cleanId = String(o.orderId || '').trim();
                      const isReturned = returnedOrderIds.has(cleanId.replace(/^#/, '').toUpperCase());
                      return (
                        <button
                          key={cleanId}
                          type="button"
                          onClick={() => handleSelectOrderChip(cleanId)}
                          style={{
                            background: isReturned ? '#fef3c7' : '#eff6ff',
                            border: `1px solid ${isReturned ? '#fcd34d' : '#bfdbfe'}`,
                            color: isReturned ? '#92400e' : '#1d4ed8',
                            borderRadius: '16px',
                            padding: '3px 12px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>#{cleanId}</span>
                          {isReturned && (
                            <span
                              style={{
                                background: '#fde68a',
                                color: '#78350f',
                                padding: '1px 5px',
                                borderRadius: '8px',
                                fontSize: '10px',
                              }}
                            >
                              Returned
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Order Line Items Picker / Status Banner */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Select Item(s) to Return *
              </label>

              {/* State A: Order Not Found */}
              {notFoundQuery ? (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    fontSize: '13px',
                  }}
                >
                  <strong>Order Not Found</strong>
                  <p style={{ marginTop: '4px', fontSize: '12px' }}>
                    We could not find an order matching "<strong>{notFoundQuery}</strong>". Please check the number and try again.
                  </p>
                </div>
              ) : existingReturn ? (
                /* State B: DUPLICATE RETURN DETECTED (Exact match to vanilla amber box) */
                <div
                  id="duplicateReturnBanner"
                  style={{
                    background: '#fef3c7',
                    border: '1.5px solid #fde68a',
                    color: '#92400e',
                    padding: '16px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span> Return Request Already Submitted
                    </strong>
                    <span
                      style={{
                        background: '#fef08a',
                        color: '#854d0e',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {existingReturn.status || 'Pending'}
                    </span>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '12.5px', lineHeight: 1.5, color: '#78350f' }}>
                    A return request for Order <strong>#{currentOrder?.orderId}</strong> ({existingReturn.productName || existingReturn.sku}) has already been submitted on{' '}
                    <strong>
                      {existingReturn.createdAt || existingReturn.date
                        ? new Date(existingReturn.createdAt || existingReturn.date).toLocaleDateString()
                        : 'recently'}
                    </strong>
                    . Only one return request per order is permitted.
                  </p>
                </div>
              ) : currentOrder ? (
                /* State C: Order Found & Unreturned -> Line Items Checkboxes */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(!currentOrder.items || currentOrder.items.length === 0) ? (
                    <div
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        padding: '14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#6b7280',
                      }}
                    >
                      No line items found for Order #{currentOrder.orderId}.
                    </div>
                  ) : (
                    currentOrder.items.map((item) => {
                      const itemTotal = Number(item.total || (item.price * (item.quantity || 1)) || 0);
                      const isChecked = Boolean(selectedItems[item.sku]);

                      return (
                        <label
                          key={item.sku}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            border: `1.5px solid ${isChecked ? '#00BCD4' : '#e5e7eb'}`,
                            borderRadius: '10px',
                            background: isChecked ? '#f0f9fb' : '#fafbfc',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.sku)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#00BCD4',
                            }}
                          />

                          {/* Image or fallback */}
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {item.productImg ? (
                              <img
                                src={item.productImg}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              style={{
                                display: item.productImg ? 'none' : 'flex',
                                fontSize: '20px',
                              }}
                            >
                              {item.emoji || '📦'}
                            </span>
                          </div>

                          {/* Meta */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                              {item.name} <span style={{ color: '#6b7280', fontWeight: 500 }}>({item.sku})</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                              Order #{currentOrder.orderId} • Qty: {item.quantity || 1} • Ordered:{' '}
                              {currentOrder.timestamp ? new Date(currentOrder.timestamp).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>

                          {/* Price in INR */}
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f766e' }}>
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              ) : (
                /* State D: Empty Placeholder prompt */
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '18px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  Please enter an Order / Receipt number above and click <strong>Fetch Order</strong> to load ordered items.
                </div>
              )}
            </div>

            {/* 3. Reason for Return */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Reason for Return *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={Boolean(existingReturn)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#111827',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="Defective / Not Working">Defective / Not Working</option>
                <option value="Wrong Item Received">Wrong Item Received</option>
                <option value="Item Damaged in Transit">Item Damaged in Transit</option>
                <option value="Missing Parts / Accessories">Missing Parts / Accessories</option>
                <option value="Arrived Later than Expected">Arrived Later than Expected</option>
                <option value="No Longer Needed / Changed Mind">No Longer Needed / Changed Mind</option>
                <option value="Quality Not as Expected">Quality Not as Expected</option>
              </select>
            </div>

            {/* 4. Item Condition */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={Boolean(existingReturn)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#111827',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="Sealed / Unopened">Sealed / Unopened</option>
                <option value="Opened but Unused">Opened but Unused</option>
                <option value="Lightly Used">Lightly Used</option>
                <option value="Heavily Damaged / Broken">Heavily Damaged / Broken</option>
              </select>
            </div>

            {/* 5. Preferred Resolution */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Preferred Resolution *
              </label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                disabled={Boolean(existingReturn)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#111827',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="Original Payment Method">Original Payment Method</option>
                <option value="Store Credit / Wallet">Store Credit / Wallet</option>
                <option value="Product Replacement / Exchange">Product Replacement / Exchange</option>
              </select>
            </div>

            {/* 6. Condition Notes */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Condition Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe the issue or condition in detail..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={Boolean(existingReturn)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#111827',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* 7. Attach Photo Evidence */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Attach Photo Evidence (Optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="file"
                  id="evidenceInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={Boolean(existingReturn)}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="evidenceInput"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    background: existingReturn ? '#f3f4f6' : '#f9fafb',
                    color: '#374151',
                    cursor: existingReturn ? 'not-allowed' : 'pointer',
                  }}
                >
                  Choose File
                </label>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {attachedFileName ? `Selected: ${attachedFileName}` : 'No file chosen'}
                </span>
              </div>
            </div>

            {/* 8. Submit Button */}
            <button
              type="submit"
              id="submitReturnBtn"
              disabled={isSubmitDisabled}
              title={
                existingReturn
                  ? 'A return request has already been submitted for this order'
                  : !currentOrder
                  ? 'Please fetch an order first'
                  : !hasCheckedItems
                  ? 'Please select at least one item to return'
                  : ''
              }
              style={{
                width: '100%',
                padding: '14px',
                background: isSubmitDisabled ? '#e5e7eb' : '#00BCD4',
                color: isSubmitDisabled ? '#9ca3af' : '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitting
                ? 'Submitting...'
                : existingReturn
                ? '⚠️ Return Already Submitted for this Order'
                : '↩️ Submit Return Request'}
            </button>
          </form>
        </div>

        {/* ── Submitted Return Requests History List (Exact match to vanilla) ── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Your Return Requests</span>
            <span
              style={{
                fontSize: '12px',
                background: '#eff6ff',
                color: '#1d4ed8',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              {userReturns.length} {userReturns.length === 1 ? 'Claim' : 'Claims'}
            </span>
          </div>

          {loadingInitial ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '13px' }}>
              Loading return history...
            </div>
          ) : userReturns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '13px' }}>
              No return requests submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userReturns.map((r, idx) => {
                const status = r.status || 'Pending';
                const statusLower = status.toLowerCase();
                const isApproved = statusLower === 'approved';
                const isRejected = statusLower === 'rejected';
                const isExchanged = statusLower === 'exchanged';

                const badgeColor = isApproved
                  ? '#16a34a'
                  : isRejected
                  ? '#dc2626'
                  : isExchanged
                  ? '#7c3aed'
                  : '#d97706';
                const badgeBg = isApproved
                  ? '#dcfce7'
                  : isRejected
                  ? '#fee2e2'
                  : isExchanged
                  ? '#f3e8ff'
                  : '#fef3c7';

                const returnDateStr = r.createdAt || r.date
                  ? new Date(r.createdAt || r.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={r.id || `ret-${idx}`}
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '16px 18px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14.5px', color: '#111827' }}>
                          {r.productName || r.product || r.sku || 'Product'}
                        </strong>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          {r.orderId ? (
                            <>
                              Order: <strong>#{r.orderId}</strong> •{' '}
                            </>
                          ) : null}
                          SKU: {r.sku || 'N/A'} • {returnDateStr}
                        </div>
                      </div>
                      <span
                        style={{
                          background: badgeBg,
                          color: badgeColor,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '12.5px',
                        color: '#374151',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '6px',
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid #e5e7eb',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#4b5563' }}>Reason:</strong> {r.reason || '-'}
                      </div>
                      <div>
                        <strong style={{ color: '#4b5563' }}>Resolution:</strong>{' '}
                        {r.refundMethod || r.method || 'Original Payment'}
                      </div>
                      <div>
                        <strong style={{ color: '#4b5563' }}>Condition:</strong> {r.condition || '-'}
                      </div>
                      <div>
                        <strong style={{ color: '#4b5563' }}>Amount:</strong> ₹
                        {Number(r.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {r.notes ? (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '8px',
                          borderTop: '1px dashed #e5e7eb',
                          paddingTop: '6px',
                        }}
                      >
                        <strong>Notes:</strong> {r.notes}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout_consumer>
  );
}
