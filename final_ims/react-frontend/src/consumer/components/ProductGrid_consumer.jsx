/**
 * ProductGrid_consumer.jsx - Grid Container for Product Cards
 * 
 * IN LAYMAN'S TERMS:
 * Displays the responsive grid of product cards, handling loading spinners,
 * error alerts, and empty states when no products match.
 */

import React from 'react';
import ProductCard_consumer from './ProductCard_consumer';

export default function ProductGrid_consumer({
  products = [],
  loading = false,
  error = null,
  onViewProduct,
  onAddToCart,
  selectedCategory = 'ALL'
}) {
  return (
    <section className="products-section" id="products-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            {selectedCategory === 'ALL'
              ? 'Top Rated Products By Category'
              : `${selectedCategory} Collection`}
          </h2>
          <p className="section-subtitle">
            Curated selection of enterprise-grade inventory with real-time stock status.
          </p>
        </div>
      </div>

      {loading && (
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Fetching inventory from StockOverflow network...</p>
        </div>
      )}

      {error && (
        <div className="state-container error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-container empty-state">
          <div className="empty-icon">📦</div>
          <h3>No matching products found</h3>
          <p>Try adjusting your category filter or search keywords.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard_consumer
              key={product.sku}
              product={product}
              onViewProduct={onViewProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
