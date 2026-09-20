import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function StockAdjustView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustType, setAdjustType] = useState('add');
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState('Inventory Audit Reconciliation');
  const [notes, setNotes] = useState('');
  const [adjustments, setAdjustments] = useState([]);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pList, adjList] = await Promise.all([
          retailerApi.getProducts(user?.retailerId).catch(() => []),
          retailerApi.getStockAdjustments().catch(() => []),
        ]);
        const prods = Array.isArray(pList) ? pList : [];
        setProducts(prods);
        if (prods.length > 0) setSelectedProductId(prods[0].id);

        if (Array.isArray(adjList)) {
          const mapped = adjList.map((a) => ({
            id: a.id,
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            productName: a.productName || a.product || 'Product',
            sku: a.sku || 'SKU',
            store: a.store || user?.store || "John's Retail Store",
            type: a.type || 'add',
            qty: a.qty || 0,
            reason: a.reason || 'Inventory Adjustment',
            user: a.user || user?.name || 'Retailer',
            status: a.status || 'Completed',
          }));
          setAdjustments(mapped);
        }
      } catch (e) {
        console.error('Failed to load stock adjustment data:', e);
      }
    }
    load();
  }, [user]);

  const selProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAdj = {
      id: `ADJ-2026-00${adjustments.length + 1}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      productName: selProduct?.name || 'Adjusted SKU',
      sku: selProduct?.sku || 'SKU-GEN',
      store: user?.store || "John's Retail Store",
      type: adjustType,
      qty: Number(quantity),
      reason: reason,
      user: user?.name || 'John Retailer',
      status: 'Completed',
    };
    setAdjustments([newAdj, ...adjustments]);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
    setNotes('');
  };

  return (
    <div className="sa-content" style={{ padding: '24px 28px 40px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="sa-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div className="sa-page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '18px', fontWeight: 700, lineHeight: '27px', color: '#212b36' }}>
            Stock Adjustment
          </div>
          <div className="sa-breadcrumb" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#646b72', marginTop: '2px' }}>
            Dashboard &gt; Stock Adjustment
          </div>
        </div>
      </div>

      {successToast && (
        <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 700, fontSize: '13px' }}>
          ✓ Stock adjustment recorded successfully and updated in inventory logs.
        </div>
      )}

      {/* FORM CARD */}
      <div className="sa-form-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', boxShadow: '0 1px 1px rgba(198,198,198,.2)', overflow: 'hidden', marginBottom: '24px' }}>
        <div className="sa-form-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e6eaed', background: '#f9fafb' }}>
          <h3 className="sa-form-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#212b36', margin: 0 }}>
            Record Stock Adjustment
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="sa-form-body" style={{ padding: '20px' }}>
          <div className="sa-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="sa-form-group">
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Store Outlet
              </label>
              <input
                type="text"
                readOnly
                value={user?.store || "John's Retail Store"}
                className="sa-form-input sa-form-readonly"
                style={{ width: '100%', border: '1px solid #e6eaed', borderRadius: '5px', padding: '8px 12px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', background: '#f5f6fa', color: '#212b36', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div className="sa-form-group">
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Product SKU *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="sa-form-input"
                style={{ width: '100%', border: '1px solid #e6eaed', borderRadius: '5px', padding: '8px 12px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', background: '#fff', color: '#212b36', outline: 'none', boxSizing: 'border-box' }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Curr: {p.qty || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="sa-form-group">
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Adjustment Action *
              </label>
              <div className="sa-radio-group" style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '38px' }}>
                <label className="sa-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="adjType"
                    checked={adjustType === 'add'}
                    onChange={() => setAdjustType('add')}
                    style={{ accentColor: '#2e6bc5' }}
                  />
                  <span className="sa-radio-text" style={{ fontSize: '13px', color: '#212b36', fontWeight: 600 }}>+ Addition (Inward)</span>
                </label>
                <label className="sa-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="adjType"
                    checked={adjustType === 'remove'}
                    onChange={() => setAdjustType('remove')}
                    style={{ accentColor: '#ef4444' }}
                  />
                  <span className="sa-radio-text" style={{ fontSize: '13px', color: '#212b36', fontWeight: 600 }}>- Reduction (Damage/Loss)</span>
                </label>
              </div>
            </div>

            <div className="sa-form-group">
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="sa-form-input"
                style={{ width: '100%', border: '1px solid #e6eaed', borderRadius: '5px', padding: '8px 12px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', background: '#fff', color: '#212b36', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div className="sa-form-group">
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="sa-form-input"
                style={{ width: '100%', border: '1px solid #e6eaed', borderRadius: '5px', padding: '8px 12px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', background: '#fff', color: '#212b36', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="Inventory Audit Reconciliation">Inventory Audit Reconciliation</option>
                <option value="Damaged Goods">Damaged Goods</option>
                <option value="Stock Found During Count">Stock Found During Count</option>
                <option value="Expired Stock Removal">Expired Stock Removal</option>
                <option value="Return Restock">Return Restock</option>
              </select>
            </div>

            <div className="sa-form-group sa-form-group-full" style={{ gridColumn: '1 / -1' }}>
              <label className="sa-form-label" style={{ display: 'block', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Audit Notes & Reference
              </label>
              <textarea
                placeholder="Optional explanation for ledger compliance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="sa-form-input sa-form-textarea"
                style={{ width: '100%', border: '1px solid #e6eaed', borderRadius: '5px', padding: '8px 12px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', background: '#fff', color: '#212b36', outline: 'none', resize: 'vertical', minHeight: '70px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e6eaed', paddingTop: '16px' }}>
            <button
              type="submit"
              className="sa-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#2e6bc5', borderRadius: '5px', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}
            >
              Submit Adjustment
            </button>
          </div>
        </form>
      </div>

      {/* HISTORY CARD */}
      <div className="sa-history-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', boxShadow: '0 1px 1px rgba(198,198,198,.2)', overflow: 'hidden' }}>
        <div className="sa-history-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e6eaed', background: '#f9fafb' }}>
          <h3 className="sa-history-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#212b36', margin: 0 }}>
            Adjustment History Log
          </h3>
        </div>
        <div className="sa-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="sa-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>ID / Date</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Product & SKU</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Type</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Quantity</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Reason</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Auditor</th>
                <th style={{ padding: '8px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adj) => (
                <tr key={adj.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                  <td style={{ padding: '10px 15px' }}>
                    <div style={{ fontWeight: 700, color: '#212b36' }}>{adj.id}</div>
                    <div style={{ fontSize: '11.5px', color: '#646b72' }}>{adj.date}</div>
                  </td>
                  <td style={{ padding: '10px 15px' }}>
                    <div style={{ fontWeight: 700, color: '#212b36' }}>{adj.productName}</div>
                    <div style={{ fontSize: '11.5px', color: '#646b72' }}>{adj.sku}</div>
                  </td>
                  <td style={{ padding: '10px 15px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: adj.type === 'add' ? '#dcfce7' : '#fee2e2', color: adj.type === 'add' ? '#15803d' : '#b91c1c', fontWeight: 600, fontSize: '11px' }}>
                      {adj.type === 'add' ? '+ Addition' : '- Reduction'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 15px', fontWeight: 800, color: adj.type === 'add' ? '#15803d' : '#b91c1c' }}>
                    {adj.type === 'add' ? `+${adj.qty}` : `-${adj.qty}`}
                  </td>
                  <td style={{ padding: '10px 15px', color: '#646b72', fontWeight: 600 }}>{adj.reason}</td>
                  <td style={{ padding: '10px 15px', color: '#212b36', fontWeight: 600 }}>{adj.user}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '11px' }}>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
