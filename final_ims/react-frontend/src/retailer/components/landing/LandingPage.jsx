import React, { useState, useEffect } from 'react';
import BillerModal from './BillerModal';

export default function LandingPage({
  onOpenLogin,
  onOpenRegister,
  onOpenBillerPending,
  onEnterRetailer,
  onSwitchModule,
}) {
  const [isBillerOpen, setIsBillerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'relative', background: '#F8FAFC', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Scroll Progress Bar */}
      <div
        id="scroll-progress-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3px',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
          zIndex: 99999,
          boxShadow: '0 0 10px rgba(99,102,241,0.6)',
          transition: 'width 0.1s linear',
        }}
      />

      {/* Navigation */}
      <nav className="navbar container" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <div
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
        >
          <div className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
            </svg>
          </div>
          Stock Overflow
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline-gray"
            id="btnLoginNav"
            onClick={onOpenLogin}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-primary"
            id="btnGetStarted"
            onClick={onOpenRegister}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            AI-Powered Inventory Management
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Inventory That<br />
            Manages Itself
          </h1>

          <p style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '540px', lineHeight: 1.6, marginBottom: '2rem' }}>
            Stop losing sales to stockouts. Track inventory in real-time, predict demand with AI,
            and manage your entire supply chain from one powerful platform.
          </p>

          <div className="hero-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                id="heroSignUpBtn"
                style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px' }}
                onClick={onOpenRegister}
              >
                Sign Up &rarr;
              </button>

              <button
                type="button"
                className="btn btn-outline-gray"
                onClick={() => setIsBillerOpen(true)}
                style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Become a Biller
              </button>

              <button
                type="button"
                className="btn"
                onClick={onEnterRetailer}
                style={{ background: '#f1f5f9', color: '#334155', padding: '0.9rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                Guest Preview ⚡
              </button>
            </div>

            <div className="hero-perks mt-2" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                14-day free trial
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                No credit card required
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image with Floating Badges */}
        <div className="hero-image" style={{ position: 'relative', flex: 1 }}>
          {/* Monthly Growth */}
          <div className="floating-metric fm-1" style={{ position: 'absolute', top: '10%', left: '-5%', background: '#fff', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 12px 25px -4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ backgroundColor: '#e8f5e9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Monthly Growth</div>
              <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '1.4rem' }}>+24.5%</div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="floating-metric fm-2" style={{ position: 'absolute', top: '5%', right: '-5%', background: '#fff', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 12px 25px -4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ backgroundColor: '#eff6ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Orders</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>248</div>
            </div>
          </div>

          {/* Main Dashboard Preview Image */}
          <img
            src="/assets/hero_laptop_bg.png"
            alt="Stock Overflow Dashboard Preview"
            className="hero-dashboard-img"
            style={{ width: '100%', borderRadius: '16px', display: 'block', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}
            onError={(e) => {
              e.target.src = '/assets/dashboard.png';
            }}
          />

          {/* Low Stock Items */}
          <div className="floating-metric fm-3" style={{ position: 'absolute', bottom: '5%', right: '5%', background: '#fff', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 12px 25px -4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ backgroundColor: '#fffbeb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Low Stock Items</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>12 Products</div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '3rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
        <div className="stat-item">
          <h3 className="stat-num" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563eb' }}>2,000+</h3>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Active Retailers</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>95%</h3>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Forecast Accuracy</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' }}>40%</h3>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Cost Reduction</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features container" style={{ padding: '5rem 1.5rem' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Features
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            Everything You Need to Master Inventory
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Powerful features designed for modern retail operations
          </p>
        </div>

        <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: Real-Time Tracking */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Real-Time Inventory Tracking</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Monitor stock levels across all locations instantly. Get automated alerts before you run out.
            </p>
            <img
              src="/assets/realtime-inventory.jpg"
              alt="Realtime tracking"
              style={{ width: '100%', borderRadius: '10px', marginTop: '1.25rem', border: '1px solid #e2e8f0' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Card 2: POS Integration */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>POS Integration</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Connect with top POS systems and empower cashier billers to sync stock data instantly.
            </p>
          </div>

          {/* Card 3: Smart Alerts */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Smart Alerts & AI Reordering</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Get AI-powered notifications before items go out of stock, with automated supplier purchase recommendations.
            </p>
          </div>

          {/* Card 4: Advanced Analytics */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Advanced Analytics</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Track key revenue metrics, profit margins, and supplier performance scorecards.
            </p>
            <img
              src="/assets/advanced-analystics.jpg"
              alt="Analytics view"
              style={{ width: '100%', borderRadius: '10px', marginTop: '1.25rem', border: '1px solid #e2e8f0' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Card 5: Multi-Store Support */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Multi-Store Hub</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Seamlessly switch between multiple branches, store locations, and warehouses with unified inventory control.
            </p>
          </div>
        </div>
      </section>

      {/* Command Center Section */}
      <section id="dashboard" className="command-center container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <span className="section-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            Dashboard
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            Your Unified Command Center
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            See everything at a glance. Make decisions with complete clarity.
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
          <img
            src="/assets/command-center.png"
            alt="Stock Overflow Command Center Preview"
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0' }}
            onError={(e) => {
              e.target.src = '/assets/command_center_mock.png';
            }}
          />
        </div>
      </section>

      {/* Supply Chain Flow Section */}
      <section id="how-it-works" className="supply-chain container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            How It Works
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            Supply Chain Made Simple
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Connect your entire ecosystem in one intelligent platform
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Step 1: Retailer */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <span style={{ background: '#2563eb', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Step 1
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '12px', marginBottom: '6px' }}>Retailer Portal</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '14px' }}>
              Manages inventory, POS billing cashier requests, store outlets, and suppliers.
            </p>
            <img
              src="/assets/warehouse.jpg"
              alt="Retailer warehouse"
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Central Hub */}
          <div style={{ background: '#092c4c', color: '#fff', border: '1px solid #1e3a8a', borderRadius: '16px', padding: '24px', textAlign: 'left', boxShadow: '0 8px 20px rgba(9,44,76,0.2)' }}>
            <span style={{ background: '#38bdf8', color: '#0f172a', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              Central Hub
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '12px', marginBottom: '6px', color: '#fff' }}>Stock Overflow Core</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '14px' }}>
              Real-time sync, AI forecasting, automated purchase ordering, and unified ledger.
            </p>
            <img
              src="/assets/stock_platform.jpg"
              alt="Central Platform"
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Step 2: Supplier & Consumer */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Step 2 & 3
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '12px', marginBottom: '6px' }}>Suppliers & Cashiers</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '14px' }}>
              Fulfill purchase orders, bill customers at counter POS, and track order fulfillment.
            </p>
            <img
              src="/assets/supplier-turck.jpg"
              alt="Supplier truck"
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing container" style={{ padding: '5rem 1.5rem' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            Pricing
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            Simple, Transparent Plans
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Choose the plan that fits your business scale
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Starter */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Starter Kirana</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹0 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Free forever plan for independent retail stores.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>3 POs / week</strong> (Auto-resets weekly)</li>
              <li>✓ 1 Store Location</li>
              <li>✓ Up to 50 SKUs Catalog</li>
              <li>✓ Cashier Biller Approval</li>
            </ul>
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={onOpenRegister}
            >
              Get Started Free
            </button>
          </div>

          {/* Growth */}
          <div style={{ background: '#fff', border: '2px solid #2563eb', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.15)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '24px', background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Vyapar Pro</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹799 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>For expanding retailers needing multi-store visibility.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>15 POs / week</strong></li>
              <li>✓ Up to 5 Store Outlets</li>
              <li>✓ <strong>Unlimited SKUs</strong></li>
              <li>✓ Automated AI Reordering Alerts</li>
              <li>✓ Dedicated Biller Support</li>
            </ul>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenRegister}
            >
              Start 30-Day Pro Trial
            </button>
          </div>

          {/* Enterprise */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Bharat Enterprise</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹3,499 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>For retail chains and large warehouse hubs.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>Unlimited POs</strong></li>
              <li>✓ <strong>Unlimited Store Outlets</strong></li>
              <li>✓ Unlimited SKU Catalog</li>
              <li>✓ Custom ERP & POS Integrations</li>
            </ul>
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={onOpenRegister}
            >
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer style={{ background: '#092c4c', color: '#cbd5e1', padding: '60px 0 30px', marginTop: '60px' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            Ready to Transform Your Inventory Management?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '24px' }}>
            Join 2,000+ retailers optimizing their operations with Stock Overflow
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#fff', color: '#092c4c', fontWeight: 800, padding: '10px 24px' }}
              onClick={onOpenRegister}
            >
              Start Free Trial
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: 'transparent', border: '1px solid #475569', color: '#fff', fontWeight: 700, padding: '10px 20px' }}
              onClick={() => setIsBillerOpen(true)}
            >
              Become a Biller
            </button>
          </div>
        </div>

        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid #1e3a8a', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
              </svg>
            </div>
            Stock Overflow
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            &copy; 2026 Stock Overflow. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Biller Modal */}
      <BillerModal
        isOpen={isBillerOpen}
        onClose={() => setIsBillerOpen(false)}
        onRedirectPending={(email) => {
          setIsBillerOpen(false);
          if (onOpenBillerPending) onOpenBillerPending(email);
        }}
        onBillerLoginSuccess={() => {
          setIsBillerOpen(false);
          if (onEnterRetailer) onEnterRetailer();
        }}
      />
    </div>
  );
}
