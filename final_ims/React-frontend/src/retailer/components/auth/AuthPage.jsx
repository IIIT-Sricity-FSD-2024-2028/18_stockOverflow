import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

export default function AuthPage({
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  onOpenBillerPending,
  onOpenRetailerSetup,
  onSwitchModule,
}) {
  const { login, register, saveSession } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('retailer');

  const handleFillDemoRetailer = () => {
    setLoginEmail('john@gmail.com');
    setLoginPassword('pass1234');
    setError('');
  };

  const handleFillDemoBiller = () => {
    setLoginEmail('jones@gmail.com');
    setLoginPassword('pass1234');
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = loginEmail.trim();
      const password = loginPassword;
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }

      const user = await login(email, password);
      const role = (user.role || 'consumer').toLowerCase();

      if (role === 'biller') {
        try {
          const requests = await retailerApi.getBillerRequests();
          const userRequest = Array.isArray(requests) ? requests.find((r) => r.email === user.email) : null;

          if (userRequest && userRequest.status === 'rejected') {
            setError('Your biller account request was rejected by the retailer.');
            setLoading(false);
            return;
          }

          const hasStoreAccess = Boolean(
            (user.profileId || user.profile?.retailerId) &&
            (user.currentStoreId || user.storeId)
          );
          if (!hasStoreAccess || (userRequest && userRequest.status === 'pending')) {
            localStorage.setItem('biller_pending_email', user.email);
            if (onOpenBillerPending) {
              onOpenBillerPending(user.email);
              return;
            }
          }
        } catch (bErr) {
          console.warn('Error checking biller status:', bErr);
        }
      }

      if (role === 'retailer') {
        const hasProfile = Boolean(
          (user.profile && (user.profile.businessName || (Array.isArray(user.profile.stores) && user.profile.stores.length > 0))) ||
          (user.store && user.profileId && user.profileId !== user.id)
        );
        if (!hasProfile) {
          if (onOpenRetailerSetup) {
            onOpenRetailerSetup(user);
            return;
          }
        }
      }

      if (role === 'supplier') {
        if (onSwitchModule) {
          onSwitchModule('supplier');
          return;
        }
      }

      if (role === 'consumer' || role === 'customer') {
        if (onSwitchModule) {
          onSwitchModule('consumer');
          return;
        }
      }

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('unauthorized')) {
        setError(`Invalid email or password. If you don't have an account yet, please create an account below.`);
      } else {
        setError(errMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;
    const role = regRole.toLowerCase();

    if (name.length < 3) {
      setError('Please enter your full name (at least 3 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
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
    if (!role) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        status: 'Active',
      };

      const created = await register(payload);
      const session = saveSession(created);

      if (role === 'biller') {
        try {
          await retailerApi.createBillerRequest({
            name,
            email,
            phone: 'Not provided',
            company: `${name} Biller Request`,
            country: 'India',
          });
        } catch (reqErr) {
          console.warn('Failed to submit biller request after registration:', reqErr);
        }

        localStorage.setItem('biller_pending_email', email);
        if (onOpenBillerPending) {
          onOpenBillerPending(email);
          return;
        }
      }

      if (role === 'retailer') {
        if (onOpenRetailerSetup) {
          onOpenRetailerSetup(session);
          return;
        }
      }

      if (role === 'supplier') {
        if (onSwitchModule) {
          onSwitchModule('supplier');
          return;
        }
      }

      if (role === 'consumer' || role === 'customer') {
        if (onSwitchModule) {
          onSwitchModule('consumer');
          return;
        }
      }

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', width: '100%', background: '#fff' }}>
      {/* Form Side */}
      <div className="auth-form-side" style={{ flex: 1, padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '580px', margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div
            className="brand"
            onClick={onClose}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}
          >
            <div className="brand-icon" style={{ width: '32px', height: '32px', background: '#2563EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
              </svg>
            </div>
            Stock Overflow
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '14px', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Back to Home
            </button>
          )}
        </div>

        {/* Header */}
        <div className="auth-header" style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
            {mode === 'login' ? 'Sign In' : 'Create an Account'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {mode === 'login'
              ? 'Access the Stock Overflow dashboard using your email and password.'
              : 'Join Stock Overflow and start managing your inventory efficiently.'}
          </p>
        </div>

        {/* Demo Account Quick-Fill Card (Login Mode only) */}
        {mode === 'login' && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Quick Demo Accounts
                </div>
                <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 600, marginTop: '2px' }}>
                  Retailer: john@gmail.com | Cashier: jones@gmail.com
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleFillDemoRetailer}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Auto-fill Retailer Store Owner"
                >
                  Retailer
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoBiller}
                  style={{
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Auto-fill Biller / POS Cashier"
                >
                  Biller (POS)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div>{error}</div>
            {mode === 'login' && loginEmail && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegEmail(loginEmail);
                  setRegPassword(loginPassword);
                  setRegConfirmPassword(loginPassword);
                  setRegName(loginEmail.split('@')[0]);
                  setError('');
                }}
                style={{
                  background: '#b91c1c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Create Account for {loginEmail} →
              </button>
            )}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form id="loginForm" onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  style={{ paddingLeft: '40px', height: '44px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="your.email@example.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '45px', height: '44px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="••••••••"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please use demo login credentials: john@gmail.com / pass1234'); }} style={{ color: '#2563eb', fontWeight: 600 }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-footer" style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '14px', color: '#64748b' }}>
              New to Stock Overflow?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Create an account
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form id="registerForm" onSubmit={handleRegisterSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px', height: '42px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="John Doe"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '40px', height: '42px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="youremail@sample.com"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '45px', height: '42px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="••••••••"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div className="input-icon-group" style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '45px', height: '42px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="••••••••"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.4rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                className="form-control"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                style={{ height: '42px', width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', paddingLeft: '14px' }}
              >
                <option value="retailer">Retailer (Store Owner)</option>
                <option value="supplier">Supplier</option>
                <option value="consumer">Customer</option>
              </select>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Want to become a cashier? Apply via the <strong>Become a Biller</strong> button on the home page.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-footer" style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '14px', color: '#64748b' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Log In
              </button>
            </div>
          </form>
        )}

        <div className="copyright" style={{ marginTop: 'auto', paddingTop: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
          © 2026 Stock Overflow. All rights reserved.
        </div>
      </div>

      {/* Image Side */}
      <div className="auth-image-side" style={{ flex: 1, display: 'block', overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={mode === 'login' ? '/assets/workers.jpeg' : '/assets/warehouse-empl.jpeg'}
          alt="Stock Overflow Warehouse"
          className="hero-dashboard-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  );
}
