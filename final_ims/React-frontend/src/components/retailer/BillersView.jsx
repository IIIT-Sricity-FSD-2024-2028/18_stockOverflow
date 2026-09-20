import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

export default function BillersView() {
  const { user } = useAuth();
  const [billers, setBillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPending, setShowPending] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getBillers();
        setBillers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load billers:', e);
        setBillers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    company: user?.store || "John's Retail Store",
  });

  const handleApprove = (reqId) => {
    const req = pendingRequests.find((r) => r.id === reqId);
    if (!req) return;
    const newBiller = {
      id: `BIL-00${billers.length + 1}`,
      code: `BIL-00${billers.length + 1}`,
      name: req.name,
      company: req.company,
      email: req.email,
      phone: req.phone,
      country: 'India',
      status: 'Active',
      color: '#3b82f6',
    };
    setBillers([newBiller, ...billers]);
    setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
  };

  const handleReject = (reqId) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `BIL-00${billers.length + 1}`,
      code: `BIL-00${billers.length + 1}`,
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      country: form.country,
      status: 'Active',
      color: '#5b67ca',
    };
    setBillers([created, ...billers]);
    setIsAddModalOpen(false);
    setForm({ name: '', email: '', phone: '', country: 'India', company: user?.store || "John's Retail Store" });
  };

  const filtered = billers.filter((b) => {
    const q = search.toLowerCase();
    return (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.code || '').toLowerCase().includes(q);
  });

  return (
    <div className="bl-content" style={{ padding: '22px 26px 40px', maxWidth: '1240px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="bl-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="bl-page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '18px', fontWeight: 700, lineHeight: '27px', color: '#212b36' }}>
            Billers
          </div>
          <div className="bl-breadcrumb" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#646b72', marginTop: '2px' }}>
            Dashboard &gt; Billers
          </div>
        </div>
        <div className="bl-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="bl-btn-primary"
            onClick={() => setShowPending(!showPending)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', background: showPending ? '#092c4c' : '#2e6bc5', borderRadius: '5px', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}
          >
            {showPending ? 'Hide Pending Requests' : `Load Pending Requests (${pendingRequests.length})`}
          </button>
          <button
            className="bl-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', background: '#2e6bc5', borderRadius: '5px', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}
          >
            <svg viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="1.5" width="13" height="13">
              <circle cx="6.5" cy="6.5" r="5.5" />
              <line x1="6.5" y1="4" x2="6.5" y2="9" />
              <line x1="4" y1="6.5" x2="9" y2="6.5" />
            </svg>
            Add Biller
          </button>
        </div>
      </div>

      {/* PENDING REQUESTS CARD */}
      {showPending && (
        <div className="bl-requests-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 1px rgba(198,198,198,.2)' }}>
          <div className="bl-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #e6eaed', background: '#f9fafb' }}>
            <h3 style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#212b36', margin: 0 }}>Pending Biller Requests</h3>
            <span className="bl-requests-count" style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {pendingRequests.length}
            </span>
          </div>
          <div className="bl-requests-list">
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No pending requests at this time.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="bl-request-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #e6eaed', background: '#fff' }}>
                  <div className="bl-request-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="bl-request-avatar" style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#5b67ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      {req.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                    </div>
                    <div className="bl-request-details" style={{ flex: 1 }}>
                      <div className="bl-request-name" style={{ fontWeight: 700, color: '#212b36', fontSize: '14px' }}>{req.name}</div>
                      <div className="bl-request-meta" style={{ fontSize: '12px', color: '#646b72' }}>{req.email} • {req.phone}</div>
                      <div className="bl-request-company" style={{ fontSize: '12px', color: '#9ca3af' }}>{req.company} ({req.role})</div>
                    </div>
                  </div>
                  <div className="bl-request-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      style={{ padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: '#22c55e', color: '#fff' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      style={{ padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: '#ef4444', color: '#fff' }}
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

      {/* TABLE CARD */}
      <div className="bl-table-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '5px', boxShadow: '0 1px 1px rgba(198,198,198,.2)', overflow: 'hidden', width: '100%' }}>
        {/* Table Toolbar */}
        <div className="bl-table-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e6eaed', gap: '16px' }}>
          <div className="bl-search" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e6eaed', borderRadius: '5px', padding: '6px 10px', width: '240px', background: '#fff' }}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" style={{ color: '#a6aaaf' }}>
              <circle cx="6" cy="6" r="4.5" />
              <line x1="9.5" y1="9.5" x2="13" y2="13" />
            </svg>
            <input
              type="text"
              placeholder="Search billers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: '#212b36', background: 'transparent', width: '100%' }}
            />
          </div>
          <div style={{ fontSize: '13px', color: '#646b72', fontWeight: 600 }}>
            Showing {filtered.length} active billers
          </div>
        </div>

        {/* Table proper */}
        <div className="bl-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="bl-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Code</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Biller</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Store Outlet</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Email</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Phone</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Country</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2e6bc5' }}>{b.code}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '5px', background: b.color || '#5b67ca', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>
                        {b.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 700, color: '#212b36', fontSize: '13px' }}>{b.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#646b72' }}>{b.company}</td>
                  <td style={{ padding: '12px 14px', color: '#646b72' }}>{b.email}</td>
                  <td style={{ padding: '12px 14px', color: '#646b72' }}>{b.phone}</td>
                  <td style={{ padding: '12px 14px', color: '#646b72' }}>{b.country}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px', background: '#dcfce7', color: '#15803d' }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button style={{ width: '28px', height: '28px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#646b72" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button style={{ width: '28px', height: '28px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#646b72" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BILLER MODAL */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e6eaed', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#212b36' }}>Add New Store Biller</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#646b72' }}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Biller Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Cashier"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Store Outlet</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '7px 14px', border: '1px solid #e6eaed', borderRadius: '5px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#646b72' }}>Cancel</button>
                <button type="submit" style={{ padding: '7px 16px', border: 'none', borderRadius: '5px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Biller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
