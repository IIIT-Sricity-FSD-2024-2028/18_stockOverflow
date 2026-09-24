import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

export default function RetailerLayout({ activeView, setActiveView, onSwitchModule, children }) {
  const { user, logout, switchStore } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popoverRef = useRef(null);

  const viewTitles = {
    dashboard: 'Retailer Dashboard',
    products: 'Products',
    'add-product': 'Add Product',
    'edit-product': 'Edit Product',
    'inventory-overview': 'Inventory Overview',
    'low-stocks': 'Low Stocks',
    stores: 'Multi Store View',
    'stock-adjustment': 'Stock Adjustment',
    customers: 'Customers',
    billers: 'Billers',
    suppliers: 'Suppliers',
    'supplier-performance': 'Supplier Performance Scorecard',
    reorder: 'Reorder Recommendations',
    'purchase-orders': 'Purchase Orders',
    'po-products': 'Add Products to PO',
    returns: 'Purchase Return',
    'subscription-plan': 'Subscription Plans & Billing',
    profile: 'Retailer Profile',
  };

  const stores = Array.isArray(user?.profile?.stores) && user.profile.stores.length > 0
    ? user.profile.stores.map((s, idx) => ({
        id: s.code || s.storeId || s.id || `store-${idx + 1}`,
        name: s.name || `Store ${idx + 1}`,
      }))
    : [{ id: user?.storeId || 'JOHN-S-STORE', name: user?.store || "John's Retail Store" }];

  const currentStoreId = user?.currentStoreId || user?.storeId || stores[0]?.id;
  const storeName = stores.find((s) => s.id === currentStoreId)?.name || user?.store || "John's Retail Store";

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'JO';

  // Load real notifications from backend products & returns
  useEffect(() => {
    async function loadNotifications() {
      try {
        const [returnsRes, productsRes] = await Promise.all([
          retailerApi.getReturns().catch(() => []),
          retailerApi.getProducts().catch(() => []),
        ]);

        const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
        const returnList = Array.isArray(returnsRes) ? returnsRes : [];
        const prodList = Array.isArray(productsRes) ? productsRes : [];

        const notifs = [];

        // 1. Pending Returns
        returnList.forEach((r) => {
          const status = String(r.status || '').toLowerCase();
          if (status === 'pending') {
            const id = `return-${r.id || Math.random()}`;
            if (!dismissed.includes(id)) {
              notifs.push({
                id,
                type: 'return',
                title: 'Return Request Pending',
                msg: `Customer ${r.customer || 'Consumer'} requested return for ${r.product || 'item'}${r.qty ? ` (Qty: ${r.qty})` : ''}`,
                time: r.date ? new Date(r.date).toLocaleDateString('en-IN') : 'Recent',
                view: 'returns',
              });
            }
          }
        });

        // 2. Low Stock Alerts
        prodList.forEach((p) => {
          const qty = Number(p.qty != null ? p.qty : (p.initialQty || 0));
          const min = Number(p.min != null ? p.min : (p.minStockAlert != null ? p.minStockAlert : 10));
          if (qty <= min) {
            const id = `stock-${p.sku || p.id}`;
            if (!dismissed.includes(id)) {
              notifs.push({
                id,
                type: 'stock',
                title: qty === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
                msg: `${p.name || 'Product'} is at ${qty} units (Min Alert: ${min})`,
                time: 'Inventory Alert',
                view: 'low-stocks',
              });
            }
          }
        });

        setNotifications(notifs);
      } catch (err) {
        console.warn('Could not load notifications in layout:', err);
      }
    }

    loadNotifications();
  }, [user, activeView]);

  // Dismiss a single notification
  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
    if (!dismissed.includes(notifId)) {
      dismissed.push(notifId);
      localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // Clear all notifications
  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
    notifications.forEach((n) => {
      if (!dismissed.includes(n.id)) dismissed.push(n.id);
    });
    localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
    setNotifications([]);
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* SIDEBAR — Figma Exact */}
      <aside className="sidebar">
        <div className="sidebar-title">
          <div className="sidebar-logo">
            <img src="/assets/Logo.png" alt="StockOverflow" onError={(e) => { e.target.src = '/Logo.png'; }} />
          </div>
        </div>
        <div className="sidebar-body">
          {/* MAIN */}
          <div className="sb-group">
            <div className="sb-group-label">Main</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
                    <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
                    <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
                    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
                  </svg>
                </span>
                <span className="sb-item-label">Retailer Dashboard</span>
                <span className="sb-dot-badge">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#f97316" strokeWidth="1.6">
                    <polyline points="2,3.5 5,6.5 8,3.5" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* INVENTORY */}
          <div className="sb-group">
            <div className="sb-group-label">Inventory</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'products' ? 'active' : ''}`}
                onClick={() => setActiveView('products')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M8 1.5L14.5 5v6L8 14.5 1.5 11V5L8 1.5z" />
                    <path d="M1.5 5L8 8.5 14.5 5M8 8.5V14.5" />
                  </svg>
                </span>
                <span className="sb-item-label">Products</span>
              </button>

              <button
                className={`sb-item ${activeView === 'add-product' ? 'active' : ''}`}
                onClick={() => setActiveView('add-product')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="1" y="1" width="14" height="14" rx="1.5" />
                    <line x1="8" y1="4.5" x2="8" y2="11.5" />
                    <line x1="4.5" y1="8" x2="11.5" y2="8" />
                  </svg>
                </span>
                <span className="sb-item-label">Add Product</span>
              </button>

              <button
                className={`sb-item ${activeView === 'edit-product' ? 'active' : ''}`}
                onClick={() => setActiveView('edit-product')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M10.5 2.5l3 3-8.5 8.5H1.5V10.5l9-8z" />
                    <line x1="8.5" y1="4.5" x2="11.5" y2="7.5" />
                  </svg>
                </span>
                <span className="sb-item-label">Edit Product</span>
              </button>

              <button
                className={`sb-item ${activeView === 'inventory-overview' ? 'active' : ''}`}
                onClick={() => setActiveView('inventory-overview')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="8" cy="8" r="6.5" />
                    <line x1="8" y1="5" x2="8" y2="8.5" />
                    <circle cx="8" cy="10.5" r=".7" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="sb-item-label">Inventory Overview</span>
              </button>

              <button
                className={`sb-item ${activeView === 'low-stocks' ? 'active' : ''}`}
                onClick={() => setActiveView('low-stocks')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <polyline points="2,13 5.5,8.5 8.5,11 13.5,4" />
                    <polyline points="10.5,4 13.5,4 13.5,7" />
                  </svg>
                </span>
                <span className="sb-item-label">Low Stocks</span>
              </button>

              <button
                className={`sb-item ${activeView === 'stores' ? 'active' : ''}`}
                onClick={() => setActiveView('stores')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="1" y="2" width="14" height="12" rx="1" />
                    <line x1="5" y1="2" x2="5" y2="14" />
                    <line x1="1" y1="7" x2="15" y2="7" />
                  </svg>
                </span>
                <span className="sb-item-label">Multi Store View</span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* STOCK */}
          <div className="sb-group">
            <div className="sb-group-label">Stock</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'stock-adjustment' ? 'active' : ''}`}
                onClick={() => setActiveView('stock-adjustment')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <polyline points="2,14 5,11 8,8 11,5 14,2" />
                    <polyline points="8,2 14,2 14,8" />
                  </svg>
                </span>
                <span className="sb-item-label">Stock Adjustment</span>
                <span className="sb-end-icon">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.6">
                    <polyline points="3.5,2 6.5,5 3.5,8" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* PEOPLES */}
          <div className="sb-group">
            <div className="sb-group-label">Peoples</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveView('customers')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="8" cy="5.5" r="2.5" />
                    <path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" />
                  </svg>
                </span>
                <span className="sb-item-label">Customers</span>
                <span className="sb-end-icon">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.6">
                    <polyline points="3.5,2 6.5,5 3.5,8" />
                  </svg>
                </span>
              </button>

              <button
                className={`sb-item ${activeView === 'billers' ? 'active' : ''}`}
                onClick={() => setActiveView('billers')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M2 3h12v10H2z" />
                    <line x1="2" y1="6" x2="14" y2="6" />
                    <line x1="2" y1="9" x2="14" y2="9" />
                  </svg>
                </span>
                <span className="sb-item-label">Billers</span>
                <span className="sb-end-icon">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.6">
                    <polyline points="3.5,2 6.5,5 3.5,8" />
                  </svg>
                </span>
              </button>

              <button
                className={`sb-item ${activeView === 'suppliers' || activeView === 'supplier-performance' ? 'active' : ''}`}
                onClick={() => setActiveView('suppliers')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <rect x="2" y="7" width="12" height="8" rx="1.5" />
                    <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" />
                    <circle cx="8" cy="11" r="1.5" />
                  </svg>
                </span>
                <span className="sb-item-label">Suppliers</span>
                <span className="sb-end-icon">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.6">
                    <polyline points="3.5,2 6.5,5 3.5,8" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* PURCHASES */}
          <div className="sb-group">
            <div className="sb-group-label">Purchases</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'reorder' ? 'active' : ''}`}
                onClick={() => setActiveView('reorder')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" />
                    <polyline points="9,2 9,6 13,6" />
                    <line x1="8" y1="9.5" x2="8" y2="12.5" />
                    <line x1="6.5" y1="11" x2="9.5" y2="11" />
                  </svg>
                </span>
                <span className="sb-item-label" style={{ fontSize: '13px', whiteSpace: 'normal', lineHeight: '1.3' }}>
                  Reorder Recommendation
                </span>
              </button>

              <button
                className={`sb-item ${activeView === 'purchase-orders' || activeView === 'po-products' ? 'active' : ''}`}
                onClick={() => setActiveView('purchase-orders')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" />
                    <polyline points="9,2 9,6 13,6" />
                    <line x1="6" y1="10" x2="10" y2="10" />
                  </svg>
                </span>
                <span className="sb-item-label">Purchase Order</span>
                <span className="sb-end-icon">
                  <svg viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.6">
                    <polyline points="3.5,2 6.5,5 3.5,8" />
                  </svg>
                </span>
              </button>

              <button
                className={`sb-item ${activeView === 'returns' ? 'active' : ''}`}
                onClick={() => setActiveView('returns')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="8" cy="8" r="6" />
                    <polyline points="5.5,8 8,5.5 10.5,8" />
                    <line x1="8" y1="5.5" x2="8" y2="11" />
                  </svg>
                </span>
                <span className="sb-item-label">Purchase Return</span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* PLANS & BILLING */}
          <div className="sb-group">
            <div className="sb-group-label">Plans & Billing</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'subscription-plan' ? 'active' : ''}`}
                onClick={() => setActiveView('subscription-plan')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <polygon points="8 1 10.3 5.7 15.5 6.5 11.8 10.1 12.6 15.3 8 12.8 3.4 15.3 4.2 10.1 0.5 6.5 5.7 5.7 8 1" />
                  </svg>
                </span>
                <span className="sb-item-label">Subscription Plan</span>
                <span className="sb-dot-badge" style={{ background: '#4e7fd9', width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' }}></span>
              </button>
            </div>
          </div>

          <div className="sb-divider"></div>

          {/* SETTINGS */}
          <div className="sb-group">
            <div className="sb-group-label">Settings</div>
            <div className="sb-menus">
              <button
                className={`sb-item ${activeView === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveView('profile')}
              >
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="8" cy="5.5" r="2.5" />
                    <path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" />
                  </svg>
                </span>
                <span className="sb-item-label">Retailer Profile</span>
              </button>

              <button className="sb-item" onClick={logout}>
                <span className="sb-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M10.5 8H2.5M5,5 2,8 5,11" />
                    <path d="M6 3.5h5.5a2 2 0 012 2v5a2 2 0 01-2 2H6" />
                  </svg>
                </span>
                <span className="sb-item-label" style={{ color: '#ef4444' }}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              Home / <span>{viewTitles[activeView] || 'Retailer Dashboard'}</span>
            </div>

            {/* Interactive Store Switcher matching Vanilla */}
            <div
              id="retailerStoreSwitcherWrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                background: '#fff',
                marginLeft: '14px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>Store</span>
              <select
                id="retailerStoreSwitcher"
                value={currentStoreId}
                onChange={(e) => switchStore(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="topbar-right" ref={popoverRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onSwitchModule && (
              <button
                type="button"
                onClick={() => onSwitchModule('consumer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Switch to Consumer Storefront"
              >
                🛒 Consumer Store
              </button>
            )}

            {/* Notification Icon Button with live badge */}
            <div
              className="topbar-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              title="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {notifications.length > 0 && <span className="notif-dot"></span>}
            </div>

            {/* Notification Popover matching Vanilla */}
            {isNotifOpen && (
              <div
                className="so-notif-popover open"
                id="retailerNotifPopover"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="so-notif-head">
                  <div className="so-notif-head-title">
                    Notifications <span className="so-notif-badge">{notifications.length}</span>
                  </div>
                  {notifications.length > 0 && (
                    <button className="so-notif-clear" onClick={handleClearAllNotifs}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="so-notif-list">
                  {notifications.length === 0 ? (
                    <div className="so-notif-empty">🎉 All caught up! No unread notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="so-notif-item"
                        onClick={() => {
                          setActiveView(n.view);
                          setIsNotifOpen(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`so-notif-icon ${n.type}`}>
                          {n.type === 'return' ? '↩️' : '⚠️'}
                        </div>
                        <div className="so-notif-body">
                          <div className="so-notif-title">{n.title}</div>
                          <div className="so-notif-msg">{n.msg}</div>
                          <div className="so-notif-time">{n.time}</div>
                        </div>
                        <button
                          className="so-notif-close"
                          title="Dismiss"
                          onClick={(e) => handleDismissNotif(e, n.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Avatar Button */}
            <button
              className="topbar-avatar"
              id="topbarAvatar"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              type="button"
            >
              {initials}
            </button>

            {/* Profile Popover matching Vanilla */}
            {isProfileOpen && (
              <div
                className="profile-popover open"
                id="profilePopover"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-popover-head">
                  <div className="profile-popover-avatar">{initials}</div>
                  <div>
                    <div className="profile-popover-name">{user?.name || 'Retailer Profile'}</div>
                    <div className="profile-popover-sub">Retailer</div>
                  </div>
                </div>
                <div className="profile-popover-grid">
                  <div className="profile-popover-item">
                    <div className="profile-popover-label">Email</div>
                    <div className="profile-popover-value">{user?.email || '-'}</div>
                  </div>
                  <div className="profile-popover-item">
                    <div className="profile-popover-label">Store</div>
                    <div className="profile-popover-value">{storeName}</div>
                  </div>
                </div>
                <div className="profile-popover-actions">
                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setIsProfileOpen(false);
                    }}
                    type="button"
                  >
                    Edit Profile
                  </button>
                  <button className="btn-primary" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}

