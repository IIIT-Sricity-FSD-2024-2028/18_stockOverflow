/**
 * HeroSection_consumer.jsx - Hero Promotional Banner for Landing Page
 * 
 * IN LAYMAN'S TERMS:
 * The prominent banner with "Find Products That Fit Your Workflow",
 * a call-to-action "Browse Products" button, and illustration image.
 */

import React from 'react';

export default function HeroSection_consumer({
  onBrowseClick,
  title = 'Find Products That Fit Your Workflow',
  subtitle = 'Browse professional tools, electronics, and accessories. Reserve products instantly and review them after delivery.'
}) {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>
          Find Products That Fit Your <span>Workflow</span>
        </h1>
        <p>{subtitle}</p>
        <button
          type="button"
          className="btn-browse"
          onClick={onBrowseClick}
        >
          Browse Products
        </button>
      </div>

      <div className="hero-img-wrap">
        <div className="hero-img-placeholder">
          <img
            src="./cart-image.png"
            alt="Shopping cart with high-tech workflow tools"
            onError={(e) => {
              // Fallback placeholder if relative path differs
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      </div>
    </section>
  );
}
