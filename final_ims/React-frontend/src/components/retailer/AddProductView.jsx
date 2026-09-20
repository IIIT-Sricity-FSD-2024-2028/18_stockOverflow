import React, { useState, useEffect } from 'react';
import { request } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AddProductView({ onNavigate }) {
  const { user } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isToastError, setIsToastError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Dynamic lists from real database
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    brand: '',
    unit: 'Pc',
    description: '',
    tags: [],
    price: '',
    cost: '',
    discountType: 'none',
    discountValue: '',
    finalPrice: '',
    taxRate: '',
    taxType: 'Inclusive',
    supplier: '',
    supplierSku: '',
    sku: '',
    barcode: '',
    qty: '',
    min: 10,
    max: 500,
    warehouse: '',
    bin: '',
    reorderPoint: '',
    reorderQty: '',
    restockDate: new Date().toISOString().split('T')[0],
    hasVariants: false,
    variants: [],
    hasExpiry: false,
    expiryDate: '',
    batchNumber: '',
    weightKg: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    shippingClass: 'Standard',
    customFields: [],
    status: 'active',
    visibility: 'published',
  });

  // Images state
  const [images, setImages] = useState([]); // Array of { src, name }
  const [mainImgIdx, setMainImgIdx] = useState(0);

  // Variant modal state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantInput, setVariantInput] = useState({
    attr: 'Color',
    name: '',
    color: '#5b67ca',
    stock: 0,
    price: 0,
    skuSuffix: '',
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // Trigger toast
  const triggerToast = (msg, isError = false) => {
    setToastMsg(msg);
    setIsToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch real data from backend on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Fetch real products to derive next SKU and existing categories/brands
        const prodData = await request('/products').catch(() => []);
        if (Array.isArray(prodData)) {
          // Compute auto-SKU: PT + max + 1
          let maxSkuNum = 0;
          prodData.forEach((p) => {
            const match = /^PT(\d+)$/i.exec(String(p?.sku || '').trim());
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxSkuNum) maxSkuNum = num;
            }
          });
          const nextSku = 'PT' + String(maxSkuNum + 1).padStart(3, '0');
          setFormData((prev) => ({ ...prev, sku: nextSku }));

          // Extract distinct categories from DB + standard fallback
          const dbCats = Array.from(new Set(prodData.map((p) => p.category).filter(Boolean)));
          const defaultCats = [
            'Computers', 'Electronics', 'Furniture', 'Shoe', 'Bags',
            'Fashion', 'Appliances', 'Phone', 'Sports', 'Beauty', 'Food & Beverages'
          ];
          const allCats = Array.from(new Set([...dbCats, ...defaultCats]));
          setCategories(allCats);

          // Extract distinct brands from DB + standard fallback
          const dbBrands = Array.from(new Set(prodData.map((p) => p.brand).filter(Boolean)));
          const defaultBrands = [
            'Apple', 'Samsung', 'Lenovo', 'Sony', 'Nike', 'Adidas',
            'Amazon', 'Dyson', 'Dior', 'The North Face', 'Beats', 'Arlime', 'Modern Wave', 'Other'
          ];
          const allBrands = Array.from(new Set([...dbBrands, ...defaultBrands]));
          setBrands(allBrands);
        }

        // 2. Fetch real suppliers
        const supData = await request('/suppliers').catch(() => []);
        if (Array.isArray(supData) && supData.length > 0) {
          setSuppliers(supData);
        } else {
          setSuppliers([
            { id: '1', name: 'TechDistrib Co.' },
            { id: '2', name: 'Global Imports Ltd.' },
            { id: '3', name: 'Prime Wholesale' },
            { id: '4', name: 'FastSupply Inc.' },
            { id: '5', name: 'DirectSource LLC' },
          ]);
        }

        // 3. Fetch real stores / warehouses
        const storeData = await request('/stores').catch(() => []);
        if (Array.isArray(storeData) && storeData.length > 0) {
          setWarehouses(storeData);
        } else {
          setWarehouses([
            { id: '1', name: 'Main Warehouse – A1' },
            { id: '2', name: 'Main Warehouse – A2' },
            { id: '3', name: 'Main Warehouse – B1' },
            { id: '4', name: 'East Wing – C3' },
            { id: '5', name: 'West Wing – D1' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load initial form data:', err);
      }
    }

    loadInitialData();
  }, []);

  // Profit Margin calculation
  const calcProfitMargin = () => {
    const p = parseFloat(formData.price);
    const c = parseFloat(formData.cost);
    if (!p || isNaN(p) || p <= 0 || !c || isNaN(c)) return '—';
    return (((p - c) / p) * 100).toFixed(1);
  };

  // Final Price calculation
  const calcFinalPrice = () => {
    const p = parseFloat(formData.price);
    if (!p || isNaN(p)) return '—';
    const dVal = parseFloat(formData.discountValue);
    if (!dVal || isNaN(dVal) || formData.discountType === 'none') {
      return p.toFixed(2);
    }
    if (formData.discountType === 'percent') {
      return Math.max(0, p - (p * dVal) / 100).toFixed(2);
    }
    if (formData.discountType === 'fixed') {
      return Math.max(0, p - dVal).toFixed(2);
    }
    return p.toFixed(2);
  };

  // Tag Handling
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Custom Fields
  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: '', val: '' }],
    }));
  };

  const updateCustomField = (index, field, value) => {
    const updated = [...formData.customFields];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, customFields: updated }));
  };

  const removeCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // Variants
  const confirmVariant = () => {
    if (!variantInput.name.trim()) return;
    const skuSuffix = variantInput.name.toUpperCase().replace(/\s+/g, '-').slice(0, 6);
    const newVariant = {
      ...variantInput,
      skuSuffix: variantInput.skuSuffix || skuSuffix,
      stock: parseInt(variantInput.stock, 10) || 0,
      price: parseFloat(variantInput.price) || 0,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setVariantInput({
      attr: 'Color',
      name: '',
      color: '#5b67ca',
      stock: 0,
      price: 0,
      skuSuffix: '',
    });
    setShowVariantModal(false);
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Image upload
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      // Try uploading to backend file upload route
      const uploadData = new FormData();
      uploadData.append('file', file);
      try {
        const res = await fetch('http://localhost:3001/api/products/upload', {
          method: 'POST',
          body: uploadData,
        });
        if (res.ok) {
          const data = await res.json();
          const uploadedUrl = data.url.startsWith('http') ? data.url : `http://localhost:3001${data.url}`;
          setImages((prev) => [...prev, { src: uploadedUrl, name: file.name }]);
        } else {
          // Local data URL fallback
          const reader = new FileReader();
          reader.onload = (event) => {
            setImages((prev) => [...prev, { src: event.target.result, name: file.name }]);
          };
          reader.readAsDataURL(file);
        }
      } catch (_err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages((prev) => [...prev, { src: event.target.result, name: file.name }]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (mainImgIdx >= updated.length) {
        setMainImgIdx(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  // Step Validation
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Product name is required';
      if (!formData.category) errors.category = 'Please select a category';
      if (!formData.brand) errors.brand = 'Please select a brand';
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        errors.price = 'Please enter a valid selling price';
      }
    } else if (step === 2) {
      if (formData.qty === '' || isNaN(parseInt(formData.qty, 10)) || parseInt(formData.qty, 10) < 0) {
        errors.qty = 'Stock quantity is required';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmitProduct();
      }
    } else {
      triggerToast('Please complete the required fields before continuing.', true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Product to Real Backend
  const handleSubmitProduct = async (statusOverride) => {
    if (!formData.name.trim() || !formData.category || !formData.brand || !formData.price) {
      triggerToast('Please complete required fields.', true);
      return;
    }

    setSubmitting(true);
    try {
      const finalPriceNum = parseFloat(calcFinalPrice()) || parseFloat(formData.price) || 0;
      const mainImage = images.length ? images[mainImgIdx].src : '';
      const allImageUrls = images.map((img) => img.src).filter(Boolean);

      const payload = {
        sku: formData.sku,
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        subcategory: formData.subCategory,
        brand: formData.brand,
        unit: formData.unit,
        description: formData.description,
        descriptionHtml: `<p>${formData.description}</p>`,
        tags: formData.tags,
        price: parseFloat(formData.price) || 0,
        priceUSD: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue) || 0,
        finalPrice: finalPriceNum,
        taxRate: parseFloat(formData.taxRate) || 0,
        taxType: formData.taxType,
        supplier: formData.supplier,
        supplierSku: formData.supplierSku,
        barcode: formData.barcode,
        qty: parseInt(formData.qty, 10) || 0,
        min: parseInt(formData.min, 10) || 0,
        max: parseInt(formData.max, 10) || 500,
        warehouse: formData.warehouse,
        bin: formData.bin,
        reorderPoint: parseInt(formData.reorderPoint, 10) || 0,
        reorderQty: parseInt(formData.reorderQty, 10) || 0,
        restockedAt: formData.restockDate ? new Date(formData.restockDate).toISOString() : new Date().toISOString(),
        productImg: mainImage,
        images: allImageUrls,
        hasVariants: formData.hasVariants,
        variants: formData.variants,
        hasExpiry: formData.hasExpiry,
        expiryDate: formData.expiryDate || undefined,
        batchNumber: formData.batchNumber || undefined,
        weightKg: parseFloat(formData.weightKg) || 0,
        lengthCm: parseFloat(formData.lengthCm) || 0,
        widthCm: parseFloat(formData.widthCm) || 0,
        heightCm: parseFloat(formData.heightCm) || 0,
        shippingClass: formData.shippingClass,
        customFields: formData.customFields.filter((cf) => cf.key || cf.val),
        status: statusOverride || formData.status || 'active',
        visibility: formData.visibility || 'published',
        retailerId: user?.id || user?.userId || 'cedc0064-0c9e-445e-9649-d344d6fe094d',
        storeId: user?.storeId || undefined,
      };

      await request('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      triggerToast('Product added successfully! Redirecting…');
      setTimeout(() => {
        onNavigate('products');
      }, 1200);
    } catch (err) {
      console.error('Error creating product:', err);
      triggerToast(err.message || 'Error saving product', true);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMeta = [
    { label: 'Product Info', sub: 'Basic details' },
    { label: 'Inventory', sub: 'Stock & variants' },
    { label: 'Review & Publish', sub: 'Finalize' },
  ];

  return (
    <div className="page-wrap" style={{ padding: '24px 28px 48px' }}>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-title">Add New Product</div>
          <div className="page-subtitle">Products / Add Product</div>
        </div>
      </div>

      {/* STEPPER */}
      <div className="stepper-wrap" id="stepperWrap">
        {stepsMeta.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className={`step-connector ${isDone || isActive ? 'done' : ''}`} />
              )}
              <div className={`step-col ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <div
                  className={`step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => {
                    if (stepNum < currentStep || validateStep(currentStep)) {
                      setCurrentStep(stepNum);
                    }
                  }}
                  style={{ cursor: isDone ? 'pointer' : 'default' }}
                >
                  {isDone ? (
                    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.2" style={{ display: 'block' }}>
                      <polyline points="2.5,7 5.5,10 11.5,4" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <div className="step-label" style={{ color: isActive ? '#2e6bc5' : isDone ? '#2e6bc5' : '#a6aaaf' }}>
                  {step.label}
                </div>
                <div className="step-sub">{step.sub}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════
          STEP 1: PRODUCT INFO
      ═════════════════════════════════════════════════════ */}
      <div className={`form-step ${currentStep === 1 ? 'active' : ''}`} style={{ flex: 1 }}>
        <div className="content-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* General Info */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="1" width="11" height="11" rx="1.5" />
                      <line x1="4" y1="4.5" x2="9" y2="4.5" />
                      <line x1="4" y1="6.5" x2="9" y2="6.5" />
                      <line x1="4" y1="8.5" x2="7" y2="8.5" />
                    </svg>
                  </div>
                  General Information
                </div>
              </div>
              <div className="card-body">
                <div className="field-row col-1">
                  <div className="field">
                    <label className="field-label">
                      Product Name <span className="req">*</span>
                    </label>
                    <input
                      className={`input ${fieldErrors.name ? 'error' : ''}`}
                      type="text"
                      placeholder="Enter product name e.g. Nike Air Max 270"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                      }}
                    />
                    {fieldErrors.name && (
                      <div className="field-error show">{fieldErrors.name}</div>
                    )}
                  </div>
                </div>

                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">
                      Category <span className="req">*</span>
                    </label>
                    <div className="select-wrap">
                      <select
                        className={`select ${fieldErrors.category ? 'error' : ''}`}
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: '' });
                        }}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.category && (
                      <div className="field-error show">{fieldErrors.category}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label">Sub Category</label>
                    <div className="select-wrap">
                      <select
                        className="select"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select sub-category</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Desktops">Desktops</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Monitors">Monitors</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">
                      Brand <span className="req">*</span>
                    </label>
                    <div className="select-wrap">
                      <select
                        className={`select ${fieldErrors.brand ? 'error' : ''}`}
                        value={formData.brand}
                        onChange={(e) => {
                          setFormData({ ...formData, brand: e.target.value });
                          if (fieldErrors.brand) setFieldErrors({ ...fieldErrors, brand: '' });
                        }}
                      >
                        <option value="">Select brand</option>
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.brand && (
                      <div className="field-error show">{fieldErrors.brand}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Unit of Measure <span className="req">*</span>
                    </label>
                    <div className="select-wrap">
                      <select
                        className="select"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      >
                        <option value="Pc">Piece (Pc)</option>
                        <option value="Box">Box</option>
                        <option value="Kg">Kilogram (Kg)</option>
                        <option value="Ltr">Litre (Ltr)</option>
                        <option value="Set">Set</option>
                        <option value="Pair">Pair</option>
                        <option value="Meter">Meter</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field-row col-1">
                  <div className="field">
                    <label className="field-label">Description</label>
                    <div className="rich-toolbar">
                      <button type="button" className="rt-btn" title="Bold"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2h4.5a2 2 0 010 4H3V2zM3 6h5a2 2 0 010 4H3V6z"/></svg></button>
                      <button type="button" className="rt-btn" title="Italic"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7.5" y1="2" x2="5.5" y2="11"/><line x1="5" y1="2" x2="8" y2="2"/><line x1="4" y1="11" x2="7" y2="11"/></svg></button>
                      <button type="button" className="rt-btn" title="Underline"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v4a3.5 3.5 0 007 0V2"/><line x1="1.5" y1="11" x2="11.5" y2="11"/></svg></button>
                      <div className="rt-sep"></div>
                      <button type="button" className="rt-btn" title="Bullet list"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="2" cy="4" r="1" fill="currentColor" stroke="none"/><line x1="5" y1="4" x2="12" y2="4"/><circle cx="2" cy="7" r="1" fill="currentColor" stroke="none"/><line x1="5" y1="7" x2="12" y2="7"/><circle cx="2" cy="10" r="1" fill="currentColor" stroke="none"/><line x1="5" y1="10" x2="12" y2="10"/></svg></button>
                      <button type="button" className="rt-btn" title="Numbered list"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="2" x2="2" y2="5"/><line x1="6" y1="4" x2="12" y2="4"/><line x1="6" y1="7" x2="12" y2="7"/><line x1="6" y1="10" x2="12" y2="10"/></svg></button>
                      <div className="rt-sep"></div>
                      <button type="button" className="rt-btn" title="Align left"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="3" x2="11" y2="3"/><line x1="2" y1="6" x2="8" y2="6"/><line x1="2" y1="9" x2="11" y2="9"/></svg></button>
                      <button type="button" className="rt-btn" title="Align center"><svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="3" x2="11" y2="3"/><line x1="3.5" y1="6" x2="9.5" y2="6"/><line x1="2" y1="9" x2="11" y2="9"/></svg></button>
                    </div>
                    <textarea
                      className="textarea rich-textarea"
                      placeholder="Write a detailed product description…"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ minHeight: '100px', borderTop: 'none', borderRadius: '0 0 5px 5px' }}
                    ></textarea>
                    <div className="field-hint">
                      Good descriptions improve discoverability and conversions.
                    </div>
                  </div>
                </div>

                <div className="field-row col-1">
                  <div className="field">
                    <label className="field-label">Tags</label>
                    <div
                      className="tags-field"
                      onClick={() => document.getElementById('tagInputAdd')?.focus()}
                    >
                      {formData.tags.map((tag) => (
                        <div key={tag} className="tag-chip">
                          {tag}
                          <span
                            className="tag-chip-del"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(tag);
                            }}
                          >
                            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="2" y1="2" x2="8" y2="8" />
                              <line x1="8" y1="2" x2="2" y2="8" />
                            </svg>
                          </span>
                        </div>
                      ))}
                      <input
                        id="tagInputAdd"
                        className="tag-input"
                        type="text"
                        placeholder={formData.tags.length ? '' : 'Add tags and press Enter…'}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </div>
                    <div className="field-hint">
                      Tags help customers find your product. Press Enter or comma to add.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="6.5" cy="6.5" r="5.5" />
                      <line x1="6.5" y1="3.5" x2="6.5" y2="5" />
                      <path d="M5 5.5h2a1 1 0 110 2H5.5a1 1 0 100 2H8" />
                      <line x1="6.5" y1="9.5" x2="6.5" y2="9" />
                    </svg>
                  </div>
                  Pricing
                </div>
              </div>
              <div className="card-body">
                <div className="field-row col-3">
                  <div className="field">
                    <label className="field-label">
                      Selling Price <span className="req">*</span>
                    </label>
                    <div className="input-addon">
                      <span className="addon-prefix">₹</span>
                      <input
                        className={`input ${fieldErrors.price ? 'error' : ''}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: '' });
                        }}
                      />
                    </div>
                    {fieldErrors.price && (
                      <div className="field-error show">{fieldErrors.price}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label">Cost Price</label>
                    <div className="input-addon">
                      <span className="addon-prefix">₹</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Profit Margin</label>
                    <div className="input-addon">
                      <input
                        className="input"
                        type="text"
                        placeholder="—"
                        readOnly
                        value={calcProfitMargin()}
                        style={{ background: '#f9fafb', color: 'var(--text-secondary)' }}
                      />
                      <span className="addon-suffix">%</span>
                    </div>
                    <div className="field-hint">Auto-calculated</div>
                  </div>
                </div>

                <div className="field-row col-3">
                  <div className="field">
                    <label className="field-label">Discount Type</label>
                    <div className="select-wrap">
                      <select
                        className="select"
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      >
                        <option value="none">No Discount</option>
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Discount Value</label>
                    <div className="input-addon">
                      <span className="addon-prefix">
                        {formData.discountType === 'percent'
                          ? '%'
                          : formData.discountType === 'fixed'
                          ? '₹'
                          : '—'}
                      </span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={formData.discountType === 'none'}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        style={{
                          background: formData.discountType === 'none' ? '#f9fafb' : '#fff',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Final Price</label>
                    <div className="input-addon">
                      <span className="addon-prefix">₹</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="—"
                        readOnly
                        value={calcFinalPrice()}
                        style={{ background: '#f9fafb', color: 'var(--text-secondary)' }}
                      />
                    </div>
                    <div className="field-hint">After discount</div>
                  </div>
                </div>

                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">Tax Rate</label>
                    <div className="input-addon">
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                      />
                      <span className="addon-suffix">%</span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Tax Type</label>
                    <div className="select-wrap">
                      <select
                        className="select"
                        value={formData.taxType}
                        onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                      >
                        <option value="Inclusive">Inclusive</option>
                        <option value="Exclusive">Exclusive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Product Images */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="2" width="11" height="9" rx="1.5" />
                      <circle cx="4.5" cy="5" r="1" />
                      <path d="M1 9l3-3 2.5 2.5 2-2 3.5 3.5" />
                    </svg>
                  </div>
                  Product Images
                </div>
              </div>
              <div className="card-body dense">
                {/* Main preview */}
                <div className="main-img-box">
                  {images.length > 0 ? (
                    <img src={images[mainImgIdx]?.src} alt="Main product" />
                  ) : (
                    <div className="main-img-placeholder">
                      <svg viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="2" y="5" width="34" height="28" rx="2.5" />
                        <circle cx="12" cy="15" r="4" />
                        <path d="M2 27l9-9 6 6 5-5 14 13" />
                      </svg>
                      <span>No image selected</span>
                    </div>
                  )}
                </div>

                {/* Upload zone */}
                <div
                  className="upload-zone"
                  onClick={() => document.getElementById('imgUploadInput')?.click()}
                >
                  <input
                    type="file"
                    id="imgUploadInput"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="upload-icon">
                    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 17s0-2 2-2h10s2 0 2 2" />
                      <line x1="11" y1="4" x2="11" y2="14" />
                      <polyline points="7,8 11,4 15,8" />
                    </svg>
                  </div>
                  <div className="upload-title">Drag &amp; drop to upload</div>
                  <div className="upload-sub">PNG, JPG, WEBP — max 10 MB</div>
                  <span className="upload-browse-btn">Browse Files</span>
                </div>

                {/* Direct Image URL input */}
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Or paste direct image URL and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = e.target.value.trim();
                        if (url) {
                          setImages((prev) => [...prev, { src: url, name: 'External URL' }]);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Thumbnail strip */}
                {images.length > 0 && (
                  <div className="img-strip">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`img-thumb ${mainImgIdx === idx ? 'main-thumb' : ''}`}
                        onClick={() => setMainImgIdx(idx)}
                      >
                        <img src={img.src} alt="" />
                        {mainImgIdx === idx && <span className="main-badge">Main</span>}
                        <div
                          className="img-thumb-del"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                        >
                          <svg viewBox="0 0 10 10" fill="none">
                            <line x1="2" y1="2" x2="8" y2="8" />
                            <line x1="8" y1="2" x2="2" y2="8" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Supplier */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="5.5" width="11" height="7" rx="1" />
                      <path d="M3.5 5.5V4a3 3 0 016 0v1.5" />
                      <circle cx="6.5" cy="9" r="1.2" />
                    </svg>
                  </div>
                  Supplier
                </div>
              </div>
              <div className="card-body dense">
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label className="field-label">Supplier Name</label>
                  <div className="select-wrap">
                    <select
                      className="select"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Supplier SKU / Part No.</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. SUP-12345"
                    value={formData.supplierSku}
                    onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
          STEP 2: INVENTORY & STOCK
      ═════════════════════════════════════════════════════ */}
      <div className={`form-step ${currentStep === 2 ? 'active' : ''}`} style={{ flex: 1 }}>
        <div className="content-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* Stock Information */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M6.5 1L12.5 4.5v4L6.5 12 .5 8.5v-4L6.5 1z" />
                      <path d="M.5 4.5L6.5 8l6-3.5M6.5 8v4" />
                    </svg>
                  </div>
                  Stock Information
                </div>
              </div>
              <div className="card-body">
                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">SKU (Auto-generated)</label>
                    <div className="input-addon">
                      <span className="addon-prefix" style={{ fontSize: '11px', padding: '0 8px' }}>
                        SKU
                      </span>
                      <input
                        className="input"
                        type="text"
                        readOnly
                        value={formData.sku}
                        style={{
                          background: '#f9fafb',
                          color: 'var(--text-secondary)',
                          fontFamily: 'Nunito Sans, sans-serif',
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Barcode / UPC</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. 012345678901"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field-row col-3">
                  <div className="field">
                    <label className="field-label">
                      Opening Stock <span className="req">*</span>
                    </label>
                    <input
                      className={`input ${fieldErrors.qty ? 'error' : ''}`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.qty}
                      onChange={(e) => {
                        setFormData({ ...formData, qty: e.target.value });
                        if (fieldErrors.qty) setFieldErrors({ ...fieldErrors, qty: '' });
                      }}
                    />
                    {fieldErrors.qty && (
                      <div className="field-error show">{fieldErrors.qty}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label">Minimum Stock Alert</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.min}
                      onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                    />
                    <div className="field-hint">Alert when stock falls below this</div>
                  </div>

                  <div className="field">
                    <label className="field-label">Maximum Stock</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="500"
                      value={formData.max}
                      onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">Warehouse Location</label>
                    <div className="select-wrap">
                      <select
                        className="select"
                        value={formData.warehouse}
                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                      >
                        <option value="">Select warehouse</option>
                        {warehouses.map((w) => (
                          <option key={w.id || w.name} value={w.name}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Bin / Shelf Number</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. BIN-07-C"
                      value={formData.bin}
                      onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field-row col-2">
                  <div className="field">
                    <label className="field-label">Reorder Point</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="20"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    />
                    <div className="field-hint">Trigger purchase order when reached</div>
                  </div>

                  <div className="field">
                    <label className="field-label">Reorder Quantity</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="50"
                      value={formData.reorderQty}
                      onChange={(e) => setFormData({ ...formData, reorderQty: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field-row col-2" style={{ marginTop: '12px' }}>
                  <div className="field">
                    <label className="field-label">Stock / Restock Date</label>
                    <input
                      className="input"
                      type="date"
                      value={formData.restockDate}
                      onChange={(e) => setFormData({ ...formData, restockDate: e.target.value })}
                    />
                    <div className="field-hint">Date when stock level was recorded or restocked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="3" cy="6.5" r="2" />
                      <circle cx="10" cy="3" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <line x1="5" y1="6.5" x2="8" y2="3.5" />
                      <line x1="5" y1="6.5" x2="8" y2="9.5" />
                    </svg>
                  </div>
                  Product Variants
                </div>
                <div className="switch-row" style={{ border: 'none', padding: 0 }}>
                  <label className="switch" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.hasVariants}
                      onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                    />
                    <div className="switch-track"></div>
                    <div className="switch-thumb"></div>
                  </label>
                </div>
              </div>
              <div className="card-body">
                {!formData.hasVariants ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      color: 'var(--text-muted)',
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '13px',
                    }}
                  >
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}
                    >
                      <circle cx="10" cy="18" r="5" />
                      <circle cx="26" cy="10" r="5" />
                      <circle cx="26" cy="26" r="5" />
                      <line x1="15" y1="18" x2="21" y2="12" />
                      <line x1="15" y1="18" x2="21" y2="24" />
                    </svg>
                    Enable variants to define product options like color, size, or style.
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div className="field" style={{ flex: 1, minWidth: '120px' }}>
                        <label className="field-label" style={{ fontSize: '12px' }}>
                          Attribute
                        </label>
                        <div className="select-wrap">
                          <select
                            className="select"
                            value={variantInput.attr}
                            onChange={(e) => setVariantInput({ ...variantInput, attr: e.target.value })}
                          >
                            <option value="Color">Color</option>
                            <option value="Size">Size</option>
                            <option value="Style">Style</option>
                            <option value="Material">Material</option>
                            <option value="Storage">Storage</option>
                            <option value="RAM">RAM</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: '40px', padding: '0 14px' }}
                          onClick={() => setShowVariantModal(true)}
                        >
                          <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="6.5" y1="2" x2="6.5" y2="11" />
                            <line x1="2" y1="6.5" x2="11" y2="6.5" />
                          </svg>
                          Add Option
                        </button>
                      </div>
                    </div>

                    <div
                      className="card"
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: 0,
                      }}
                    >
                      <table className="variant-table">
                        <thead>
                          <tr>
                            <th>Color</th>
                            <th>Option Value</th>
                            <th>SKU Suffix</th>
                            <th>Stock</th>
                            <th>Price Adj.</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.variants.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                No variants added yet. Click &quot;Add Option&quot;.
                              </td>
                            </tr>
                          ) : (
                            formData.variants.map((v, i) => (
                              <tr key={i}>
                                <td>
                                  <div
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: v.color,
                                      border: '1px solid #ccc',
                                    }}
                                  ></div>
                                </td>
                                <td>
                                  <input
                                    className="v-input"
                                    type="text"
                                    value={v.name}
                                    onChange={(e) => {
                                      const updated = [...formData.variants];
                                      updated[i].name = e.target.value;
                                      setFormData({ ...formData, variants: updated });
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="v-input"
                                    type="text"
                                    style={{ width: '80px' }}
                                    value={v.skuSuffix}
                                    onChange={(e) => {
                                      const updated = [...formData.variants];
                                      updated[i].skuSuffix = e.target.value;
                                      setFormData({ ...formData, variants: updated });
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="v-input"
                                    type="number"
                                    style={{ width: '70px' }}
                                    value={v.stock}
                                    onChange={(e) => {
                                      const updated = [...formData.variants];
                                      updated[i].stock = e.target.value;
                                      setFormData({ ...formData, variants: updated });
                                    }}
                                  />
                                </td>
                                <td>
                                  <div className="input-addon" style={{ border: '1px solid var(--border)', borderRadius: '4px' }}>
                                    <span style={{ padding: '0 6px', fontSize: '12px', background: '#f5f6fa' }}>₹</span>
                                    <input
                                      className="v-input"
                                      type="number"
                                      step="0.01"
                                      style={{ border: 'none', width: '70px' }}
                                      value={v.price}
                                      onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[i].price = e.target.value;
                                        setFormData({ ...formData, variants: updated });
                                      }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="v-del-btn" onClick={() => removeVariant(i)}>
                                    <svg viewBox="0 0 12 12" fill="none" strokeWidth="1.4">
                                      <polyline points="1,3 11,3" />
                                      <path d="M3.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M4 3v7.5M8 3v7.5M2 3l.6 7.5a1 1 0 001 .9h4.8a1 1 0 001-.9L10 3" />
                                    </svg>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Expiry & Batch */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="2" width="11" height="10" rx="1" />
                      <line x1="4" y1="1" x2="4" y2="3" />
                      <line x1="9" y1="1" x2="9" y2="3" />
                      <line x1="1" y1="5" x2="12" y2="5" />
                    </svg>
                  </div>
                  Expiry &amp; Batch
                </div>
              </div>
              <div className="card-body dense">
                <div className="switch-row" style={{ marginBottom: '10px' }}>
                  <div>
                    <div className="switch-label">Track Expiry Date</div>
                    <div className="switch-sub">For perishable items</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.hasExpiry}
                      onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked })}
                    />
                    <div className="switch-track"></div>
                    <div className="switch-thumb"></div>
                  </label>
                </div>
                {formData.hasExpiry && (
                  <div>
                    <div className="field" style={{ marginBottom: '12px' }}>
                      <label className="field-label" style={{ fontSize: '12px' }}>
                        Expiry Date
                      </label>
                      <input
                        className="input"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" style={{ fontSize: '12px' }}>
                        Batch Number
                      </label>
                      <input
                        className="input"
                        type="text"
                        placeholder="e.g. BATCH-2025-01"
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M1 4h8v6H1V4z" />
                      <path d="M9 5.5l2.5 1V10H9V5.5z" />
                      <circle cx="3.5" cy="10.5" r="1" />
                      <circle cx="10" cy="10.5" r="1" />
                    </svg>
                  </div>
                  Shipping
                </div>
              </div>
              <div className="card-body dense">
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label className="field-label" style={{ fontSize: '12px' }}>
                    Weight (kg)
                  </label>
                  <div className="input-addon">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    />
                    <span className="addon-suffix">kg</span>
                  </div>
                </div>

                <div className="field-row col-3" style={{ marginBottom: '12px' }}>
                  <div className="field">
                    <label className="field-label" style={{ fontSize: '12px' }}>
                      L (cm)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.lengthCm}
                      onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" style={{ fontSize: '12px' }}>
                      W (cm)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.widthCm}
                      onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" style={{ fontSize: '12px' }}>
                      H (cm)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" style={{ fontSize: '12px' }}>
                    Shipping Class
                  </label>
                  <div className="select-wrap">
                    <select
                      className="select"
                      value={formData.shippingClass}
                      onChange={(e) => setFormData({ ...formData, shippingClass: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Express">Express</option>
                      <option value="Overnight">Overnight</option>
                      <option value="Free Shipping">Free Shipping</option>
                      <option value="Local Pickup Only">Local Pickup Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Attributes */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="1" width="11" height="11" rx="1.5" />
                      <line x1="4" y1="6.5" x2="9" y2="6.5" />
                      <line x1="6.5" y1="4" x2="6.5" y2="9" />
                    </svg>
                  </div>
                  Custom Attributes
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                  onClick={addCustomField}
                >
                  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="6.5" y1="2" x2="6.5" y2="11" />
                    <line x1="2" y1="6.5" x2="11" y2="6.5" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="card-body dense">
                {formData.customFields.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '16px 0',
                      color: 'var(--text-muted)',
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '12.5px',
                    }}
                  >
                    No custom attributes yet. Click Add to create one.
                  </div>
                ) : (
                  formData.customFields.map((field, idx) => (
                    <div key={idx} className="field-row col-2" style={{ marginBottom: '10px' }}>
                      <div className="field">
                        <label className="field-label" style={{ fontSize: '12px' }}>
                          Attribute Name
                        </label>
                        <input
                          className="input"
                          placeholder="e.g. Material"
                          value={field.key}
                          onChange={(e) => updateCustomField(idx, 'key', e.target.value)}
                        />
                      </div>
                      <div className="field" style={{ position: 'relative' }}>
                        <label className="field-label" style={{ fontSize: '12px' }}>
                          Value
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            className="input"
                            placeholder="e.g. Aluminum"
                            value={field.val}
                            onChange={(e) => updateCustomField(idx, 'val', e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <div
                            className="v-del-btn"
                            onClick={() => removeCustomField(idx)}
                            style={{ flexShrink: 0, marginTop: 0 }}
                          >
                            <svg viewBox="0 0 12 12" fill="none" strokeWidth="1.4">
                              <polyline points="1,3 11,3" />
                              <path d="M3.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M4 3v7.5M8 3v7.5M2 3l.6 7.5a1 1 0 001 .9h4.8a1 1 0 001-.9L10 3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
          STEP 3: REVIEW & PUBLISH
      ═════════════════════════════════════════════════════ */}
      <div className={`form-step ${currentStep === 3 ? 'active' : ''}`} style={{ flex: 1 }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <div className="card-title-icon">
                  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M11 8.5l-4.5 3-4.5-3V3l4.5-2 4.5 2v5.5z" />
                    <polyline points="4,6.5 6,8.5 9,5" />
                  </svg>
                </div>
                Review Summary
              </div>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '18px 24px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Product Name
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.name || '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    SKU Code
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.sku || '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Category
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.category || '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Brand
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.brand || '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Selling Price
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#092c4c',
                    }}
                  >
                    ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Opening Stock
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.qty || 0} units
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Images
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {images.length} uploaded
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Variants
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.variants.length} option(s)
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      marginBottom: '3px',
                    }}
                  >
                    Tags
                  </div>
                  <div
                    style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.tags.length ? formData.tags.join(', ') : '—'}
                  </div>
                </div>
              </div>

              {/* Status and Visibility Settings */}
              <div
                style={{
                  borderTop: '1px solid #f0f2f4',
                  paddingTop: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <label className="field-label" style={{ marginBottom: '8px' }}>
                    Status
                  </label>
                  <div className="toggle-group">
                    {['active', 'inactive', 'draft'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`toggle-pill ${formData.status === st ? 'sel-green' : ''}`}
                        onClick={() => setFormData({ ...formData, status: st })}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label" style={{ marginBottom: '8px' }}>
                    Visibility
                  </label>
                  <div className="toggle-group">
                    {['published', 'hidden', 'scheduled'].map((vb) => (
                      <button
                        key={vb}
                        type="button"
                        className={`toggle-pill ${formData.visibility === vb ? 'sel-green' : ''}`}
                        onClick={() => setFormData({ ...formData, visibility: vb })}
                      >
                        {vb.charAt(0).toUpperCase() + vb.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
          BOTTOM NAVIGATION BAR
      ═════════════════════════════════════════════════════ */}
      <div
        className="bottom-nav"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 40,
          background: '#fff',
          borderTop: '1px solid var(--border)',
          margin: '24px -28px -48px',
          padding: '14px 28px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <div className="bottom-nav-left">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={prevStep}
            >
              <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polyline points="8,2 4,6.5 8,11" />
              </svg>
              Previous
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="step-indicator">
            Step <strong>{currentStep}</strong> of <strong>{totalSteps}</strong>
          </span>
          <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`step-dot ${currentStep === dot ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        </div>

        <div className="bottom-nav-right">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleSubmitProduct('draft')}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={nextStep}
          >
            {currentStep === totalSteps ? (
              submitting ? 'Publishing...' : 'Publish Product'
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
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <div className="toast-icon">
          {isToastError ? (
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'block', flexShrink: 0 }}>
              <circle cx="10" cy="10" r="8.5" />
              <line x1="7" y1="7" x2="13" y2="13" />
              <line x1="13" y1="7" x2="7" y2="13" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'block', flexShrink: 0 }}>
              <circle cx="10" cy="10" r="8.5" />
              <polyline points="6.5,10 9,12.5 13.5,7" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>{toastMsg}</span>
      </div>

      {/* MODAL: ADD VARIANT */}
      {showVariantModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.4)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '26px',
              width: '380px',
              boxShadow: '0 8px 40px rgba(0,0,0,.16)',
            }}
          >
            <div
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                color: '#092c4c',
                marginBottom: '18px',
              }}
            >
              Add Variant Option
            </div>
            <div className="field" style={{ marginBottom: '12px' }}>
              <label className="field-label" style={{ fontSize: '12.5px' }}>
                Value / Name
              </label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Space Black"
                value={variantInput.name}
                onChange={(e) => setVariantInput({ ...variantInput, name: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: '12px' }}>
              <label className="field-label" style={{ fontSize: '12.5px' }}>
                Color (optional)
              </label>
              <input
                className="input"
                type="color"
                style={{ height: '40px', padding: '4px 10px', cursor: 'pointer' }}
                value={variantInput.color}
                onChange={(e) => setVariantInput({ ...variantInput, color: e.target.value })}
              />
            </div>
            <div className="field-row col-2" style={{ marginBottom: '20px' }}>
              <div className="field">
                <label className="field-label" style={{ fontSize: '12.5px' }}>
                  Stock
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={variantInput.stock}
                  onChange={(e) => setVariantInput({ ...variantInput, stock: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" style={{ fontSize: '12.5px' }}>
                  Price Adj. (₹)
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={variantInput.price}
                  onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowVariantModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmVariant}
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
