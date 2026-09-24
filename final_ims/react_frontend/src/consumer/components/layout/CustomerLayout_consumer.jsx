/**
 * CustomerLayout_consumer.jsx - Universal Sidebar & Header Layout for Inner Consumer Pages
 * 
 * IN LAYMAN'S TERMS:
 * This component provides the exact sidebar navigation on the left (Dashboard, Products, Orders, Reservations, Returns, Restock Alerts)
 * and the top header bar (with Page Title, Shopping Cart icon with badge, notification bell, and user avatar)
 * used across all the internal customer pages (Products, Detail, Cart, Checkout, Orders, Returns, Feedback, Restock).
 */

import React from 'react';

export default function CustomerLayout_consumer({
  activeMenu = 'products',
  pageTitle = 'Products',
  pageSub = 'Browse all products from retailer inventory',
  cartCount = 0,
  userSession,
  onNavigate,
  onLogout,
  children,
}) {
  return (
    <div className="portal-app-wrapper">
      {/* ── Fixed Left Sidebar ── */}
      <aside className="sidebar">
        {/* Sidebar Brand Logo */}
        <div className="sidebar-logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 800, fontSize: '20px', color: '#38BDF8' }}>
            StockOverflow
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <div className="nav-group-label">MAIN MENU</div>

          {/* Dashboard / Home */}
          <div
            className={`nav-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </div>

          {/* Products Search & Catalog */}
          <div
            className={`nav-item ${activeMenu === 'products' ? 'active' : ''}`}
            onClick={() => onNavigate('search')}
          >
            <span className="nav-icon">📦</span>
            <span>Products</span>
          </div>

          {/* My Orders */}
          <div
            className={`nav-item ${activeMenu === 'orders' ? 'active' : ''}`}
            onClick={() => onNavigate('orders')}
          >
            <span className="nav-icon">📋</span>
            <span>Orders</span>
          </div>

          {/* Reservations / Cart */}
          <div
            className={`nav-item ${activeMenu === 'cart' ? 'active' : ''}`}
            onClick={() => onNavigate('cart')}
          >
            <span className="nav-icon">🛒</span>
            <span>Reservations</span>
            {cartCount > 0 && (
              <span className="sidebar-cart-badge">{cartCount}</span>
            )}
          </div>

          {/* Returns / RMA */}
          <div
            className={`nav-item ${activeMenu === 'returns' ? 'active' : ''}`}
            onClick={() => onNavigate('returns')}
          >
            <span className="nav-icon">🔄</span>
            <span>Returns</span>
          </div>

          {/* Restock Alerts */}
          <div
            className={`nav-item ${activeMenu === 'restock' ? 'active' : ''}`}
            onClick={() => onNavigate('restock')}
          >
            <span className="nav-icon">🔔</span>
            <span>Restock Alerts</span>
          </div>
        </nav>

        {/* Sidebar Bottom Logout */}
        <div className="sidebar-logout-wrap" style={{ marginTop: 'auto', padding: '14px' }}>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              background: '#fff',
              color: '#374151',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Wrap (Right of Sidebar) ── */}
      <div className="main-wrap">
        {/* Sticky Header */}
        <header className="header">
          <div>
            <div className="header-title">{pageTitle}</div>
            <div className="header-sub">{pageSub}</div>
          </div>
          <div className="header-right">
            {/* Shopping Cart Icon with dynamic badge */}
            <div
              className="icon-btn2"
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => onNavigate('cart')}
              title="View Cart"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <div
                  className="cart-badge"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div
              className="icon-btn2"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('restock')}
              title="Restock Alerts"
            >
              🔔
            </div>

            {/* Avatar */}
            <div className="avatar">
              {userSession?.name
                ? userSession.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'AK'}
            </div>
          </div>
        </header>

        {/* Page Body Content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
