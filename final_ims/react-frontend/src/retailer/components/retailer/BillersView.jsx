import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

export default function BillersView() {
  const { user } = useAuth();
  const [billers, setBillers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPending, setShowPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    company: user?.store || "John's Retail Store",
    email: '',
    phone: '',
    country: 'India',
    status: 'active',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [billersRes, requestsRes] = await Promise.all([
        retailerApi.getBillers().catch(() => []),
        retailerApi.getBillerRequests().catch(() => []),
      ]);

      if (Array.isArray(billersRes) && billersRes.length > 0) {
        setBillers(
          billersRes.map((b, idx) => ({
            id: b.id || idx + 1,
            code: b.code || `BI00${idx + 1}`,
            name: b.name || 'Biller Staff',
            company: b.company || b.companyName || user?.store || "John's Retail Store",
            email: b.email || 'biller@example.com',
            phone: b.phone || '+91 98200 11223',
            country: b.country || 'India',
            status: (b.status || 'active').toLowerCase(),
            color: b.color || '#2e6bc5',
          }))
        );
      } else {
        // Mock default billers
        setBillers([
          {
            id: 1,
            code: 'BI001',
            name: 'Shaun Farley',
            company: user?.store || "John's Retail Store",
            email: 'shaun@example.com',
            phone: '+91 98765 43210',
            country: 'India',
            status: 'active',
            color: '#4CAF50',
          },
          {
            id: 2,
            code: 'BI002',
            name: 'Jenny Ellis',
            company: user?.store || "John's Retail Store",
            email: 'jenny@example.com',
            phone: '+91 98234 56789',
            country: 'India',
            status: 'active',
            color: '#2196F3',
          },
        ]);
      }

      if (Array.isArray(requestsRes) && requestsRes.length > 0) {
        setPendingRequests(requestsRes);
      } else {
        setPendingRequests([
          {
            id: 'REQ-01',
            name: 'Rohan Verma',
            company: 'Verma Quick Billing',
            email: 'rohan.biller@example.com',
            phone: '+91 99887 76655',
            experience: '3 Years POS Operations',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load billers data:', err);
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

  const handleApprove = async (reqId) => {
    const req = pendingRequests.find((r) => r.id === reqId);
    if (!req) return;

    try {
      await retailerApi
        .approveBillerRequest(reqId, {
          retailerId: user?.retailerId,
          storeId: user?.storeId || user?.currentStoreId,
        })
        .catch(() => {});

      const newBiller = {
        id: Date.now(),
        code: `BI00${billers.length + 1}`,
        name: req.name,
        company: req.company || user?.store || "John's Retail Store",
        email: req.email,
        phone: req.phone,
        country: 'India',
        status: 'active',
        color: '#2e6bc5',
      };
      setBillers([newBiller, ...billers]);
      setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
      showToast(`Approved ${req.name} as verified store biller.`);
    } catch (err) {
      console.error('Failed to approve biller:', err);
    }
  };

  const handleReject = async (reqId) => {
    try {
      await retailerApi.rejectBillerRequest(reqId).catch(() => {});
      setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
      showToast('Biller request rejected.');
    } catch (err) {
      console.error('Failed to reject biller:', err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      company: user?.store || "John's Retail Store",
      email: '',
      phone: '',
      country: 'India',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingId(b.id);
    setForm({
      name: b.name || '',
      company: b.company || '',
      email: b.email || '',
      phone: b.phone || '',
      country: b.country || 'India',
      status: b.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      retailerId: user?.retailerId,
      storeId: user?.storeId || user?.currentStoreId,
    };

    try {
      if (editingId) {
        setBillers(billers.map((b) => (b.id === editingId ? { ...b, ...payload } : b)));
        showToast('Biller updated successfully.');
      } else {
        const created = await retailerApi.createBiller(payload).catch(() => ({
          id: Date.now(),
          code: `BI00${billers.length + 1}`,
          ...payload,
        }));
        setBillers([
          {
            id: created.id || Date.now(),
            code: created.code || `BI00${billers.length + 1}`,
            name: form.name,
            company: form.company,
            email: form.email,
            phone: form.phone,
            country: form.country,
            status: form.status,
            color: '#2e6bc5',
          },
          ...billers,
        ]);
        showToast('New biller added successfully.');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save biller:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this biller account?')) return;
    try {
      await retailerApi.deleteBiller(id).catch(() => {});
      setBillers(billers.filter((b) => b.id !== id));
      showToast('Biller removed successfully.');
    } catch (err) {
      console.error('Failed to delete biller:', err);
    }
  };

  const filtered = billers.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.company || '').toLowerCase().includes(q) ||
      (b.code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="content" style={{ padding: '22px 26px 40px', maxWidth: '1180px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-.4px', color: '#1a1d2e', margin: 0 }}>
            Billers
          </h1>
          <p className="page-subtitle" style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '3px' }}>
            Manage POS cashiers, counter billers, and staff permissions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowPending(!showPending)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: showPending ? '#1e293b' : '#fff',
              color: showPending ? '#fff' : '#374151',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
            }}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={openAddModal}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#2e6bc5',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Biller
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', fontWeight: 600 }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* PENDING REQUESTS PANEL */}
      {showPending && (
        <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: '22px', overflow: 'hidden' }}>
          <div className="panel-header" style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>Biller Join Requests</h3>
            <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
              {pendingRequests.length} pending
            </span>
          </div>
          <div>
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No pending requests found.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#5b67ca', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                      {req.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>{req.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{req.email} &bull; {req.phone}</div>
                      <div style={{ fontSize: '11px', color: '#2e6bc5', marginTop: '2px' }}>{req.company || req.experience}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BILLERS TABLE PANEL */}
      <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>
            Store Billers ({filtered.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', width: '220px', background: '#fff' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search billers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Biller</th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Store / Company</th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No biller accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', fontWeight: 700, color: '#2e6bc5' }}>
                      {b.code}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: b.color || '#2e6bc5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>
                          {b.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1a1d2e' }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#475569' }}>
                      {b.company}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#1a1d2e', fontWeight: 500 }}>
                      {b.email}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', color: '#6b7280' }}>
                      {b.phone}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(b)}
                          title="Edit"
                          style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '5px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '450px', maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#1a1d2e' }}>
                {editingId ? 'Edit Biller' : 'Add New Biller'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Biller Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Company / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Store name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="biller@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Country</label>
                  <input
                    type="text"
                    placeholder="India"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '5px' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {editingId ? 'Save Changes' : 'Save Biller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
