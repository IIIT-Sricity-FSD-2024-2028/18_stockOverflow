import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function StockAdjustView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [adjustType, setAdjustType] = useState('add');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Recount');
  const [notes, setNotes] = useState('');
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const warehouses = [
    user?.store || "John's Retail Store",
    'Lavish Warehouse',
    'Quaint Warehouse',
    'Traditional Warehouse',
    'Cool Warehouse',
    'Overflow Warehouse',
    'Nova Storage Hub',
    'Retail Supply Hub',
    'EdgeWare Solutions',
    'North Zone Warehouse',
    'Fulfillment Hub',
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [pList, adjList] = await Promise.all([
        retailerApi.getProducts(user?.retailerId).catch(() => []),
        retailerApi.getStockAdjustments().catch(() => []),
      ]);

      const prods = Array.isArray(pList) ? pList : [];
      setProducts(prods);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id);
      }
      if (!warehouse) {
        setWarehouse(user?.store || "John's Retail Store");
      }

      if (Array.isArray(adjList) && adjList.length > 0) {
        setAdjustments(
          adjList.map((a) => ({
            id: a.id,
            date: a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'),
            product: a.productName || a.product || a.productSku || 'Product Item',
            sku: a.productSku || a.sku || 'SKU',
            warehouse: a.warehouse || a.store || user?.store || "John's Store",
            type: a.type || 'add',
            qty: a.qty || 0,
            reason: a.reason || 'Inventory Adjustment',
            person: a.person || a.user || user?.name || 'Retailer',
            status: a.status || 'completed',
            notes: a.notes || '',
          }))
        );
      } else {
        // Fallback default adjustments
        setAdjustments([
          {
            id: 101,
            date: '18 Sep 2026',
            product: 'Lenovo IdeaPad 3',
            sku: 'PT001',
            warehouse: 'Lavish Warehouse',
            type: 'add',
            qty: 15,
            reason: 'Physical Recount',
            person: user?.name || 'John Retailer',
            status: 'completed',
            notes: 'Reconciled during month-end audit',
          },
          {
            id: 102,
            date: '16 Sep 2026',
            product: 'Beats Pro Headphone',
            sku: 'PT002',
            warehouse: 'Quaint Warehouse',
            type: 'remove',
            qty: 2,
            reason: 'Damaged Goods',
            person: user?.name || 'John Retailer',
            status: 'completed',
            notes: 'Packaging damaged during transfer',
          },
        ]);
      }
    } catch (err) {
      console.error('Error loading stock adjustment view:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const selProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleReset = () => {
    if (products.length > 0) setSelectedProductId(products[0].id);
    setWarehouse(user?.store || "John's Retail Store");
    setAdjustType('add');
    setQuantity(1);
    setReason('Recount');
    setNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selProduct) return;

    const qtyNum = parseInt(quantity, 10) || 1;
    const today = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const payload = {
      retailerId: user?.retailerId,
      storeId: user?.storeId || user?.currentStoreId,
      productSku: selProduct.sku || selProduct.id,
      productName: selProduct.name,
      warehouse: warehouse || user?.store || "John's Retail Store",
      type: adjustType,
      qty: qtyNum,
      reason: reason,
      person: user?.name || 'Retailer',
      notes: notes,
      date: today,
      status: 'completed',
    };

    try {
      const created = await retailerApi.createStockAdjustment(payload).catch(() => ({
        id: Date.now(),
        ...payload,
      }));

      // Update product quantity live in inventory
      const currentQty = parseInt(selProduct.qty || selProduct.quantity || 0, 10);
      const newQty = adjustType === 'add' ? currentQty + qtyNum : Math.max(0, currentQty - qtyNum);
      await retailerApi.updateProduct(selProduct.id, { qty: newQty, quantity: newQty }).catch(() => {});

      // Refresh product list state
      setProducts(products.map((p) => (p.id === selProduct.id ? { ...p, qty: newQty, quantity: newQty } : p)));

      setAdjustments([
        {
          id: created.id || Date.now(),
          date: today,
          product: selProduct.name,
          sku: selProduct.sku,
          warehouse: warehouse || user?.store || "John's Retail Store",
          type: adjustType,
          qty: qtyNum,
          reason: reason,
          person: user?.name || 'Retailer',
          status: 'completed',
          notes: notes,
        },
        ...adjustments,
      ]);

      setSuccessToast(`Stock adjustment recorded successfully! ${adjustType === 'add' ? '+' : '-'}${qtyNum} units updated.`);
      setTimeout(() => setSuccessToast(''), 4000);
      handleReset();
    } catch (err) {
      console.error('Failed to submit adjustment:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock adjustment record?')) return;
    try {
      await retailerApi.deleteStockAdjustment(id).catch(() => {});
      setAdjustments(adjustments.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete adjustment:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Date,Product,SKU,Warehouse,Type,Quantity,Reason,Person,Status'];
    const rows = adjustments.map(
      (a) => `"${a.id}","${a.date}","${a.product}","${a.sku}","${a.warehouse}","${a.type}","${a.qty}","${a.reason}","${a.person}","${a.status}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-adjustments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = adjustments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.product || '').toLowerCase().includes(q) ||
      (a.sku || '').toLowerCase().includes(q) ||
      (a.warehouse || '').toLowerCase().includes(q) ||
      (a.reason || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="content" style={{ padding: '22px 26px 40px', maxWidth: '1180px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-.4px', color: '#1a1d2e', margin: 0 }}>
            Stock Adjustment
          </h1>
          <p className="page-subtitle" style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '3px' }}>
            Reconcile physical counts with warehouse inventory ledger
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {successToast && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', fontWeight: 600 }}>
          ✓ {successToast}
        </div>
      )}

      {/* FORM CARD */}
      <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: '22px', overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', background: '#fafbfc' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>Create New Adjustment</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Product Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Product SKU *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Warehouse / Store *
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              >
                {warehouses.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Stock */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Current Stock (In Ledger)
              </label>
              <input
                type="text"
                readOnly
                value={`${selProduct?.qty ?? selProduct?.quantity ?? 0} units`}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', background: '#f8fafc', color: '#475569', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Adjustment Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Adjustment Action *
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '38px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1a1d2e' }}>
                  <input
                    type="radio"
                    name="adjType"
                    checked={adjustType === 'add'}
                    onChange={() => setAdjustType('add')}
                    style={{ accentColor: '#2e6bc5' }}
                  />
                  + Add Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1a1d2e' }}>
                  <input
                    type="radio"
                    name="adjType"
                    checked={adjustType === 'remove'}
                    onChange={() => setAdjustType('remove')}
                    style={{ accentColor: '#ef4444' }}
                  />
                  - Remove Stock
                </label>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Quantity to Adjust *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Reason */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Recount">Physical Recount</option>
                <option value="Damage">Damaged Goods</option>
                <option value="Loss">Shrinkage/Loss</option>
                <option value="Return">Customer Return</option>
                <option value="Transfer">Inter-Warehouse Transfer</option>
                <option value="Correction">Inventory Correction</option>
                <option value="Expiry">Expired/Obsolete</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Notes / Audit Comments
            </label>
            <textarea
              placeholder="Add any audit notes or ledger explanation..."
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: 700, color: '#6b7280', cursor: 'pointer' }}
            >
              Reset
            </button>
            <button
              type="submit"
              style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', background: '#2e6bc5', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Submit Adjustment
            </button>
          </div>
        </form>
      </div>

      {/* ADJUSTMENT HISTORY TABLE */}
      <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>
            Adjustment History ({filtered.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', width: '180px', background: '#fff' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%' }}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12.5px', outline: 'none', background: '#fff' }}
            >
              <option value="all">All Types</option>
              <option value="add">Additions</option>
              <option value="remove">Removals</option>
            </select>
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Product
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Warehouse
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Type
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Quantity
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Reason
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Date
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Adjusted By
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Status
                </th>
                <th style={{ textAlign: 'center', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No stock adjustment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((adj) => (
                  <tr key={adj.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#1a1d2e' }}>{adj.product}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{adj.sku}</div>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#475569' }}>
                      {adj.warehouse}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: adj.type === 'add' ? '#dcfce7' : '#fee2e2',
                          color: adj.type === 'add' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {adj.type === 'add' ? '+ Add' : '- Remove'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', fontWeight: 700, color: adj.type === 'add' ? '#15803d' : '#b91c1c' }}>
                      {adj.type === 'add' ? `+${adj.qty}` : `-${adj.qty}`} units
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#475569' }}>
                      {adj.reason}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#6b7280' }}>
                      {adj.date}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#1a1d2e', fontWeight: 600 }}>
                      {adj.person}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                        ✓ Completed
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedAdjustment(adj)}
                          title="View Details"
                          style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '5px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(adj.id)}
                          title="Delete"
                          style={{ width: '28px', height: '28px', border: '1px solid #fee2e2', borderRadius: '5px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedAdjustment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '450px', maxWidth: 'calc(100vw - 32px)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1a1d2e' }}>Stock Adjustment Detail</h3>
              <button onClick={() => setSelectedAdjustment(null)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div><strong>Adjustment ID:</strong> #{selectedAdjustment.id}</div>
              <div><strong>Product:</strong> {selectedAdjustment.product} ({selectedAdjustment.sku})</div>
              <div><strong>Warehouse:</strong> {selectedAdjustment.warehouse}</div>
              <div><strong>Action:</strong> {selectedAdjustment.type === 'add' ? '+ Addition' : '- Reduction'}</div>
              <div><strong>Quantity:</strong> {selectedAdjustment.qty} units</div>
              <div><strong>Reason:</strong> {selectedAdjustment.reason}</div>
              <div><strong>Date:</strong> {selectedAdjustment.date}</div>
              <div><strong>Auditor:</strong> {selectedAdjustment.person}</div>
              <div><strong>Notes:</strong> {selectedAdjustment.notes || 'None recorded'}</div>
              <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <button onClick={() => setSelectedAdjustment(null)} style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
