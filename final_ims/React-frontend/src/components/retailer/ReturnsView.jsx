import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';

export default function ReturnsView() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getReturns();
        if (Array.isArray(data)) {
          const mapped = data.map((r) => ({
            id: r.id,
            poRef: r.orderId || r.poRef || 'ORD-REF',
            supplier: r.customer || r.supplier || 'Customer Return',
            product: r.productName || r.product || 'Item',
            qty: r.qty || 1,
            reason: r.reason || 'Return',
            amount: r.amount || 0,
            date: r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            status: r.status || 'Approved',
          }));
          setReturns(mapped);
        }
      } catch (err) {
        console.error('Failed to load returns:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  const [form, setForm] = useState({
    poRef: 'PO-2026-001',
    supplier: 'Acme Electronics Ltd',
    product: 'iPhone 15 Pro Max',
    qty: 1,
    amount: 1943,
    reason: 'Damaged Goods',
  });

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    const newRet = {
      id: `RET-2026-00${returns.length + 1}`,
      poRef: form.poRef,
      supplier: form.supplier,
      product: form.product,
      qty: Number(form.qty),
      amount: Number(form.amount),
      reason: form.reason,
      date: 'Today',
      status: 'Confirmed',
    };
    setReturns([newRet, ...returns]);
    setIsModalOpen(false);
  };

  const totalReturnVal = returns.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    return r.id.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q) || r.product.toLowerCase().includes(q);
  });

  return (
    <div className="page-content" style={{ padding: '24px 28px 48px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#092c4c', lineHeight: 1.3 }}>
            Purchase Return & Returns Management
          </div>
          <div className="page-sub" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#646b72', marginTop: '3px' }}>
            Dashboard &gt; Purchases &gt; Purchase Return
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '5px',
            border: 'none',
            background: '#2e6bc5',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '13px',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Return
        </button>
      </div>

      {/* KPI STATS ROW */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif" }}>Total Returns Value</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Nunito Sans', sans-serif", color: '#092c4c', lineHeight: 1.1 }}>₹{totalReturnVal.toLocaleString('en-IN')}</div>
            <div className="stat-note" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px', fontFamily: "'Nunito Sans', sans-serif" }}>Direct vendor credit notes</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif" }}>Pending Confirmation</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Nunito Sans', sans-serif", color: '#092c4c', lineHeight: 1.1 }}>0</div>
            <div className="stat-note" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px', fontFamily: "'Nunito Sans', sans-serif" }}>0 awaiting credit confirmation</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif" }}>Resolved Claims</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Nunito Sans', sans-serif", color: '#092c4c', lineHeight: 1.1 }}>{returns.length}</div>
            <div className="stat-note" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px', fontFamily: "'Nunito Sans', sans-serif" }}>100% resolution success</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif" }}>Restocked Units</div>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Nunito Sans', sans-serif", color: '#092c4c', lineHeight: 1.1 }}>3</div>
            <div className="stat-note" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px', fontFamily: "'Nunito Sans', sans-serif" }}>Returned or swapped</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
        </div>
      </div>

      {/* RETURNS TABLE */}
      <div style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e6eaed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e6eaed', borderRadius: '5px', padding: '6px 10px', width: '240px', background: '#fff' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#a6aaaf" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search return ID or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
            />
          </div>
          <div style={{ fontSize: '12.5px', color: '#646b72', fontWeight: 600 }}>
            {filtered.length} Return records
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8f9fb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Return ID</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>PO Reference</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Supplier</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Product & Reason</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Refund Amount</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => (
                <tr key={ret.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#dc2626' }}>{ret.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2e6bc5' }}>{ret.poRef}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#212b36' }}>{ret.supplier}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#092c4c' }}>{ret.product} ({ret.qty} pcs)</div>
                    <div style={{ fontSize: '11.5px', color: '#646b72' }}>{ret.reason}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#092c4c' }}>₹{ret.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', color: '#646b72' }}>{ret.date}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD RETURN MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e6eaed', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#212b36' }}>Record Purchase Return</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#646b72' }}>&times;</button>
            </div>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>PO Ref *</label>
                  <input type="text" required value={form.poRef} onChange={(e) => setForm({ ...form, poRef: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Supplier *</label>
                  <input type="text" required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Product Name *</label>
                <input type="text" required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Quantity *</label>
                  <input type="number" min="1" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Refund Amount (₹) *</label>
                  <input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Return Reason *</label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Defective / Quality Issue">Defective / Quality Issue</option>
                  <option value="Incorrect Item Shipped">Incorrect Item Shipped</option>
                  <option value="Shortage / Partial Delivery">Shortage / Partial Delivery</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#646b72' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '5px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Record Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
