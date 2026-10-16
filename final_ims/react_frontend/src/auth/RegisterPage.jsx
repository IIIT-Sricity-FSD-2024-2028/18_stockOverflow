import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export default function RegisterPage({ onNavigate, onRegisterSuccess, initialRole = 'retailer', initialPlan = 'free' }) {
  const { saveSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('business@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialRole) setRole(initialRole);
    if (initialPlan) setSelectedPlan(initialPlan);
  }, [initialRole, initialPlan]);

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    if (newRole !== 'retailer' && newRole !== 'supplier') {
      setSelectedPlan('free');
    }
  };

  const validateForm = () => {
    if (!name || name.trim().length < 3) {
      throw new Error('Please enter your full name (at least 3 characters).');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (role === 'admin') {
      throw new Error('Admin accounts cannot be registered publicly.');
    }
    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      status: 'Active',
    };
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      validateForm();
      // If paid tier selected for retailer/supplier, open payment modal simulator
      if ((role === 'retailer' || role === 'supplier') && selectedPlan !== 'free') {
        setPaymentModalOpen(true);
        return;
      }
      // Otherwise proceed immediately
      executeRegistration();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const executeRegistration = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = validateForm();
      const dummyPaymentId = selectedPlan !== 'free' ? 'PAY-SO-' + Math.floor(100000 + Math.random() * 900000) : undefined;
      const paymentMethodName = paymentTab === 'upi' ? 'UPI AutoPay' : paymentTab === 'card' ? 'Credit/Debit Card' : 'NetBanking';

      let createdUser = null;

      const API_BASE = typeof window !== 'undefined' && window.IMS_API_BASE_URL
        ? window.IMS_API_BASE_URL
        : '/api';

      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          plan: selectedPlan || 'free',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to register account.');
      }

      createdUser = await res.json();

      // 2. Activate Subscription on backend if retailer or supplier
      if (payload.role === 'retailer' || payload.role === 'supplier') {
        try {
          await fetch(`${API_BASE}/platform-revenue/subscriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: createdUser.id,
              userName: createdUser.name,
              userEmail: createdUser.email,
              userRole: payload.role,
              tier: selectedPlan,
              billingCycle: 'monthly',
              paymentMethod: paymentMethodName,
              paymentId: dummyPaymentId,
            }),
          });
        } catch (_subErr) {
          console.warn('Subscription activation note:', _subErr);
        }

        // Trigger employee assignment distribution for immediate review
        try {
          await fetch(`${API_BASE}/employees/assignments/distribute`, { method: 'POST' });
        } catch (_distErr) {
          console.warn('Assignment distribution trigger note:', _distErr);
        }
      }

      // Save user session
      const token = createdUser.token || `sotk_${createdUser.id}_${Date.now()}`;
      const session = {
        ...createdUser,
        role: payload.role,
        status: (payload.role === 'retailer' || payload.role === 'supplier') ? 'Pending' : 'Active',
        profile: createdUser.profile || { profileStatus: 'pending' },
        subscriptionPlan: selectedPlan,
        paymentId: dummyPaymentId,
        token: token,
      };

      if (saveSession) {
        saveSession(session);
      } else {
        localStorage.setItem('so_session', JSON.stringify(session));
        localStorage.setItem('so_token', token);
      }

      setPaymentModalOpen(false);

      // Route to destination:
      // Retailer & Supplier go to wizard to fill additional information
      if (payload.role === 'retailer') {
        onNavigate('retailer-wizard');
      } else if (payload.role === 'supplier') {
        onNavigate('supplier-wizard');
      } else if (payload.role === 'consumer') {
        onNavigate('consumer');
      } else if (payload.role === 'biller') {
        onNavigate('biller');
      } else {
        onNavigate('landing');
      }

    } catch (err) {
      setErrorMessage(err.message || 'Unable to create account');
      setPaymentModalOpen(false);
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmDummyPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      executeRegistration();
    }, 1200);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Form Side */}
        <div className="auth-form-side">
          <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div className="auth-header" style={{ width: '100%', maxWidth: '500px' }}>
            <h1>Create an Account</h1>
            <p>Join Stock Overflow and start managing your inventory efficiently.</p>
          </div>

          <form id="registerForm" onSubmit={handleRegisterSubmit} noValidate style={{ width: '100%', maxWidth: '500px' }}>
            <div className="form-group" style={{ padding: 0, width: '100%' }}>
              <label className="form-label">Full Name</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ padding: 0, width: '100%' }}>
              <label className="form-label">Email</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="youremail@sample.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ padding: 0, width: '100%' }}>
              <label className="form-label">Password</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••" 
                  required 
                  minLength={8}
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

            <div className="form-group" style={{ padding: 0, width: '100%' }}>
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••" 
                  required 
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group" style={{ padding: 0, width: '100%' }}>
              <label className="form-label">Select Your Role</label>
              
              {/* Visual Role Toggle Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => handleRoleSelect('retailer')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: role === 'retailer' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    background: role === 'retailer' ? '#eff6ff' : '#ffffff',
                    color: role === 'retailer' ? '#1d4ed8' : '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🏪 Retailer / Store
                </button>
                <button 
                  type="button" 
                  onClick={() => handleRoleSelect('supplier')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: role === 'supplier' ? '2px solid #7c5def' : '2px solid #e2e8f0',
                    background: role === 'supplier' ? '#f5f3ff' : '#ffffff',
                    color: role === 'supplier' ? '#6d28d9' : '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🏭 Supplier / Distributor
                </button>
              </div>

              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9m3 4H5m4 4h10M5 7h2m0 4h2m-2 4h2"></path></svg>
                <select 
                  className="form-control" 
                  value={role}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                >
                  <option value="retailer">Retailer (Store / Supermarket)</option>
                  <option value="supplier">Supplier (Distributor / Wholesaler)</option>
                  <option value="biller">Biller (POS Staff)</option>
                  <option value="consumer">Customer (End Buyer)</option>
                  <option value="admin">Admin (Testing)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Plan Selection for Retailers & Suppliers */}
            {(role === 'retailer' || role === 'supplier') && (
              <div style={{ display: 'block', width: '100%', margin: '1.25rem 0', animation: 'fadeIn 0.3s ease-in-out' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Choose Subscription Plan</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>30-Day Billing Cycle</span>
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  {/* Starter (Free) */}
                  <div 
                    onClick={() => setSelectedPlan('free')}
                    style={{
                      border: selectedPlan === 'free' ? '2px solid #10b981' : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      background: selectedPlan === 'free' ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Starter <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>FREE FOREVER</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {role === 'supplier' 
                            ? '5 Incoming POs / week • Up to 25 Products • 1 Depot • Order Tracking'
                            : '3 Orders / week • 1 Store • 50 SKUs • POS Billing'}
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                        ₹0<span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth (Pro) */}
                  <div 
                    onClick={() => setSelectedPlan('pro')}
                    style={{
                      border: selectedPlan === 'pro' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      background: selectedPlan === 'pro' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-9px', right: '14px', background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                      MOST POPULAR
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#1d4ed8' }}>Growth</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {role === 'supplier'
                            ? '30 Incoming POs / week • Unlimited Products • Bulk CSV Import • Auto-Dispatch'
                            : '15 Orders / week • Up to 5 Stores • Unlimited SKUs • AI Reorders'}
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8' }}>
                        ₹799<span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise */}
                  <div 
                    onClick={() => setSelectedPlan('enterprise')}
                    style={{
                      border: selectedPlan === 'enterprise' ? '2px solid #7e22ce' : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      background: selectedPlan === 'enterprise' ? '#faf5ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#7e22ce' }}>Enterprise</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {role === 'supplier'
                            ? 'UNLIMITED Incoming POs • Multi-Depots • Net 30/60 Credit • ERP Sync'
                            : 'UNLIMITED Orders • Unlimited Stores • ERP Sync • 24/7 Support'}
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#7e22ce' }}>
                        ₹3,499<span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', marginBottom: '1rem' }}>
                {errorMessage}
              </div>
            )}

            <div style={{ padding: 0, width: '100%' }}>
              <button 
                type="submit" 
                id="btnSubmitRegister" 
                className="btn btn-primary btn-block" 
                style={{ backgroundColor: '#10b981', marginTop: '1rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="auth-footer" style={{ marginTop: '2rem' }}>
              Already have an account? <a onClick={() => onNavigate('login')} style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Log In</a>
            </div>
          </form>

          <div className="copyright" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            © 2026 Stock Overflow
          </div>
        </div>

        {/* Right Image Side */}
        <div className="auth-image-side">
          <img src="/assets/warehouse-empl.jpeg" alt="Stock Overflow Warehouse" className="hero-dashboard-img" />
        </div>
      </div>

      {/* Dummy Payment & Activation Modal (Exact from final_ims/frontend/auth/register.html) */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secure Checkout Simulator</div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  {selectedPlan === 'enterprise' ? 'Enterprise Plan Activation' : 'Growth Plan Activation'}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Order Summary Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                    {selectedPlan === 'enterprise' ? 'Enterprise Plan (1 Month)' : 'Growth Plan (1 Month)'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>30 days validity • Auto-renews monthly • Cancel anytime</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                    {selectedPlan === 'enterprise' ? '₹3,499' : '₹799'}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981' }}>+ 2% Commission</div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Select Dummy Payment Method:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setPaymentTab('upi')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: paymentTab === 'upi' ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                      background: paymentTab === 'upi' ? '#eff6ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: paymentTab === 'upi' ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    📱 UPI AutoPay
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentTab('card')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: paymentTab === 'card' ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                      background: paymentTab === 'card' ? '#eff6ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: paymentTab === 'card' ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    💳 Card
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentTab('netbanking')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: paymentTab === 'netbanking' ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                      background: paymentTab === 'netbanking' ? '#eff6ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: paymentTab === 'netbanking' ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🏦 NetBanking
                  </button>
                </div>
              </div>

              {/* Payment Tab Forms */}
              {paymentTab === 'upi' && (
                <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>UPI ID / VPA</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={e => setUpiId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                    ⚡ Simulated: Mandate pre-approved for sandbox testing.
                  </div>
                </div>
              )}

              {paymentTab === 'card' && (
                <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Card Number</label>
                  <input type="text" value="4242 •••• •••• 4242" readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#6b7280' }}>Valid Thru</label>
                      <input type="text" value="12/29" readOnly style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#6b7280' }}>CVV</label>
                      <input type="text" value="888" readOnly style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {paymentTab === 'netbanking' && (
                <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Select Bank</label>
                  <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }}>
                    <option>HDFC Bank Corporate</option>
                    <option>ICICI Bank Current Account</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank Business</option>
                  </select>
                </div>
              )}

              {/* Confirm Button */}
              <button 
                type="button" 
                onClick={handleConfirmDummyPayment}
                disabled={isProcessingPayment}
                style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
              >
                <span>{isProcessingPayment ? '⏳ Activating Subscription...' : '✓ Confirm & Activate Subscription'}</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11.5px', color: '#94a3b8' }}>
                🔒 Sandbox Test Mode: No real money is charged.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
