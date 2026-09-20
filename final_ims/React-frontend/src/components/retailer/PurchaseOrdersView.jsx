import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function PurchaseOrdersView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const poList = await retailerApi.getPurchaseOrders();
        if (Array.isArray(poList)) {
          const mapped = poList.map((po) => ({
            id: po.id,
            supplier: po.supplierName || po.supplier || 'Supplier',
            date: po.deliveryDate || po.createdAt ? new Date(po.deliveryDate || po.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            items: Array.isArray(po.items) && po.items.length > 0 ? (po.items[0].name || po.items[0].productName || 'Order Items') + (po.items.length > 1 ? ` (+${po.items.length - 1} more)` : '') : 'Inventory Restock',
            total: po.total || po.subtotal || 0,
            status: po.status || 'Delivered',
            payment: po.paymentStatus || 'Paid',
          }));
          setOrders(mapped);
        }
      } catch (e) {
        console.error('Failed to load purchase orders:', e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const [createForm, setCreateForm] = useState({
    supplier: 'Acme Electronics Ltd',
    items: '',
    qty: 10,
    unitPrice: 500,
    expectedDate: '2026-09-30',
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const newPO = {
      id: `PO-2026-00${orders.length + 1}`,
      supplier: createForm.supplier,
      date: 'Today',
      items: `${createForm.items || 'Restock SKU'} (${createForm.qty} pcs)`,
      total: Number(createForm.qty) * Number(createForm.unitPrice),
      status: 'Processing',
      payment: 'Pending',
    };
    setOrders([newPO, ...orders]);
    setActiveTab('list');
    setCreateForm({ supplier: 'Acme Electronics Ltd', items: '', qty: 10, unitPrice: 500, expectedDate: '2026-09-30' });
  };

  const totalSpend = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q);
  });

  return (
    <div className="po-content" style={{ padding: '24px 28px 48px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="po-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="po-page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#092c4c', lineHeight: 1.3 }}>
            Purchase Order & History
          </div>
          <div className="po-breadcrumb" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#646b72', marginTop: '3px' }}>
            Dashboard &gt; Purchases &gt; Purchase Orders
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#2e6bc5',
              color: '#fff',
              border: 'none',
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="nav-tab-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e6eaed', paddingBottom: '12px' }}>
        <button
          className={`nav-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: activeTab === 'list' ? '#fff' : 'transparent',
            border: activeTab === 'list' ? '1px solid #e6eaed' : '1px solid transparent',
            color: activeTab === 'list' ? '#2e6bc5' : '#646b72',
            fontWeight: 700,
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
        >
          Purchase Order List
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: activeTab === 'create' ? '#fff' : 'transparent',
            border: activeTab === 'create' ? '1px solid #e6eaed' : '1px solid transparent',
            color: activeTab === 'create' ? '#2e6bc5' : '#646b72',
            fontWeight: 700,
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
        >
          + Create New Order
        </button>
      </div>

      {/* STATS KPI CARDS */}
      <div className="po-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="po-stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="po-stat-lbl" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Orders Placed</div>
            <div className="po-stat-val" style={{ fontSize: '24px', fontWeight: 800, color: '#092c4c', marginTop: '4px' }}>{orders.length}</div>
            <div className="po-stat-sub" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px' }}>100% fulfill rate</div>
          </div>
          <div className="po-stat-icon psi-blue" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
        </div>

        <div className="po-stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="po-stat-lbl" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Delivery</div>
            <div className="po-stat-val" style={{ fontSize: '24px', fontWeight: 800, color: '#092c4c', marginTop: '4px' }}>0</div>
            <div className="po-stat-sub" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px' }}>All orders received</div>
          </div>
          <div className="po-stat-icon psi-yellow" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div className="po-stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="po-stat-lbl" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Orders</div>
            <div className="po-stat-val" style={{ fontSize: '24px', fontWeight: 800, color: '#092c4c', marginTop: '4px' }}>{orders.length}</div>
            <div className="po-stat-sub" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px' }}>Stock updated in store</div>
          </div>
          <div className="po-stat-icon psi-green" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>

        <div className="po-stat-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div className="po-stat-lbl" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Procurement Spend</div>
            <div className="po-stat-val" style={{ fontSize: '24px', fontWeight: 800, color: '#092c4c', marginTop: '4px' }}>₹{totalSpend.toLocaleString('en-IN')}</div>
            <div className="po-stat-sub" style={{ fontSize: '11px', color: '#a6aaaf', marginTop: '4px' }}>Delivered PO value</div>
          </div>
          <div className="po-stat-icon psi-purple" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--primary-light)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
      </div>

      {activeTab === 'list' && (
        <div style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e6eaed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e6eaed', borderRadius: '5px', padding: '6px 10px', width: '240px', background: '#fff' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#a6aaaf" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search PO or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
              />
            </div>
            <div style={{ fontSize: '12.5px', color: '#646b72', fontWeight: 600 }}>
              Showing {filtered.length} purchase orders
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fb' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>PO Reference</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Supplier</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Date</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Items Summary</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Amount</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2e6bc5' }}>{po.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#212b36' }}>{po.supplier}</td>
                    <td style={{ padding: '12px 16px', color: '#646b72' }}>{po.date}</td>
                    <td style={{ padding: '12px 16px', color: '#212b36' }}>{po.items}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#092c4c' }}>₹{Number(po.total).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: po.status === 'Delivered' ? '#dcfce7' : '#fef3c7', color: po.status === 'Delivered' ? '#15803d' : '#92400e' }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedPO(po)}
                        style={{ width: '28px', height: '28px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#646b72" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', overflow: 'hidden', padding: '24px', maxWidth: '720px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#092c4c', margin: '0 0 16px 0' }}>
            New Supplier Purchase Order
          </h3>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px' }}>Select Supplier *</label>
              <select
                value={createForm.supplier}
                onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13.5px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="Acme Electronics Ltd">Acme Electronics Ltd</option>
                <option value="Apex Footwear Co.">Apex Footwear Co.</option>
                <option value="Zenith Apparel India">Zenith Apparel India</option>
                <option value="Omni Gadgets Dist.">Omni Gadgets Dist.</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px' }}>Product Items Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 15 Pro Max, 256GB Titanium"
                value={createForm.items}
                onChange={(e) => setCreateForm({ ...createForm, items: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px' }}>Order Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={createForm.qty}
                  onChange={(e) => setCreateForm({ ...createForm, qty: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '6px' }}>Unit Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={createForm.unitPrice}
                  onChange={(e) => setCreateForm({ ...createForm, unitPrice: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e6eaed', paddingTop: '16px', marginTop: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#092c4c' }}>
                Est. Total: ₹{(Number(createForm.qty) * Number(createForm.unitPrice)).toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#646b72' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '5px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit PO</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* PO VIEW MODAL */}
      {selectedPO && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e6eaed', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#212b36', margin: 0 }}>PO Details: {selectedPO.id}</h3>
              <button onClick={() => setSelectedPO(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#646b72' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div><strong>Supplier:</strong> {selectedPO.supplier}</div>
              <div><strong>Order Date:</strong> {selectedPO.date}</div>
              <div><strong>Items:</strong> {selectedPO.items}</div>
              <div><strong>Total Amount:</strong> ₹{Number(selectedPO.total).toLocaleString('en-IN')}</div>
              <div><strong>Status:</strong> {selectedPO.status}</div>
              <div><strong>Payment:</strong> {selectedPO.payment}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedPO(null)} style={{ padding: '8px 16px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
