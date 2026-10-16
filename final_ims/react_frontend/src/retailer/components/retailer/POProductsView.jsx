import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function POProductsView({ supplier, onBack, onAddProducts, initialSelected = [] }) {
  const { user } = useAuth();
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { [id]: { product, qty } }
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [toastMsg, setToastMsg] = useState('');

  const supplierName = supplier?.name || localStorage.getItem('po_selected_supplier_name') || 'Apex Footwear Co.';
  const supplierId = supplier?.id || localStorage.getItem('po_selected_supplier_id') || '';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const [suppliersRes, productsRes] = await Promise.all([
          retailerApi.getSuppliers().catch(() => []),
          retailerApi.getProducts(user?.retailerId).catch(() => []),
        ]);

        let items = [];

        // 1. Check if supplier has specific catalogue products
        if (Array.isArray(suppliersRes)) {
          const sNameLower = supplierName.toLowerCase().trim();
          const foundSup = suppliersRes.find((s) => {
            if (supplierId && s.id === supplierId) return true;
            const name = (s.name || s.companyName || s.business?.companyName || '').toLowerCase().trim();
            return name === sNameLower || name.includes(sNameLower) || sNameLower.includes(name);
          });

          if (foundSup && Array.isArray(foundSup.products) && foundSup.products.length > 0) {
            foundSup.products.forEach((sp, idx) => {
              const price = Math.round(Number(sp.unitPrice || sp.price || 500));
              items.push({
                id: sp.sku || sp.id || `SUP-${idx + 1}`,
                name: sp.name || 'Supplier Product',
                emoji: sp.emoji || '📦',
                sku: sp.sku || `SKU-SUP-${idx + 1}`,
                cat: sp.category || 'General',
                price: price,
                stock: Number(sp.stockAvailable || sp.stock || 80),
                stockStatus: Number(sp.stockAvailable || 80) > 10 ? 'ok' : Number(sp.stockAvailable || 80) > 0 ? 'low' : 'out',
                brand: sp.brand || supplierName,
                supplier: supplierName,
                profitMargin: 10,
              });
            });
          }
        }

        // 2. Fetch inventory products from backend
        if (Array.isArray(productsRes) && productsRes.length > 0) {
          productsRes.forEach((p) => {
            const qty = Number(p.qty != null ? p.qty : p.quantity) || 0;
            const pSup = String(p.supplier || '').toLowerCase();
            const pBrand = String(p.brand || '').toLowerCase();
            const sName = supplierName.toLowerCase();

            // Avoid duplicates
            if (items.some((item) => item.sku === p.sku || item.id === p.id)) {
              return;
            }

            if (pSup.includes(sName) || pBrand.includes(sName) || items.length === 0) {
              const price = Math.round(Number(p.buyingPrice || p.cost || p.price || 450));
              items.push({
                id: p.id || p.sku,
                name: p.name || 'Catalog Item',
                emoji: p.emoji || '📦',
                sku: p.sku || p.id,
                cat: p.category || 'Electronics',
                price: price,
                stock: qty,
                stockStatus: qty <= 0 ? 'out' : qty <= 10 ? 'low' : 'ok',
                brand: p.brand || supplierName,
                supplier: supplierName,
                profitMargin: 10,
              });
            }
          });
        }

        // 3. Fallback catalogue if list is empty
        if (items.length === 0) {
          items = [
            { id: 'NIKE-AM-01', name: 'Nike Air Max 270', emoji: '👟', sku: 'NIKE-AM-01', cat: 'Footwear', price: 4200, stock: 45, stockStatus: 'ok', brand: 'Nike', supplier: supplierName, profitMargin: 15 },
            { id: 'ADID-UB-02', name: 'Adidas Ultraboost Light', emoji: '👟', sku: 'ADID-UB-02', cat: 'Footwear', price: 5600, stock: 30, stockStatus: 'ok', brand: 'Adidas', supplier: supplierName, profitMargin: 12 },
            { id: 'PUMA-RS-03', name: 'Puma RS-X Reinvention', emoji: '👟', sku: 'PUMA-RS-03', cat: 'Footwear', price: 3400, stock: 8, stockStatus: 'low', brand: 'Puma', supplier: supplierName, profitMargin: 20 },
            { id: 'APPL-W9-04', name: 'Apple Watch Series 9 GPS', emoji: '⌚', sku: 'APPL-W9-04', cat: 'Electronics', price: 28500, stock: 24, stockStatus: 'ok', brand: 'Apple', supplier: supplierName, profitMargin: 10 },
            { id: 'BEAT-SP-05', name: 'Beats Studio Pro Headphones', emoji: '🎧', sku: 'BEAT-SP-05', cat: 'Electronics', price: 9200, stock: 15, stockStatus: 'ok', brand: 'Beats', supplier: supplierName, profitMargin: 18 },
            { id: 'ECHO-D5-06', name: 'Amazon Echo Dot 5th Gen', emoji: '🔊', sku: 'ECHO-D5-06', cat: 'Electronics', price: 2999, stock: 0, stockStatus: 'out', brand: 'Amazon', supplier: supplierName, profitMargin: 15 },
            { id: 'LOGI-MX-07', name: 'Logitech MX Master 3S', emoji: '🖱️', sku: 'LOGI-MX-07', cat: 'Peripherals', price: 6800, stock: 40, stockStatus: 'ok', brand: 'Logitech', supplier: supplierName, profitMargin: 15 },
            { id: 'KEYC-K2-08', name: 'Keychron K2 Wireless Keyboard', emoji: '⌨️', sku: 'KEYC-K2-08', cat: 'Peripherals', price: 5400, stock: 19, stockStatus: 'ok', brand: 'Keychron', supplier: supplierName, profitMargin: 15 },
          ];
        }

        setCatalogue(items);

        // Load pre-existing selections if passed or in localStorage
        const stored = initialSelected.length > 0
          ? initialSelected
          : JSON.parse(localStorage.getItem('po_products') || '[]');
        const selMap = {};
        if (Array.isArray(stored)) {
          stored.forEach((item) => {
            const found = items.find((p) => p.id === item.id || p.sku === item.sku);
            if (found) {
              if (item.profitMargin != null) found.profitMargin = Number(item.profitMargin);
              selMap[found.id] = { product: found, qty: Number(item.qty) || 1 };
            }
          });
        }
        setSelected(selMap);
      } catch (err) {
        console.error('Error loading PO catalogue products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [user, supplierName]);

  const toggleSelect = (prodId) => {
    const prod = catalogue.find((p) => p.id === prodId);
    if (!prod) return;
    const newSel = { ...selected };
    if (newSel[prodId]) {
      delete newSel[prodId];
    } else {
      newSel[prodId] = { product: prod, qty: 1 };
    }
    setSelected(newSel);
  };

  const changeQty = (prodId, delta) => {
    if (!selected[prodId]) return;
    const newQty = Math.max(1, selected[prodId].qty + delta);
    setSelected({
      ...selected,
      [prodId]: { ...selected[prodId], qty: newQty },
    });
  };

  const setQty = (prodId, val) => {
    if (!selected[prodId]) return;
    const q = Math.max(1, Math.min(999, parseInt(val, 10) || 1));
    setSelected({
      ...selected,
      [prodId]: { ...selected[prodId], qty: q },
    });
  };

  const setMargin = (prodId, val) => {
    const m = Math.max(0, Math.min(500, parseFloat(val) || 0));
    setCatalogue(
      catalogue.map((p) => (p.id === prodId ? { ...p, profitMargin: m } : p))
    );
    if (selected[prodId]) {
      setSelected({
        ...selected,
        [prodId]: {
          ...selected[prodId],
          product: { ...selected[prodId].product, profitMargin: m },
        },
      });
    }
  };

  const removeChip = (prodId) => {
    const updated = { ...selected };
    delete updated[prodId];
    setSelected(updated);
  };

  const clearAll = () => {
    setSelected({});
  };

  const handleAddToPO = () => {
    const ids = Object.keys(selected);
    if (!ids.length) {
      showToast('Please select at least one product.');
      return;
    }

    const payload = ids.map((id) => {
      const item = selected[id];
      const margin = item.product.profitMargin != null ? Number(item.product.profitMargin) : 10;
      return {
        id: item.product.id,
        name: item.product.name,
        emoji: item.product.emoji || '📦',
        sku: item.product.sku,
        cat: item.product.cat || 'General',
        price: item.product.price,
        profitMargin: margin,
        qty: item.qty,
        stock: item.product.stock,
        stockStatus: item.product.stockStatus,
      };
    });

    localStorage.setItem('po_products', JSON.stringify(payload));
    localStorage.setItem('po_products_ts', Date.now().toString());

    if (onAddProducts) {
      onAddProducts(payload);
    } else if (onBack) {
      onBack();
    }
  };

  // Filtering
  const filteredProducts = catalogue.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    const matchCat = !activeCategory || p.cat === activeCategory;
    const matchStock = !stockFilter || p.stockStatus === stockFilter;
    return matchQ && matchCat && matchStock;
  });

  // Sorting
  if (sortOption === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortOption === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
  if (sortOption === 'name') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOption === 'stock') filteredProducts.sort((a, b) => b.stock - a.stock);

  const selectedIds = Object.keys(selected);
  const totalSelectedUnits = selectedIds.reduce((sum, id) => sum + selected[id].qty, 0);
  const totalSelectedValue = selectedIds.reduce((sum, id) => sum + selected[id].product.price * selected[id].qty, 0);

  const categories = ['All Products', 'Electronics', 'Footwear', 'Apparel', 'Peripherals', 'Furniture', 'Accessories'];

  return (
    <div className="content" style={{ padding: '24px 28px 100px', maxWidth: '1240px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#092c4c', margin: 0, lineHeight: 1.3 }}>
            Add Products to PO
          </h1>
          <div className="page-sub" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#646b72', marginTop: '3px' }}>
            Dashboard › Purchase Order › Select Products from <span style={{ color: '#2e6bc5', fontWeight: 700 }}>{supplierName}</span>
          </div>
        </div>
        <div>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Cancel & Return to PO
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* SUMMARY STATS HEADER */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '14px 20px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#092c4c' }}>{catalogue.length}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Total Products</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e5e7eb' }}></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2e6bc5' }}>{selectedIds.length}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Selected</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e5e7eb' }}></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#092c4c' }}>{totalSelectedUnits}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Total Units</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e5e7eb' }}></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>₹{totalSelectedValue.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Est. Value</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                width: '34px',
                height: '34px',
                border: 'none',
                background: viewMode === 'grid' ? '#eef3fc' : '#fff',
                color: viewMode === 'grid' ? '#2e6bc5' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              style={{
                width: '34px',
                height: '34px',
                border: 'none',
                background: viewMode === 'list' ? '#eef3fc' : '#fff',
                color: viewMode === 'list' ? '#2e6bc5' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER ROW */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '7px 12px', background: '#fff', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search products, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
          />
        </div>

        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          style={{ height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Footwear">Footwear</option>
          <option value="Apparel">Apparel</option>
          <option value="Peripherals">Peripherals</option>
          <option value="Furniture">Furniture</option>
          <option value="Accessories">Accessories</option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          style={{ height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Stock</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="name">Sort: Name A-Z</option>
          <option value="price-asc">Sort: Price Low–High</option>
          <option value="price-desc">Sort: Price High–Low</option>
          <option value="stock">Sort: Stock Level</option>
        </select>
      </div>

      {/* CATEGORY PILL TABS */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {categories.map((cat) => {
          const isAct = (!activeCategory && cat === 'All Products') || activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === 'All Products' ? '' : cat)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: isAct ? '1px solid #2e6bc5' : '1px solid #e5e7eb',
                background: isAct ? '#2e6bc5' : '#fff',
                color: isAct ? '#fff' : '#4b5563',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .14s',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* PRODUCTS DISPLAY (GRID OR LIST) */}
      {filteredProducts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#092c4c', marginBottom: '6px' }}>
            No products available for "{supplierName}"
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', maxWidth: '420px', margin: '0 auto 16px' }}>
            There are currently no products matching your search filter in this catalogue.
          </div>
          <button
            onClick={onBack}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Back to Purchase Order
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
          {filteredProducts.map((p) => {
            const isSel = !!selected[p.id];
            const qty = isSel ? selected[p.id].qty : 1;
            const margin = p.profitMargin != null ? p.profitMargin : 10;
            const retailPrice = Math.round(p.price * (1 + margin / 100));
            const stockBg = p.stockStatus === 'ok' ? '#dcfce7' : p.stockStatus === 'low' ? '#fef3c7' : '#fee2e2';
            const stockColor = p.stockStatus === 'ok' ? '#15803d' : p.stockStatus === 'low' ? '#92400e' : '#991b1b';
            const stockLabel = p.stockStatus === 'ok' ? 'In Stock' : p.stockStatus === 'low' ? 'Low Stock' : 'Out of Stock';

            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                style={{
                  background: '#fff',
                  border: isSel ? '2px solid #2e6bc5' : '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isSel ? '0 0 0 2px rgba(46,107,197,.18)' : '0 1px 3px rgba(0,0,0,.06)',
                  transition: 'all .18s',
                }}
              >
                {/* Selection Checkmark */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isSel ? '#2e6bc5' : '#fff',
                    border: isSel ? '2px solid #2e6bc5' : '2px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  {isSel && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Card Image Area */}
                <div
                  style={{
                    height: '140px',
                    background: 'linear-gradient(135deg,#f0f4ff 0%,#e8eeff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '50px' }}>{p.emoji || '📦'}</span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      background: stockBg,
                      color: stockColor,
                    }}
                  >
                    {stockLabel}
                  </span>
                </div>

                {/* Card Info Area */}
                <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13.5px', fontWeight: 700, color: '#092c4c' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {p.sku} &bull; <span style={{ color: '#2563eb', fontWeight: 600 }}>{p.brand || supplierName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#2e6bc5', fontWeight: 600 }}>{p.cat}</div>

                  {/* Margin rate & Selling price input */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '6px',
                      background: '#f8fafc',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Margin:</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={margin}
                      onChange={(e) => setMargin(p.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '46px', height: '24px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', color: '#0f172a', background: '#fff' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>%</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>
                      Retail: ₹{retailPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderTop: '1px solid #f3f4f6',
                    background: '#fafbfc',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Unit Cost</div>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: '#092c4c' }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {isSel ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '5px', overflow: 'hidden' }}
                    >
                      <button
                        onClick={() => changeQty(p.id, -1)}
                        style={{ width: '28px', height: '28px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#475569' }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={qty}
                        onChange={(e) => setQty(p.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '38px', height: '28px', border: 'none', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, outline: 'none' }}
                      />
                      <button
                        onClick={() => changeQty(p.id, 1)}
                        style={{ width: '28px', height: '28px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#475569' }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Wholesale available'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredProducts.map((p) => {
            const isSel = !!selected[p.id];
            const qty = isSel ? selected[p.id].qty : 1;
            const margin = p.profitMargin != null ? p.profitMargin : 10;
            const retailPrice = Math.round(p.price * (1 + margin / 100));
            const stockBg = p.stockStatus === 'ok' ? '#dcfce7' : p.stockStatus === 'low' ? '#fef3c7' : '#fee2e2';
            const stockColor = p.stockStatus === 'ok' ? '#15803d' : p.stockStatus === 'low' ? '#92400e' : '#991b1b';
            const stockLabel = p.stockStatus === 'ok' ? 'In Stock' : p.stockStatus === 'low' ? 'Low Stock' : 'Out of Stock';

            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                style={{
                  background: '#fff',
                  border: isSel ? '2px solid #2e6bc5' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 0 0 2px rgba(46,107,197,.18)' : '0 1px 2px rgba(0,0,0,.04)',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isSel ? '#2e6bc5' : '#fff',
                    border: isSel ? '2px solid #2e6bc5' : '2px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSel && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'linear-gradient(135deg,#f0f4ff,#e8eeff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                  {p.emoji || '📦'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#092c4c' }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '2px', fontSize: '11.5px', color: '#6b7280' }}>
                    <span>{p.sku}</span>
                    <span style={{ color: '#2e6bc5', fontWeight: 600 }}>{p.cat}</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{p.brand || supplierName}</span>
                  </div>
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Margin:</span>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={margin}
                    onChange={(e) => setMargin(p.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '42px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>%</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>
                    ₹{retailPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700, background: stockBg, color: stockColor }}>
                  {stockLabel}
                </span>

                <div style={{ minWidth: '90px', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#092c4c' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </div>

                {isSel ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '5px', overflow: 'hidden', flexShrink: 0 }}
                  >
                    <button onClick={() => changeQty(p.id, -1)} style={{ width: '26px', height: '26px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>−</button>
                    <input type="number" min="1" value={qty} onChange={(e) => setQty(p.id, e.target.value)} style={{ width: '36px', height: '26px', border: 'none', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12px', fontWeight: 700 }} />
                    <button onClick={() => changeQty(p.id, 1)} style={{ width: '26px', height: '26px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                ) : (
                  <div style={{ minWidth: '80px', textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Wholesale'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM STICKY SELECTION PANEL */}
      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '252px',
            right: 0,
            background: '#fff',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 28px',
            zIndex: 80,
            boxShadow: '0 -4px 24px rgba(0,0,0,.08)',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <span style={{ background: '#2e6bc5', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
              {selectedIds.map((id) => {
                const item = selected[id];
                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#eef3fc',
                      border: '1px solid #c9d9f5',
                      borderRadius: '20px',
                      padding: '3px 10px 3px 6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1d4ed8',
                    }}
                  >
                    <span>{item.product.emoji || '📦'}</span>
                    <span>{item.product.name} ×{item.qty}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChip(id);
                      }}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: 'rgba(46,107,197,.15)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2e6bc5',
                        fontSize: '10px',
                        padding: 0,
                        marginLeft: '2px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#092c4c' }}>
              Total: ₹{totalSelectedValue.toLocaleString('en-IN')}
            </div>
            <button
              onClick={clearAll}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 700, color: '#6b7280', cursor: 'pointer' }}
            >
              Clear All
            </button>
            <button
              onClick={handleAddToPO}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                background: '#2e6bc5',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Add to PO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
