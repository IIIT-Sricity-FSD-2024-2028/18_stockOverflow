/**
 * ConsumerLandingPage_consumer.jsx - Consumer Storefront Landing Page
 * 
 * Exact port of `frontend/customer module/consumer-landingpage.html`:
 * - Top nav with StockOverflow brand, store location selector, links to Products, Orders, Cart, and Logout.
 * - Hero banner with "Find Products That Fit Your Workflow", description, and "Browse Products" button.
 * - Top Rated Products By Category section featuring category winners in color-accented cards.
 * - Product cards with thumbnail, category, brand, SKU, store name, rating, formatted INR price, stock status, and "View Product".
 * - Store selection modal.
 * - Standard footer.
 */

import React, { useState, useMemo } from 'react';
import StoreModal_consumer from './StoreModal_consumer';
import NotificationToast_consumer from './NotificationToast_consumer';

const CARD_BGS = [
  '#f8fafc', '#f0fdf4', '#eff6ff', '#fefce8',
  '#fdf2f8', '#f5f3ff', '#fff7ed', '#f0fdfa'
];

function getStockMeta(product) {
  if (!product || Number(product.qty) === 0) {
    return { key: 'out', label: 'Out of Stock' };
  }
  const max = Number(product.max || 0);
  if (max > 0 && Number(product.qty) <= max * 0.2) {
    return { key: 'low', label: 'Low Stock' };
  }
  if (Number(product.qty) <= 10) {
    return { key: 'low', label: 'Low Stock' };
  }
  return { key: 'in', label: 'Available' };
}

function getRatingMeta(product) {
  const directAvg = Number(product && product.ratingAvg);
  const directCount = Number(product && product.ratingCount);
  const feedback = Array.isArray(product && product.feedback) ? product.feedback : [];

  if (Number.isFinite(directAvg) && directAvg > 0) {
    return {
      avg: directAvg,
      count: Number.isFinite(directCount) && directCount > 0 ? Math.floor(directCount) : feedback.length
    };
  }

  if (!feedback.length) {
    return { avg: 0, count: 0 };
  }

  const total = feedback.reduce((sum, item) => sum + (Number(item.rating) || 0), 0);
  return {
    avg: total / feedback.length,
    count: feedback.length
  };
}

