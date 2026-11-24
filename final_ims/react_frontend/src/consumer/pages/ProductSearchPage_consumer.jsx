/**
 * ProductSearchPage_consumer.jsx - Exact Product Search & Catalog Portal (Redux Integrated)
 * 
 * IN LAYMAN'S TERMS:
 * This page matches `productsearch.html` identically.
 * It connects to Redux (`catalogSlice` and `cartSlice`):
 * - Reads product catalog and physical store locations from Redux state.
 * - Reads live cart count from Redux state.
 * - Dispatches store selection changes to Redux.
 * - Features dynamic search, store filter, category filter, brand filter, stock status filter,
 *   sorting selector, and responsive 3-column product cards grid.
 */

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomerLayout_consumer from '../components/layout/CustomerLayout_consumer';
import {
  selectProducts,
  selectStores,
  selectSelectedStoreName,
  selectSelectedStoreId,
  setSelectedStore,
  selectCatalogLoading,
} from '../redux/slices/catalogSlice';
import { selectCartCount } from '../redux/slices/cartSlice';

export default function ProductSearchPage_consumer({
  products: propProducts,
  stores: propStores,
  selectedStore: propSelectedStore,
  selectedStoreId: propSelectedStoreId,
  cart: propCart,
  userSession,
  loading: propLoading,
  onAddToCart,
  onViewProduct,
  onNavigate,
  onLogout,
}) {
  const dispatch = useDispatch();

  // Redux Selectors with prop fallbacks
  const reduxProducts = useSelector(selectProducts);
  const reduxStores = useSelector(selectStores);
  const reduxSelectedStore = useSelector(selectSelectedStoreName);
  const reduxSelectedStoreId = useSelector(selectSelectedStoreId);
  const reduxLoading = useSelector(selectCatalogLoading);
  const reduxCartCount = useSelector(selectCartCount);

  const products = propProducts || reduxProducts || [];
  const stores = propStores || reduxStores || [];
  const selectedStore = propSelectedStore || reduxSelectedStore || 'Downtown Store';
  const selectedStoreId = propSelectedStoreId || reduxSelectedStoreId || '';
  const loading = propLoading !== undefined ? propLoading : reduxLoading;
  const cartCount = propCart ? propCart.reduce((t, i) => t + (Number(i.qty) || 1), 0) : reduxCartCount;

  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState(selectedStoreId || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('featured');

  // Extract unique categories from catalog list
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return list.sort();
  }, [products]);

  // Extract unique brands from catalog list
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return list.sort();
  }, [products]);

  // Handle store filter change and synchronize with Redux
  const handleStoreFilterChange = (e) => {
    const newStoreId = e.target.value;
    setStoreFilter(newStoreId);
    if (newStoreId) {
      dispatch(setSelectedStore(newStoreId));
    }
  };

  // Filter products by search text, category, brand, and stock status
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
        const matchesBrand = !brandFilter || product.brand === brandFilter;

        const qty = product.qty !== undefined ? product.qty : 10;
        let matchesStock = true;
        if (stockFilter === 'in-stock') matchesStock = qty > 10;
        else if (stockFilter === 'low-stock') matchesStock = qty > 0 && qty <= 10;
        else if (stockFilter === 'out-stock') matchesStock = qty <= 0;

        return matchesSearch && matchesCategory && matchesBrand && matchesStock;
      })
      .sort((a, b) => {
        const priceA = Number(a.priceUSD || a.price || 0);
        const priceB = Number(b.priceUSD || b.price || 0);
        if (sortFilter === 'price-low') return priceA - priceB;
        if (sortFilter === 'price-high') return priceB - priceA;
        if (sortFilter === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [products, searchQuery, categoryFilter, brandFilter, stockFilter, sortFilter]);

  return (
    <CustomerLayout_consumer
      activeMenu="products"
      pageTitle="Products"
      pageSub="Browse all products from retailer inventory"
      cartCount={cartCount}
      userSession={userSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* ── Filter Bar matching productsearch.html ── */}
      <div className="filter-bar">
        {/* Search Box input */}
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
            onChange={handleStoreFilterChange}
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

        {/* Brand Filter */}
        <div className="filter-select">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
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
              <div
                key={p.sku || idx}
                className="prod-card"
                onClick={() => onViewProduct(p.sku || p.id || p.name)}
                style={{ cursor: 'pointer' }}
              >
                {/* Product Image & Stock Badge */}
                <div className="prod-img">
                  {p.productImg ? (
                    <img
                      src={p.productImg}
                      alt={p.name}
                      className="prod-img-photo"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="prod-img-fallback"
                    style={{ display: p.productImg ? 'none' : 'flex' }}
                  >
                    {p.emoji || '📦'}
                  </div>
                  <span className={stockClass}>● {stockLabel}</span>
                </div>

                {/* Card Body & Details */}
                <div className="prod-body">
                  <div className="prod-cat">
                    {p.category || 'General'} · {p.brand || 'StockOverflow'} · {p.sku}
                  </div>
                  <div
                    className="prod-name"
                    title={p.name}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                    Store: {p.retailerName || selectedStore || "John's Retail Store"}
                  </div>

                  <hr className="prod-divider" />

                  <div className="prod-footer">
                    <div className="prod-price">₹{price.toLocaleString('en-IN')}</div>
                    {qty <= 10 && qty > 0 ? (
                      <div className="low-stock-label">Low stock</div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProduct(p.sku || p.id || p.name);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CustomerLayout_consumer>
  );
}
