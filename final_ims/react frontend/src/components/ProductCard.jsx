import React from 'react';

/**
 * Helper to compute stock level indicator
 */
function getStockMeta(product) {
  const qty = Number(product?.qty ?? 0);
  const max = Number(product?.max ?? 0);
  if (qty === 0) {
    return { key: 'out', label: 'Out of Stock', cssClass: 'out' };
  }
  if (max > 0 && qty <= max * 0.2) {
    return { key: 'low', label: 'Low Stock', cssClass: 'low' };
  }
  if (qty < 10) {
    return { key: 'low', label: 'Low Stock', cssClass: 'low' };
  }
  return { key: 'in', label: 'Available', cssClass: 'in' };
}

/**
 * Helper to compute rating metadata
 */
function getRatingMeta(product) {
  const avg = Number(product?.ratingAvg || 0);
  const count = Number(product?.ratingCount || 0);
  if (avg > 0) {
    return { avg: avg.toFixed(1), count: count || 12 };
  }
  return { avg: '4.8', count: 24 };
}

/**
 * Format currency
 */
function formatPrice(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * ProductCard Component
 * 
 * Props:
 * - product: object (the product data passed from parent)
 * - onViewProduct: function (callback to parent with sku)
 * - onAddToCart: function (callback to parent with product object)
 */
export default function ProductCard({ product, onViewProduct, onAddToCart }) {
  const stock = getStockMeta(product);
  const rating = getRatingMeta(product);
  const bgPalette = Array.isArray(product.palette) && product.palette[0]
    ? product.palette[0]
    : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)';

  const [imgError, setImgError] = React.useState(false);

  return (
    <article
      className="product-card"
      data-sku={product.sku}
      onClick={() => onViewProduct(product.sku)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onViewProduct(product.sku);
        }
      }}
    >
      <div className="card-inner">
        {/* Card Top / Image Area */}
        <div className="card-img">
          <div
            className="img-placeholder"
            style={{ background: bgPalette }}
          >
            {!imgError && product.productImg ? (
              <img
                src={product.productImg}
                alt={product.name}
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="img-fallback">{product.emoji || '📦'}</div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="card-content">
          <div className="card-category-badge">{product.category || 'General'}</div>
          <h3 className="card-name" title={product.name}>{product.name}</h3>
          
          <div className="card-meta">
            <span>{product.brand}</span>
            <span className="dot-sep">•</span>
            <span className="card-sku">{product.sku}</span>
          </div>

          <div className="card-rating">
            <span className="star-icon">★</span>
            <span className="rating-score">{rating.avg}</span>
            <span className="rating-count">({rating.count} reviews)</span>
          </div>

          <div className="card-pricing-row">
            <div className="card-price">{formatPrice(product.priceUSD)}</div>
            <div className={`card-stock ${stock.cssClass}`}>
              <span className="stock-dot"></span>
              {stock.label} ({Number(product.qty || 0)} left)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button
            type="button"
            className="card-btn card-btn-view"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product.sku);
            }}
          >
            View Details
          </button>
          
          <button
            type="button"
            className="card-btn card-btn-cart"
            disabled={product.qty === 0}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            title={product.qty === 0 ? 'Out of stock' : 'Add 1 unit to cart'}
          >
            + Cart
          </button>
        </div>
      </div>
    </article>
  );
}
