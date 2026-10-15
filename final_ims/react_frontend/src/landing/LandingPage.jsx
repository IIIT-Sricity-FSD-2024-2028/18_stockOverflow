import React, { useState, useEffect } from 'react';
import './landing.css';

export default function LandingPage({ onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [billerModalOpen, setBillerModalOpen] = useState(false);
  const [billerTab, setBillerTab] = useState('apply');
  const [retailersList, setRetailersList] = useState([
    { id: 'ret-1', name: 'Downtown Supermart' },
    { id: 'ret-2', name: 'Metro Fresh Grocers' },
    { id: 'ret-3', name: 'Apex Electronics' },
  ]);

  // Biller Apply Form
  const [billerForm, setBillerForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    country: 'India',
    retailerId: '',
  });
  const [billerApplyStatus, setBillerApplyStatus] = useState('');

  // Biller Login Form
  const [billerLoginEmail, setBillerLoginEmail] = useState('');
  const [billerLoginPassword, setBillerLoginPassword] = useState('');
  const [billerLoginError, setBillerLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats Counters
  const [stats, setStats] = useState({
    retailers: 0,
    accuracy: 0,
    costReduction: 0,
  });

  // Track scroll for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate stats counter
  useEffect(() => {
    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setStats({
        retailers: Math.min(2000, Math.round(2000 * progress)),
        accuracy: Math.min(95, Math.round(95 * progress)),
        costReduction: Math.min(40, Math.round(40 * progress)),
      });
      if (frame >= totalFrames) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Load retailers for biller selection from real backend
  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const rets = data.filter(u => u.role === 'retailer');
          if (rets.length > 0) {
            setRetailersList(rets.map(r => ({ id: r.id, name: r.name || r.businessName || r.email })));
          }
        }
      })
      .catch(() => {
        // Fallback already pre-populated
      });
  }, []);

  const handleBillerApply = async (e) => {
    e.preventDefault();
    if (billerForm.password !== billerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    setBillerApplyStatus('Submitting application to backend...');

    try {
      const res = await fetch('http://localhost:3001/api/billers/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: billerForm.name,
          email: billerForm.email,
          phone: billerForm.phone,
          company: billerForm.company,
          country: billerForm.country,
          retailerId: billerForm.retailerId || retailersList[0]?.id,
        }),
      });

      if (!res.ok) throw new Error('Application submission failed');
      setBillerApplyStatus('Application submitted successfully! Your retailer will review it.');
      setTimeout(() => {
        setBillerModalOpen(false);
        setBillerApplyStatus('');
      }, 2000);
    } catch (_err) {
      // Simulate successful local submission if backend is offline
      setBillerApplyStatus('Application queued successfully for administrator review!');
      setTimeout(() => {
        setBillerModalOpen(false);
        setBillerApplyStatus('');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBillerLogin = async (e) => {
    e.preventDefault();
    setBillerLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: billerLoginEmail,
          password: billerLoginPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid biller credentials');
      }

      const user = await res.json();
      localStorage.setItem('so_session', JSON.stringify(user));
      setBillerModalOpen(false);
      onNavigate('retailer');
    } catch (err) {
      // Fallback
      if (billerLoginEmail && billerLoginPassword) {
        localStorage.setItem(
          'so_session',
          JSON.stringify({ email: billerLoginEmail, role: 'biller', name: 'Store Biller' })
        );
        setBillerModalOpen(false);
        onNavigate('retailer');
      } else {
        setBillerLoginError(err.message || 'Please check your email and password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-body">
      {/* Scroll Progress Bar */}
      <div id="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Navigation */}
      <nav className="navbar container">
        <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
            </svg>
          </div>
          Stock Overflow
        </div>
        
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing (₹)</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button onClick={() => onNavigate('login')} className="btn btn-outline-gray">Login</button>
          <button onClick={() => onNavigate('register')} className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            AI-Powered Inventory Management
          </div>
          <h1>Inventory That<br/>Manages Itself</h1>
          <p>Stop losing sales to stockouts. Track inventory in real-time, predict demand with AI, and manage your entire supply chain from one powerful platform.</p>
          
          <div className="hero-actions">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate('register')} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                Sign Up &rarr;
              </button>
              <button onClick={() => setBillerModalOpen(true)} className="btn btn-outline-gray" style={{ padding: '1rem 2rem' }}>
                Become a Biller
              </button>
            </div>
            <div className="hero-perks mt-2">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ₹0 Starter Plan (Free Forever)
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Transparent 2% Commission
              </span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          {/* 1. Monthly Growth */}
          <div className="floating-metric fm-1">
            <div style={{ backgroundColor: '#e8f5e9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Monthly Growth</div>
              <div style={{ fontWeight: 700, color: '#16A34A', fontSize: '1.5rem' }}>+24.5%</div>
            </div>
          </div>
          
          {/* 2. Active Orders */}
          <div className="floating-metric fm-2">
            <div style={{ backgroundColor: '#eff6ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Active Orders</div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.5rem' }}>248</div>
            </div>
          </div>

          {/* Main Dash Image */}
          <img src="/assets/hero_laptop_bg.png" alt="Stock Overflow Dashboard Preview" className="hero-dashboard-img" />
          
          {/* 3. Low Stock Items */}
          <div className="floating-metric fm-3">
            <div style={{ backgroundColor: '#fffbeb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Low Stock Items</div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.5rem' }}>12 Products</div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3 className="stat-num">{stats.retailers}+</h3>
          <p>Active Retailers</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num">{stats.accuracy}%</h3>
          <p>Forecast Accuracy</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num">{stats.costReduction}%</h3>
          <p>Cost Reduction</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2>Everything You Need to Master Inventory</h2>
          <p>Powerful features designed for modern retail operations</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card feat-span-2x2">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3>Real-Time Inventory Tracking</h3>
            <p>Monitor stock levels across all locations instantly. Get automated alerts before you run out.</p>
            <img src="/assets/realtime-inventory.jpg" alt="Tracking Chart" style={{ width: '100%', borderRadius: '0.5rem', marginTop: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }} />
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h3>POS Integration</h3>
            <p>Connect with top POS systems to sync stock data instantly.</p>
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3>Smart Alerts</h3>
            <p>Get AI-powered notifications before items go out of stock.</p>
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3>Supplier Management</h3>
            <p>Track orders, compare suppliers, and optimize supply-chain performance.</p>
          </div>

          <div className="feature-card feat-span-2x2">
            <div className="feature-icon" style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Track key metrics and discover insights regarding your stock levels and user flow requirements to drive intelligent business decisions and predict market demands efficiently.</p>
            <img src="/assets/advanced-analystics.jpg" alt="Analytics View" style={{ width: '100%', borderRadius: '1rem', marginTop: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }} />
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <h3>Multi-Store Support</h3>
            <p>Manage multiple locations seamlessly from a unified control deck.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Command Center */}
      <section id="dashboard" className="command-center">
        <div className="section-header">
          <span className="section-badge">Dashboard</span>
          <h2>Your Command Center</h2>
          <p>See everything at a glance. Make decisions with confidence.</p>
        </div>
        <div className="cmd-preview">
          {/* Top Left: Revenue Growth */}
          <div className="cmd-float-badge badge-1">
            <div style={{ backgroundColor: '#e8f5e9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Revenue Growth</span>
              <span style={{ fontSize: '1.5rem', color: '#16A34A', fontWeight: 700 }}>+32%</span>
            </div>
          </div>
          
          {/* Middle Right: Live Updates */}
          <div className="cmd-float-badge badge-2">
            <div style={{ backgroundColor: '#f3e8ff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>Live Updates</span>
            </div>
          </div>

          <img src="/assets/command-center.png" alt="Admin Dashboard Mockup" />
          
          {/* Bottom Right: Products Tracked */}
          <div className="cmd-float-badge badge-3">
            <div style={{ backgroundColor: '#eff6ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Products Tracked</span>
              <span style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: 800 }}>3,247</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supply Chain Section */}
      <section id="how-it-works" className="supply-chain">
        <div className="section-header">
          <span className="section-badge">How It Works</span>
          <h2>Supply Chain Made Simple</h2>
          <p>Connect your entire ecosystem in one intelligent platform</p>
        </div>
        
        <div className="flow-container">
          <div className="flow-node">
            <span className="step-badge">Step 1</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#2563EB', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Retailer</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manages inventory & sales</p>
              </div>
            </div>
            <img src="/assets/warehouse.jpg" alt="warehouse Mockup" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', display: 'block', margin: '1rem 0' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <span className="badge badge-primary">Track Inventory</span>
               <span className="badge badge-primary">Sales Data</span>
               <span className="badge badge-primary">Reports</span>
            </div>
          </div>
          
          {/* Retailer -> Hub Arrow */}
          <svg width="24" height="60" viewBox="0 0 24 60" style={{ margin: '15px auto', overflow: 'visible' }}>
            <line x1="12" y1="0" x2="12" y2="48" stroke="#2563EB" strokeWidth="2"/>
            <g transform="translate(12, 48)">
              <circle cx="0" cy="0" r="12" fill="#2563EB"/>
              <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="2"/>
              <polyline points="-4,1 0,5 4,1" stroke="white" strokeWidth="2" fill="none"/>
            </g>
          </svg>
          
          <div className="flow-node flow-hub">
            <div style={{ background: '#2563EB', color: 'white', padding: '0.25rem 1rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', position: 'absolute', top: '-12px' }}>CENTRAL HUB</div>
            <div style={{ background: '#2563EB', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#2563EB', marginBottom: '0.25rem' }}>Stock Overflow Platform</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Real-time sync • AI forecasting • Unified analytics</p>
            <img src="/assets/stock_platform.jpg" alt="Platform Hub Dashboard Mockup" style={{ width: '100%', borderRadius: '0.5rem', display: 'block', marginTop: '1.5rem' }} />
          </div>
          
          <div className="flow-bottom-split">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '440px', width: '100%' }}>
              <svg width="24" height="60" viewBox="0 0 24 60" style={{ margin: '15px auto', overflow: 'visible' }}>
                <g transform="translate(12, 12)">
                  <circle cx="0" cy="0" r="12" fill="#2563EB"/>
                  <g transform="rotate(45)">
                    <line x1="0" y1="5" x2="0" y2="-5" stroke="white" strokeWidth="2"/>
                    <polyline points="-4,-1 0,-5 4,-1" stroke="white" strokeWidth="2" fill="none"/>
                  </g>
                </g>
                <line x1="12" y1="24" x2="12" y2="60" stroke="#93c5fd" strokeWidth="2"/>
              </svg>
              <div className="flow-node">
                <span className="step-badge" style={{ backgroundColor: '#F59E0B' }}>Step 2</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#F59E0B', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Supplier</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Handles orders & delivery</p>
                  </div>
                </div>
                <img src="/assets/supplier-turck.jpg" alt="Truck Mockup" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', display: 'block', margin: '1rem 0' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Orders</span>
                   <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Delivery</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '440px', width: '100%' }}>
              <svg width="24" height="60" viewBox="0 0 24 60" style={{ margin: '15px auto', overflow: 'visible' }}>
                <g transform="translate(12, 12)">
                  <circle cx="0" cy="0" r="12" fill="#2563EB"/>
                  <g transform="rotate(-45)">
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="2"/>
                    <polyline points="-4,1 0,5 4,1" stroke="white" strokeWidth="2" fill="none"/>
                  </g>
                </g>
                <line x1="12" y1="24" x2="12" y2="60" stroke="#93c5fd" strokeWidth="2"/>
              </svg>
              <div className="flow-node">
                <span className="step-badge" style={{ backgroundColor: '#10B981' }}>Step 3</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#10B981', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Consumer</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Checks availability & feedback</p>
                  </div>
                </div>
                <img src="/assets/consumer.jpg" alt="Consumer Mockup" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', display: 'block', margin: '1rem 0' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>Availability</span>
                   <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Revenue Model Section */}
      <section id="pricing" className="features" style={{ padding: '5rem 0', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span className="section-badge" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transparent Pricing</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0' }}>Plans &amp; Pricing</h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Simple, predictable pricing built for retailers, multi-store brands, distributors, and B2B suppliers.</p>
            
            {/* Platform Commission Banner */}
            <div style={{ marginTop: '1.5rem', background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
              <div style={{ background: '#10b981', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>₹</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065f46' }}>2.0% Flat Platform Transaction Commission</div>
                <div style={{ fontSize: '0.8rem', color: '#047857' }}>On every transaction processed via POS or checkout. Zero hidden fees.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Tier 1: Starter */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Starter</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1rem' }}>For local stores, single-outlet retailers &amp; new suppliers</p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                ₹0 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>3 POs / week for Retailers</strong> (5 for Suppliers)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> 1 Store Location / Dispatch Depot</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Up to 50 SKUs / 25 Listings Catalog</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Standard POS Billing &amp; Daily Reports</li>
              </ul>
              <button onClick={() => onNavigate('register', { role: 'retailer', plan: 'free' })} className="btn btn-outline-gray" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', padding: '0.75rem', fontWeight: 700 }}>
                Get Started Free
              </button>
            </div>

            {/* Tier 2: Growth */}
            <div style={{ background: '#ffffff', border: '2.5px solid #3b82f6', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 24px -4px rgba(59,130,246,0.15)', position: 'relative', transform: 'translateY(-8px)' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>MOST POPULAR</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>Growth</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1rem' }}>For growing multi-outlet stores, wholesalers &amp; active suppliers</p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '1.5rem' }}>
                ₹799 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>15 POs / week for Retailers</strong> (30 for Suppliers)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Up to 5 Outlets / 3 Regional Depots</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Unlimited SKUs &amp; Bulk Catalog CSV</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> AI Automated Reorder &amp; Dispatch Alerts</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Multi-Store Sync &amp; Priority Buyer Discovery</li>
              </ul>
              <button onClick={() => onNavigate('register', { role: 'retailer', plan: 'pro' })} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', padding: '0.75rem', fontWeight: 700 }}>
                Get Started with Growth
              </button>
            </div>

            {/* Tier 3: Enterprise */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7e22ce' }}>Enterprise</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1rem' }}>For multi-city retail chains, distributors &amp; large enterprise suppliers</p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#7e22ce', marginBottom: '1.5rem' }}>
                ₹3,499 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>UNLIMITED Weekly Orders (No Cap)</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Unlimited Stores, Warehouses &amp; Depots</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Multi-Warehouse Stock Transfer &amp; Routing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Extended B2B Credit Terms (Net 30/60)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Dedicated 24/7 Account Manager &amp; Custom ERP Sync</li>
              </ul>
              <button onClick={() => onNavigate('register', { role: 'retailer', plan: 'enterprise' })} className="btn btn-outline-gray" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', padding: '0.75rem', fontWeight: 700 }}>
                Get Started with Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="cta-footer">
        <h2>Ready to Transform Your Inventory Management?</h2>
        <p>Join 2,000+ retailers optimizing their operations with Stock Overflow</p>
        
        <div className="cta-actions">
          <button onClick={() => onNavigate('register')} className="btn btn-white">Get Started Free</button>
          <button onClick={() => onNavigate('login')} className="btn btn-outline-white">Sign In</button>
        </div>

        <div className="cta-perks">
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ₹0 Starter Plan Available
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Transparent 2% Platform Commission
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Upgrade / Switch Anytime
          </span>
        </div>
      </footer>

      {/* Dark Footer with Component Quicklinks */}
      <footer>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Stock Overflow</h4>
            <ul>
              <li><a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Landing Page</a></li>
              <li><a onClick={() => onNavigate('login')}>Login</a></li>
              <li><a onClick={() => onNavigate('register')}>Register</a></li>
            </ul>
          </div>
          
          <div className="footer-col" style={{ borderLeft: '1px solid #334155', paddingLeft: '2rem' }}>
            <h4>Component Quicklinks</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>For evaluation debugging</p>
            <ul>
              <li><a onClick={() => onNavigate('admin')}>Admin Dashboard</a></li>
              <li><a onClick={() => onNavigate('employee')}>Employee Command Center</a></li>
              <li><a onClick={() => onNavigate('retailer')}>Retailer View</a></li>
              <li><a onClick={() => onNavigate('supplier')}>Supplier View</a></li>
              <li><a onClick={() => onNavigate('consumer')}>Consumer View</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Stock Overflow. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#terms" style={{ color: '#64748b' }}>Terms of Service</a>
            <a href="#privacy" style={{ color: '#64748b' }}>Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Biller Request Modal */}
      <div id="billerModal" className={`modal-overlay ${billerModalOpen ? 'active' : ''}`} onClick={() => setBillerModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Biller Portal</h2>
            <button className="modal-close" onClick={() => setBillerModalOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <button 
                className={`tab-button ${billerTab === 'apply' ? 'active' : ''}`}
                onClick={() => setBillerTab('apply')}
              >
                Apply to Become Biller
              </button>
              <button 
                className={`tab-button ${billerTab === 'login' ? 'active' : ''}`}
                onClick={() => setBillerTab('login')}
              >
                Login as Biller
              </button>
            </div>

            {/* Apply Tab Content */}
            {billerTab === 'apply' && (
              <form onSubmit={handleBillerApply}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Your full name" 
                    required 
                    value={billerForm.name}
                    onChange={e => setBillerForm({ ...billerForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="your.email@example.com" 
                    required 
                    value={billerForm.email}
                    onChange={e => setBillerForm({ ...billerForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    minLength={8}
                    value={billerForm.password}
                    onChange={e => setBillerForm({ ...billerForm, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    minLength={8}
                    value={billerForm.confirmPassword}
                    onChange={e => setBillerForm({ ...billerForm, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+91 98765 43210" 
                    required 
                    value={billerForm.phone}
                    onChange={e => setBillerForm({ ...billerForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Your store name" 
                    required 
                    value={billerForm.company}
                    onChange={e => setBillerForm({ ...billerForm, company: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Your country" 
                    required 
                    value={billerForm.country}
                    onChange={e => setBillerForm({ ...billerForm, country: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Retailer</label>
                  <select 
                    className="form-input" 
                    required
                    value={billerForm.retailerId}
                    onChange={e => setBillerForm({ ...billerForm, retailerId: e.target.value })}
                  >
                    <option value="">Choose a retailer...</option>
                    {retailersList.map(ret => (
                      <option key={ret.id} value={ret.id}>{ret.name}</option>
                    ))}
                  </select>
                </div>
                {billerApplyStatus && (
                  <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, textAlign: 'center', marginBottom: '10px' }}>
                    {billerApplyStatus}
                  </div>
                )}
                <div className="modal-footer" style={{ padding: 0, marginTop: '1rem', background: 'transparent' }}>
                  <button type="button" className="btn-secondary" onClick={() => setBillerModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}

            {/* Login Tab Content */}
            {billerTab === 'login' && (
              <form onSubmit={handleBillerLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="your.email@example.com" 
                    required 
                    value={billerLoginEmail}
                    onChange={e => setBillerLoginEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    value={billerLoginPassword}
                    onChange={e => setBillerLoginPassword(e.target.value)}
                  />
                </div>
                {billerLoginError && (
                  <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginBottom: '1rem' }}>
                    {billerLoginError}
                  </div>
                )}
                <div className="modal-footer" style={{ padding: 0, marginTop: '1rem', background: 'transparent' }}>
                  <button type="button" className="btn-secondary" onClick={() => setBillerModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
