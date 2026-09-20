import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Mumbai',
    orders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load customers:', e);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q);
    const matchStatus = statusFilter === 'all' || (c.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const added = {
      id: `CUST-00${customers.length + 1}`,
      ...newCustomer,
      status: 'Active',
      color: '#5b67ca',
    };
    setCustomers([added, ...customers]);
    setIsModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', location: 'Mumbai', orders: 0, totalSpent: 0 });
  };

  return (
    <div className="page-wrap" style={{ padding: '24px 28px 40px', flex: 1, overflow: 'auto' }}>
      {/* PAGE HEADER */}
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div className="page-head-left">
          <div className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Customers
          </div>
          <div className="page-subtitle" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>
            Manage loyalty shoppers, customer history and directory
          </div>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '5px', border: 'none', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* METRIC CARDS - 4 Column */}
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        <div className="metric-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-blue" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef3fc', color: '#2e6bc5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Customers</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{customers.length}</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>+12%</span>
              <span className="metric-sub" style={{ fontSize: '11.5px', color: '#a6aaaf' }}>vs last mo</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-green" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dcfce7', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Active Customers</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{customers.length}</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>100%</span>
              <span className="metric-sub" style={{ fontSize: '11.5px', color: '#a6aaaf' }}>engagement</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-purple" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>New This Month</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>2</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#ede9fe', color: '#7c3aed' }}>+50%</span>
              <span className="metric-sub" style={{ fontSize: '11.5px', color: '#a6aaaf' }}>trend</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-orange" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ffedd5', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Reward Members</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>3</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="metric-badge badge-neutral" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>75%</span>
              <span className="metric-sub" style={{ fontSize: '11.5px', color: '#a6aaaf' }}>enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="table-card" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div className="table-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e6eaed', gap: '14px', flexWrap: 'wrap' }}>
          <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="tbl-search" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e6eaed', borderRadius: '5px', padding: '6px 12px', background: '#fff', width: '230px' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a6aaaf" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
              />
            </div>
          </div>
          <div className="toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className={`sf-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1.5px solid #e6eaed',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#2e6bc5' : '#fff',
                color: statusFilter === 'all' ? '#fff' : '#646b72',
              }}
            >
              All ({customers.length})
            </div>
            <div
              className={`sf-pill ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1.5px solid #e6eaed',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === 'active' ? '#2e6bc5' : '#fff',
                color: statusFilter === 'active' ? '#fff' : '#646b72',
              }}
            >
              Active ({customers.length})
            </div>
          </div>
        </div>

        {/* Table Proper */}
        <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
          <table className="cust-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif" }}>
            <thead>
              <tr style={{ background: '#f8f9fb' }}>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Customer</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Contact Details</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Location</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Orders</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Spent</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
                <th style={{ padding: '10px 18px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.color || '#5b67ca', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                        {c.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#212b36', fontSize: '13.5px' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: '#a6aaaf' }}>{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '13px', color: '#212b36', fontWeight: 600 }}>{c.email}</div>
                    <div style={{ fontSize: '11.5px', color: '#646b72' }}>{c.phone}</div>
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle', fontWeight: 600, color: '#646b72', fontSize: '13px' }}>
                    {c.location || 'Mumbai'}
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle', fontWeight: 700, color: '#092c4c', fontSize: '13px' }}>
                    {c.orders || c.totalOrders || 0} orders
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle', fontWeight: 800, color: '#092c4c', fontSize: '13.5px' }}>
                    ₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

      {/* ADD CUSTOMER MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '460px', maxWidth: '90%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e6eaed', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#212b36' }}>Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#a6aaaf' }}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#212b36', marginBottom: '5px' }}>City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={newCustomer.location}
                  onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6eaed', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e6eaed', borderRadius: '6px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#646b72' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#2e6bc5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
