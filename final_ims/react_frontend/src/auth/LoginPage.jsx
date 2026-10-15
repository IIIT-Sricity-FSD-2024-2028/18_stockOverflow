/**
 * LoginPage.jsx - Role-Aware Interactive Login Component
 */

import React, { useState } from 'react';
import './auth.css';

const DEMO_USERS = {
  admin: {
    email: 'admin@stockoverflow.com',
    password: 'password123',
    role: 'admin',
    name: 'Super Admin',
  },
  employee: {
    email: 'sarah.c@stockoverflow.com',
    password: 'password123',
    role: 'employee',
    name: 'Sarah Connor',
  },
  retailer: {
    email: 'retailer@stockoverflow.com',
    password: 'password123',
    role: 'retailer',
    name: 'Downtown Retail Corp',
  },
  supplier: {
    email: 'supplier@stockoverflow.com',
    password: 'password123',
    role: 'supplier',
    name: 'Nordic Logistics Supply',
  },
  consumer: {
    email: 'consumer@stockoverflow.com',
    password: 'password123',
    role: 'consumer',
    name: 'Primary Consumer',
  },
};

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState(DEMO_USERS.admin.email);
  const [password, setPassword] = useState(DEMO_USERS.admin.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role]?.email || '');
    setPassword(DEMO_USERS[role]?.password || '');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = DEMO_USERS[selectedRole] || {
        email,
        role: selectedRole,
        name: email.split('@')[0],
      };
      try {
        localStorage.setItem('stockoverflow_user_session', JSON.stringify(user));
      } catch (err) {
        console.warn(err);
      }
      onLoginSuccess(selectedRole);
    }, 400);
  };

  return (
    <div className="auth-wrapper">
      {/* ── Left Branded Sidebar ── */}
      <div className="auth-sidebar-hero">
        <div>
          <div className="auth-brand" onClick={() => onNavigate('landing')}>
            <div className="auth-brand-badge">📦</div>
            <span>StockOverflow</span>
          </div>
          <div style={{ marginTop: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
              Access Point
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 1rem 0', lineHeight: '1.2' }}>
              Sign in to your role dashboard
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '400px' }}>
              Seamlessly switch between administrative governance, employee verification queues, and supply chain operations.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          StockOverflow IMS &bull; Secure Authentication Engine
        </div>
      </div>

      {/* ── Right Form Container ── */}
      <div className="auth-form-container">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Select your account role to continue</p>

        {/* Role Switcher Tabs */}
        <div className="auth-role-tabs">
          {[
            { key: 'admin', label: '🛡️ Admin' },
            { key: 'employee', label: '👔 Employee' },
            { key: 'retailer', label: '🏬 Retailer' },
            { key: 'supplier', label: '🚚 Supplier' },
            { key: 'consumer', label: '🛒 Consumer' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`auth-role-tab ${selectedRole === tab.key ? 'active' : ''}`}
              onClick={() => handleSelectRole(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demo Fast Login Helper */}
        <div className="auth-demo-box">
          <div className="auth-demo-text">
            Demo Credentials for <strong>{selectedRole.toUpperCase()}</strong> loaded
          </div>
          <button
            type="button"
            className="auth-demo-btn"
            onClick={() => {
              setEmail(DEMO_USERS[selectedRole].email);
              setPassword(DEMO_USERS[selectedRole].password);
            }}
          >
            Refill Demo
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              required
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              required
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} →`}
          </button>
        </form>

        <div className="auth-footer-links">
          Don't have an account yet?{' '}
          <span className="auth-link" onClick={() => onNavigate('register')}>
            Register a business
          </span>
          <div style={{ marginTop: '0.75rem' }}>
            <span className="auth-link" style={{ color: '#64748b' }} onClick={() => onNavigate('landing')}>
              ← Back to Landing Page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
