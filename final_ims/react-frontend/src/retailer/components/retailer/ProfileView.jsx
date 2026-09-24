import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

export default function ProfileView() {
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'John',
    businessName: user?.profile?.businessName || user?.store || "John's Retail Store",
    email: user?.email || 'john@gmail.com',
    phone: user?.profile?.businessPhone || '+91 98765 11111',
    address: user?.profile?.address || 'Main Commercial Market, Gujarat, India',
    city: 'Ahmedabad',
    retailerCode: user?.profile?.retailerCode || 'RET-101',
    gstin: '24AAACJ1234F1Z5',
    tier: 'Growth (₹799/mo)',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (user?.id) {
        await retailerApi.updateUser(user.id, {
          name: formData.name,
          profile: {
            ...user.profile,
            ...formData,
          },
        });
        if (refreshUser) await refreshUser();
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100%', padding: '28px', boxSizing: 'border-box' }}>
      <div className="shell" style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '22px' }}>
        {/* LEFT HERO CARD */}
        <div className="card hero-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', boxShadow: '0 20px 50px rgba(15,23,42,.06)', padding: '28px', height: 'fit-content', position: 'sticky', top: '24px' }}>
          <div className="avatar-lg" style={{ width: '78px', height: '78px', borderRadius: '24px', background: 'linear-gradient(135deg,#2e6bc5,#4f7de2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, marginBottom: '18px' }}>
            {formData.name.charAt(0)}
          </div>
          <div className="eyebrow" style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#2e6bc5', marginBottom: '8px' }}>
            Retailer Profile
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '28px', lineHeight: 1.15, color: '#122033' }}>
            {formData.name}
          </h1>
          <p style={{ margin: 0, color: '#667085', lineHeight: 1.55, fontSize: '14px' }}>
            {formData.businessName} • Code: <strong>{formData.retailerCode}</strong>
          </p>

          <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#eef4ff', color: '#2e6bc5', fontSize: '12px', fontWeight: 800 }}>
              Growth Plan Active
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 800 }}>
              Verified Retailer
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 800 }}>
              POS Outlet Ready
            </span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {success && (
            <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13.5px' }}>
              ✓ Retailer profile details updated successfully!
            </div>
          )}

          <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '22px', boxShadow: '0 20px 50px rgba(15,23,42,.06)', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#122033', margin: '0 0 16px 0' }}>
              Business Profile Details
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Retailer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Store Trade Name</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Primary City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122033', marginBottom: '6px' }}>Operating Business Address</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13.5px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2e6bc5',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
