import React, { useState, useCallback } from 'react';
import './setup.css';
import {
  writeSupplierId, writeSession,
  createSupplierSetup, updateSupplier
} from '../api/supplierApi';

const STEPS = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Products' },
  { id: 3, label: 'Review' }
];

const HERO_META = [
  {
    title: 'Set Up Your Supplier Profile',
    sub: 'Start with your company name, contact info, and business details.'
  },
  {
    title: 'Add Your Product Catalog',
    sub: 'Enter the products you supply with pricing and minimum order quantities.'
  },
  {
    title: 'Review & Complete Setup',
    sub: 'Everything looks good? Launch your StockOverflow supplier dashboard.'
  }
];

const CATEGORIES = [
  'Electronics & Technology',
  'Computers & Peripherals',
  'Fashion & Apparel',
  'Food & Grocery',
  'Home & Furniture',
  'Health & Beauty',
  'Mobile & Telecom',
  'Sports & Outdoors',
  'Bags & Accessories',
  'Appliances',
  'Mixed / General'
];

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand',
  'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const DEFAULT_PRODUCTS = [
  { id: 'SP-101', sku: 'SP-101', name: 'Wireless Ergonomic Keyboard', brand: 'Logitech', variant: 'Matte Black', cat: 'Computers & Peripherals', unit: 'Piece', price: 1850, stock: 120, moq: 5, status: 'active' },
  { id: 'SP-102', sku: 'SP-102', name: 'Ultra HD 4K Monitor 27"', brand: 'Dell', variant: 'IPS Panel', cat: 'Electronics & Technology', unit: 'Piece', price: 18999, stock: 24, moq: 2, status: 'active' },
  { id: 'SP-103', sku: 'SP-103', name: 'Fast Charging Power Bank 20000mAh', brand: 'Mi', variant: 'Pocket Pro', cat: 'Mobile & Telecom', unit: 'Piece', price: 1299, stock: 85, moq: 10, status: 'active' }
];

