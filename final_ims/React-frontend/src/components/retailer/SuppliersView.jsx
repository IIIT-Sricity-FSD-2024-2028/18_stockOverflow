import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    contact: '',
    category: 'General',
    paymentTerms: 'Net 30',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getSuppliers();
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load suppliers:', e);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await retailerApi.createSupplier(form).catch(() => ({
        id: `SUP-00${suppliers.length + 1}`,
        ...form,
        rating: '5.0',
        status: 'Active',
      }));
      setSuppliers([created, ...suppliers]);
      setIsModalOpen(false);
      setForm({ name: '', email: '', phone: '', contact: '', category: 'General', paymentTerms: 'Net 30' });
    } catch (err) {
      console.error('Error creating supplier:', err);
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.name || s.companyName || s.business?.companyName || '').toLowerCase();
    const email = (s.email || s.businessEmail || s.business?.businessEmail || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="content" style={{ padding: '22px 26px 40px', maxWidth: '1180px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-.4px', color: '#1a1d2e', margin: 0 }}>
            Suppliers
          </h1>
          <p className="page-subtitle" style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '3px' }}>
            Manage and view verified supplier accounts and procurement directory
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            background: '#2e6bc5',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Supplier
        </button>
      </div>

      {/* SUPPLIERS TABLE PANEL */}
      <div className="panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <div className="panel-title" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-.2px', color: '#1a1d2e' }}>
            Supplier List ({filtered.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', width: '220px', background: '#fff' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
            />
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', fontFamily: "'Nunito Sans', sans-serif" }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Supplier Name
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Contact
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Category
                </th>
                <th style={{ textAlign: 'left', padding: '9px 15px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e5e7eb' }}>
                  Rating
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
              {filtered.map((s) => {
                const name = s.name || s.companyName || s.business?.companyName || 'Supplier';
                const email = s.email || s.businessEmail || s.business?.businessEmail || '-';
                const phone = s.phone || s.phoneNumber || s.business?.phoneNumber || '-';
                const cat = s.category || 'General';
                const rating = s.rating || '4.8';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <div className="supplier-cell" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div className="avatar-sm" style={{ width: '32px', height: '32px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11.5px', fontWeight: 700, color: '#fff', background: s.color || '#5b67ca' }}>
                          {name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="supplier-name" style={{ fontWeight: 600, fontSize: '12.5px', color: '#1a1d2e' }}>{name}</div>
                          <div className="supplier-id" style={{ fontSize: '11px', color: '#9ca3af' }}>{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12.5px', color: '#1a1d2e', fontWeight: 600 }}>{email}</div>
                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>{phone}</div>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 700 }}>
                        {cat}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <div className="rating-cell" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="star" style={{ color: '#f59e0b', fontSize: '12px' }}>★</span>
                        <span style={{ fontWeight: 700, color: '#1a1d2e' }}>{rating}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                      <span className="status-pill" style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button style={{ width: '30px', height: '30px', border: '1px solid #e5e7eb', borderRadius: '5px', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '480px', maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e' }}>Add New Supplier</div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '4px' }}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" required placeholder="e.g. Acme Supplies Ltd" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '4px' }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="email" required placeholder="supplier@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '4px' }}>Phone</label>
                  <input type="text" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '4px' }}>Contact Person</label>
                  <input type="text" placeholder="Contact Manager" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a1d2e', marginBottom: '4px' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#2e6bc5', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
