import React, { useState } from 'react';
import './auth.css';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = typeof window !== 'undefined' && window.IMS_API_BASE_URL
        ? window.IMS_API_BASE_URL
        : '/api';

      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid email or password.');
      }

      const user = await res.json();
      const role = String(user.role || 'consumer').toLowerCase();
      const status = String(user.profile?.profileStatus || user.status || 'Active').toLowerCase();

      // Store canonical session and auth token
      const session = {
        ...user,
        id: user.id || 'usr-' + Date.now(),
        name: user.name || 'User',
        email: user.email || email,
        role: role === 'customer' ? 'consumer' : role,
        status: user.status || 'Active',
        profile: user.profile || null,
        token: user.token || `sotk_${user.id}_${Date.now()}`,
      };

      localStorage.setItem('so_session', JSON.stringify(session));
      if (session.token) {
        localStorage.setItem('so_token', session.token);
      }

      // Role and Verification Gate Routing
      if (role === 'admin') {
        onNavigate('admin');
      } else if (role === 'employee') {
        onNavigate('employee');
      } else if (role === 'retailer' || role === 'supplier') {
        if (status === 'pending' || status === 'rejected') {
          onNavigate('verification-pending');
        } else {
          onNavigate(role);
        }
      } else if (role === 'consumer') {
        onNavigate('consumer');
      } else if (role === 'biller') {
        onNavigate('biller');
      } else {
        onNavigate('landing');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
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
                  onClick={() => quickFill('admin@stockoverflow.com', 'admin123')}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛡️ Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('employee@stockoverflow.com', 'employee123')}
                  style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  👔 Employee
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('retailer@stockoverflow.com', 'retailer123')}
                  style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🏪 Retailer
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('supplier@stockoverflow.com', 'supplier123')}
                  style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🏭 Supplier
                </button>
                <button 
                  type="button" 
                  onClick={() => quickFill('consumer@stockoverflow.com', 'consumer123')}
                  style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛒 Consumer
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