function pickTopRatedProductsByCategory(productsList) {
  const winners = Object.create(null);

  (Array.isArray(productsList) ? productsList : []).forEach((product) => {
    const category = (product && product.category ? String(product.category).trim() : '') || 'General';
    const current = winners[category];

    const currentRating = current ? getRatingMeta(current) : { avg: -1, count: -1 };
    const nextRating = getRatingMeta(product);

    const isBetterRating = nextRating.avg > currentRating.avg;
    const isSameRatingMoreReviews = nextRating.avg === currentRating.avg && nextRating.count > currentRating.count;
    const isSameRatingAndReviewsMoreSales =
      nextRating.avg === currentRating.avg &&
      nextRating.count === currentRating.count &&
      (Number(product.soldThisMonth) || 0) > (Number(current && current.soldThisMonth) || 0);

    if (!current || isBetterRating || isSameRatingMoreReviews || isSameRatingAndReviewsMoreSales) {
      winners[category] = product;
    }
  });

  return Object.keys(winners).sort().map((category) => winners[category]);
}

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
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Cart total quantity
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // Pick top rated product per category matching consumer-landingpage.html
  const topRatedProducts = useMemo(() => {
    return pickTopRatedProductsByCategory(products);
  }, [products]);

  return (
    <div className="consumer-landing-page-wrapper">
      <div className="consumer">
        {/* ═══ NAV ═══ */}
        <nav>
          {/* Brand Logo */}
          <div className="nav-logo" onClick={() => onNavigate('home')}>
            StockOverflow
          </div>

          {/* Location Widget */}
          <div
            className="nav-location"
            onClick={() => setIsStoreModalOpen(true)}
            title="Select a nearby store"
          >
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
              <span className="nav-location-lbl">Deliver to</span>
              <span className="nav-location-val" id="globalStoreDisplay">
                {selectedStore || 'Global'}
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
            >
              Cart{' '}
              <span
                className="cart-badge-inline cart-badge"
                style={{ display: cartCount > 0 ? 'inline-block' : 'none' }}
              >
                {cartCount}
              </span>
            </a>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className="btn-logout"
            id="logoutbutton"
            onClick={onLogout}
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
        </nav>

        {/* ═══ HERO SECTION ═══ */}
        <section className="hero">
          <div className="hero-text">
            <h1>
              Find Products That Fit Your <span>Workflow</span>
            </h1>
            <p>
              Browse professional tools, electronics, and accessories. Reserve products instantly and review them after delivery.
            </p>
            <button
              type="button"
              className="btn-browse"
              id="browseproduct"
              onClick={() => onNavigate('search')}
            >
              Browse Products
            </button>
          </div>

          <div className="hero-img-wrap">
            <div className="hero-img-placeholder">
              <img
                src="/cart-image.png"
                alt="Shopping cart with floating products"
                onError={(e) => {
                  e.target.src = '/cart-image.png';
                }}
              />
            </div>
          </div>
        </section>

        {/* ═══ PRODUCTS SECTION ═══ */}
        <section className="products-section" id="products-section">
          <h2>Top Rated Products By Category</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: '#64748b' }}>Loading top rated products...</p>
            </div>
          ) : topRatedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p>No products available right now.</p>
            </div>
          ) : (
            <div className="products-grid" id="productsGrid">
              {topRatedProducts.map((p, idx) => {
                const stock = getStockMeta(p);
                const rating = getRatingMeta(p);
                const price = Number(p.priceUSD ?? p.price ?? 0);
                const bg = CARD_BGS[idx % CARD_BGS.length];

                return (
                  <article
                    key={p.sku || idx}
                    className={`product-card card-${idx % 8}`}
                    data-sku={p.sku}
                    onClick={() => onViewProduct(p.sku)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-inner" style={{ background: bg }}>
                      <div className="card-img">
                        <div
                          className="img-placeholder"
                          style={{
                            background:
                              p.palette && p.palette[0]
                                ? p.palette[0]
                                : 'linear-gradient(135deg,#e0f7ff,#bae6fd)',
                          }}
                        >
                          <img
                            src={p.productImg || ''}
                            alt={p.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            className="img-fallback"
                            style={{ display: p.productImg ? 'none' : 'flex' }}
                          >
                            {p.emoji || '📦'}
                          </div>
                        </div>
                      </div>

                      <div className="card-name">{p.name}</div>
                      <div className="card-meta">
                        {p.category || 'General'} · {p.brand || 'StockOverflow'} · {p.sku}
                      </div>
                      <div className="card-meta" style={{ color: '#0284c7', fontWeight: 600 }}>
                        Store: {p.retailerName || selectedStore || "John's Retail Store"}
                      </div>
                      <div className="card-meta">
                        Rating {rating.avg ? rating.avg.toFixed(1) : '0.0'} ({rating.count})
                      </div>
                      <div className="card-price">₹{price.toLocaleString('en-IN')}</div>
                      <div
                        className={`card-stock ${
                          stock.key === 'low' ? 'low' : stock.key === 'out' ? 'out' : ''
                        }`}
                      >
                        {stock.label} • {Number(p.qty || 0)} units
                      </div>

                      <button
                        className="card-btn"
                        type="button"
                        data-sku={p.sku}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProduct(p.sku);
                        }}
                      >
                        View Product
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer>
          <p>© 2026 StockOverflow</p>
        </footer>
      </div>

      {/* Store Selection Modal */}
      <StoreModal_consumer
        isOpen={isStoreModalOpen}
        currentStore={selectedStore}
        stores={stores}
        onSelectStore={(store) => {
          onSelectStore(store);
          setIsStoreModalOpen(false);
        }}
        onClose={() => setIsStoreModalOpen(false)}
      />

      {/* Toast Notification */}
      <NotificationToast_consumer message={toastMessage} />
    </div>
  );
}
