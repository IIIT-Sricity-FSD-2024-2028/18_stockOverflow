/**
 * ProductSearchPage.jsx - Exact Product Search & Catalog Portal
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `productsearch.html` identically.
 * It contains the left sidebar, the top header bar, the filter bar (search input, store location filter,
 * category selector, stock filter, sorting selector), and the 3-column products grid with stock status badges.
 */

import React, { useState, useMemo } from 'react';
import CustomerLayout from '../layout/CustomerLayout';

export default function ProductSearchPage({
  products = [],
  stores = [],
  selectedStore = 'Downtown Store',
  cart = [],
  userSession,
  loading = false,
  onAddToCart,
  onViewProduct,
  onNavigate,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('featured');

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return list.sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          product.name?.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q);

        const matchesCategory = !categoryFilter || product.category === categoryFilter;

        const qty = product.qty !== undefined ? product.qty : 10;
        let matchesStock = true;
        if (stockFilter === 'in-stock') matchesStock = qty > 10;
        else if (stockFilter === 'low-stock') matchesStock = qty > 0 && qty <= 10;
        else if (stockFilter === 'out-stock') matchesStock = qty <= 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        const priceA = Number(a.priceUSD || a.price || 0);
        const priceB = Number(b.priceUSD || b.price || 0);
        if (sortFilter === 'price-low') return priceA - priceB;
        if (sortFilter === 'price-high') return priceB - priceA;
        if (sortFilter === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [products, searchQuery, categoryFilter, stockFilter, sortFilter]);

  return (
    <CustomerLayout
      activeMenu="products"
      pageTitle="Products"
      pageSub="Browse all products from retailer inventory"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search product name, SKU, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Store Location Filter */}
        <div className="filter-select">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            style={{ fontWeight: 500 }}
          >
            <option value="">Global (All Stores)</option>
            {stores.map((s) => (
              <option key={s.id || s.name} value={s.id || s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-select">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="filter-select">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="in-stock">In Stock (&gt; 10)</option>
            <option value="low-stock">Low Stock (1–10)</option>
            <option value="out-stock">Out of Stock (0)</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="filter-select">
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* ── Products Grid ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner"></div>
          <p style={{ color: '#64748b' }}>Loading products catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <h3>No products match your search criteria</h3>
          <p>Try changing the active filters or clearing your search term.</p>
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

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
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
    </CustomerLayout>
  );
}
