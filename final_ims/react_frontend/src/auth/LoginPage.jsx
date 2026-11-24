import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../store/auth-slice';
import { loginUser } from '../store/auth-actions';
import './auth.css';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  const errorMessage = validationError || authError || '';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(authActions.clearAuthError());

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    try {
      const session = await dispatch(loginUser(email, password));
      const role = String(session.role || 'consumer').toLowerCase();
      const status = String(session.profile?.profileStatus || session.status || 'Active').toLowerCase();

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }

      const hasRetailerProfile = Boolean(
        session.profileId ||
        (session.profile && (session.profile.businessName || (Array.isArray(session.profile.stores) && session.profile.stores.length > 0)))
      );
      const hasSupplierProfile = Boolean(
        session.profileId ||
        (session.profile && (session.profile.businessName || session.profile.companyName))
      );

      if (role === 'admin') {
        onNavigate('admin');
      } else if (role === 'employee') {
        onNavigate('employee');
      } else if (role === 'retailer') {
        if (!hasRetailerProfile) {
          onNavigate('retailer-wizard');
        } else if (status === 'pending' || status === 'rejected') {
          onNavigate('verification-pending');
        } else {
          onNavigate('retailer');
        }
      } else if (role === 'supplier') {
        if (!hasSupplierProfile) {
          onNavigate('supplier-wizard');
        } else if (status === 'pending' || status === 'rejected') {
          onNavigate('verification-pending');
        } else {
          onNavigate('supplier');
        }
      } else if (role === 'consumer') {
        onNavigate('consumer');
      } else if (role === 'biller') {
        onNavigate('biller');
      } else {
        onNavigate('landing');
      }
    } catch {
      // Error is handled in Redux auth slice
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setValidationError('');
    dispatch(authActions.clearAuthError());
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Form Side */}
        <div className="auth-form-side">
          <div style={{ width: '100%', maxWidth: '500px', padding: '0 4rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a onClick={() => onNavigate('landing')} className="brand" style={{ marginBottom: 0, cursor: 'pointer' }}>
              <div className="brand-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
              </div>
              Stock Overflow
            </a>
            <button 
              onClick={() => onNavigate('landing')} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: '#475569', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Home
            </button>
          </div>

          <div className="auth-header" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
            <h1>Sign In</h1>
            <p>Access the Stock Overflow dashboard using your email and password.</p>
          </div>

          <form id="loginForm" onSubmit={handleLoginSubmit} noValidate style={{ width: '100%' }}>
            <div className="form-group" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
              <label className="form-label">Email</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  placeholder="your.email@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
              <label className="form-label">Password</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-options" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
              <label className="form-check">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> Remember Me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact administrator to reset password.'); }} style={{ color: '#2563eb', textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>

            {errorMessage && (
              <div style={{ padding: '0 4rem', width: '100%', maxWidth: '500px', marginBottom: '1rem' }}>
                <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                  {errorMessage}
                </div>
              </div>
            )}

            <div style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <div className="auth-footer" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px' }}>
              New to Stock Overflow? <a onClick={() => onNavigate('register')} style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Create an account</a>
            </div>

            {/* Quick Autofill Helper for Evaluation */}
            <div style={{ padding: '1.25rem 4rem 0', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
                ⚡ 1-Click Evaluation Autofill
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => quickFill('admin@stockoverflow.com', 'pass1234')}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛡️ Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('employee@stockoverflow.com', 'pass1234')}
                  style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  👔 Employee
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('retailer@stockoverflow.com', 'pass1234')}
                  style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🏪 Retailer
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('supplier@stockoverflow.com', 'pass1234')}
                  style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🏭 Supplier
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('consumer@stockoverflow.com', 'pass1234')}
                  style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛒 Consumer
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('bil1@gmail.com', 'pass1234')}
                  style={{ background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🧾 Biller
                </button>
              </div>
            </div>
          </form>

          <div className="copyright" style={{ padding: '0 4rem', width: '100%', maxWidth: '500px', marginTop: '2rem' }}>
            © 2026 Stock Overflow
          </div>
        </div>

        {/* Right Image Side */}
        <div className="auth-image-side">
          <img src="/assets/workers.jpeg" alt="Stock Overflow Warehouse" className="hero-dashboard-img" />
        </div>
      </div>
    </div>
  );
}
