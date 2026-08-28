import React from 'react';
import ProductCard from './ProductCard';

/**
 * ProductGrid Component
 * 
 * Props:
 * - products: array of products (lifted data filtered by parent)
 * - loading: boolean (loading state)
 * - error: string | null (error state)
 * - onViewProduct: function (callback forwarded to ProductCard)
 * - onAddToCart: function (callback forwarded to ProductCard)
 * - selectedCategory: string (active filter category)
 */
export default function ProductGrid({
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
            <ProductCard
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
