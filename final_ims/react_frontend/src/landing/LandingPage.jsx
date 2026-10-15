/**
 * LandingPage.jsx - Modern React Landing Page for StockOverflow
 * Converted from final_ims/frontend/index.html
 */

import React from 'react';
import './landing.css';

export default function LandingPage({ onNavigate, onSwitchModule }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-wrapper">
      {/* ── Sticky Floating Pill Navbar ── */}
      <div className="landing-container">
        <header className="landing-navbar-pill">
          <div className="landing-brand" onClick={() => scrollTo('hero')}>
            <div className="landing-brand-badge">📦</div>
            <span>StockOverflow</span>
          </div>

          <nav className="landing-nav-links">
            <span className="landing-nav-link" onClick={() => scrollTo('features')}>Features</span>
            <span className="landing-nav-link" onClick={() => scrollTo('portals')}>Portals</span>
            <span className="landing-nav-link" onClick={() => scrollTo('workflow')}>How It Works</span>
            <span className="landing-nav-link" onClick={() => scrollTo('pricing')}>Pricing (₹)</span>
          </nav>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              onClick={() => onNavigate('register')}
            >
              Get Started →
            </button>
          </div>
        </header>
      </div>

      {/* ── Hero Section ── */}
      <section id="hero" className="landing-hero landing-container">
        <div className="landing-hero-badge">
          ✨ Next-Gen Multi-Stakeholder Retail Architecture
        </div>

        <h1 className="landing-hero-title">
          Unified Inventory Lifecycle &amp; <span>Platform Governance</span>
        </h1>

        <p className="landing-hero-desc">
          Connect Administrators, Retailers, Suppliers, Employees, and Consumers into a
          single high-performance ecosystem with automated stock audits, 2% platform monetization, and real-time POS sync.
        </p>

        <div className="landing-hero-actions">
          <button
            type="button"
            className="landing-btn landing-btn-primary"
            style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
            onClick={() => onSwitchModule('admin')}
          >
            🛡️ Explore Admin Portal
          </button>
          <button
            type="button"
            className="landing-btn landing-btn-outline"
            style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
            onClick={() => onSwitchModule('employee')}
          >
            👔 Enter Employee Desk
          </button>
          <button
            type="button"
            className="landing-btn landing-btn-outline"
            style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
            onClick={() => onNavigate('register')}
          >
            Register Business →
          </button>
        </div>

        {/* Laptop Preview Mockup */}
        <div className="landing-hero-preview">
          <img
            src="/assets/hero_laptop_bg.png"
            alt="StockOverflow Dashboard Interface Preview"
            onError={(e) => {
              e.currentTarget.src = '/assets/dashboard.png';
            }}
          />
        </div>
      </section>

      {/* ── Real-Time Metrics Strip ── */}
      <section className="landing-container">
        <div className="landing-stats-grid">
          <div className="landing-stat-item">
            <div className="landing-stat-num">99.8%</div>
            <div className="landing-stat-label">Stock Reconciliation Accuracy</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num">35+</div>
            <div className="landing-stat-label">Active Regional Retail Hubs</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num">&lt; 1.2s</div>
            <div className="landing-stat-label">Real-time POS Sync Latency</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num">2.0%</div>
            <div className="landing-stat-label">Transparent Platform Commission</div>
          </div>
        </div>
      </section>

      {/* ── Stakeholder Portals Showcase ── */}
      <section id="portals" className="landing-container">
        <div className="landing-section-header">
          <div className="landing-section-tag">Ecosystem Roles</div>
          <h2 className="landing-section-title">Built for Every Stakeholder</h2>
          <p className="landing-section-sub">
            Each role accesses dedicated, role-enforced interfaces built with custom business logic.
          </p>
        </div>

        <div className="landing-portals-grid">
          {/* Admin Card */}
          <div className="landing-portal-card" style={{ borderTop: '4px solid #2563eb' }}>
            <div>
              <div className="landing-portal-header">
                <div className="landing-portal-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  🛡️
                </div>
                <div>
                  <h3 className="landing-portal-title">Administrator Portal</h3>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>SYSTEM GOVERNANCE</span>
                </div>
              </div>
              <p className="landing-portal-desc">
                Platform-wide oversight, 2% commission &amp; SaaS revenue analytics, multi-store branch scope control, and staff RBAC governance.
              </p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Dual-view platform revenue vs. GMV ledger</li>
                <li><span>✓</span> Multi-store scope &amp; regional hub setup</li>
                <li><span>✓</span> System users, audit logs, and settings</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              style={{ width: '100%' }}
              onClick={() => onSwitchModule('admin')}
            >
              Launch Admin Portal →
            </button>
          </div>

          {/* Employee Card */}
          <div className="landing-portal-card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div>
              <div className="landing-portal-header">
                <div className="landing-portal-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                  👔
                </div>
                <div>
                  <h3 className="landing-portal-title">Employee Desk</h3>
                  <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700 }}>OPERATIONS &amp; AUDIT</span>
                </div>
              </div>
              <p className="landing-portal-desc">
                Entity verification desk for onboarding retailers &amp; suppliers, document dossier inspection (GSTIN, PAN), shift tracker, and support helpdesk.
              </p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Dynamic live-updating validation queues</li>
                <li><span>✓</span> Document inspection dossier modal</li>
                <li><span>✓</span> User support ticket threaded response desk</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn"
              style={{ width: '100%', background: '#8b5cf6', color: '#fff' }}
              onClick={() => onSwitchModule('employee')}
            >
              Launch Employee Desk →
            </button>
          </div>

          {/* Retailer Card */}
          <div className="landing-portal-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div>
              <div className="landing-portal-header">
                <div className="landing-portal-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  🏬
                </div>
                <div>
                  <h3 className="landing-portal-title">Retailer &amp; POS</h3>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>STORE OPERATIONS</span>
                </div>
              </div>
              <p className="landing-portal-desc">
                Physical storefront inventory tracking, cashier POS barcode billing, pickup reservation release, and supplier stock replenishment orders.
              </p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Live store branch inventory management</li>
                <li><span>✓</span> Point-of-Sale instant billing counter</li>
                <li><span>✓</span> Purchase orders to connected suppliers</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              style={{ width: '100%' }}
              onClick={() => onSwitchModule('retailer')}
            >
              Preview Retailer Portal →
            </button>
          </div>

          {/* Supplier Card */}
          <div className="landing-portal-card" style={{ borderTop: '4px solid #ec4899' }}>
            <div>
              <div className="landing-portal-header">
                <div className="landing-portal-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                  🚚
                </div>
                <div>
                  <h3 className="landing-portal-title">Wholesale Supplier</h3>
                  <span style={{ fontSize: '11px', color: '#db2777', fontWeight: 700 }}>SUPPLY CHAIN</span>
                </div>
              </div>
              <p className="landing-portal-desc">
                Wholesale bulk inventory catalog, purchase order fulfillment, shipment manifests, and quota tracking based on subscription tiers.
              </p>
              <ul className="landing-portal-features">
                <li><span>✓</span> B2B purchase order dispatch tracking</li>
                <li><span>✓</span> Weekly order volume quota monitoring</li>
                <li><span>✓</span> Distribution logistics synchronization</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              style={{ width: '100%' }}
              onClick={() => onSwitchModule('supplier')}
            >
              Preview Supplier Portal →
            </button>
          </div>

          {/* Consumer Card */}
          <div className="landing-portal-card" style={{ borderTop: '4px solid #10b981' }}>
            <div>
              <div className="landing-portal-header">
                <div className="landing-portal-icon" style={{ background: '#d1fae5', color: '#047857' }}>
                  🛒
                </div>
                <div>
                  <h3 className="landing-portal-title">Consumer Storefront</h3>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>MARKETPLACE</span>
                </div>
              </div>
              <p className="landing-portal-desc">
                Public storefront to browse in-stock products across retail branches, place in-store pickup holds, check return status, and submit ratings.
              </p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Multi-store localized product search</li>
                <li><span>✓</span> 2-Hour hold reservation and checkout</li>
                <li><span>✓</span> Verified customer feedback &amp; restock alerts</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              style={{ width: '100%' }}
              onClick={() => onSwitchModule('consumer')}
            >
              Open Consumer Storefront →
            </button>
          </div>
        </div>
      </section>

      {/* ── Workflow Diagram ── */}
      <section id="workflow" className="landing-container" style={{ margin: '4rem auto' }}>
        <div className="landing-section-header">
          <div className="landing-section-tag">End-to-End Automation</div>
          <h2 className="landing-section-title">The Complete Supply Chain in Sync</h2>
          <p className="landing-section-sub">
            How inventory moves seamlessly from wholesale manufacturers to retail consumers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { step: '01', title: 'Registration & Onboarding', role: 'Employee Desk', desc: 'Retailers and suppliers register. Employees verify GSTIN and legal dossiers.' },
            { step: '02', title: 'Wholesale Purchase Orders', role: 'Supplier & Retailer', desc: 'Retail stores order bulk stock. Suppliers dispatch with tracking manifests.' },
            { step: '03', title: 'Store Stock Reconciliation', role: 'Multi-Store Engine', desc: 'Inventory is checked into branch locations with automatic low-stock alerts.' },
            { step: '04', title: 'Sales, POS & Monetization', role: 'Admin Revenue', desc: 'Cashiers bill via POS or consumers reserve online. 2% fee is logged to platform.' },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.5rem' }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
                {item.title}
              </h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                {item.role}
              </span>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing & SaaS Monetization ── */}
      <section id="pricing" className="landing-container">
        <div className="landing-section-header">
          <div className="landing-section-tag">Transparent SaaS Model</div>
          <h2 className="landing-section-title">Subscription Plans for Retailers &amp; Suppliers</h2>
          <p className="landing-section-sub">
            Scalable plans with predictable pricing. In addition to subscriptions, a 2% platform fee applies to sales.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {/* Starter Plan */}
          <div className="landing-price-card">
            <div>
              <div className="landing-price-tier">Starter Free</div>
              <div className="landing-price-amount">₹0 <span>/ month</span></div>
              <p className="landing-price-desc">Ideal for small individual shops testing the ecosystem.</p>
              <ul className="landing-portal-features">
                <li><span>✓</span> 1 Store Hub Location</li>
                <li><span>✓</span> Up to 50 Products in Catalog</li>
                <li><span>✓</span> 5 Orders / week capacity</li>
                <li><span>✓</span> Standard POS billing</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              style={{ width: '100%' }}
              onClick={() => onNavigate('register')}
            >
              Get Started Free
            </button>
          </div>

          {/* Growth Plan */}
          <div className="landing-price-card popular">
            <div className="landing-price-badge">Most Popular</div>
            <div>
              <div className="landing-price-tier">Growth Partner</div>
              <div className="landing-price-amount">₹799 <span>/ month</span></div>
              <p className="landing-price-desc">For growing retail chains managing multi-store hubs.</p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Up to 5 Multi-Store Branches</li>
                <li><span>✓</span> Up to 1,000 Catalog Products</li>
                <li><span>✓</span> 30 Orders / week capacity</li>
                <li><span>✓</span> Real-Time Analytics &amp; CSV Exports</li>
                <li><span>✓</span> Priority Employee Verification</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('register')}
            >
              Upgrade to Growth →
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="landing-price-card">
            <div>
              <div className="landing-price-tier">Enterprise Logistics</div>
              <div className="landing-price-amount">₹3,499 <span>/ month</span></div>
              <p className="landing-price-desc">Full supply chain suite with unlimited quotas and branches.</p>
              <ul className="landing-portal-features">
                <li><span>✓</span> Unlimited Store &amp; Warehouse Branches</li>
                <li><span>✓</span> Unlimited Catalog Products &amp; SKUs</li>
                <li><span>✓</span> Unlimited Weekly Order Volumes</li>
                <li><span>✓</span> Custom Platform Integration &amp; SLA</li>
                <li><span>✓</span> 24/7 Dedicated Support</li>
              </ul>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-outline"
              style={{ width: '100%' }}
              onClick={() => onNavigate('register')}
            >
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div>
            <div className="landing-footer-brand">📦 StockOverflow</div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8' }}>
              Next-generation Inventory Lifecycle Management System. Built with React 18, Vite 5, and NestJS for modern retail ecosystems.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem' }}>Portals</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => onSwitchModule('admin')}>Admin Portal</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onSwitchModule('employee')}>Employee Desk</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onSwitchModule('retailer')}>Retailer POS</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onSwitchModule('supplier')}>Supplier Dispatch</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onSwitchModule('consumer')}>Consumer Store</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('features')}>Features</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('pricing')}>Pricing Tiers</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('workflow')}>How It Works</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('login')}>Sign In</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem' }}>Assignment</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              FDFED Individual Project Submission: <strong>Admin &amp; Employee Modules</strong> with integrated Landing and Authentication.
            </p>
          </div>
        </div>

        <div className="landing-footer-copy">
          © {new Date().getFullYear()} StockOverflow IMS. All rights reserved. Built for academic evaluation.
        </div>
      </footer>
    </div>
  );
}
