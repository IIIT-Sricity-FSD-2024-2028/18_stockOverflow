import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function BillerModal({ isOpen, onClose, onRedirectPending, onBillerLoginSuccess }) {
  const { register, login, saveSession } = useAuth();
  const [tab, setTab] = useState('apply'); // 'apply' | 'login'
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Apply Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('India');
  const [selectedStoreId, setSelectedStoreId] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Load stores for retailer dropdown
    setLoadingStores(true);
    retailerApi
      .getStores()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
          setSelectedStoreId(data[0].id || data[0].code || '');
        } else {
          // Default fallback stores
          setStores([
            { id: 'STORE-01', code: 'STORE-01', name: "John's Kirana Store", location: 'Downtown Mumbai', retailerId: 'RET-01' },
            { id: 'STORE-02', code: 'STORE-02', name: "Eastern Supermarket", location: 'Kolkata Sector V', retailerId: 'RET-02' },
          ]);
          setSelectedStoreId('STORE-01');
        }
      })
      .catch((err) => {
        console.warn('Error loading stores for biller modal:', err);
        setStores([
          { id: 'STORE-01', code: 'STORE-01', name: "John's Kirana Store", location: 'Downtown Mumbai', retailerId: 'RET-01' },
        ]);
        setSelectedStoreId('STORE-01');
      })
      .finally(() => setLoadingStores(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword || !phone.trim() || !company.trim() || !country.trim() || !selectedStoreId) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const selectedStore = stores.find((s) => (s.id || s.code) === selectedStoreId);
      const retailerId = selectedStore ? selectedStore.retailerId || selectedStore.id || '' : '';

      // 1. Create biller user account
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: 'biller',
        status: 'Active',
      });

      // 2. Submit biller request to retailer
      await retailerApi.createBillerRequest({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: company.trim(),
        country: country.trim(),
        retailerId: retailerId || selectedStoreId,
        storeId: selectedStoreId,
      });

      // 3. Store pending email
      localStorage.setItem('biller_pending_email', email.trim().toLowerCase());

      onClose();
      if (onRedirectPending) {
        onRedirectPending(email.trim().toLowerCase());
      }
    } catch (err) {
      console.error('Biller apply error:', err);
      setError(err.message || 'Failed to submit biller request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(loginEmail.trim(), loginPassword);

      if (user.role !== 'biller') {
        setError('This portal is for billers. Please use main login for other roles.');
        setSubmitting(false);
        return;
      }

      // Check biller request status
      const requests = await retailerApi.getBillerRequests().catch(() => []);
      const userRequest = Array.isArray(requests)
        ? requests.find((r) => r.email?.toLowerCase() === user.email?.toLowerCase())
        : null;

      if (userRequest && userRequest.status === 'rejected') {
        setError('Your biller application was declined by the retailer.');
        setSubmitting(false);
        return;
      }

      const hasStoreAccess = Boolean(user.profileId && (user.currentStoreId || user.storeId));

      if (userRequest?.status === 'pending' || !hasStoreAccess) {
        localStorage.setItem('biller_pending_email', user.email);
        onClose();
        if (onRedirectPending) {
          onRedirectPending(user.email);
        }
        return;
      }

      // Approved biller with store access
      onClose();
      if (onBillerLoginSuccess) {
        onBillerLoginSuccess(user);
      }
    } catch (err) {
      console.error('Biller login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '14px',
          width: '92%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              🧾
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1d2e', margin: 0 }}>
              Biller Portal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setTab('apply'); setError(''); }}
            style={{
              flex: 1,
              padding: '13px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              color: tab === 'apply' ? '#2563eb' : '#64748b',
              borderBottom: tab === 'apply' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Apply to Become Biller
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '13px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              color: tab === 'login' ? '#2563eb' : '#64748b',
              borderBottom: tab === 'login' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Login as Biller
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ margin: '16px 24px 0', background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 24px' }}>
          {tab === 'apply' ? (
            /* Apply Form */
            <form onSubmit={handleApplySubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Phone <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Country <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Company / Organization Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Express Billing Ltd."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Select Retailer Store to Apply Under <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none', background: '#fff' }}
                >
                  <option value="">Choose a retailer store...</option>
                  {stores.map((s) => (
                    <option key={s.id || s.code} value={s.id || s.code}>
                      {s.name} ({s.location || s.address || 'Outlet'})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Your request will be submitted to this retailer's Billers management section for approval.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '9px 24px', fontWeight: 700, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Submitting Request...' : 'Submit Request & Go to Waiting Page'}
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Biller Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '9px 24px', fontWeight: 700, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Verifying...' : 'Login as Biller'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
