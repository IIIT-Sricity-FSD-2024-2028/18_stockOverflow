import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function PurchaseOrdersView({ onBrowseCatalogue }) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [targetStore, setTargetStore] = useState(user?.store || "John's Retail Store (Main)");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [shippingAddress, setShippingAddress] = useState("John's Retail Store, Main Hub, Mumbai");
  const [priority, setPriority] = useState('Normal');
  const [notes, setNotes] = useState('');

  // Added Products
  const [products, setProducts] = useState([]);
  const [bannerMsg, setBannerMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // History state
  const [ordersList, setOrdersList] = useState([]);
  const [searchHistory, setSearchHistory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPODetail, setSelectedPODetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load suppliers and existing PO history
  const loadData = async () => {
    try {
      setLoading(true);
      const [supRes, poRes] = await Promise.all([
        retailerApi.getSuppliers().catch(() => []),
        retailerApi.getPurchaseOrders().catch(() => []),
      ]);

      const rawSuppliers = Array.isArray(supRes) ? supRes : [];
      const sList = rawSuppliers.length > 0
        ? rawSuppliers.map((s) => {
            const name = s.name || s.companyName || s.business?.companyName || s.company || s.primaryContact?.fullName || 'Supplier';
            const category = s.category || s.primaryCategory || s.business?.primaryCategory || 'General';
            return {
              ...s,
              id: s.id || s.code || `SUP-${Math.random()}`,
              name,
              category,
              paymentTerms: s.paymentTerms || s.business?.paymentTerms || 'Net 30',
            };
          })
        : [
            { id: 'SUP-001', name: 'Apex Footwear Co.', category: 'Footwear' },
            { id: 'SUP-002', name: 'Acme Electronics Ltd', category: 'Electronics' },
            { id: 'SUP-003', name: 'Zenith Apparel India', category: 'Apparel' },
            { id: 'SUP-004', name: 'Omni Gadgets Dist.', category: 'Accessories' },
          ];
      setSuppliers(sList);

      const savedSupplierId = localStorage.getItem('po_selected_supplier_id');
      const matched = sList.find((s) => s.id === savedSupplierId);
      if (matched) {
        setSelectedSupplierId(matched.id);
        localStorage.setItem('po_selected_supplier_name', matched.name);
      } else if (sList.length > 0) {
        setSelectedSupplierId(sList[0].id);
        localStorage.setItem('po_selected_supplier_id', sList[0].id);
        localStorage.setItem('po_selected_supplier_name', sList[0].name);
      }

      if (Array.isArray(poRes) && poRes.length > 0) {
        setOrdersList(
          poRes.map((po) => ({
            id: po.id,
            supplier: po.supplierName || po.supplier || 'Supplier',
            supplierId: po.supplierId || '',
            date: po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '18 Sep 2026',
            deliveryDate: po.deliveryDate || '25 Sep 2026',
            items: po.items || [],
            itemsSummary: Array.isArray(po.items) && po.items.length > 0
              ? `${po.items[0].name || 'Item'}${po.items.length > 1 ? ` (+${po.items.length - 1} more)` : ''}`
              : 'Inventory Restock',
            total: Number(po.total || po.subtotal || 0),
            paymentTerms: po.paymentTerms || 'Net 30',
            status: po.status || 'Delivered',
            notes: po.notes || '',
            storeId: po.storeId || user?.store || "John's Retail Store",
          }))
        );
      } else {
        setOrdersList([
          {
            id: 'PO-2026-001',
            supplier: 'Apex Footwear Co.',
            supplierId: 'SUP-001',
            date: '15 Sep 2026',
            deliveryDate: '22 Sep 2026',
            items: [
              { name: 'Nike Air Max 270', sku: 'NIKE-AM-01', emoji: '👟', qty: 15, price: 4200 },
              { name: 'Adidas Ultraboost Light', sku: 'ADID-UB-02', emoji: '👟', qty: 10, price: 5600 },
            ],
            itemsSummary: 'Nike Air Max 270 (+1 more)',
            total: 124950,
            paymentTerms: 'Net 30',
            status: 'Delivered',
            notes: 'Quarterly shoe catalogue replenishment',
            storeId: "John's Retail Store",
          },
          {
            id: 'PO-2026-002',
            supplier: 'Acme Electronics Ltd',
            supplierId: 'SUP-002',
            date: '18 Sep 2026',
            deliveryDate: '26 Sep 2026',
            items: [
              { name: 'Beats Studio Pro', sku: 'BEAT-SP-05', emoji: '🎧', qty: 5, price: 9200 },
              { name: 'Apple Watch Series 9', sku: 'APPL-W9-04', emoji: '⌚', qty: 3, price: 28500 },
            ],
            itemsSummary: 'Beats Studio Pro (+1 more)',
            total: 138075,
            paymentTerms: 'Advance Payment',
            status: 'In Delivery',
            notes: 'Express air shipping requested',
            storeId: "John's Retail Store",
          },
        ]);
      }

      // Check if products were returned from po-products
      const storedProds = JSON.parse(localStorage.getItem('po_products') || '[]');
      if (Array.isArray(storedProds) && storedProds.length > 0) {
        setProducts(storedProds);
        const ts = localStorage.getItem('po_products_ts');
        const age = ts ? Date.now() - parseInt(ts, 10) : 99999;
        if (age < 30000) {
          setBannerMsg(`${storedProds.length} product${storedProds.length > 1 ? 's' : ''} added successfully from catalogue!`);
        }
      }
    } catch (err) {
      console.error('Error loading PO page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const handleSupplierChange = (e) => {
    const sId = e.target.value;
    setSelectedSupplierId(sId);
    const sup = suppliers.find((s) => s.id === sId);
    if (sup) {
      localStorage.setItem('po_selected_supplier_id', sup.id);
      localStorage.setItem('po_selected_supplier_name', sup.name || sup.companyName || 'Supplier');
      if (sup.paymentTerms) {
        setPaymentTerms(sup.paymentTerms);
      }
    }
  };

  const handleBrowseCatalogue = () => {
    if (!selectedSupplierId) {
      showToast('Please select a supplier first before browsing products!');
      return;
    }
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || { id: selectedSupplierId, name: 'Selected Supplier' };
    const sName = sup.name || sup.companyName || 'Selected Supplier';
    localStorage.setItem('po_selected_supplier_id', sup.id);
    localStorage.setItem('po_selected_supplier_name', sName);
    localStorage.setItem('po_products', JSON.stringify(products));
    localStorage.setItem('po_products_ts', '0');

    if (onBrowseCatalogue) {
      onBrowseCatalogue({ ...sup, name: sName });
    }
  };

  const updateProductQty = (index, newQty) => {
    const q = Math.max(1, parseInt(newQty, 10) || 1);
    const updated = [...products];
    updated[index] = { ...updated[index], qty: q };
    setProducts(updated);
    localStorage.setItem('po_products', JSON.stringify(updated));
  };

  const updateProductMargin = (index, newMargin) => {
    const m = Math.max(0, parseFloat(newMargin) || 0);
    const updated = [...products];
    updated[index] = { ...updated[index], profitMargin: m };
    setProducts(updated);
    localStorage.setItem('po_products', JSON.stringify(updated));
  };

  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    localStorage.setItem('po_products', JSON.stringify(updated));
  };

  const clearDraft = () => {
    setProducts([]);
    localStorage.removeItem('po_products');
    setNotes('');
    setBannerMsg('');
    showToast('Draft purchase order cleared.');
  };

  const saveDraft = () => {
    localStorage.setItem('po_products', JSON.stringify(products));
    showToast('Draft purchase order saved to storage.');
  };

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.qty) || 1), 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.qty) || 1), 0);

  // Submit PO
  const handleCreatePO = async () => {
    if (!products.length) {
      showToast('Please add at least one product to the purchase order!');
      return;
    }

    const poNumber = `PO-2026-00${ordersList.length + 1}`;
    const sup = selectedSupplierObj;

    const payload = {
      id: poNumber,
      supplierId: selectedSupplierId || sup?.id || 'SUP-001',
      supplierName: sup?.name || 'Selected Supplier',
      retailerId: user?.retailerId,
      retailerName: user?.name || 'Retailer Store',
      storeId: user?.storeId || user?.currentStoreId || targetStore,
      deliveryDate: deliveryDate,
      paymentTerms: paymentTerms,
      shippingAddress: shippingAddress,
      notes: notes,
      status: 'Pending',
      items: products.map((item) => ({
        id: item.id || 'SKU-ITEM',
        name: item.name,
        emoji: item.emoji || '📦',
        sku: item.sku || 'SKU',
        cat: item.cat || 'General',
        price: Number(item.price),
        qty: Number(item.qty),
        stock: item.stock || 50,
        stockStatus: item.stockStatus || 'ok',
        profitMargin: item.profitMargin || 10,
      })),
      subtotal: subtotal,
      tax: tax,
      total: grandTotal,
    };

    try {
      const created = await retailerApi.createPurchaseOrder(payload).catch(() => ({
        ...payload,
      }));

      const newHistoryItem = {
        id: created.id || poNumber,
        supplier: sup?.name || 'Supplier',
        supplierId: sup?.id || '',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        deliveryDate: deliveryDate,
        items: products,
        itemsSummary: `${products[0]?.name || 'Item'}${products.length > 1 ? ` (+${products.length - 1} more)` : ''}`,
        total: grandTotal,
        paymentTerms: paymentTerms,
        status: 'Pending',
        notes: notes,
        storeId: targetStore,
      };

      setOrdersList([newHistoryItem, ...ordersList]);
      clearDraft();
      showToast(`Purchase order ${newHistoryItem.id} created successfully!`);
      scrollToHistory();
    } catch (err) {
      console.error('Error creating purchase order:', err);
    }
  };

  const handleMarkReceived = async (poId) => {
    try {
      await retailerApi.updatePurchaseOrder(poId, { status: 'Delivered' }).catch(() => {});
      setOrdersList(
        ordersList.map((o) => (o.id === poId ? { ...o, status: 'Delivered' } : o))
      );
      if (selectedPODetail?.id === poId) {
        setSelectedPODetail({ ...selectedPODetail, status: 'Delivered' });
      }
      showToast(`Purchase Order ${poId} marked Received & stock synced!`);
    } catch (err) {
      console.error('Failed to mark PO received:', err);
    }
  };

  const scrollToHistory = () => {
    const el = document.getElementById('historySection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // KPI calculations
  const totalPos = ordersList.length;
  const pendingPos = ordersList.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredPos = ordersList.filter((o) => o.status === 'Delivered').length;
  const totalProcurementSpend = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Filter history
  const filteredHistory = ordersList.filter((o) => {
    const q = searchHistory.toLowerCase();
    const matchQ =
      (o.id || '').toLowerCase().includes(q) ||
      (o.supplier || '').toLowerCase().includes(q) ||
      (o.itemsSummary || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchStatus;
  });

  return (
    <div className="content" style={{ padding: '22px 26px 60px', maxWidth: '1240px', width: '100%', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#092c4c', margin: 0, lineHeight: 1.3 }}>
            Purchase Orders & Procurement
          </h1>
          <div className="page-subtitle" style={{ fontSize: '13px', color: '#646b72', fontWeight: 600, marginTop: '3px' }}>
            Create new purchase orders, select supplier catalogue, and track fulfillment history
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={scrollToHistory}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View PO History
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', fontWeight: 600 }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#646b72', fontWeight: 600, marginBottom: '4px' }}>Total Purchase Orders</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>{totalPos}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>All-time procurement records</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eef3fc', color: '#2e6bc5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" />
              <polyline points="9,2 9,6 13,6" />
            </svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#646b72', fontWeight: 600, marginBottom: '4px' }}>Pending & In Delivery</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>{pendingPos}</div>
            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>Awaiting store delivery</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#646b72', fontWeight: 600, marginBottom: '4px' }}>Received / Delivered</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>{deliveredPos}</div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>Inventory synced to stores</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#646b72', fontWeight: 600, marginBottom: '4px' }}>Total Procurement Spend</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#2e6bc5' }}>₹{totalProcurementSpend.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Total inventory order value</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
        </div>
      </div>

      {/* ADDED PRODUCTS BANNER */}
      {bannerMsg && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#15803d',
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <span>{bannerMsg}</span>
          </div>
          <button
            onClick={() => setBannerMsg('')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#15803d' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN 2-COLUMN CREATION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '32px', alignItems: 'start' }}>
        {/* LEFT COLUMN: CREATE FORM & PRODUCTS ORDERED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PO DETAILS CARD */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div>
                <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '15px', fontWeight: 800, color: '#092c4c' }}>Purchase Order Details</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Select supplier, store destination, and delivery terms</div>
              </div>
              <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                New Draft
              </span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Supplier Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={handleSupplierChange}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    {suppliers.map((s) => {
                      const displayName = s.name || s.companyName || s.business?.companyName || 'Supplier';
                      const displayCat = s.category || s.primaryCategory || s.business?.primaryCategory || 'General';
                      return (
                        <option key={s.id} value={s.id}>
                          {displayName} ({displayCat})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Target Fulfillment Store
                  </label>
                  <select
                    value={targetStore}
                    onChange={(e) => setTargetStore(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value={user?.store || "John's Retail Store"}>{user?.store || "John's Retail Store"} (Main)</option>
                    <option value="Lavish Warehouse">Lavish Warehouse</option>
                    <option value="Quaint Warehouse">Quaint Warehouse</option>
                    <option value="North Zone Warehouse">North Zone Warehouse</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Expected Delivery Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="Advance Payment">Advance Payment</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Fulfillment warehouse / store address..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Notes & Instructions
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or order terms for this vendor..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* PRODUCTS ORDERED CARD */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div>
                <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '15px', fontWeight: 800, color: '#092c4c' }}>
                  Products Ordered
                  {products.length > 0 && (
                    <span style={{ marginLeft: '8px', background: '#2e6bc5', color: '#fff', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                      {products.length}
                    </span>
                  )}
                </div>
                {products.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Items included in this purchase order</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleBrowseCatalogue}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2e6bc5',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Browse Catalogue
              </button>
            </div>

            {/* TABLE OR EMPTY ZONE */}
            {products.length > 0 ? (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Product</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Stock</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Order Qty</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Unit Cost</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Margin (%)</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Selling Price</th>
                        <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Line Total</th>
                        <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => {
                        const margin = p.profitMargin != null ? p.profitMargin : 10;
                        const sellingPrice = Math.round(p.price * (1 + margin / 100));
                        const lineTotal = p.price * p.qty;

                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>{p.emoji || '📦'}</span>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#092c4c' }}>{p.name}</div>
                                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#475569' }}>{p.cat || 'General'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d' }}>
                                {p.stock || 50} in stock
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <input
                                type="number"
                                min="1"
                                value={p.qty}
                                onChange={(e) => updateProductQty(i, e.target.value)}
                                style={{ width: '56px', padding: '5px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '12.5px' }}
                              />
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <input
                                type="number"
                                min="0"
                                max="500"
                                value={margin}
                                onChange={(e) => updateProductMargin(i, e.target.value)}
                                style={{ width: '48px', padding: '5px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '10px 14px', color: '#0284c7', fontWeight: 700 }}>
                              ₹{sellingPrice.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#092c4c' }}>
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeProduct(i)}
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '16px', cursor: 'pointer' }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* SUMMARY FOOTER */}
                <div style={{ padding: '16px 20px', background: '#fafbfc', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', color: '#646b72' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 700, color: '#1a1d2e' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', color: '#646b72' }}>
                    <span>Estimated GST (5%):</span>
                    <span style={{ fontWeight: 700, color: '#1a1d2e' }}>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', color: '#646b72' }}>
                    <span>Freight / Shipping:</span>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>₹0 (Included)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', borderTop: '1px solid #e5e7eb', paddingTop: '6px', fontSize: '15px', fontWeight: 800, color: '#092c4c' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#2e6bc5' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* EMPTY ZONE */
              <div
                onClick={handleBrowseCatalogue}
                style={{
                  padding: '48px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#fafbfc',
                }}
              >
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>📦</div>
                <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: '#092c4c', marginBottom: '4px' }}>
                  No products added to this order yet
                </div>
                <div style={{ fontSize: '12.5px', color: '#646b72', maxWidth: '380px', marginBottom: '16px' }}>
                  Click below to browse your product catalogue and select items for replenishment
                </div>
                <button
                  type="button"
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
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Browse & Add Products
                </button>
              </div>
            )}
          </div>

          {/* ACTIONS ROW */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={clearDraft}
              style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontWeight: 700, fontSize: '13px', color: '#646b72', cursor: 'pointer' }}
            >
              Clear Draft
            </button>
            <button
              type="button"
              onClick={saveDraft}
              style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontWeight: 700, fontSize: '13px', color: '#092c4c', cursor: 'pointer' }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleCreatePO}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
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
              Create Purchase Order
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden', position: 'sticky', top: '78px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '15px', fontWeight: 800, color: '#092c4c' }}>Order Summary</div>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
              Draft
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>PO Number</span>
              <strong style={{ color: '#2e6bc5' }}>Auto-Generated</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Supplier</span>
              <strong style={{ color: '#092c4c' }}>{selectedSupplierObj?.name || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Products</span>
              <strong>{products.length} added</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Total Units</span>
              <strong>{totalUnits}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
              <span style={{ color: '#646b72' }}>Estimated Value</span>
              <strong style={{ color: '#2e6bc5', fontSize: '14px' }}>₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Expected Delivery</span>
              <strong>{deliveryDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Store</span>
              <strong style={{ maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{targetStore}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Payment Terms</span>
              <strong>{paymentTerms}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Priority</span>
              <span style={{ fontWeight: 700, color: priority === 'Urgent' ? '#ef4444' : '#10b981' }}>{priority}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#646b72' }}>Shipping</span>
              <strong style={{ color: '#15803d' }}>Free / Included</strong>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PURCHASE ORDER HISTORY */}
      <div id="historySection" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#092c4c' }}>Purchase Order History</h3>
            <div style={{ fontSize: '12px', color: '#646b72', marginTop: '2px' }}>Track procurement orders, delivery milestones and fulfillment logs</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status filters */}
            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
              {['all', 'pending', 'in delivery', 'delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '5px 10px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    background: statusFilter === st ? '#2e6bc5' : '#fff',
                    color: statusFilter === st ? '#fff' : '#6b7280',
                    borderRight: '1px solid #e5e7eb',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', width: '220px', background: '#fff' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search PO, supplier..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', fontFamily: "'Nunito Sans', sans-serif" }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>PO Number</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Items Summary</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Delivery Date</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Total Value</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Payment</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
                    No purchase order records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((po) => {
                  const statusColors = {
                    delivered: { bg: '#dcfce7', text: '#15803d' },
                    'in delivery': { bg: '#e0e7ff', text: '#3730a3' },
                    pending: { bg: '#fef3c7', text: '#92400e' },
                    cancelled: { bg: '#fee2e2', text: '#b91c1c' },
                  };
                  const st = statusColors[po.status.toLowerCase()] || statusColors.pending;

                  return (
                    <tr key={po.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2e6bc5' }}>
                        {po.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#092c4c' }}>
                        {po.supplier}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>
                        {po.itemsSummary}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#646b72' }}>
                        {po.deliveryDate}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#092c4c' }}>
                        ₹{Number(po.total).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#646b72' }}>
                        {po.paymentTerms}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.text }}>
                          {po.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedPODetail(po)}
                          title="View PO Breakdown"
                          style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '5px', background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO DETAILS MODAL */}
      {selectedPODetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '580px', maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#092c4c' }}>Purchase Order {selectedPODetail.id}</h3>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Supplier: {selectedPODetail.supplier} &bull; Date: {selectedPODetail.date}</div>
              </div>
              <button onClick={() => setSelectedPODetail(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Status</div>
                  <div style={{ fontWeight: 700, color: '#2e6bc5' }}>{selectedPODetail.status}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Delivery Date</div>
                  <div style={{ fontWeight: 700, color: '#092c4c' }}>{selectedPODetail.deliveryDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Payment Terms</div>
                  <div style={{ fontWeight: 700, color: '#092c4c' }}>{selectedPODetail.paymentTerms}</div>
                </div>
              </div>

              {/* Items breakdown */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#092c4c', marginBottom: '8px' }}>Line Items</div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedPODetail.items) && selectedPODetail.items.length > 0 ? (
                        selectedPODetail.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.emoji || '📦'}</span>
                              <strong>{item.name}</strong>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{item.qty || 1}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#092c4c' }}>₹{((item.qty || 1) * Number(item.price || 0)).toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '14px', color: '#9ca3af' }}>{selectedPODetail.itemsSummary}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                    <span>Total Value:</span>
                    <span style={{ fontWeight: 800, color: '#2e6bc5', fontSize: '15px' }}>₹{Number(selectedPODetail.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setSelectedPODetail(null)}
                  style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#646b72' }}
                >
                  Close
                </button>
                {selectedPODetail.status !== 'Delivered' && (
                  <button
                    onClick={() => {
                      handleMarkReceived(selectedPODetail.id);
                      setSelectedPODetail(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#22c55e',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Mark Received & Restock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
