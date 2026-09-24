/**
 * ConsumerLandingPage_consumer.jsx - Consumer Storefront Landing Page
 * 
 * IN LAYMAN'S TERMS:
 * This is the exact customer landing page matching `consumer-landingpage.html`.
 * It has:
 * - Top navigation with the StockOverflow blue logo, location selector, links to Products, Orders, Cart, and Logout.
 * - Hero banner with "Shop All Inventory", description, and "Browse Products" button.
 * - Featured products section with category filter pills, search box, and product cards with stock status chips, "+ Cart", and "View Details".
 * - Store selection modal for changing locations.
 * - Footer.
 */

import React, { useState, useMemo } from 'react';
import StoreModal_consumer from './StoreModal_consumer';
import NotificationToast_consumer from './NotificationToast_consumer';

export default function ConsumerLandingPage_consumer({
  products = [],
  stores = [],
  selectedStore = 'Downtown Store',
  cart = [],
  userSession,
  loading = false,
  error = null,
  onAddToCart,
  onViewProduct,
  onSelectStore,
  onNavigate,
  onLogout,
  toastMessage = '',
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Derive cart total quantity count
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // Derive unique categories from products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category && String(p.category).trim()) {
        set.add(String(p.category).trim());
      }
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [products]);

  // Filter products by category and search keyword
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === 'ALL' ||
        String(p.category || '').toLowerCase() === activeCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(p.name || '').toLowerCase().includes(query) ||
        String(p.sku || '').toLowerCase().includes(query) ||
        String(p.brand || '').toLowerCase().includes(query) ||
        String(p.category || '').toLowerCase().includes(query);

      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleBrowseClick = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="consumer-landing-page-wrapper">
      <div className="consumer">
        {/* ── Top Navigation Bar ── */}
        <nav>
          {/* Brand Logo */}
          <div className="nav-logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            StockOverflow
          </div>

          {/* Location Selector */}
          <div className="nav-location" onClick={() => setIsStoreModalOpen(true)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div className="nav-location-text">
              <span className="nav-location-lbl">DELIVERING TO</span>
              <span className="nav-location-val" id="activeStoreLabel">
                {selectedStore} ▾
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('search');
              }}
            >
              Products
            </a>
            <a
              href="#orders"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('orders');
              }}
            >
              Orders
            </a>
            <a
              href="#cart"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('cart');
              }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              Cart
              {cartCount > 0 && (
                <span className="cart-badge-inline" style={{ display: 'inline-block' }}>
                  {cartCount}
                </span>
              )}
            </a>
          </div>

          {/* Logout Button */}
          <button type="button" className="btn-logout" onClick={onLogout}>
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
        </nav>

        {/* ── Hero Section ── */}
        <section className="hero">
          <div className="hero-text">
            <h1>
              Shop All <span>Inventory</span>
            </h1>
            <p>
              Find everything you need in one place. Discover amazing deals today.
            </p>
            <button className="btn-browse" onClick={handleBrowseClick}>
              Browse Products
            </button>
          </div>
          <div className="hero-img-wrap">
            <div className="hero-img-placeholder">
              <img
                src="/cart-image.png"
                alt="Shopping Basket"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Featured Products Section ── */}
        <section className="products-section" id="products-section">
          <h2>Featured Products</h2>

          {/* Filter Bar */}
          <div className="landing-filter-bar">
            <div className="landing-cat-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`landing-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="landing-search-wrap">
              <span className="search-ico">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-btn" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner"></div>
              <p style={{ color: '#64748b' }}>Loading inventory catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <h3>No products found</h3>
              <p>Try adjusting your search query or selecting a different category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p, idx) => {
                const qty = p.qty !== undefined ? p.qty : 10;
                const price = Number(p.priceUSD || p.price || 0);

                let stockClass = 'stock-chip in-stock';
                let stockLabel = `In Stock (${qty})`;
                if (qty <= 0) {
                  stockClass = 'stock-chip out-stock';
                  stockLabel = 'Out of Stock';
                } else if (qty <= 10) {
                  stockClass = 'stock-chip low-stock';
                  stockLabel = `Low Stock (${qty} left)`;
                }

                return (
                  <div key={p.sku || idx} className="prod-card">
                    {/* Image Box */}
                    <div
                      className="prod-img"
                      onClick={() => onViewProduct(p.sku)}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.productImg ? (
                        <img
                          src={p.productImg}
                          alt={p.name}
                          className="prod-img-photo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="prod-img-fallback"
                        style={{ display: p.productImg ? 'none' : 'flex' }}
                      >
                        {p.emoji || '📦'}
                      </div>
                      <span className={stockClass}>{stockLabel}</span>
                    </div>

                    {/* Card Body */}
                    <div className="prod-body">
                      <div className="prod-cat">{p.category || 'General'}</div>
                      <div
                        className="prod-name"
                        title={p.name}
                        onClick={() => onViewProduct(p.sku)}
                        style={{ cursor: 'pointer' }}
                      >
                        {p.name}
                      </div>

                      <hr className="prod-divider" />

                      <div className="prod-footer">
                        <span className="prod-price">₹{price.toLocaleString('en-IN')}</span>
                        {qty > 0 && qty <= 10 && (
                          <span className="low-stock-label">Only {qty} left!</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          type="button"
                          className="view-btn"
                          style={{ flex: 1, marginTop: 0 }}
                          onClick={() => onViewProduct(p.sku)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="btn-add-cart"
                          style={{ padding: '8px 12px' }}
                          disabled={qty <= 0}
                          onClick={() => onAddToCart(p)}
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid #e5e7eb',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          <div>© 2026 StockOverflow. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('search')}>Catalog</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>Orders</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('returns')}>Returns</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('restock')}>Restock Alerts</span>
          </div>
        </footer>

        {/* Store Selection Modal */}
        <StoreModal_consumer
          isOpen={isStoreModalOpen}
          currentStore={selectedStore}
          stores={stores}
          onSelectStore={(storeName) => {
            onSelectStore(storeName);
            setIsStoreModalOpen(false);
          }}
          onClose={() => setIsStoreModalOpen(false)}
        />

        {/* Notification Toast Alert */}
        <NotificationToast_consumer message={toastMessage} visible={!!toastMessage} />
      </div>
    </div>
  );
}