export default function SupplierSetup({ onNavigateToDashboard }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // ── Step 1: Profile ──
  const [business, setBusiness] = useState({
    companyName: 'Apex Supply Dynamics',
    businessType: 'Wholesaler',
    businessEmail: 'contact@apexsupply.in',
    phoneNumber: '+91 98765 43210',
    gstNumber: '24AADCA2230G1ZO',
    supplierCode: 'ASD-7821',
    currency: 'INR',
    businessAddress: 'Plot 42, GIDC Electronic Zone, Gandhinagar',
    state: 'Gujarat',
    website: 'https://apexsupply.in',
    primaryCategory: 'Electronics & Technology',
    paymentTerms: 'Net 30',
    sellingType: 'Wholesale',
    description: 'Leading wholesale distributor of premium electronics and IT accessories.'
  });

  const [contact, setContact] = useState({
    fullName: 'Hansraj Verma',
    designation: 'Managing Director',
    directEmail: 'hans@apexsupply.in'
  });

  const [errors, setErrors] = useState({});

  // ── Step 2: Products ──
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    brand: '',
    variant: '',
    cat: 'Electronics & Technology',
    unit: 'Piece',
    price: '',
    stock: '',
    moq: '1'
  });

  const showToast = useCallback((msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  const genCode = () => {
    const name = business.companyName.trim();
    const prefix = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) : 'SUP';
    const num = Math.floor(1000 + Math.random() * 9000);
    setBusiness(prev => ({ ...prev, supplierCode: `${prefix}-${num}` }));
    showToast('Supplier Code generated: ' + `${prefix}-${num}`);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!business.companyName.trim()) errs.companyName = 'Company name is required';
    if (!business.businessType) errs.businessType = 'Business type is required';
    if (!business.businessEmail.trim()) errs.businessEmail = 'Business email is required';
    if (!contact.fullName.trim()) errs.contactName = 'Contact name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        showToast('Please fill in required fields.');
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddProduct = () => {
    if (!prodForm.name || !prodForm.price) {
      alert('Product Name and Unit Price are required.');
      return;
    }
    const newProd = {
      id: prodForm.sku || `SKU-${Date.now()}`,
      sku: prodForm.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: prodForm.name,
      brand: prodForm.brand || 'Generic',
      variant: prodForm.variant || 'Standard',
      cat: prodForm.cat || 'General',
      unit: prodForm.unit || 'Piece',
      price: Number(prodForm.price),
      stock: Number(prodForm.stock || 0),
      moq: Number(prodForm.moq || 1),
      status: 'active'
    };
    setProducts(prev => [newProd, ...prev]);
    setProdModalOpen(false);
    setProdForm({
      name: '',
      sku: '',
      brand: '',
      variant: '',
      cat: 'Electronics & Technology',
      unit: 'Piece',
      price: '',
      stock: '',
      moq: '1'
    });
    showToast('Product added to catalog.');
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id && p.sku !== id));
    showToast('Product removed.');
  };

  const handleCompleteSetup = async () => {
    const payload = {
      name: business.companyName,
      supplierName: business.companyName,
      supplierCode: business.supplierCode || 'SUP-2026',
      email: business.businessEmail,
      phone: business.phoneNumber,
      gst: business.gstNumber,
      gstNumber: business.gstNumber,
      businessType: business.businessType,
      primaryCategory: business.primaryCategory,
      state: business.state,
      address: business.businessAddress,
      website: business.website,
      contactPerson: contact.fullName,
      contactDesignation: contact.designation,
      contactEmail: contact.directEmail,
      paymentTerms: business.paymentTerms,
      sellingType: business.sellingType,
      description: business.description,
      currency: business.currency,
      products: products
    };

    try {
      const res = await createSupplierSetup(payload);
      if (res && res.supplier && res.supplier.id) {
        writeSupplierId(res.supplier.id);
        writeSession({
          supplierId: res.supplier.id,
          supplierName: business.companyName,
          email: business.businessEmail
        });
      }
    } catch {
      // Fallback local persistence
      const dummyId = `sup-${Date.now()}`;
      writeSupplierId(dummyId);
      writeSession({
        supplierId: dummyId,
        supplierName: business.companyName,
        email: business.businessEmail
      });
    }

    setSetupComplete(true);
    showToast('Supplier setup completed successfully!');
  };

  return (
    <div className="shell">
      {/* ── BRAND BAR ── */}
      <header className="brand-bar">
        <div className="brand-logo">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2L22 7v10L12 22 2 17V7L12 2z"/>
              <path d="M2 7l10 5 10-5M12 12v10"/>
            </svg>
          </div>
          <span className="brand-name">StockOverflow</span>
        </div>
        <span className="brand-badge">Supplier Setup Wizard</span>
      </header>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-title">{HERO_META[currentStep - 1].title}</div>
        <div className="hero-sub">{HERO_META[currentStep - 1].sub}</div>
      </div>

      {/* ── STEP TRACKER ── */}
      <div className="step-tracker">
        <div className="step-track-inner">
          {STEPS.map((s, idx) => (
            <div className="st-item" key={s.id}>
              <div
                className={`st-node ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'done' : ''}`}
                onClick={() => !setupComplete && setCurrentStep(s.id)}
              >
                <div className={`st-circle ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'done' : ''}`}>
                  {currentStep > s.id ? (
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 14, height: 14 }}>
                      <polyline points="2,7 5.5,10.5 12,3.5" />
                    </svg>
                  ) : s.id}
                </div>
                <span className="st-label">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`st-line ${currentStep > s.id ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT CONTAINER ── */}
      <div className="content">

        {setupComplete ? (
          /* ── FINISH STATE ── */
          <div className="finish-hero">
            <div className="finish-icon">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="2,7 5.5,10.5 12,3.5"/>
              </svg>
            </div>
            <div className="finish-title">You're All Set!</div>
            <div className="finish-sub">
              Your supplier account has been fully configured. Launch your dashboard now to begin managing inventory, orders, and retail distribution.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={onNavigateToDashboard}
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
                  <rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
                  <rect x="1.5" y="9.5" width="5" height="5" rx="1"/>
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
                </svg>
                Launch Supplier Dashboard
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setSetupComplete(false)}
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                Review Setup
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ══════ SECTION 1: SUPPLIER PROFILE ══════ */}
            {currentStep === 1 && (
              <div className="section active">
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <rect x="1" y="1" width="11" height="11" rx="1.5"/>
                          <line x1="4" y1="4.5" x2="9" y2="4.5"/>
                          <line x1="4" y1="6.5" x2="9" y2="6.5"/>
                          <line x1="4" y1="8.5" x2="7" y2="8.5"/>
                        </svg>
                      </div>
                      Business Information
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Supplier / Company Name <span className="req">*</span></label>
                        <input
                          type="text"
                          value={business.companyName}
                          onChange={(e) => setBusiness({ ...business, companyName: e.target.value })}
                          placeholder="Enter supplier name"
                          className={errors.companyName ? 'err' : ''}
                        />
                        {errors.companyName && <div className="field-error show">{errors.companyName}</div>}
                      </div>

                      <div className="field">
                        <label className="field-label">Business Type <span className="req">*</span></label>
                        <div className="sel-wrap">
                          <select
                            value={business.businessType}
                            onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                            className={errors.businessType ? 'err' : ''}
                          >
                            <option value="">Select type</option>
                            <option>Manufacturer</option>
                            <option>Wholesaler</option>
                            <option>Distributor</option>
                            <option>Importer / Exporter</option>
                            <option>Trading Company</option>
                          </select>
                        </div>
                        {errors.businessType && <div className="field-error show">{errors.businessType}</div>}
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Business Email <span className="req">*</span></label>
                        <input
                          type="email"
                          value={business.businessEmail}
                          onChange={(e) => setBusiness({ ...business, businessEmail: e.target.value })}
                          placeholder="admin@yoursupply.com"
                          className={errors.businessEmail ? 'err' : ''}
                        />
                        {errors.businessEmail && <div className="field-error show">{errors.businessEmail}</div>}
                      </div>

                      <div className="field">
                        <label className="field-label">Phone Number</label>
                        <input
                          type="tel"
                          value={business.phoneNumber}
                          onChange={(e) => setBusiness({ ...business, phoneNumber: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="fg fg-3">
                      <div className="field">
                        <label className="field-label">GST / Tax Number</label>
                        <input
                          type="text"
                          value={business.gstNumber}
                          onChange={(e) => setBusiness({ ...business, gstNumber: e.target.value })}
                          placeholder="e.g. 24AADCA2230G1ZO"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Supplier Code</label>
                        <div className="input-gen-wrap">
                          <input
                            type="text"
                            value={business.supplierCode}
                            onChange={(e) => setBusiness({ ...business, supplierCode: e.target.value })}
                            placeholder="Auto-generated"
                          />
                          <button type="button" className="btn-gen" onClick={genCode}>Generate</button>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Currency <span className="req">*</span></label>
                        <div className="sel-wrap">
                          <select
                            value={business.currency}
                            onChange={(e) => setBusiness({ ...business, currency: e.target.value })}
                          >
                            <option value="INR">INR – Indian Rupee</option>
                            <option value="USD">USD – US Dollar</option>
                            <option value="EUR">EUR – Euro</option>
                            <option value="GBP">GBP – British Pound</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Business Address</label>
                        <input
                          type="text"
                          value={business.businessAddress}
                          onChange={(e) => setBusiness({ ...business, businessAddress: e.target.value })}
                          placeholder="Street address, city, state, PIN"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">State</label>
                        <div className="sel-wrap">
                          <select
                            value={business.state}
                            onChange={(e) => setBusiness({ ...business, state: e.target.value })}
                          >
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Website</label>
                        <input
                          type="url"
                          value={business.website}
                          onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                          placeholder="https://yoursupply.com"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Primary Category</label>
                        <div className="sel-wrap">
                          <select
                            value={business.primaryCategory}
                            onChange={(e) => setBusiness({ ...business, primaryCategory: e.target.value })}
                          >
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Payment Terms</label>
                        <div className="sel-wrap">
                          <select
                            value={business.paymentTerms}
                            onChange={(e) => setBusiness({ ...business, paymentTerms: e.target.value })}
                          >
                            <option>Net 30</option>
                            <option>Net 15</option>
                            <option>Net 45</option>
                            <option>COD</option>
                            <option>Prepaid</option>
                          </select>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Selling Type</label>
                        <div className="sel-wrap">
                          <select
                            value={business.sellingType}
                            onChange={(e) => setBusiness({ ...business, sellingType: e.target.value })}
                          >
                            <option>Wholesale</option>
                            <option>Retail</option>
                            <option>Both</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="fg fg-1">
                      <div className="field">
                        <label className="field-label">About / Description</label>
                        <textarea
                          value={business.description}
                          onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                          placeholder="Briefly describe your business, specialisations, and supply capabilities…"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Contact Card */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <circle cx="6.5" cy="4.5" r="2.5"/>
                          <path d="M1 12c0-3.04 2.46-5 5.5-5s5.5 1.96 5.5 5"/>
                        </svg>
                      </div>
                      Primary Contact Person
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="fg fg-3">
                      <div className="field">
                        <label className="field-label">Full Name <span className="req">*</span></label>
                        <input
                          type="text"
                          value={contact.fullName}
                          onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                          placeholder="e.g. Arjun Tiwari"
                          className={errors.contactName ? 'err' : ''}
                        />
                        {errors.contactName && <div className="field-error show">{errors.contactName}</div>}
                      </div>

                      <div className="field">
                        <label className="field-label">Designation</label>
                        <input
                          type="text"
                          value={contact.designation}
                          onChange={(e) => setContact({ ...contact, designation: e.target.value })}
                          placeholder="e.g. Sales Manager"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Direct Email</label>
                        <input
                          type="email"
                          value={contact.directEmail}
                          onChange={(e) => setContact({ ...contact, directEmail: e.target.value })}
                          placeholder="arjun@yoursupply.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SECTION 2: PRODUCT CATALOG ══════ */}
            {currentStep === 2 && (
              <div className="section active">
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z"/>
                          <path d="M1 4.5L6.5 8 12 4.5M6.5 8v4"/>
                        </svg>
                      </div>
                      Product Catalog
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                        {products.length} products added
                      </span>
                      <button className="btn btn-primary btn-sm" onClick={() => setProdModalOpen(true)}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <line x1="6.5" y1="2" x2="6.5" y2="11"/>
                          <line x1="2" y1="6.5" x2="11" y2="6.5"/>
                        </svg>
                        Add Product
                      </button>
                    </div>
                  </div>

                  <div className="prod-table-wrap">
                    {products.length === 0 ? (
                      <div className="empty-state">
                        <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M22 4L40 13.5v17L22 40 4 30.5v-17L22 4z"/>
                          <path d="M4 13.5L22 23l18-9.5M22 23V40"/>
                        </svg>
                        <p>No products in catalog yet</p>
                        <span>Click "Add Product" to add wholesale items with pricing and MOQ</span>
                      </div>
                    ) : (
                      <table className="prod-table">
                        <thead>
                          <tr>
                            <th style={{ width: '100px' }}>SKU</th>
                            <th>Product Name</th>
                            <th>Brand / Variant</th>
                            <th>Category</th>
                            <th style={{ width: '110px' }}>Unit Price (₹)</th>
                            <th style={{ width: '80px' }}>MOQ</th>
                            <th style={{ width: '80px' }}>Stock</th>
                            <th style={{ width: '80px' }}>Unit</th>
                            <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p.id}>
                              <td className="sku-cell">{p.sku || p.id}</td>
                              <td style={{ fontWeight: 600 }}>{p.name}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{p.brand} {p.variant && `• ${p.variant}`}</td>
                              <td>
                                <span style={{ fontSize: '11px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                  {p.cat}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700 }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                              <td>{p.moq}</td>
                              <td>{p.stock}</td>
                              <td>{p.unit}</td>
                              <td className="del-td">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  title="Delete product"
                                >
                                  <svg viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="1.8">
                                    <line x1="2" y1="2" x2="10" y2="10"/>
                                    <line x1="10" y1="2" x2="2" y2="10"/>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SECTION 3: REVIEW & LAUNCH ══════ */}
            {currentStep === 3 && (
              <div className="section active">
                <div className="review-grid">
                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="2" y="2" width="12" height="12" rx="2"/>
                        <path d="M5 8h6M8 5v6"/>
                      </svg>
                    </div>
                    <div className="rev-card-label">Catalog Products</div>
                    <div className="rev-card-value">{products.length}</div>
                    <div className="rev-card-sub">Items ready for retail orders</div>
                  </div>

                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="8" cy="8" r="6"/>
                        <path d="M8 5v6M5.5 6.5h5"/>
                      </svg>
                    </div>
                    <div className="rev-card-label">Primary Currency</div>
                    <div className="rev-card-value">{business.currency}</div>
                    <div className="rev-card-sub">Pricing base for PO invoicing</div>
                  </div>

                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="8" cy="5" r="3"/>
                        <path d="M2 14c0-3 3-5 6-5s6 2 6 5"/>
                      </svg>
                    </div>
                    <div className="rev-card-label">Primary Contact</div>
                    <div className="rev-card-value" style={{ fontSize: '18px' }}>{contact.fullName || 'Admin'}</div>
                    <div className="rev-card-sub">{contact.designation || 'Supplier Admin'}</div>
                  </div>
                </div>

                <div className="rev-list-card">
                  <div className="rev-list-head">
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M7 1L13 4.5v5L7 13 1 9.5v-5L7 1z"/>
                    </svg>
                    Supplier Information Summary
                  </div>
                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    <div><strong>Company:</strong> {business.companyName}</div>
                    <div><strong>Type:</strong> {business.businessType}</div>
                    <div><strong>Email:</strong> {business.businessEmail}</div>
                    <div><strong>Phone:</strong> {business.phoneNumber || 'Not provided'}</div>
                    <div><strong>GST:</strong> {business.gstNumber || 'Not provided'}</div>
                    <div><strong>State:</strong> {business.state || 'Not provided'}</div>
                    <div><strong>Terms:</strong> {business.paymentTerms}</div>
                    <div><strong>Selling:</strong> {business.sellingType}</div>
                  </div>
                </div>

                <div className="rev-list-card">
                  <div className="rev-list-head">
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="1" width="12" height="12" rx="1"/>
                      <line x1="4" y1="1" x2="4" y2="13"/>
                      <line x1="1" y1="7" x2="13" y2="7"/>
                    </svg>
                    Products In Catalog ({products.length})
                  </div>
                  <table className="prod-table" style={{ borderTop: 'none' }}>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="sku-cell">{p.sku || p.id}</td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>{p.cat}</td>
                          <td style={{ fontWeight: 700 }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td>{p.stock} {p.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                  <button
                    className="btn btn-dark"
                    style={{ padding: '12px 32px', fontSize: '14px' }}
                    onClick={handleCompleteSetup}
                  >
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="2,7 5.5,10.5 12,3.5"/>
                    </svg>
                    Complete Setup &amp; Launch Dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>{/* /content */}

      {/* ── BOTTOM STICKY BAR ── */}
      {!setupComplete && (
        <div className="bottom-bar">
          <button
            className="btn btn-outline"
            onClick={handleBack}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polyline points="8,2 4,6.5 8,11"/>
            </svg>
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="bb-dots">
              {STEPS.map(s => (
                <div
                  key={s.id}
                  className={`bb-dot ${currentStep === s.id ? 'active' : ''}`}
                />
              ))}
            </div>
            <span className="bb-info">
              Step <strong>{currentStep}</strong> of <strong>3</strong>
            </span>
          </div>

          <button className="btn btn-primary" onClick={handleNext}>
            {currentStep === 3 ? 'Launch Dashboard' : 'Continue'}
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polyline points="5,2 9,6.5 5,11"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── MODAL: ADD PRODUCT ── */}
      {prodModalOpen && (
        <div className="modal-bg open" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setProdModalOpen(false); }}>
          <div className="modal">
            <div className="modal-title">
              <div className="card-icon" style={{ background: 'var(--primary-light)' }}>
                <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4">
                  <path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z"/>
                  <path d="M1 4.5L6.5 8 12 4.5M6.5 8v4"/>
                </svg>
              </div>
              Add Product to Catalog
            </div>

            <div className="fg fg-1" style={{ marginBottom: '12px' }}>
              <div className="field">
                <label className="field-label">Product Name <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Gaming Mouse"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                />
              </div>
            </div>

            <div className="fg fg-2" style={{ marginBottom: '12px' }}>
              <div className="field">
                <label className="field-label">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Razer"
                  value={prodForm.brand}
                  onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Category</label>
                <div className="sel-wrap">
                  <select
                    value={prodForm.cat}
                    onChange={(e) => setProdForm({ ...prodForm, cat: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="fg fg-3" style={{ marginBottom: '16px' }}>
              <div className="field">
                <label className="field-label">Unit Price (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  placeholder="500"
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Initial Stock</label>
                <input
                  type="number"
                  placeholder="100"
                  value={prodForm.stock}
                  onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">MOQ</label>
                <input
                  type="number"
                  placeholder="1"
                  value={prodForm.moq}
                  onChange={(e) => setProdForm({ ...prodForm, moq: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setProdModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAddProduct}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <svg viewBox="0 0 18 18" fill="none" stroke="#22c55e" strokeWidth="2">
          <circle cx="9" cy="9" r="7.5"/>
          <polyline points="5.5,9 7.5,11.5 12,6.5"/>
        </svg>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
