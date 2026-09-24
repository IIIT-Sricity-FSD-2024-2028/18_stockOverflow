/**
 * ProductDetailPage_consumer.jsx - Exact Product Detail Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `product-detail.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Left Column:
 *   1. Product Image Gallery with thumbnail switcher.
 *   2. Detail card with product name, tag badges, description, and technical specs table.
 *   3. 3-card dynamic recommendations grid.
 *   4. Verified customer reviews and review submission form.
 * Right Column:
 *   1. Big on-hand stock count, sparkline chart, and store-by-store availability list with colored badges.
 *   2. Rating breakdown bars (5 stars down to 1 star) and average rating summary.
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import ReservationModal_consumer from '../components/ReservationModal_consumer';
import {
  fetchProductBySku,
  fetchRatingSummary,
  fetchProductFeedback,
  submitProductFeedback,
} from '../utils/api_consumer';

export default function ProductDetailPage_consumer({
  sku = 'PT001',
  products = [],
  stores = [],
  selectedStore = 'Downtown Store',
  cart = [],
  userSession,
  onAddToCart,
  onViewProduct,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [ratingSummary, setRatingSummary] = useState({
    avg: 4.8,
    total: 3,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 },
  });
  const [reviews, setReviews] = useState([]);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewType, setReviewType] = useState('Product Quality');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // Load product details, reviews, and ratings
  useEffect(() => {
    let isMounted = true;
    async function loadProductData() {
      setLoading(true);
      try {
        const found = await fetchProductBySku(sku);
        if (isMounted) {
          setProduct(found);
          setActiveImage(found?.productImg || '');
        }

        const [summary, feedbackList] = await Promise.all([
          fetchRatingSummary(sku),
          fetchProductFeedback(sku),
        ]);

        if (isMounted) {
          if (summary) setRatingSummary(summary);
          if (feedbackList) setReviews(feedbackList);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (sku) {
      loadProductData();
    }
    return () => {
      isMounted = false;
    };
  }, [sku]);

  // Gallery Thumbnails
  const galleryThumbs = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.productImg) list.push(product.productImg);
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (list.length === 0) {
      list.push(`https://picsum.photos/seed/${product.sku || 'sample'}/600/400`);
      list.push(`https://picsum.photos/seed/${product.sku || 'sample'}2/600/400`);
    }
    return list;
  }, [product]);

  // Dynamic 3-item Recommendations
  const recommendations = useMemo(() => {
    if (!products || products.length === 0) return [];
    const others = products.filter((p) => p.sku !== sku);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [products, sku]);

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please enter your review comments.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        productName: product?.name || 'Product',
        customer: reviewAuthor.trim() || userSession?.name || 'Verified Customer',
        type: reviewType,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        date: new Date().toISOString(),
      };

      await submitProductFeedback(sku, payload);
      showToast('Thank you! Your verified review has been submitted.');

      const [updatedSummary, updatedReviews] = await Promise.all([
        fetchRatingSummary(sku),
        fetchProductFeedback(sku),
      ]);
      setRatingSummary(updatedSummary);
      setReviews(updatedReviews);
      setReviewComment('');
    } catch (err) {
      showToast(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout_consumer
        activeMenu="products"
        pageTitle="Product Detail"
        pageSub="Loading inventory..."
        cartCount={cartCount}
        userSession={userSession}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner"></div>
          <p style={{ color: '#64748b' }}>Loading product details & store inventory...</p>
        </div>
      </CustomerLayout_consumer>
    );
  }

  if (!product) {
    return (
      <CustomerLayout_consumer
        activeMenu="products"
        pageTitle="Product Not Found"
        pageSub="Requested product is unavailable"
        cartCount={cartCount}
        userSession={userSession}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#64748b', margin: '12px 0 20px' }}>
            We could not find the product with SKU: {sku}
          </p>
          <button className="view-btn" onClick={() => onNavigate('search')}>
            Back to Products Catalog
          </button>
        </div>
      </CustomerLayout_consumer>
    );
  }

  const price = Number(product.priceUSD || product.price || 0);
  const totalStock = product.qty !== undefined ? product.qty : 10;
  const storeInventory = Array.isArray(product.storeInventory) ? product.storeInventory : [];

  return (
    <CustomerLayout_consumer
      activeMenu="products"
      pageTitle={product.name}
      pageSub={`SKU: ${product.sku} · Category: ${product.category}`}
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="product-detail-layout">
        {/* ══════════════════════════════════════════════════════════════
           LEFT COLUMN: Image Gallery + Specs + Description + Reviews
        ══════════════════════════════════════════════════════════════ */}
        <div className="left-col">
          {/* Product Image Gallery Card */}
          <div className="img-card">
            <div className="img-main">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="img-main-fallback"
                style={{ display: activeImage ? 'none' : 'flex' }}
              >
                {product.emoji || '📦'}
              </div>
            </div>

            {/* Thumbnail Row */}
            {galleryThumbs.length > 1 && (
              <div className="img-thumbs">
                {galleryThumbs.map((img, i) => (
                  <div
                    key={i}
                    className={`thumb ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Description & Specs Card */}
          <div className="detail-card">
            <div className="detail-header">
              <div className="prod-name-h">{product.name}</div>
              <button
                type="button"
                className="reserve-btn"
                disabled={totalStock <= 0}
                onClick={() => setIsReserveModalOpen(true)}
              >
                📦 Reserve for In-Store Pickup
              </button>
            </div>

            {/* Tag Badges */}
            <div className="tag-row">
              <span className="tag tag-sku">SKU: {product.sku}</span>
              <span className="tag tag-cat">{product.category}</span>
              <span className="tag tag-brand">{product.brand || 'StockOverflow'}</span>
              <span className="tag tag-status">
                {totalStock > 10 ? 'In Stock' : totalStock > 0 ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Product Description */}
            <p className="prod-desc">
              {product.description ||
                'A precision-engineered device designed for reliable day-to-day computing, featuring enterprise-grade performance and energy efficiency.'}
            </p>

            {/* Specification Grid (Zebra Striped Rows) */}
            <div className="spec-grid">
              <div className="spec-row">
                <span className="spec-key">Product SKU</span>
                <span className="spec-val">{product.sku}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Unit Price</span>
                <span className="spec-val" style={{ color: '#2563eb' }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Category</span>
                <span className="spec-val">{product.category}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Brand</span>
                <span className="spec-val">{product.brand || 'StockOverflow'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Supplier</span>
                <span className="spec-val">{product.supplier || 'Global Inventory Supply'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Warranty</span>
                <span className="spec-val">1 Year Official Manufacturer Warranty</span>
              </div>

              {/* Dynamic specs if defined */}
              {product.specs &&
                Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="spec-row">
                    <span className="spec-key">
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </span>
                    <span className="spec-val">{v}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* 3-Card Dynamic Product Recommendations Grid */}
          <div className="detail-card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
              Similar Products & Recommendations
            </h3>
            <div className="recommendations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {recommendations.map((rec) => (
                <div
                  key={rec.sku}
                  className="rec-card"
                  onClick={() => onViewProduct(rec.sku)}
                  style={{
                    border: '1px solid #e8e9f0',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      height: '100px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    {rec.productImg ? (
                      <img
                        src={rec.productImg}
                        alt={rec.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '32px' }}>{rec.emoji || '📦'}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rec.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 6px' }}>
                    {rec.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>
                    ₹{Number(rec.priceUSD || rec.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews & Feedback Section */}
          <div className="detail-card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
              Verified Customer Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
                No reviews yet. Be the first to rate and review this product!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {reviews.map((rev, i) => (
                  <div
                    key={rev.id || i}
                    style={{
                      border: '1px solid #e8e9f0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      background: '#fafbfc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{rev.customer}</span>
                      <span style={{ color: '#f59e0b', fontSize: '14px' }}>
                        {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: '6px' }}>
                      {rev.type || 'Product Quality'} · {rev.date ? new Date(rev.date).toLocaleDateString() : 'Verified Purchase'}
                    </div>
                    <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review Form */}
            <div style={{ borderTop: '1px solid #e8e9f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
                Write a Customer Review
              </h4>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Review Category
                    </label>
                    <select
                      className="form-input"
                      value={reviewType}
                      onChange={(e) => setReviewType(e.target.value)}
                    >
                      <option value="Product Quality">Product Quality</option>
                      <option value="Pricing Concern">Pricing & Value</option>
                      <option value="Stock Issue">Stock Availability</option>
                      <option value="Other">General Experience</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Star Rating ({reviewRating} / 5)
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '22px',
                          color: reviewRating >= s ? '#f59e0b' : '#cbd5e1',
                          cursor: 'pointer',
                        }}
                        onClick={() => setReviewRating(s)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Detailed Comments *
                  </label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="reserve-btn"
                  disabled={isSubmittingReview}
                  style={{ width: '100%' }}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
           RIGHT COLUMN: Stock Widget + Store Breakdown + Ratings Breakdown
        ══════════════════════════════════════════════════════════════ */}
        <div className="right-col">
          {/* On-Hand Inventory Card */}
          <div className="r-card">
            <div className="r-card-title">
              <span>📦</span>
              <span>On-Hand Inventory</span>
            </div>

            {/* Big Stock Number */}
            <div className="stock-hero">
              <div className="stock-big">{totalStock}</div>
              <div className="stock-label">Total Units in Retailer Network</div>
              <div className="stock-status">
                {totalStock > 10 ? '✓ Healthy Stock' : totalStock > 0 ? '⚠️ Low Inventory' : '🔴 Out of Stock'}
              </div>
            </div>

            {/* Store Availability List */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                Store Availability Breakdown
              </div>
              {stores.map((s) => {
                const sEntry = storeInventory.find((entry) => entry.storeId === s.id);
                const sQty = sEntry ? sEntry.qty : Math.max(0, Math.floor(totalStock / stores.length));

                let sClass = 'store-status s-in';
                let sLabel = 'In Stock';
                if (sQty <= 0) {
                  sClass = 'store-status s-out';
                  sLabel = 'Out of Stock';
                } else if (sQty <= 5) {
                  sClass = 'store-status s-low';
                  sLabel = 'Low Stock';
                }

                return (
                  <div key={s.id || s.name} className="store-row">
                    <div>
                      <div className="store-name">{s.name}</div>
                      <span className={sClass}>{sLabel}</span>
                    </div>
                    <div className="store-qty">{sQty}</div>
                  </div>
                );
              })}
            </div>

            {/* Direct Add to Cart Action */}
            <button
              type="button"
              className="view-btn"
              style={{
                marginTop: '18px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
              }}
              disabled={totalStock <= 0}
              onClick={() => onAddToCart(product)}
            >
              🛒 {totalStock <= 0 ? 'Out of Stock' : `Add to Cart (₹${price.toLocaleString('en-IN')})`}
            </button>
          </div>

          {/* Customer Ratings Distribution Card */}
          <div className="r-card">
            <div className="r-card-title">
              <span>⭐</span>
              <span>Customer Ratings & Feedback</span>
            </div>

            {/* 5-star to 1-star Distribution */}
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingSummary.breakdown?.[star] || 0;
              const pct = ratingSummary.total > 0 ? Math.round((count / ratingSummary.total) * 100) : 0;
              return (
                <div key={star} className="rating-row">
                  <span className="rating-stars">{star} ★</span>
                  <div className="rating-bar-wrap">
                    <div className="rating-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="rating-pct">{pct}%</span>
                </div>
              );
            })}

            {/* Summary Box */}
            <div className="rating-summary">
              <div className="rating-big">{ratingSummary.avg || 4.8}</div>
              <div>
                <div style={{ color: '#f59e0b', fontSize: '16px' }}>
                  {'★'.repeat(Math.round(ratingSummary.avg || 5))}
                </div>
                <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                  Based on {ratingSummary.total || reviews.length} verified ratings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store Pickup Hold Dialog */}
      <ReservationModal_consumer
        isOpen={isReserveModalOpen}
        product={product}
        stores={stores}
        selectedStore={selectedStore}
        onClose={() => setIsReserveModalOpen(false)}
        onConfirmReservation={async (payload) => {
          showToast('In-store pickup hold placed! You can pick it up at your selected store.');
        }}
      />
    </CustomerLayout_consumer>
  );
}
