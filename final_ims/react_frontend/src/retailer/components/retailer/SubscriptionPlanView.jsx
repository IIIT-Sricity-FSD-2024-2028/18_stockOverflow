import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionPlanView({ onNavigate }) {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState(() => user?.plan || 'starter');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [payMethod, setPayMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const planConfigs = {
    free: {
      id: 'free',
      name: 'Starter Kirana (Free Tier)',
      badge: 'Free Forever',
      desc: 'Basic POS and single store location management for individual shopkeepers.',
      basePrice: 0,
      gst: 0,
      total: 0,
      usageText: '1 / 1 Store Location',
      usagePct: 100,
    },
    starter: {
      id: 'starter',
      name: 'Starter Kirana (Free Tier)',
      badge: 'Free Forever',
      desc: 'Basic POS and single store location management for individual shopkeepers.',
      basePrice: 0,
      gst: 0,
      total: 0,
      usageText: '1 / 1 Store Location',
      usagePct: 100,
    },
    pro: {
      id: 'pro',
      name: 'Vyapar Pro (Active)',
      badge: 'Most Popular',
      desc: 'Enhanced multi-store inventory sync, GST e-invoicing & automated replenishment.',
      basePrice: 799,
      gst: 143.82,
      total: 942.82,
      usageText: '1 / 5 Store Outlets',
      usagePct: 20,
    },
    enterprise: {
      id: 'enterprise',
      name: 'Bharat Enterprise',
      badge: 'Enterprise Tier',
      desc: 'Supermarket chains & multi-branch depots with custom ERP & Tally Prime sync.',
      basePrice: 3499,
      gst: 629.82,
      total: 4128.82,
      usageText: '1 / Unlimited Stores',
      usagePct: 10,
    },
  };

  const currentConfig = planConfigs[activePlan] || planConfigs.pro;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenUpgrade = (tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
    setProcessing(false);
  };

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setIsModalOpen(false);
      setActivePlan(selectedTier);

      // Persist plan in session
      try {
        const session = JSON.parse(localStorage.getItem('so_session') || '{}');
        session.plan = selectedTier;
        localStorage.setItem('so_session', JSON.stringify(session));
      } catch (e) {
        console.error(e);
      }

      showToast(`🎉 Upgraded to ${selectedTier === 'pro' ? 'Vyapar Pro' : 'Bharat Enterprise'} successfully!`);
    }, 1800);
  };

  const selectedTierConfig = planConfigs[selectedTier] || planConfigs.pro;

  return (
    <div className="content" style={{ padding: '24px 28px 48px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            fontSize: '13.5px',
            fontWeight: 700,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c', letterSpacing: '-.3px', margin: '0 0 4px 0' }}>
          SaaS Growth & Subscription Plans
        </h1>
        <p style={{ fontSize: '13px', color: '#646b72', margin: 0 }}>
          Transparent tiered pricing engineered for Indian Kirana stores, retail chains, and supermarkets
        </p>
      </div>

      {/* ACTIVE PLAN BANNER */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#fff',
          border: 'none',
          padding: '26px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                Active Membership
              </span>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                {currentConfig.badge}
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0' }}>
              {currentConfig.name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
              {currentConfig.desc}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.65)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Store Capacity Utilization
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {currentConfig.usageText}
            </div>
            <div style={{ width: '160px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px', marginLeft: 'auto' }}>
              <div style={{ width: `${currentConfig.usagePct}%`, height: '100%', background: '#38bdf8', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 TIER PRICING GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {/* Tier 1: Free */}
        <div
          className="card"
          style={{
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            background: '#fff',
            border: activePlan === 'free' || activePlan === 'starter' ? '2px solid #2e6bc5' : '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#092c4c', marginBottom: '4px' }}>
            Starter Kirana
          </div>
          <div style={{ fontSize: '12px', color: '#646b72', marginBottom: '12px' }}>
            Free forever for single store owners
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#092c4c', marginBottom: '16px' }}>
            ₹0 <span style={{ fontSize: '13px', fontWeight: 500, color: '#646b72' }}>/ month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#334155' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> <strong>1 Store Location</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Up to 50 Products Catalog
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> UPI QR & POS Billing Terminal
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Daily WhatsApp Sales Summary
            </li>
          </ul>
          <button
            disabled={activePlan === 'free' || activePlan === 'starter'}
            onClick={() => {
              setActivePlan('starter');
              showToast('Switched to Starter Kirana plan.');
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: activePlan === 'free' || activePlan === 'starter' ? 'default' : 'pointer',
              border: '1px solid #e5e7eb',
              background: activePlan === 'free' || activePlan === 'starter' ? '#f8fafc' : '#fff',
              color: activePlan === 'free' || activePlan === 'starter' ? '#94a3b8' : '#092c4c',
            }}
          >
            {activePlan === 'free' || activePlan === 'starter' ? 'Current Active Plan' : 'Downgrade to Starter'}
          </button>
        </div>

        {/* Tier 2: Pro */}
        <div
          className="card"
          style={{
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            background: '#fff',
            border: '2px solid #3b82f6',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '10px',
              letterSpacing: '0.5px',
            }}
          >
            MOST POPULAR (BHARAT)
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>
            Vyapar Pro
          </div>
          <div style={{ fontSize: '12px', color: '#646b72', marginBottom: '12px' }}>
            For growing stores & mini-marts
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#092c4c', marginBottom: '16px' }}>
            ₹799 <span style={{ fontSize: '13px', fontWeight: 500, color: '#646b72' }}>/ month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#334155' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> <strong>Up to 5 Retail Outlets</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> <strong>Unlimited Products & SKUs</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> GST E-Invoice & e-Way Bill Generator
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> WhatsApp & SMS Low Stock Alerts
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Automated Reorder Suggestions
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Priority Verification Staff Support
            </li>
          </ul>
          <button
            onClick={() => handleOpenUpgrade('pro')}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              background: activePlan === 'pro' ? '#2563eb' : '#2e6bc5',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            }}
          >
            {activePlan === 'pro' ? 'Current Active Plan' : 'Upgrade to Vyapar Pro'}
          </button>
        </div>

        {/* Tier 3: Enterprise */}
        <div
          className="card"
          style={{
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            background: '#fff',
            border: activePlan === 'enterprise' ? '2px solid #7e22ce' : '1px solid #7e22ce',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#7e22ce', marginBottom: '4px' }}>
            Bharat Enterprise
          </div>
          <div style={{ fontSize: '12px', color: '#646b72', marginBottom: '12px' }}>
            For supermarket chains & multi-branch depots
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#092c4c', marginBottom: '16px' }}>
            ₹3,499 <span style={{ fontSize: '13px', fontWeight: 500, color: '#646b72' }}>/ month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#334155' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> <strong>Unlimited Stores & Outlets</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Multi-Warehouse Stock Transfer & Depots
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Bulk Supplier POs & Credit Terms
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Dedicated 24/7 Account Manager
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> Custom ERP & Tally Prime Sync API
            </li>
          </ul>
          <button
            onClick={() => handleOpenUpgrade('enterprise')}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              background: '#1e1b4b',
              color: '#fff',
            }}
          >
            {activePlan === 'enterprise' ? 'Current Active Plan' : 'Upgrade to Enterprise'}
          </button>
        </div>
      </div>

      {/* MODAL: MOCK PAYMENT GATEWAY */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              width: 'min(520px, 94vw)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#fff',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                  StockOverflow Bharat Gateway
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  Upgrade to {selectedTier === 'pro' ? 'Vyapar Pro' : 'Bharat Enterprise'}
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Amount Summary */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Plan Base Amount</span>
                  <span>₹{selectedTierConfig.basePrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  <span>GST (18% Goods & Services Tax)</span>
                  <span>₹{selectedTierConfig.gst.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  <span>Total Payable</span>
                  <span style={{ color: '#2563eb' }}>₹{selectedTierConfig.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPayMethod('upi')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: payMethod === 'upi' ? '#2e6bc5' : '#e5e7eb',
                    background: payMethod === 'upi' ? '#2e6bc5' : '#fff',
                    color: payMethod === 'upi' ? '#fff' : '#0f172a',
                  }}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: payMethod === 'card' ? '#2e6bc5' : '#e5e7eb',
                    background: payMethod === 'card' ? '#2e6bc5' : '#fff',
                    color: payMethod === 'card' ? '#fff' : '#0f172a',
                  }}
                >
                  Card (RuPay/Visa)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('net')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: payMethod === 'net' ? '#2e6bc5' : '#e5e7eb',
                    background: payMethod === 'net' ? '#2e6bc5' : '#fff',
                    color: payMethod === 'net' ? '#fff' : '#0f172a',
                  }}
                >
                  NetBanking
                </button>
              </div>

              {/* UPI Form */}
              {payMethod === 'upi' && !processing && (
                <div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'inline-block', padding: '8px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <svg width="120" height="120" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#ffffff" />
                        <rect x="10" y="10" width="26" height="26" fill="#0f172a" />
                        <rect x="14" y="14" width="18" height="18" fill="#ffffff" />
                        <rect x="18" y="18" width="10" height="10" fill="#0f172a" />
                        <rect x="64" y="10" width="26" height="26" fill="#0f172a" />
                        <rect x="68" y="14" width="18" height="18" fill="#ffffff" />
                        <rect x="72" y="18" width="10" height="10" fill="#0f172a" />
                        <rect x="10" y="64" width="26" height="26" fill="#0f172a" />
                        <rect x="14" y="68" width="18" height="18" fill="#ffffff" />
                        <rect x="18" y="72" width="10" height="10" fill="#0f172a" />
                        <rect x="42" y="14" width="8" height="8" fill="#0f172a" />
                        <rect x="52" y="24" width="6" height="6" fill="#0f172a" />
                        <rect x="42" y="34" width="16" height="16" fill="#0f172a" />
                        <rect x="14" y="44" width="8" height="12" fill="#0f172a" />
                        <rect x="64" y="44" width="12" height="8" fill="#0f172a" />
                        <rect x="80" y="52" width="10" height="10" fill="#0f172a" />
                        <rect x="44" y="64" width="12" height="12" fill="#0f172a" />
                        <rect x="64" y="68" width="16" height="8" fill="#0f172a" />
                        <rect x="70" y="80" width="14" height="10" fill="#0f172a" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                      Scan with GPay, PhonePe, Paytm or BHIM
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                      Or Enter UPI ID
                    </label>
                    <input
                      type="text"
                      defaultValue="retailer@upi"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Card Form */}
              {payMethod === 'card' && !processing && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      defaultValue="4532 9812 3456 8892"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Valid Thru
                      </label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="882"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Authorized Store Owner"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* NetBanking Form */}
              {payMethod === 'net' && !processing && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Select Popular Indian Bank
                  </label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank (PNB)</option>
                  </select>
                </div>
              )}

              {/* Processing State */}
              {processing && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 14px',
                    }}
                  ></div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Authorizing with Banking Switch...
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Please do not refresh or close this window
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!processing && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    style={{
                      flex: 2,
                      padding: '10px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    }}
                  >
                    Pay ₹{selectedTierConfig.total.toFixed(2)} & Activate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
