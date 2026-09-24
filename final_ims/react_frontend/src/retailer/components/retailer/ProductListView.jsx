import React, { useState, useEffect } from 'react';
import { request } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ProductListView({ onNavigate, onEditProduct }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All');
  const [viewProduct, setViewProduct] = useState(null);
  const [message, setMessage] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await request('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await request(`/products/${id}`, { method: 'DELETE' });
        setMessage(`Deleted product "${name}" successfully.`);
        setTimeout(() => setMessage(''), 3000);
        loadProducts();
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const brands = ['All', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;

    let matchesStock = true;
    if (selectedStockFilter === 'Low') {
      matchesStock = Number(p.qty || 0) <= Number(p.min || 10);
    } else if (selectedStockFilter === 'Out') {
      matchesStock = Number(p.qty || 0) === 0;
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  return (
    <div className="pl-content">
      {/* PAGE HEADER */}
      <div className="pl-page-header">
        <div>
          <div className="pl-page-title">Products</div>
          <div className="pl-breadcrumb">Products</div>
        </div>
        <div className="pl-toolbar">
          <span
            id="skuPlanPill"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748b',
              background: '#f1f5f9',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {products.length} / 50 SKUs (Starter)
          </span>

          <button className="pl-btn-primary" onClick={() => onNavigate('add-product')}>
            <svg viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="5.5" />
              <line x1="6.5" y1="4" x2="6.5" y2="9" />
              <line x1="4" y1="6.5" x2="9" y2="6.5" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          ✓ {message}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="pl-table-card">
        {/* Table Toolbar */}
        <div className="pl-table-toolbar">
          <div className="pl-search">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" />
              <line x1="9.5" y1="9.5" x2="13" y2="13" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pl-filter-group">
            <select
              className="pl-filter-btn"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ outline: 'none', border: '1px solid #e6eaed', cursor: 'pointer' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'Category' : `Category: ${c}`}
                </option>
              ))}
            </select>

            <select
              className="pl-filter-btn"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ outline: 'none', border: '1px solid #e6eaed', cursor: 'pointer' }}
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'Brand' : `Brand: ${b}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Proper */}
        <div className="pl-table-wrap">
          <table className="pl-table">
            <thead>
              <tr>
                <th className="th-check">
                  <input type="checkbox" className="pl-checkbox" />
                </th>
                <th className="th-sku">
                  <span className="sort-icon">
                    SKU
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="2,3.5 5,1 8,3.5" />
                      <polyline points="2,6.5 5,9 8,6.5" />
                    </svg>
                  </span>
                </th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Created By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    {loading ? 'Loading products...' : 'No products found matching your search.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input type="checkbox" className="pl-checkbox" />
                    </td>
                    <td>
                      <span className="sku-text">{p.sku || '—'}</span>
                    </td>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-img-wrap">
                          {p.productImg || p.image ? (
                            <img src={p.productImg || p.image} alt="" />
                          ) : (
                            <span style={{ fontSize: '16px' }}>{p.emoji || '📦'}</span>
                          )}
                        </div>
                        <span className="prod-name">{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-text">{p.category || '—'}</span>
                    </td>
                    <td>
                      <span className="cell-text">{p.brand || '—'}</span>
                    </td>
                    <td>
                      <span className="cell-text" style={{ color: '#092c4c' }}>
                        ₹{Number(p.price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className="cell-text">{p.unit || 'Piece'}</span>
                    </td>
                    <td>
                      <span
                        className="cell-text"
                        style={{
                          color: Number(p.qty || 0) <= Number(p.min || 10) ? '#dc2626' : '#15803d',
                          fontWeight: 800,
                        }}
                      >
                        {p.qty || 0}
                      </span>
                    </td>
                    <td>
                      <div className="creator-cell">
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#5b67ca',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {(p.createdBy || user?.name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="creator-name">{p.createdBy || user?.name || 'Admin'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
                        {/* View Details */}
                        <button
                          className="act-btn view"
                          title="View Details"
                          onClick={() => setViewProduct(p)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z" />
                            <circle cx="8" cy="8" r="2" />
                          </svg>
                        </button>

                        {/* Edit */}
                        <button
                          className="act-btn edit"
                          title="Edit"
                          onClick={() => onEditProduct && onEditProduct(p)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11 2l3 3-9 9H2v-3l9-9z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          className="act-btn del"
                          title="Delete"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M6 7v5M10 7v5M3.5 4l.8 10a1 1 0 001 .9h5.4a1 1 0 001-.9l.8-10" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="pl-table-footer">
          <div className="pl-rows-per-page">
            Row Per Page
            <div className="pl-rpp-select">
              <span>{filteredProducts.length}</span>
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="2,4 6,8 10,4" />
              </svg>
            </div>
            Entries
          </div>
          <div className="pl-pagination">
            <button className="pl-page-nav">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9,2 4,7 9,12" />
              </svg>
            </button>
            <div className="pl-pages">
              <span className="pl-page-btn active">1</span>
            </div>
            <button className="pl-page-nav">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="5,2 10,7 5,12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL (Exact match from Product_List.html) */}
      {viewProduct && (
        <div className="pl-modal-overlay open" onClick={() => setViewProduct(null)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div>
                <div className="pl-modal-title">{viewProduct.name}</div>
                <div className="pl-modal-subtitle">
                  SKU: {viewProduct.sku || '—'} • {viewProduct.category || 'General'} • {viewProduct.brand || 'No brand'}
                </div>
              </div>
              <button type="button" className="pl-modal-close" onClick={() => setViewProduct(null)}>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <line x1="3" y1="3" x2="11" y2="11" />
                  <line x1="11" y1="3" x2="3" y2="11" />
                </svg>
              </button>
            </div>

            <div className="pl-modal-body">
              <div className="pl-modal-media">
                <div className="pl-modal-main-media">
                  {viewProduct.productImg || viewProduct.image ? (
                    <img src={viewProduct.productImg || viewProduct.image} alt={viewProduct.name} />
                  ) : (
                    <span className="pl-modal-emoji">{viewProduct.emoji || '📦'}</span>
                  )}
                </div>
                <div className="pl-modal-meta-badges">
                  <span className="pl-modal-badge">Category: {viewProduct.category || 'Standard'}</span>
                  <span className="pl-modal-badge">Brand: {viewProduct.brand || 'Retail'}</span>
                </div>
              </div>

              <div className="pl-modal-content">
                <div className="pl-modal-section">
                  <div className="pl-modal-section-title">Description</div>
                  <p className="pl-modal-copy">
                    {viewProduct.description || 'No description entered for this product item.'}
                  </p>
                </div>

                <div className="pl-modal-section">
                  <div className="pl-modal-section-title">Stock & Pricing Breakdown</div>
                  <div className="pl-detail-grid">
                    <div className="pl-detail-card">
                      <div className="pl-detail-label">Selling Price</div>
                      <div className="pl-detail-value" style={{ color: '#2e6bc5' }}>
                        ₹{Number(viewProduct.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="pl-detail-card">
                      <div className="pl-detail-label">Cost Price</div>
                      <div className="pl-detail-value">
                        ₹{Number(viewProduct.costPrice || viewProduct.price * 0.7 || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="pl-detail-card">
                      <div className="pl-detail-label">Current Stock Available</div>
                      <div
                        className="pl-detail-value"
                        style={{
                          color: Number(viewProduct.qty || 0) <= Number(viewProduct.min || 10) ? '#dc2626' : '#15803d',
                        }}
                      >
                        {viewProduct.qty || 0} {viewProduct.unit || 'Units'}
                      </div>
                    </div>
                    <div className="pl-detail-card">
                      <div className="pl-detail-label">Low Stock Threshold</div>
                      <div className="pl-detail-value">{viewProduct.min || 10} Units</div>
                    </div>
                  </div>
                </div>

                {viewProduct.tags && (
                  <div className="pl-modal-section">
                    <div className="pl-modal-section-title">Product Tags</div>
                    <div className="pl-chip-row">
                      {String(viewProduct.tags)
                        .split(',')
                        .map((tag, idx) => (
                          <span key={idx} className="pl-chip">
                            {tag.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
