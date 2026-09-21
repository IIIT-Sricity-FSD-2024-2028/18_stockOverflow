/**
 * FeedbackPage.jsx - Exact Feedback & Review Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `feedback.html` identically.
 * It is wrapped in the Customer Sidebar & Header layout.
 * Features 3-step progress, product selection card, 4 category cards (Quality, Stock, Pricing, Other),
 * 5-star interactive rating row, comments textarea, and submission button.
 */

import React, { useState, useEffect, useMemo } from 'react';
import CustomerLayout from '../layout/CustomerLayout';
import { fetchProducts, submitProductFeedback } from '../../utils/api';

export default function FeedbackPage({
  initialSku = '',
  cart = [],
  userSession,
  onNavigate,
  onLogout,
  showToast,
}) {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(initialSku);
  const [feedbackType, setFeedbackType] = useState('quality');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchProducts();
      setProducts(data);
      if (!selectedSku && data.length > 0) {
        setSelectedSku(data[0].sku);
      }
    }
    loadCatalog();
  }, [selectedSku]);

  useEffect(() => {
    if (userSession?.name) setCustomerName(userSession.name);
  }, [userSession]);

  const selectedProduct = products.find((p) => p.sku === selectedSku) || null;

  const typeLabels = {
    quality: 'Product Quality',
    pricing: 'Pricing Concern',
    stock: 'Stock Availability',
    other: 'General Experience',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      showToast('Please enter your feedback comments.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productName: selectedProduct?.name || selectedSku,
        customer: customerName.trim() || userSession?.name || 'Verified Customer',
        type: typeLabels[feedbackType] || 'Product Quality',
        rating: Number(rating),
        comment: comments.trim(),
        date: new Date().toISOString(),
      };

      await submitProductFeedback(selectedSku, payload);
      setIsSubmitted(true);
      showToast('⭐ Thank you for your feedback!');
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      activeMenu="products"
      pageTitle="Customer Feedback"
      pageSub="Share your product ratings and reviews"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {isSubmitted ? (
          <div className="card" style={{ textAlign: 'center', borderColor: '#10b981', padding: '40px 24px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>⭐</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Feedback Submitted!
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              Thank you! Your verified rating for <strong>{selectedProduct?.name || selectedSku}</strong> has been recorded and will help other shoppers.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="reserve-btn"
                onClick={() => onNavigate('search')}
              >
                Back to Products
              </button>
              <button
                type="button"
                className="view-btn"
                style={{ marginTop: 0, width: 'auto' }}
                onClick={() => {
                  setIsSubmitted(false);
                  setComments('');
                }}
              >
                Submit Another Review
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step 1: Select Product */}
            <div className="form-card">
              <div className="form-section-title">1. Select Product</div>
              <label>Choose Product from Catalog</label>
              <select
                className="form-input"
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — {p.category}
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div className="product-result">
                  <div className="product-result-icon">
                    {selectedProduct.productImg ? (
                      <img src={selectedProduct.productImg} alt={selectedProduct.name} />
                    ) : (
                      <span>{selectedProduct.emoji || '📦'}</span>
                    )}
                  </div>
                  <div className="product-result-info">
                    <div className="product-result-name">{selectedProduct.name}</div>
                    <div className="product-result-tags">
                      <span className="result-tag tag-sku">SKU: {selectedProduct.sku}</span>
                      <span className="result-tag tag-stock">₹{Number(selectedProduct.priceUSD || selectedProduct.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Feedback Details */}
            <form onSubmit={handleSubmit}>
              <div className="form-card">
                <div className="form-section-title">2. Feedback Category & Rating</div>

                {/* 4 Type Cards */}
                <label>Feedback Type</label>
                <div className="type-grid" style={{ marginBottom: '18px' }}>
                  <div
                    className={`type-card ${feedbackType === 'quality' ? 'selected' : ''}`}
                    onClick={() => setFeedbackType('quality')}
                  >
                    <div className="type-icon">🌟</div>
                    <div>
                      <div className="type-name">Product Quality</div>
                      <div className="type-desc">Build, materials & performance</div>
                    </div>
                  </div>

                  <div
                    className={`type-card ${feedbackType === 'pricing' ? 'selected' : ''}`}
                    onClick={() => setFeedbackType('pricing')}
                  >
                    <div className="type-icon">💰</div>
                    <div>
                      <div className="type-name">Pricing & Value</div>
                      <div className="type-desc">Affordability & market price</div>
                    </div>
                  </div>

                  <div
                    className={`type-card ${feedbackType === 'stock' ? 'selected' : ''}`}
                    onClick={() => setFeedbackType('stock')}
                  >
                    <div className="type-icon">📦</div>
                    <div>
                      <div className="type-name">Stock Availability</div>
                      <div className="type-desc">Inventory & store pickup</div>
                    </div>
                  </div>

                  <div
                    className={`type-card ${feedbackType === 'other' ? 'selected' : ''}`}
                    onClick={() => setFeedbackType('other')}
                  >
                    <div className="type-icon">📝</div>
                    <div>
                      <div className="type-name">General Experience</div>
                      <div className="type-desc">Support & packaging</div>
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <label>Overall Star Rating</label>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`star ${rating >= s ? 'active' : ''}`}
                      onClick={() => setRating(s)}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="rating-label">{rating} / 5 Stars</span>
                </div>
              </div>

              {/* Step 3: Comments & Author */}
              <div className="form-card">
                <div className="form-section-title">3. Your Comments</div>
                <div style={{ marginBottom: '14px' }}>
                  <label>Your Name / Nickname</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label>Detailed Feedback *</label>
                  <textarea
                    rows="4"
                    className="form-input"
                    placeholder="What did you think of the product? Share pros, cons, and tips..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="reserve-btn"
                  style={{ width: '100%', padding: '14px', fontSize: '14px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Feedback...' : 'Publish Feedback & Rating'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
