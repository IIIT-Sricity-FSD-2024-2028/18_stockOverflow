import React from 'react';
import LocationWidget from './LocationWidget';

/**
 * Navbar Component
 * 
 * Props:
 * - cartCount: number (lifted state from parent, item quantity count in cart)
 * - selectedStore: string (lifted state from parent)
 * - onLocationClick: function (callback from parent to open store selection modal)
 * - onLogout: function (callback from parent to log out the user)
 * - userSession: object | null (current logged in user data)
 */
export default function Navbar({
  cartCount = 0,
  selectedStore = 'Global Hub',
  onLocationClick,
  onLogout,
  userSession
}) {
  return (
    <nav className="site-nav">
      <div className="nav-brand">
        <span className="nav-logo-text">StockOverflow</span>
        <span className="nav-badge-role">Consumer</span>
      </div>

      {/* Location / Store Selector Widget */}
      <LocationWidget
        selectedStore={selectedStore}
        onLocationClick={onLocationClick}
      />

      {/* Navigation Links */}
      <div className="nav-links">
        <a href="#products-section" className="nav-link">Products</a>
        <a href="#orders" onClick={(e) => { e.preventDefault(); alert('Redirecting to Orders page...'); }} className="nav-link">
          Orders
        </a>
        <a
          href="#cart"
          className="nav-link nav-link-cart"
          onClick={(e) => {
            e.preventDefault();
            alert(`Cart opened! You have ${cartCount} item(s) in your cart.`);
          }}
        >
          <span>Cart</span>
          <span
            className={`cart-badge ${cartCount > 0 ? 'visible' : ''}`}
            aria-label={`${cartCount} items in cart`}
          >
            {cartCount}
          </span>
        </a>
      </div>

      {/* User info & Logout */}
      <div className="nav-actions">
        {userSession?.name && (
          <span className="user-greeting">Hi, {userSession.name.split(' ')[0]}</span>
        )}
        <button
          type="button"
          className="btn-logout"
          onClick={onLogout}
          title="Sign out of your account"
        >
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
