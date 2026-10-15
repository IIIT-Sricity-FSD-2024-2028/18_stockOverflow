/**
 * RegisterPage.jsx - Multi-Role Registration Component
 * Adds new business registrations into the Employee Verification Queue
 */

import React, { useState } from 'react';
import './auth.css';

export default function RegisterPage({ onNavigate, onRegisterSuccess }) {
  const [role, setRole] = useState('retailer');
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    gstin: '',
    location: '',
    plan: 'growth',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.email) {
      alert('Please fill out all required fields.');
      return;
    }

    // Add to Employee Verification Queue (localStorage)
    const newValidationItem = {
      id: `VAL-${Date.now().toString().slice(-4)}`,
      entityName: formData.businessName,
      type: role,
      owner: formData.ownerName || 'Business Owner',
      contact: formData.phone || '+91 98000 00000',
      email: formData.email,
      gstin: formData.gstin || '29ABCDE1234F1Z5',
      location: formData.location || 'India',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      documents: ['GSTIN Certificate', 'Business Registration', 'Bank Proof'],
      notes: `Registered online for the ${formData.plan.toUpperCase()} plan. Awaiting employee verification.`,
      plan: formData.plan,
    };

    try {
      const existing = localStorage.getItem('stockoverflow_employee_validations');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newValidationItem);
      localStorage.setItem('stockoverflow_employee_validations', JSON.stringify(list));
    } catch (err) {
      console.warn('Could not save to validations', err);
    }

    setSubmitted(true);
  };

  return (
    <div className="auth-wrapper">
      {/* ── Left Sidebar ── */}
      <div className="auth-sidebar-hero">
        <div>
          <div className="auth-brand" onClick={() => onNavigate('landing')}>
            <div className="auth-brand-badge">📦</div>
            <span>StockOverflow</span>
          </div>
          <div style={{ marginTop: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
              Onboarding
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 1rem 0', lineHeight: '1.2' }}>
              Register your business on StockOverflow
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '400px' }}>
              Connect with multi-store retailers, verified suppliers, and automated inventory sync. All registrations are verified by our compliance team.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Compliance &bull; Multi-Stakeholder Ecosystem
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-form-container">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Registration Submitted!
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Your business <strong>{formData.businessName}</strong> has been placed into the <strong>Employee Verification Queue</strong> with status <code>pending</code>.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="landing-btn landing-btn-primary"
                onClick={() => onRegisterSuccess('employee')}
              >
                Go to Employee Desk to Verify →
              </button>
              <button
                type="button"
                className="landing-btn landing-btn-outline"
                onClick={() => onNavigate('login')}
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Create an Account</h1>
            <p className="auth-subtitle">Select role and enter your organization details</p>

            <div className="auth-role-tabs">
              {[
                { key: 'retailer', label: '🏬 Retailer' },
                { key: 'supplier', label: '🚚 Supplier' },
                { key: 'consumer', label: '🛒 Consumer' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`auth-role-tab ${role === tab.key ? 'active' : ''}`}
                  onClick={() => setRole(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  {role === 'consumer' ? 'Full Name' : 'Business / Organization Name'} *
                </label>
                <input
                  type="text"
                  required
                  className="auth-input"
                  placeholder={role === 'consumer' ? 'Jane Doe' : 'Apex Supermarket Ltd.'}
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                />
              </div>

              {role !== 'consumer' && (
                <div className="auth-form-group">
                  <label className="auth-label">Authorized Contact Person</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Owner or Manager Name"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="auth-form-group">
                  <label className="auth-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="auth-input"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Phone Number</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {role !== 'consumer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="auth-form-group">
                    <label className="auth-label">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="27AABCU9603R1ZM"
                      value={formData.gstin}
                      onChange={(e) => handleChange('gstin', e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label">City / Region</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Mumbai, Maharashtra"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {role !== 'consumer' && (
                <div className="auth-form-group">
                  <label className="auth-label">Select Subscription Plan</label>
                  <select
                    className="auth-input"
                    value={formData.plan}
                    onChange={(e) => handleChange('plan', e.target.value)}
                  >
                    <option value="free">Starter Plan (₹0 / month - 1 Store)</option>
                    <option value="growth">Growth Partner (₹799 / month - Multi-Store)</option>
                    <option value="enterprise">Enterprise Suite (₹3,499 / month - Unlimited)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                Complete Registration →
              </button>
            </form>

            <div className="auth-footer-links">
              Already have an account?{' '}
              <span className="auth-link" onClick={() => onNavigate('login')}>
                Sign in
              </span>
              <div style={{ marginTop: '0.75rem' }}>
                <span className="auth-link" style={{ color: '#64748b' }} onClick={() => onNavigate('landing')}>
                  ← Back to Landing Page
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
