import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function ReturnsView() {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    party: '',
    email: '',
    orderId: 'ORD-2026-001',
    productName: '',
    sku: 'SKU-001',
    qty: 1,
    amount: 1500,
    reason: 'Damaged Goods',
    method: 'Original Payment',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await retailerApi.getReturns().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((r) => ({
          id: r.id,
          orderId: r.orderId || 'ORD-2026-001',
          party: r.customer || r.party || r.supplier || 'Customer',
          email: r.email || 'customer@example.com',
          productName: r.productName || r.product || 'Purchased Item',
          sku: r.sku || 'SKU-ITEM',
          qty: Number(r.qty) || 1,
          amount: Number(r.refundAmount || r.amount) || 1500,
          reason: r.reason || 'Damaged Goods',
          method: r.refundMethod || r.method || 'Store Credit',
          status: r.status || 'Pending',
          date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'),
        }));
        setReturns(mapped);
        if (!selectedReturn && mapped.length > 0) setSelectedReturn(mapped[0]);
      } else {
        const defaultReturns = [
          {
            id: 'RET-001',
            orderId: 'ORD-8921',
            party: 'Rajesh Sharma',
            email: 'rajesh.s@example.com',
            productName: 'Beats Studio Pro Headphones',
            sku: 'PT002',
            qty: 1,
            amount: 8999,
            reason: 'Defective audio channel',
            method: 'Original Payment',
            status: 'Pending',
            date: '19 Sep 2026',
          },
          {
            id: 'RET-002',
            orderId: 'ORD-8714',
            party: 'Sneha Patel',
            email: 'sneha.p@example.com',
            productName: 'Nike Air Jordan 1 Low',
            sku: 'PT003',
            qty: 1,
            amount: 7499,
            reason: 'Incorrect size delivered',
            method: 'Store Credit',
            status: 'Approved',
            date: '17 Sep 2026',
          },
          {
            id: 'RET-003',
            orderId: 'PO-2026-012',
            party: 'Acme Electronics Ltd',
            email: 'returns@acme.com',
            productName: 'Echo Dot 5th Gen (Bulk)',
            sku: 'PT005',
            qty: 5,
            amount: 14500,
            reason: 'Vendor transit damage',
            method: 'Bank Transfer',
            status: 'Completed',
            date: '14 Sep 2026',
          },
        ];
        setReturns(defaultReturns);
        setSelectedReturn(defaultReturns[0]);
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      retailerId: user?.retailerId,
      storeId: user?.storeId || user?.currentStoreId,
      orderId: form.orderId,
      customer: form.party,
      email: form.email,
      productName: form.productName,
      sku: form.sku,
      qty: Number(form.qty),
      refundAmount: Number(form.amount),
      amount: Number(form.amount),
      reason: form.reason,
      refundMethod: form.method,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    try {
      const created = await retailerApi.createReturn(payload).catch(() => ({
        id: `RET-00${returns.length + 1}`,
        ...payload,
      }));

      const newEntry = {
        id: created.id || `RET-00${returns.length + 1}`,
        ...payload,
        party: form.party,
      };

      setReturns([newEntry, ...returns]);
      setSelectedReturn(newEntry);
      setIsCreateModalOpen(false);
      showToast(`Return request #${newEntry.id} created successfully.`);
    } catch (err) {
      console.error('Failed to create return:', err);
    }
  };

  const handleUpdateStatus = async (id, newStatus, notes = '') => {
    const target = returns.find((r) => r.id === id);
    if (!target) return;
    if (target.status !== 'Pending') {
      showToast(`Return #${id} has already been processed as ${target.status} and cannot be modified.`);
      return;
    }

    try {
      await retailerApi.updateReturn(id, { status: newStatus, notes });
      const updatedList = returns.map((r) => (r.id === id ? { ...r, status: newStatus, notes: notes || r.notes } : r));
      setReturns(updatedList);
      if (selectedReturn?.id === id) {
        setSelectedReturn({ ...selectedReturn, status: newStatus, notes: notes || selectedReturn.notes });
      }
      showToast(`Return #${id} status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update return status:', err);
      showToast(err?.message || `Failed to update return #${id}.`);
    }
  };

  const totalReturnVal = returns.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingCount = returns.filter((r) => r.status === 'Pending').length;
  const approvedCount = returns.filter((r) => r.status === 'Approved' || r.status === 'Completed').length;

  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.id || '').toLowerCase().includes(q) ||
      (r.party || '').toLowerCase().includes(q) ||
      (r.productName || '').toLowerCase().includes(q) ||
      (r.orderId || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="content" style={{ padding: '22px 26px 40px', maxWidth: '1180px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-.4px', color: '#1a1d2e', margin: 0 }}>
            Returns & RMA Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '3px' }}>
            Process customer returns, replacement authorizations, and vendor damage claims
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            background: '#2e6bc5',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '13px',
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
          Log Return Request
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', fontWeight: 600 }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Return Claims</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1d2e' }}>{returns.length}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Logged RMA records</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Pending Authorization</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1d2e' }}>{pendingCount}</div>
            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>Requires inspection</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Approved & Resolved</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1d2e' }}>{approvedCount}</div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>Credit released</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>Total Refund Value</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>₹{totalReturnVal.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Processed refunds</div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: TABLE + DETAIL CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
        {/* LEFT: TABLE */}
        <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '10px' }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
              {['all', 'pending', 'approved', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '5px 10px',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    background: statusFilter === tab ? '#2e6bc5' : '#fff',
                    color: statusFilter === tab ? '#fff' : '#6b7280',
                    borderRight: '1px solid #e5e7eb',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', width: '180px', background: '#fff' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%' }}
              />
            </div>
          </div>

          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Return ID</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Party / Customer</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Refund Amount</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isSel = selectedReturn?.id === r.id;
                  const statusColors = {
                    pending: { bg: '#fef3c7', text: '#92400e' },
                    approved: { bg: '#dcfce7', text: '#15803d' },
                    completed: { bg: '#e0e7ff', text: '#3730a3' },
                    rejected: { bg: '#fee2e2', text: '#b91c1c' },
                  };
                  const st = statusColors[r.status.toLowerCase()] || statusColors.pending;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReturn(r)}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        background: isSel ? '#f0f7ff' : '#fff',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#dc2626' }}>{r.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1d2e' }}>{r.party}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{r.orderId}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>
                        <div>{r.productName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.reason}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a1d2e' }}>
                        ₹{r.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700, background: st.bg, color: st.text }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        {r.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <button
                              title="Approve Return"
                              onClick={() => setPendingAction({ action: 'approve', returnItem: r, notes: '' })}
                              style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}
                            >
                              ✓
                            </button>
                            <button
                              title="Reject Return"
                              onClick={() => setPendingAction({ action: 'reject', returnItem: r, notes: '' })}
                              style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: DETAIL CARD */}
        <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div className="panel-header" style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', background: '#fafbfc' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>Return Details & Actions</h3>
          </div>
          {selectedReturn ? (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1d2e' }}>{selectedReturn.id}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Ref: {selectedReturn.orderId}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                  {selectedReturn.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Customer / Source</div>
                <div style={{ fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{selectedReturn.party}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedReturn.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Returned Item</div>
                <div style={{ fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{selectedReturn.productName}</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>SKU: {selectedReturn.sku} &bull; Qty: {selectedReturn.qty}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Claim Reason</div>
                <div style={{ color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>{selectedReturn.reason}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Refund Amount</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e' }}>₹{selectedReturn.amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Refund Mode</div>
                  <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#2e6bc5' }}>{selectedReturn.method}</div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Process Claim Action:</div>
                {selectedReturn.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => setPendingAction({ action: 'approve', returnItem: selectedReturn, notes: '' })}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#22c55e',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve Return & Restock
                    </button>
                    <button
                      onClick={() => setPendingAction({ action: 'reject', returnItem: selectedReturn, notes: '' })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fee2e2',
                        background: '#fff',
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Reject Return Request
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      background: selectedReturn.status.toLowerCase().includes('reject') ? '#fef2f2' : '#f1f5f9',
                      color: selectedReturn.status.toLowerCase().includes('reject') ? '#b91c1c' : '#475569',
                      border: selectedReturn.status.toLowerCase().includes('reject') ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {selectedReturn.status.toLowerCase().includes('reject') ? (
                      <>Processed as Rejected ✕</>
                    ) : (
                      <>Processed as {selectedReturn.status} ✓</>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              Select a return record to view details and execute actions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE RETURN MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '480px', maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#1a1d2e' }}>Log Return Claim</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Customer / Party *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={form.party}
                    onChange={(e) => setForm({ ...form, party: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Order / PO Ref *</label>
                  <input
                    type="text"
                    required
                    placeholder="ORD-8921"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Product SKU</label>
                  <input
                    type="text"
                    placeholder="SKU-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beats Studio Pro Headphones"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Refund Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Reason</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Damaged Goods">Damaged Goods</option>
                    <option value="Defective / Quality Issue">Defective / Quality Issue</option>
                    <option value="Incorrect Item Shipped">Incorrect Item Shipped</option>
                    <option value="Size / Fit Issue">Size / Fit Issue</option>
                    <option value="Customer Dissatisfied">Customer Dissatisfied</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Refund Method</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Original Payment">Original Payment</option>
                    <option value="Store Credit">Store Credit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Replacement Item">Replacement Item</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ACTION CONFIRMATION MODAL */}
      {pendingAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingAction(null);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              width: '440px',
              maxWidth: 'calc(100vw - 32px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafbfc',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#1a1d2e' }}>
                {pendingAction.action === 'approve'
                  ? `Approve Return ${pendingAction.returnItem.id}`
                  : `Reject Return ${pendingAction.returnItem.id}`}
              </h3>
              <button
                onClick={() => setPendingAction(null)}
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                {pendingAction.action === 'approve' ? (
                  <>
                    Approving will authorize a refund of{' '}
                    <strong style={{ color: '#1a1d2e' }}>
                      ₹{pendingAction.returnItem.amount?.toLocaleString('en-IN')}
                    </strong>{' '}
                    and sync restocked units back to your inventory.
                  </>
                ) : (
                  <>
                    Rejecting will decline return request{' '}
                    <strong style={{ color: '#1a1d2e' }}>#{pendingAction.returnItem.id}</strong> and notify the customer/requester.
                  </>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Notes / Comments (optional)
                </label>
                <textarea
                  placeholder="Provide any processing notes..."
                  value={pendingAction.notes}
                  onChange={(e) => setPendingAction({ ...pendingAction, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '75px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                background: '#fafbfc',
              }}
            >
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = pendingAction.returnItem.id;
                  const newStatus = pendingAction.action === 'approve' ? 'Approved' : 'Rejected';
                  const notes = pendingAction.notes;
                  setPendingAction(null);
                  handleUpdateStatus(targetId, newStatus, notes);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: pendingAction.action === 'approve' ? '#22c55e' : '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {pendingAction.action === 'approve' ? 'Approve & Restock' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
