/**
 * Navbar.jsx - Universal Top Navigation Bar
 * 
 * IN LAYMAN'S TERMS:
 * This sticky top bar stays visible on every screen.
 * It lets the customer jump to Home, Products, My Orders, Cart, Returns,
 * and Restock Alerts. It also shows the store location picker, live cart badge count,
 * and the user logout button.
 */

import React from 'react';
import LocationWidget from './LocationWidget';

export default function Navbar({
  currentView = 'home',
  cartCount = 0,
  selectedStore = 'Downtown Store',
  onLocationClick,
  onNavigate,
  onLogout,
  userSession,
}) {
  return (
    <nav className="site-nav">
      {/* Brand Logo & Tag */}
      <div className="nav-brand" onClick={() => onNavigate && onNavigate('home')}>
        <span className="nav-logo-text">StockOverflow</span>
        <span className="nav-badge-role">Customer Portal</span>
      </div>

      {/* Location / Store Selector Widget */}
      <LocationWidget
        selectedStore={selectedStore}
        onLocationClick={onLocationClick}
      />

      {/* Main Navigation Links */}
      <div className="nav-links">
        {/* Home */}
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('home')}
        >
          Home
        </button>

        {/* Products Search & Catalog */}
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('search')}
        >
          Catalog & Search
        </button>

        {/* Orders & Tracking */}
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'orders' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('orders')}
        >
          My Orders
        </button>

        {/* Returns / RMA */}
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'returns' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('returns')}
        >
          Returns
        </button>

        {/* Restock Alerts */}
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'restock' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('restock')}
        >
          🔔 Alerts
        </button>

        {/* Cart & Reservations with Live Badge */}
        <button
          type="button"
          className={`nav-link-btn nav-link-cart ${currentView === 'cart' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('cart')}
          title="View Shopping & Reservation Cart"
        >
          <span>🛒 Cart</span>
          {cartCount > 0 && (
            <span className="cart-badge-pill" aria-label={`${cartCount} items in cart`}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* User Info & Logout Button */}
      <div className="nav-actions">
        {userSession?.name && (
          <span className="user-greeting">
            👤 {userSession.name.split(' ')[0]}
          </span>
        )}
        <button
          type="button"
          className="btn-logout"
          onClick={onLogout}
          title="Sign out of your session"
        >
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path
              d="M7.5 17.5H4.17A1.67 1.67 0 0 1 2.5 15.83V4.17A1.67 1.67 0 0 1 4.17 2.5H7.5"
              stroke="#EF4444"
              strokeWidth="1.667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.33 14.17 17.5 10l-4.17-4.17"
              stroke="#EF4444"
              strokeWidth="1.667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 10H7.5"
              stroke="#EF4444"
              strokeWidth="1.667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
