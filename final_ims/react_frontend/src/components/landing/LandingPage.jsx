import React, { useState } from 'react';
import LoginModal from '../auth/LoginModal';
import BillerModal from './BillerModal';

export default function LandingPage({ onEnterRetailer, onSwitchModule }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBillerOpen, setIsBillerOpen] = useState(false);

  return (
    <div>
      {/* Scroll Progress Bar */}
      <div id="scroll-progress-bar"></div>

      {/* Navigation */}
      <nav className="navbar container">
        <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
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
          <a href="#pricing">Pricing (₹)</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          {onSwitchModule && (
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={() => onSwitchModule('consumer')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', borderColor: '#bae6fd' }}
            >
              🛒 Consumer Store
            </button>
          )}
          <button className="btn btn-outline-gray" id="btnLoginNav" onClick={() => setIsLoginOpen(true)}>
            Login
          </button>
          <button
            className="btn btn-primary"
            id="btnGetStarted"
            onClick={() => (onEnterRetailer ? onEnterRetailer() : setIsLoginOpen(true))}
          >
            Enter Retailer
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero container">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            AI-Powered Inventory Management
          </div>
          <h1>
            Inventory That<br />
            Manages Itself
          </h1>
          <p>
            Stop losing sales to stockouts. Track inventory in real-time, predict demand with AI,
            and manage your entire supply chain from one powerful platform.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              id="heroSignUpBtn"
              style={{ padding: '1rem 3rem' }}
              onClick={() => (onEnterRetailer ? onEnterRetailer() : setIsLoginOpen(true))}
            >
              Enter Retailer Dashboard &rarr;
            </button>
            {onSwitchModule && (
              <button
                type="button"
                className="btn btn-outline-gray"
                onClick={() => onSwitchModule('consumer')}
                style={{ padding: '1rem 2rem' }}
              >
                🛒 Consumer Store
              </button>
            )}
            <button
              className="btn btn-outline-gray"
              onClick={() => setIsBillerOpen(true)}
              style={{ padding: '1rem 2rem' }}
            >
              Become a Biller
            </button>
            <div className="hero-perks mt-2">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                ₹0 Starter Plan (Free Forever)
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Transparent 2% Commission
              </span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          {/* Monthly Growth */}
          <div className="floating-metric fm-1">
            <div style={{ backgroundColor: '#e8f5e9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Monthly Growth</div>
              <div style={{ fontWeight: 700, color: '#16A34A', fontSize: '1.5rem' }}>+24.5%</div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="floating-metric fm-2">
            <div style={{ backgroundColor: '#eff6ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Orders</div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.5rem' }}>248</div>
            </div>
          </div>

          <img
            src="/assets/hero_laptop_bg.png"
            alt="Stock Overflow Dashboard Preview"
            className="hero-dashboard-img"
            onError={(e) => { e.target.src = '/assets/dashboard.png'; }}
          />

          {/* Low Stock Items */}
          <div className="floating-metric fm-3">
            <div style={{ backgroundColor: '#fffbeb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Low Stock Items</div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.5rem' }}>12 Products</div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats container">
        <div className="stat-item">
          <h3 className="stat-num">2000+</h3>
          <p>Active Retailers</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num">95%</h3>
          <p>Forecast Accuracy</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-num">40%</h3>
          <p>Cost Reduction</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features container">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2>Everything You Need to Master Inventory</h2>
          <p>Powerful features designed for modern retail operations</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card feat-span-2x2">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Real-Time Inventory Tracking</h3>
            <p>Monitor stock levels across all locations instantly. Get automated alerts before you run out.</p>
            <img
              src="/assets/realtime-inventory.jpg"
              alt="Tracking Chart"
              style={{ width: '100%', borderRadius: '0.5rem', marginTop: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h3>POS Integration</h3>
            <p>Connect with top POS systems to sync stock data instantly.</p>
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Smart Alerts</h3>
            <p>Get AI-powered notifications before items go out of stock.</p>
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Supplier Management</h3>
            <p>Track orders, compare suppliers, and optimize supply-chain performance.</p>
          </div>

          <div className="feature-card feat-span-2x2">
            <div className="feature-icon" style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Track key metrics and discover insights regarding your stock levels and user flow requirements to drive intelligent business decisions and predict market demands efficiently.</p>
            <img
              src="/assets/advanced-analystics.jpg"
              alt="Analytics View"
              style={{ width: '100%', borderRadius: '1rem', marginTop: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="feature-card feat-span-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="feature-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3>Multi-Store Support</h3>
            <p>Manage multiple locations seamlessly from a unified control deck.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing container" style={{ padding: '60px 0' }}>
        <div className="section-header">
          <span className="section-badge">Pricing</span>
          <h2>Simple, Transparent Plans</h2>
          <p>Choose the plan that fits your business scale</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Starter */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starter</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹0 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Free forever plan for independent retail stores.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>3 POs / week</strong> (Auto-resets weekly)</li>
              <li>✓ 1 Store Location</li>
              <li>✓ Up to 50 SKUs Catalog</li>
              <li>✓ 2% Commission on Platform Orders</li>
            </ul>
            <button className="btn btn-outline-gray" onClick={() => setIsLoginOpen(true)}>
              Get Started Free
            </button>
          </div>

          {/* Growth */}
          <div style={{ background: '#fff', border: '2px solid #3b82f6', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.15)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '24px', background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹799 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>For expanding retailers needing multi-store visibility.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>15 POs / week</strong></li>
              <li>✓ Up to 5 Store Locations</li>
              <li>✓ <strong>Unlimited SKUs</strong></li>
              <li>✓ Automated AI Reordering Alerts</li>
              <li>✓ 2% Commission on Platform Orders</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setIsLoginOpen(true)}>
              Start 30-Day Growth
            </button>
          </div>

          {/* Enterprise */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>
              ₹3,499 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>For retail chains and large warehouse hubs.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', flex: 1 }}>
              <li>✓ <strong>Unlimited Weekly POs</strong></li>
              <li>✓ <strong>Unlimited Store Outlets</strong></li>
              <li>✓ Unlimited SKU Catalog</li>
              <li>✓ Dedicated Account Manager</li>
              <li>✓ Custom ERP & POS Integrations</li>
            </ul>
            <button className="btn btn-outline-gray" onClick={() => setIsLoginOpen(true)}>
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#092c4c', color: '#cbd5e1', padding: '40px 0 20px', marginTop: '60px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
            <div className="brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
              </svg>
            </div>
            Stock Overflow
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            &copy; 2026 Stock Overflow Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          if (onEnterRetailer) onEnterRetailer();
        }}
      />

      <BillerModal
        isOpen={isBillerOpen}
        onClose={() => setIsBillerOpen(false)}
      />
    </div>
  );
}
