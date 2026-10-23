import React, { useState, useCallback, useMemo } from 'react';
import './setup.css';
import { useAuth } from '../context/AuthContext';
import {
  writeSupplierId, writeSession,
  createSupplierSetup, updateSupplier, updateUser
} from './api/supplierApi';

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
    sub: 'Enter the products you supply — SKU, name, brand, category, and stock details.'
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

const EMOJIS = {
  'Electronics': '🎧',
  'Electronics & Technology': '🎧',
  'Computers': '💻',
  'Computers & Peripherals': '💻',
  'Fashion': '👖',
  'Fashion & Apparel': '👖',
  'Furniture': '🛋️',
  'Home & Furniture': '🛋️',
  'Food & Grocery': '🍎',
  'Food & Beverage': '🍎',
  'Health & Beauty': '💄',
  'Beauty': '💄',
  'Mobile': '📱',
  'Mobile & Telecom': '📱',
  'Sports': '🏃',
  'Sports & Outdoors': '🏃',
  'Bags': '👜',
  'Bags & Accessories': '👜',
  'Appliances': '🧹',
  'Mixed': '📦',
  'Mixed / General': '📦'
};

const DEFAULT_PRODUCTS = [];

export default function SupplierSetup({ onNavigateToDashboard, onLogout }) {
  const { user, saveSession, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'ok' });

  // ── Step 1: Profile ──
  const [business, setBusiness] = useState(() => ({
    companyName: user?.name || '',
    businessType: 'Wholesaler',
    businessEmail: user?.email || '',
    phoneNumber: '',
    gstNumber: '',
    supplierCode: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
    currency: 'INR',
    businessAddress: '',
    state: 'Gujarat',
    website: '',
    primaryCategory: 'Electronics & Technology',
    paymentTerms: 'Net 30',
    sellingType: 'Wholesale',
    description: ''
  }));

  const [contact, setContact] = useState(() => ({
    fullName: user?.name || '',
    designation: 'Managing Director',
    directEmail: user?.email || ''
  }));

  const [errors, setErrors] = useState({});

  // ── Step 2: Products ──
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProdSku, setEditingProdSku] = useState(null);
  const [prodFormErrors, setProdFormErrors] = useState({});
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    brand: '',
    variant: '',
    cat: 'Electronics & Technology',
    unit: 'Piece',
    price: '',
    stock: 0,
    moq: 10,
    expiryDate: '',
    reviewSummary: '',
    description: ''
  });

  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'ok' }), 3000);
  }, []);

  const genCode = () => {
    const name = business.companyName.trim();
    const prefix = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) : 'SUP';
    const num = Math.floor(1000 + Math.random() * 9000);
    setBusiness(prev => ({ ...prev, supplierCode: `${prefix}-${num}` }));
    showToast(`Supplier Code generated: ${prefix}-${num}`);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!business.companyName.trim()) errs.companyName = 'Company name is required';
    if (!business.businessType) errs.businessType = 'Business type is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!business.businessEmail.trim()) {
      errs.businessEmail = 'Business email is required';
    } else if (!emailRegex.test(business.businessEmail.trim())) {
      errs.businessEmail = 'Valid email is required';
    }
    if (!contact.fullName.trim()) errs.contactName = 'Contact name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        showToast('Please fill in all required fields.', 'err');
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

  const openAddProductModal = () => {
    if (products.length >= 50) {
      showToast('Starter Kirana plan is limited to 50 products. Upgrade to Pro for unlimited.', 'err');
      return;
    }
    const nextSku = `SP-${Math.floor(100 + products.length + 1)}`;
    setEditingProdSku(null);
    setProdFormErrors({});
    setProdForm({
      name: '',
      sku: nextSku,
      brand: '',
      variant: '',
      cat: 'Electronics & Technology',
      unit: 'Piece',
      price: '',
      stock: 50,
      moq: 5,
      expiryDate: '',
      reviewSummary: '',
      description: ''
    });
    setProdModalOpen(true);
  };

  const openEditProduct = (p) => {
    setEditingProdSku(p.sku);
    setProdFormErrors({});
    setProdForm({
      name: p.name || '',
      sku: p.sku || '',
      brand: p.brand || '',
      variant: p.variant || '',
      cat: p.cat || 'Electronics & Technology',
      unit: p.unit || 'Piece',
      price: p.price ?? '',
      stock: p.stock ?? 0,
      moq: p.moq ?? 1,
      expiryDate: p.expiryDate || '',
      reviewSummary: p.reviewSummary || '',
      description: p.description || ''
    });
    setProdModalOpen(true);
  };

  const handleSaveProduct = () => {
    const errs = {};
    if (!prodForm.name.trim()) errs.name = 'Product name is required';
    if (!prodForm.cat) errs.cat = 'Category is required';
    const priceNum = parseFloat(prodForm.price);
    if (isNaN(priceNum) || priceNum < 0 || prodForm.price === '') {
      errs.price = 'Valid price is required';
    }

    if (Object.keys(errs).length > 0) {
      setProdFormErrors(errs);
      return;
    }

    const emoji = EMOJIS[prodForm.cat] || '📦';
    const productObj = {
      id: prodForm.sku,
      sku: prodForm.sku,
      name: prodForm.name.trim(),
      brand: prodForm.brand.trim() || '—',
      variant: prodForm.variant.trim(),
      cat: prodForm.cat,
      unit: prodForm.unit || 'Piece',
      price: priceNum,
      stock: parseInt(prodForm.stock, 10) || 0,
      moq: parseInt(prodForm.moq, 10) || 1,
      expiryDate: prodForm.expiryDate,
      reviewSummary: prodForm.reviewSummary.trim(),
      description: prodForm.description.trim(),
      emoji
    };

    if (editingProdSku) {
      setProducts(prev => prev.map(p => (p.sku === editingProdSku ? productObj : p)));
      showToast('Product updated!');
    } else {
      setProducts(prev => [...prev, productObj]);
      showToast('Product added to catalog!');
    }

    setProdModalOpen(false);
  };

  const handleDeleteProduct = (sku) => {
    if (!window.confirm('Remove this product from catalog?')) return;
    setProducts(prev => prev.filter(p => p.sku !== sku));
    showToast('Product removed.');
  };

  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => acc + (parseInt(p.stock, 10) || 0), 0);
  }, [products]);

  const handleCompleteSetup = async () => {
    const existingSid = user?.profileId || readSupplierId() || undefined;
    const cleanSid = existingSid && !existingSid.startsWith('sup-17') ? existingSid : undefined;

    const payload = {
      id: cleanSid,
      business: {
        companyName: business.companyName.trim(),
        businessType: business.businessType || 'Wholesaler',
        businessEmail: business.businessEmail.trim(),
        phoneNumber: business.phoneNumber.trim() || undefined,
        gstNumber: business.gstNumber.trim() || undefined,
        supplierCode: business.supplierCode.trim() || undefined,
        currency: business.currency || 'INR',
        businessAddress: business.businessAddress.trim() || undefined,
        state: business.state || undefined,
        website: business.website.trim() || undefined,
        primaryCategory: business.primaryCategory || 'General',
        paymentTerms: business.paymentTerms || 'Net 30',
        sellingType: business.sellingType || 'Wholesale',
        description: business.description.trim() || undefined
      },
      primaryContact: {
        fullName: contact.fullName.trim(),
        designation: contact.designation.trim() || undefined,
        directEmail: contact.directEmail.trim() || undefined
      },
      retailers: [],
      products: products.map(p => ({
        sku: p.sku || `SKU-${Date.now()}`,
        name: p.name,
        brand: p.brand || undefined,
        variant: p.variant || undefined,
        category: p.cat || p.category || 'General',
        stockAvailable: Number(p.stock || 0),
        unitPrice: Number(p.price || 0),
        minOrderQty: Number(p.moq || 1),
        unit: p.unit || 'Piece',
        expiryDate: p.expiryDate || undefined,
        reviewSummary: p.reviewSummary || undefined,
        description: p.description || undefined
      })),
      profileStatus: user?.profile?.profileStatus === 'active' ? 'active' : 'pending'
    };

    try {
      const res = await createSupplierSetup(payload);
      const supplierId = res?.id || res?.supplier?.id || cleanSid || `sup-${Date.now()}`;
      writeSupplierId(supplierId);

      if (user?.id) {
        try {
          await updateUser(user.id, { profileId: supplierId, status: user.status === 'Active' ? 'Active' : 'Pending' });
        } catch (e) {
          console.warn('Could not link profileId to user in backend:', e);
        }
        try {
          localStorage.setItem(`so_supplier_setup_completed_${user.id}`, 'true');
        } catch {}
      }

      // Trigger employee task distribution in round-robin
      try {
        await fetch('/api/employees/assignments/distribute', { method: 'POST' });
      } catch (_distErr) {
        console.warn('Distribution trigger note:', _distErr);
      }

      const updatedProfile = {
        businessName: business.companyName.trim(),
        businessEmail: business.businessEmail.trim(),
        businessPhone: business.phoneNumber.trim(),
        supplierCode: business.supplierCode.trim(),
        address: business.businessAddress.trim(),
        website: business.website.trim(),
        businessType: business.businessType,
        currency: business.currency,
        primaryCategory: business.primaryCategory,
        paymentTerms: business.paymentTerms,
        sellingType: business.sellingType,
        description: business.description.trim(),
        state: business.state,
        ownerName: contact.fullName.trim(),
        ownerTitle: contact.designation.trim(),
        ownerEmail: contact.directEmail.trim(),
        profileStatus: user?.profile?.profileStatus === 'active' ? 'active' : 'pending',
        retailers: [],
        productCount: products.length
      };

      writeSession({
        ...user,
        supplierId,
        profileId: supplierId,
        supplierName: business.companyName,
        email: business.businessEmail,
        role: 'supplier',
        status: user?.status === 'Active' ? 'Active' : 'Pending',
        profile: updatedProfile
      });

      if (saveSession) {
        saveSession({
          ...user,
          status: user?.status === 'Active' ? 'Active' : 'Pending',
          profileId: supplierId,
          profile: updatedProfile
        });
      }

      showToast('Setup submitted! Product catalog saved.');
      setSetupComplete(true);
      if (onNavigateToDashboard) {
        setTimeout(() => onNavigateToDashboard(), 1200);
      }
    } catch (err) {
      console.error('Failed to submit supplier setup:', err);
      showToast(err.message || 'Setup submission failed. Please check the fields.', 'err');
    }
  };

  return (
    <div className="supplier-setup-shell">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="brand-badge">Supplier Setup Wizard</span>
          {onLogout && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '5px 12px', background: 'rgba(255,255,255,0.08)' }}
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* ── HERO BANNER ── */}
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
                onClick={() => {
                  if (s.id < currentStep && !setupComplete) {
                    setCurrentStep(s.id);
                  }
                }}
              >
                <div className={`st-circle ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'done' : ''}`}>
                  {currentStep > s.id ? (
                    <svg viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.2" style={{ width: 14, height: 14 }}>
                      <polyline points="2.5,7 5.5,10 11.5,4" />
                    </svg>
                  ) : (
                    s.id
                  )}
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
          /* ── FINISH HERO STATE ── */
          <div className="finish-hero">
            <div className="finish-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <div className="finish-title">Application Submitted for Review! ⏳</div>
            <div className="finish-sub">
              Your supplier account has been configured and submitted. Our compliance team will review your business credentials and approve your account shortly.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onNavigateToDashboard}
                style={{ padding: '10px 24px' }}
              >
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="1.5" y="1.5" width="4" height="4" rx=".8" />
                  <rect x="7.5" y="1.5" width="4" height="4" rx=".8" />
                  <rect x="1.5" y="7.5" width="4" height="4" rx=".8" />
                  <rect x="7.5" y="7.5" width="4" height="4" rx=".8" />
                </svg>
                Check Verification Status &rarr;
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSetupComplete(false);
                  setCurrentStep(1);
                }}
              >
                Edit Setup
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ══════ SECTION 1: PROFILE ══════ */}
            {currentStep === 1 && (
              <div className="section active">
                {/* Business Information Card */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <rect x="1" y="1" width="11" height="11" rx="1.5" />
                          <line x1="4" y1="4.5" x2="9" y2="4.5" />
                          <line x1="4" y1="6.5" x2="9" y2="6.5" />
                          <line x1="4" y1="8.5" x2="7" y2="8.5" />
                        </svg>
                      </div>
                      Business Information
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">
                          Supplier / Company Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={business.companyName}
                          onChange={e => setBusiness({ ...business, companyName: e.target.value })}
                          placeholder="Enter supplier name"
                          className={errors.companyName ? 'err' : ''}
                        />
                        <div className={`field-error ${errors.companyName ? 'show' : ''}`}>
                          {errors.companyName}
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">
                          Business Type <span className="req">*</span>
                        </label>
                        <div className="sel-wrap">
                          <select
                            value={business.businessType}
                            onChange={e => setBusiness({ ...business, businessType: e.target.value })}
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
                        <div className={`field-error ${errors.businessType ? 'show' : ''}`}>
                          {errors.businessType}
                        </div>
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">
                          Business Email <span className="req">*</span>
                        </label>
                        <input
                          type="email"
                          value={business.businessEmail}
                          onChange={e => setBusiness({ ...business, businessEmail: e.target.value })}
                          placeholder="admin@yoursupply.com"
                          className={errors.businessEmail ? 'err' : ''}
                        />
                        <div className={`field-error ${errors.businessEmail ? 'show' : ''}`}>
                          {errors.businessEmail}
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Phone Number</label>
                        <input
                          type="tel"
                          value={business.phoneNumber}
                          onChange={e => setBusiness({ ...business, phoneNumber: e.target.value })}
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
                          onChange={e => setBusiness({ ...business, gstNumber: e.target.value })}
                          placeholder="e.g. 24AADCA2230G1ZO"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Supplier Code</label>
                        <div className="input-gen-wrap">
                          <input
                            type="text"
                            value={business.supplierCode}
                            onChange={e => setBusiness({ ...business, supplierCode: e.target.value })}
                            placeholder="Auto-generated"
                          />
                          <button type="button" className="btn-gen" onClick={genCode}>
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">
                          Currency <span className="req">*</span>
                        </label>
                        <div className="sel-wrap">
                          <select
                            value={business.currency}
                            onChange={e => setBusiness({ ...business, currency: e.target.value })}
                          >
                            <option value="INR">INR – Indian Rupee</option>
                            <option value="USD">USD – US Dollar</option>
                            <option value="EUR">EUR – Euro</option>
                            <option value="GBP">GBP – British Pound</option>
                            <option value="AUD">AUD – Australian Dollar</option>
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
                          onChange={e => setBusiness({ ...business, businessAddress: e.target.value })}
                          placeholder="Street address, city, state, PIN"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">State</label>
                        <div className="sel-wrap">
                          <select
                            value={business.state}
                            onChange={e => setBusiness({ ...business, state: e.target.value })}
                          >
                            <option value="">Select state</option>
                            {STATES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
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
                          onChange={e => setBusiness({ ...business, website: e.target.value })}
                          placeholder="https://yoursupply.com"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Primary Category</label>
                        <div className="sel-wrap">
                          <select
                            value={business.primaryCategory}
                            onChange={e => setBusiness({ ...business, primaryCategory: e.target.value })}
                          >
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
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
                            onChange={e => setBusiness({ ...business, paymentTerms: e.target.value })}
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
                            onChange={e => setBusiness({ ...business, sellingType: e.target.value })}
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
                          onChange={e => setBusiness({ ...business, description: e.target.value })}
                          placeholder="Briefly describe your business, specialisations, and what makes you a great supply partner…"
                          style={{ minHeight: '80px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Contact Person Card */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <circle cx="6.5" cy="4.5" r="2.5" />
                          <path d="M1 12c0-3.04 2.46-5 5.5-5s5.5 1.96 5.5 5" />
                        </svg>
                      </div>
                      Primary Contact Person
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="fg fg-3">
                      <div className="field">
                        <label className="field-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={contact.fullName}
                          onChange={e => setContact({ ...contact, fullName: e.target.value })}
                          placeholder="e.g. Arjun Tiwari"
                          className={errors.contactName ? 'err' : ''}
                        />
                        <div className={`field-error ${errors.contactName ? 'show' : ''}`}>
                          {errors.contactName}
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Designation</label>
                        <input
                          type="text"
                          value={contact.designation}
                          onChange={e => setContact({ ...contact, designation: e.target.value })}
                          placeholder="e.g. Sales Manager"
                        />
                      </div>

                      <div className="field">
                        <label className="field-label">Direct Email</label>
                        <input
                          type="email"
                          value={contact.directEmail}
                          onChange={e => setContact({ ...contact, directEmail: e.target.value })}
                          placeholder="arjun@yoursupply.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SECTION 2: PRODUCTS ══════ */}
            {currentStep === 2 && (
              <div className="section active">
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon">
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z" />
                          <path d="M1 4.5L6.5 8 12 4.5M6.5 8v4" />
                        </svg>
                      </div>
                      Product Catalog
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                      </span>
                      <button type="button" className="btn btn-primary btn-sm" onClick={openAddProductModal}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <line x1="6.5" y1="2" x2="6.5" y2="11" />
                          <line x1="2" y1="6.5" x2="11" y2="6.5" />
                        </svg>
                        Add Product
                      </button>
                    </div>
                  </div>

                  <div className="prod-table-wrap">
                    {products.length === 0 ? (
                      <div className="empty-state" style={{ padding: '36px 20px' }}>
                        <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M22 4L40 13.5v17L22 40 4 30.5v-17L22 4z" />
                          <path d="M4 13.5L22 23l18-9.5M22 23V40" />
                        </svg>
                        <p>No products in catalog yet</p>
                        <span>Click "Add Product" to configure detailed product specifications</span>
                      </div>
                    ) : (
                      <table className="prod-table">
                        <thead>
                          <tr>
                            <th style={{ width: '38px' }}></th>
                            <th style={{ width: '90px' }}>SKU</th>
                            <th>Product Name</th>
                            <th>Brand / Variant</th>
                            <th>Category</th>
                            <th style={{ width: '105px' }}>Unit Price (₹)</th>
                            <th style={{ width: '75px' }}>MOQ</th>
                            <th style={{ width: '75px' }}>Stock</th>
                            <th style={{ width: '75px' }}>Unit</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(p => (
                            <tr key={p.sku}>
                              <td className="emoji-cell">{p.emoji || EMOJIS[p.cat] || '📦'}</td>
                              <td className="sku-cell">{p.sku}</td>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                                {p.description && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                    {p.description}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{p.brand || '—'}</div>
                                {p.variant && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.variant}</div>}
                              </td>
                              <td>
                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', background: '#eef3fc', color: '#2e6bc5', fontSize: '11.5px', fontWeight: 700 }}>
                                  {p.cat}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700, color: '#15803d' }}>
                                ₹{Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: 'var(--text-secondary)' }}>{p.moq || 1}</td>
                              <td style={{ fontWeight: 700 }}>{p.stock || 0}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{p.unit || 'Piece'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '3px 7px' }}
                                    onClick={() => openEditProduct(p)}
                                    title="Edit"
                                  >
                                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 11, height: 11 }}>
                                      <path d="M10 1.5l1.5 1.5L4 10.5H2.5V9L10 1.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '3px 7px', borderColor: '#fca5a5' }}
                                    onClick={() => handleDeleteProduct(p.sku)}
                                    title="Delete"
                                  >
                                    <svg viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="1.6" style={{ width: 11, height: 11 }}>
                                      <polyline points="1,3 11,3" />
                                      <path d="M3.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M4 3v7.5M8 3v7.5M2 3l.6 7.5a1 1 0 001 .9h4.8a1 1 0 001-.9L10 3" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f2f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                      Starter Kirana plan includes up to 50 products catalog. Upgrade to Vyapar Pro for unlimited products.
                    </div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={openAddProductModal}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <line x1="6.5" y1="2" x2="6.5" y2="11" />
                        <line x1="2" y1="6.5" x2="11" y2="6.5" />
                      </svg>
                      Add Product
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SECTION 3: REVIEW ══════ */}
            {currentStep === 3 && (
              <div className="section active">
                <div className="review-grid">
                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M8 1L15 4.5v7L8 15 1 11.5v-7L8 1z" />
                      </svg>
                    </div>
                    <div className="rev-card-label">Products</div>
                    <div className="rev-card-value">{products.length}</div>
                    <div className="rev-card-sub">{totalStock} units available</div>
                  </div>

                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <circle cx="8" cy="5.5" r="3" />
                        <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" />
                      </svg>
                    </div>
                    <div className="rev-card-label">Company</div>
                    <div className="rev-card-value" style={{ fontSize: '18px' }}>
                      {business.companyName || '—'}
                    </div>
                    <div className="rev-card-sub">{business.businessType || 'Supplier'}</div>
                  </div>

                  <div className="rev-card">
                    <div className="rev-card-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="1" y="3" width="14" height="10" rx="1.5" />
                        <line x1="1" y1="7" x2="15" y2="7" />
                      </svg>
                    </div>
                    <div className="rev-card-label">Contact</div>
                    <div className="rev-card-value" style={{ fontSize: '15px' }}>
                      {contact.fullName || '—'}
                    </div>
                    <div className="rev-card-sub">{business.businessEmail || ''}</div>
                  </div>
                </div>

                <div className="rev-list-card">
                  <div className="rev-list-head">
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M7 1L13 4.5v5L7 13 1 9.5v-5L7 1z" />
                    </svg>
                    Products Summary
                  </div>
                  {products.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>
                      <p>No products added</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ background: '#f5f6fa' }}>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                            SKU
                          </th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                            Product
                          </th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                            Brand
                          </th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                            Category
                          </th>
                          <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, idx) => (
                          <tr key={p.sku} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #f0f2f4', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              {p.sku}
                            </td>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #f0f2f4' }}>
                              {p.emoji || '📦'} {p.name}
                            </td>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #f0f2f4', color: 'var(--text-secondary)' }}>
                              {p.brand || '—'}
                            </td>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #f0f2f4', color: 'var(--text-secondary)' }}>
                              {p.cat || '—'}
                            </td>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #f0f2f4', textAlign: 'right', fontWeight: 700 }}>
                              {p.stock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-dark"
                    style={{ padding: '12px 32px', fontSize: '14px' }}
                    onClick={handleCompleteSetup}
                  >
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="2,7 5.5,10.5 12,3.5" />
                    </svg>
                    Complete Setup &amp; Launch Dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── BOTTOM STICKY BAR ── */}
      {!setupComplete && (
        <div className="bottom-bar">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleBack}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polyline points="8,2 4,6.5 8,11" />
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
              Step <strong style={{ color: 'var(--text-primary)' }}>{currentStep}</strong> of <strong>3</strong>
            </span>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {currentStep === 3 ? (
              <>
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polyline points="2,7 5.5,10.5 11,3.5" />
                </svg>
                Complete Setup
              </>
            ) : (
              <>
                Continue
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polyline points="5,2 9,6.5 5,11" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* ══ MODAL: ADD / EDIT PRODUCT ══ */}
      {prodModalOpen && (
        <div
          className="modal-bg open"
          onClick={e => {
            if (e.target.classList.contains('modal-bg')) setProdModalOpen(false);
          }}
        >
          <div className="modal" style={{ width: 'min(600px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-title">
              <div className="card-icon" style={{ background: 'var(--primary-light)' }}>
                <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4">
                  <path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z" />
                </svg>
              </div>
              <span>{editingProdSku ? 'Edit Product' : 'Add Product to Catalog'}</span>
            </div>

            <div className="fg fg-2" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">
                  Product Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice 5kg / Laptop 15-inch"
                  value={prodForm.name}
                  onChange={e => setProdForm({ ...prodForm, name: e.target.value })}
                  className={prodFormErrors.name ? 'err' : ''}
                />
                <div className={`field-error ${prodFormErrors.name ? 'show' : ''}`}>
                  {prodFormErrors.name}
                </div>
              </div>
              <div className="field">
                <label className="field-label">SKU</label>
                <input
                  type="text"
                  value={prodForm.sku}
                  style={{ background: '#f9fafb' }}
                  readOnly
                />
              </div>
            </div>

            <div className="fg fg-2" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. India Gate / Lenovo"
                  value={prodForm.brand}
                  onChange={e => setProdForm({ ...prodForm, brand: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Product Variant</label>
                <input
                  type="text"
                  placeholder="e.g. 5kg Bag / 16GB RAM"
                  value={prodForm.variant}
                  onChange={e => setProdForm({ ...prodForm, variant: e.target.value })}
                />
              </div>
            </div>

            <div className="fg fg-2" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">
                  Category <span className="req">*</span>
                </label>
                <div className="sel-wrap">
                  <select
                    value={prodForm.cat}
                    onChange={e => setProdForm({ ...prodForm, cat: e.target.value })}
                    className={prodFormErrors.cat ? 'err' : ''}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className={`field-error ${prodFormErrors.cat ? 'show' : ''}`}>
                  {prodFormErrors.cat}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Unit of Measure</label>
                <div className="sel-wrap">
                  <select
                    value={prodForm.unit}
                    onChange={e => setProdForm({ ...prodForm, unit: e.target.value })}
                  >
                    <option>Piece</option>
                    <option>Box</option>
                    <option>Kg</option>
                    <option>Ltr</option>
                    <option>Set</option>
                    <option>Pair</option>
                    <option>Meter</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="fg fg-3" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">
                  Unit Price (₹) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={prodForm.price}
                  onChange={e => setProdForm({ ...prodForm, price: e.target.value })}
                  className={prodFormErrors.price ? 'err' : ''}
                />
                <div className={`field-error ${prodFormErrors.price ? 'show' : ''}`}>
                  {prodFormErrors.price}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Min Order Qty</label>
                <input
                  type="number"
                  min="1"
                  value={prodForm.moq}
                  onChange={e => setProdForm({ ...prodForm, moq: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Available Stock</label>
                <input
                  type="number"
                  min="0"
                  value={prodForm.stock}
                  onChange={e => setProdForm({ ...prodForm, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="fg fg-2" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">Expiry Date</label>
                <input
                  type="date"
                  value={prodForm.expiryDate}
                  onChange={e => setProdForm({ ...prodForm, expiryDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">Review Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 4.8/5 Rating"
                  value={prodForm.reviewSummary}
                  onChange={e => setProdForm({ ...prodForm, reviewSummary: e.target.value })}
                />
              </div>
            </div>

            <div className="fg fg-1" style={{ marginBottom: '14px' }}>
              <div className="field">
                <label className="field-label">Product Description</label>
                <textarea
                  value={prodForm.description}
                  onChange={e => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Details regarding product specs, packaging, materials, warranty..."
                  style={{ minHeight: '70px' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setProdModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveProduct}
              >
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polyline points="2,7 5.5,10.5 11,3.5" />
                </svg>
                {editingProdSku ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING TOAST ── */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <svg viewBox="0 0 20 20" fill="none" stroke={toast.type === 'err' ? '#ef4444' : '#22c55e'} strokeWidth="2">
          {toast.type === 'err' ? (
            <>
              <circle cx="10" cy="10" r="8.5" />
              <line x1="7" y1="7" x2="13" y2="13" />
              <line x1="13" y1="7" x2="7" y2="13" />
            </>
          ) : (
            <>
              <circle cx="10" cy="10" r="8.5" />
              <polyline points="6.5,10 9,12.5 13.5,7" />
            </>
          )}
        </svg>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
