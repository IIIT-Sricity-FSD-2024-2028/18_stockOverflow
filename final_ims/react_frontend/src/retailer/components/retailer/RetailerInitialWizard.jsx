import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerApi } from '../../api/retailerApi';

const STEP_META = [
  { label: 'Business', sub: 'Profile' },
  { label: 'Stores', sub: 'Locations' },
  { label: 'Review', sub: '& Launch' },
];

const HERO_META = [
  { pill: 'Step 1', title: 'Set Up Your Business Profile', sub: "Start with the basics — your business name, contact info, and owner details." },
  { pill: 'Step 2', title: 'Add Your Store Locations', sub: 'Configure each physical or online store. You can manage all of them from one dashboard.' },
  { pill: 'Step 3', title: 'Review & Complete Setup', sub: 'Everything looks good? Launch your StockOverflow dashboard and start selling.' },
];

export default function RetailerInitialWizard({ onCompleteSetup, onCancel }) {
  const { user, saveSession } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isFinished, setIsFinished] = useState(false);

  // Step 1: Business Form
  const [bName, setBName] = useState('');
  const [bType, setBType] = useState('Sole Proprietorship');
  const [bEmail, setBEmail] = useState(user?.email || '');
  const [bPhone, setBPhone] = useState('');
  const [bTax, setBTax] = useState('');
  const [bFiscal, setBFiscal] = useState('April');
  const [bAddr, setBAddr] = useState('');
  const [bWeb, setBWeb] = useState('');
  const [bIndustry, setBIndustry] = useState('Mixed / General');

  // Step 1: Owner Form
  const [oName, setOName] = useState(user?.name || '');
  const [oTitle, setOTitle] = useState('Store Owner');
  const [oEmail, setOEmail] = useState(user?.email || '');

  // Step 2: Stores
  const [stores, setStores] = useState([
    {
      name: "Main Retail Outlet",
      code: "STORE-01",
      contact: user?.name || "Store Manager",
      phone: "+91 98765 43210",
      addr: "Central Market, Main Street",
      type: "Retail Store",
      notes: "Primary flagship location",
      status: "active",
    },
  ]);

  // Store Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStoreIdx, setEditingStoreIdx] = useState(null);
  const [smName, setSmName] = useState('');
  const [smCode, setSmCode] = useState('');
  const [smContact, setSmContact] = useState('');
  const [smPhone, setSmPhone] = useState('');
  const [smAddr, setSmAddr] = useState('');
  const [smType, setSmType] = useState('Retail Store');
  const [smStatus, setSmStatus] = useState('active');
  const [smNotes, setSmNotes] = useState('');

  // Form errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.email) {
      if (!bEmail) setBEmail(user.email);
      if (!oEmail) setOEmail(user.email);
    }
    if (user?.name) {
      if (!oName) setOName(user.name);
      if (!bName) setBName(`${user.name}'s Retail Store`);
      setStores((prev) => {
        if (prev.length === 1 && prev[0].name === "Main Retail Outlet") {
          return [
            {
              ...prev[0],
              name: `${user.name}'s Main Store`,
              contact: user.name,
            },
          ];
        }
        return prev;
      });
    }
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!bName.trim()) newErrors.bName = 'Business name is required';
      if (!bEmail.trim() || !bEmail.includes('@')) newErrors.bEmail = 'Valid business email is required';
      if (!oName.trim()) newErrors.oName = 'Owner name is required';
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        showToast('Please fill in all required fields.', 'err');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (stores.length === 0) {
        showToast('Please add at least one store to continue.', 'err');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Store Modal Functions
  const openStoreModal = (idx = null) => {
    if (idx === null && stores.length >= 5) {
      showToast('Maximum 5 stores allowed on your current setup. Upgrade plan for more.', 'err');
      return;
    }
    setEditingStoreIdx(idx);
    if (idx !== null) {
      const s = stores[idx];
      setSmName(s.name);
      setSmCode(s.code || '');
      setSmContact(s.contact);
      setSmPhone(s.phone || '');
      setSmAddr(s.addr || '');
      setSmType(s.type || 'Retail Store');
      setSmStatus(s.status || 'active');
      setSmNotes(s.notes || '');
    } else {
      setSmName('');
      setSmCode(`STORE-0${stores.length + 1}`);
      setSmContact(oName || 'Manager');
      setSmPhone(bPhone || '');
      setSmAddr('');
      setSmType('Retail Store');
      setSmStatus('active');
      setSmNotes('');
    }
    setIsStoreModalOpen(true);
  };

  const saveStore = () => {
    if (!smName.trim()) {
      showToast('Store name is required.', 'err');
      return;
    }
    if (!smContact.trim()) {
      showToast('Contact person is required.', 'err');
      return;
    }

    const newStore = {
      name: smName.trim(),
      code: smCode.trim() || `STORE-0${editingStoreIdx !== null ? editingStoreIdx + 1 : stores.length + 1}`,
      contact: smContact.trim(),
      phone: smPhone.trim(),
      addr: smAddr.trim(),
      type: smType,
      status: smStatus,
      notes: smNotes.trim(),
    };

    if (editingStoreIdx !== null) {
      const updated = [...stores];
      updated[editingStoreIdx] = newStore;
      setStores(updated);
      showToast('Store updated!');
    } else {
      setStores([...stores, newStore]);
      showToast('Store added successfully!');
    }
    setIsStoreModalOpen(false);
  };

  const deleteStore = (idx) => {
    if (stores.length <= 1) {
      showToast('You must keep at least 1 store.', 'err');
      return;
    }
    setStores(stores.filter((_, i) => i !== idx));
    showToast('Store removed.');
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const numericSeed = String(Date.now()).slice(-3);
      const retailerCode = `RET-${numericSeed}`;

      const normalizedStores = stores.map((s, index) => ({
        name: s.name,
        code: s.code || `STORE-${String(index + 1).padStart(2, '0')}`,
        contactPerson: s.contact,
        phone: s.phone || undefined,
        address: s.addr || undefined,
        type: s.type || 'Retail Store',
        notes: s.notes || undefined,
        status: s.status || 'active',
      }));

      const retailerPayload = {
        business: {
          businessName: bName.trim(),
          businessType: bType || 'Sole Proprietorship',
          businessEmail: bEmail.trim(),
          phoneNumber: bPhone.trim() || undefined,
          taxId: bTax.trim() || undefined,
          retailerCode: retailerCode,
          currency: 'INR',
          fiscalYear: bFiscal || 'April',
          businessAddress: bAddr.trim() || undefined,
          website: bWeb.trim() || undefined,
          primaryIndustry: bIndustry || 'Mixed / General',
        },
        primaryContact: {
          fullName: oName.trim(),
          designation: oTitle.trim() || 'Store Owner',
          directEmail: oEmail.trim() || bEmail.trim(),
        },
        profileStatus: 'pending',
        stores: normalizedStores,
        suppliers: [],
        products: [],
      };

      // Call backend retailer setup API
      const retailerRecord = await retailerApi.setupRetailer(retailerPayload).catch((e) => {
        console.warn('API setup warning, fallback simulated:', e);
        return {
          id: `RET-${Date.now()}`,
          businessName: bName.trim(),
        };
      });

      const primaryStore = normalizedStores[0];
      const profileSummary = {
        businessName: bName.trim(),
        businessEmail: bEmail.trim(),
        businessPhone: bPhone.trim(),
        taxId: bTax.trim(),
        address: bAddr.trim(),
        website: bWeb.trim(),
        businessType: bType,
        currency: 'INR',
        fiscalYear: bFiscal,
        primaryIndustry: bIndustry,
        ownerName: oName.trim(),
        ownerTitle: oTitle.trim(),
        ownerEmail: oEmail.trim(),
        profileStatus: 'pending',
        stores: normalizedStores,
      };

      // Update user in backend if user id exists
      if (user?.id) {
        await retailerApi
          .updateUser(user.id, {
            profileId: retailerRecord.id || user.id,
            retailerId: retailerRecord.id || user.id,
            status: 'Pending',
            profile: profileSummary,
            store: primaryStore ? primaryStore.name : bName.trim(),
            storeId: primaryStore ? primaryStore.code : 'STORE-01',
            currentStoreId: primaryStore ? primaryStore.code : 'STORE-01',
            accessibleStoreIds: normalizedStores.map((s) => s.code),
          })
          .catch(() => {});
      }

      // Trigger employee task distribution in round-robin
      try {
        await fetch('/api/employees/assignments/distribute', { method: 'POST' });
      } catch (_distErr) {
        console.warn('Distribution trigger note:', _distErr);
      }

      // Update active session in AuthContext
      const updatedSession = saveSession({
        ...(user || {}),
        name: oName.trim() || user?.name || bName.trim(),
        role: 'retailer',
        status: 'Pending',
        profileId: retailerRecord.id || user?.id || 'RET-01',
        retailerId: retailerRecord.id || user?.id || 'RET-01',
        profile: profileSummary,
        store: primaryStore ? primaryStore.name : bName.trim(),
        storeId: primaryStore ? primaryStore.code : 'STORE-01',
        currentStoreId: primaryStore ? primaryStore.code : 'STORE-01',
        accessibleStoreIds: normalizedStores.map((s) => s.code),
      });

      setIsFinished(true);
      showToast("Setup submitted! Awaiting employee verification.");
    } catch (err) {
      console.error('Setup error:', err);
      showToast('Error saving profile: ' + (err.message || 'Please try again.'), 'err');
    } finally {
      setLoading(false);
    }
  };

  const hero = HERO_META[currentStep - 1];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Brand Bar ── */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          height: '65px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              background: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <path d="M12 2L22 7v10L12 22 2 17V7L12 2z" />
              <path d="M2 7l10 5 10-5M12 12v10" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#092c4c' }}>StockOverflow</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#2563eb',
              background: '#eff6ff',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #bfdbfe',
            }}
          >
            Retailer Setup Wizard
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* ── Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #092c4c 0%, #1a4a8a 60%, #2e6bc5 100%)',
          padding: '44px 36px 36px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
          >
            {currentStep}
          </span>
          <span>{hero.pill}</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          {hero.title}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', maxWidth: '540px', margin: '0 auto', fontWeight: 500 }}>
          {hero.sub}
        </p>
      </div>

      {/* ── Step Tracker ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '18px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '640px', margin: '0 auto' }}>
          {STEP_META.map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={step.label}>
                {idx > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      background: isDone ? '#2563eb' : '#e5e7eb',
                      margin: '0 8px 24px',
                      transition: 'background 0.3s',
                    }}
                  />
                )}
                <div
                  onClick={() => isDone && setCurrentStep(stepNum)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isDone ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: `2px solid ${isActive || isDone ? '#2563eb' : '#d1d5db'}`,
                      background: isDone || isActive ? '#2563eb' : '#fff',
                      color: isDone || isActive ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      boxShadow: isActive ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                    }}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isActive || isDone ? '#2563eb' : '#64748b' }}>
                    {step.label}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div style={{ flex: 1, padding: '28px 36px 60px', maxWidth: '980px', margin: '0 auto', width: '100%' }}>
        {/* Celebration Finish Card */}
        {isFinished ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
                fontSize: '32px',
                color: '#fff',
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Application Submitted for Verification! ⏳
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '440px', margin: '0 auto 28px' }}>
              Your retailer profile for <strong>{bName}</strong> has been configured and submitted. Our compliance team will review your business credentials and approve your account shortly.
            </p>
            <button
              type="button"
              onClick={onCompleteSetup}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Check Verification Status &rarr;
            </button>
          </div>
        ) : (
          <>
            {/* ── SECTION 1: BUSINESS PROFILE ── */}
            {currentStep === 1 && (
              <div>
                {/* Business Information Card */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#092c4c', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    🏢 Business Information
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Business Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={bName}
                        onChange={(e) => setBName(e.target.value)}
                        placeholder="e.g. Sunrise Retail Group"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: `1px solid ${errors.bName ? '#ef4444' : '#d1d5db'}`, outline: 'none' }}
                      />
                      {errors.bName && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.bName}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Business Type <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={bType}
                        onChange={(e) => setBType(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: '#fff' }}
                      >
                        <option>Sole Proprietorship</option>
                        <option>Partnership</option>
                        <option>LLC</option>
                        <option>Corporation</option>
                        <option>Franchise</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Business Email <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={bEmail}
                        onChange={(e) => setBEmail(e.target.value)}
                        placeholder="admin@yourstore.com"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: `1px solid ${errors.bEmail ? '#ef4444' : '#d1d5db'}`, outline: 'none' }}
                      />
                      {errors.bEmail && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.bEmail}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={bPhone}
                        onChange={(e) => setBPhone(e.target.value)}
                        placeholder="+91 (555) 000-0000"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Tax / GST Number
                      </label>
                      <input
                        type="text"
                        value={bTax}
                        onChange={(e) => setBTax(e.target.value)}
                        placeholder="e.g. GST-12345678"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Fiscal Year Start
                      </label>
                      <select
                        value={bFiscal}
                        onChange={(e) => setBFiscal(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: '#fff' }}
                      >
                        <option>April</option>
                        <option>January</option>
                        <option>July</option>
                        <option>October</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={bAddr}
                      onChange={(e) => setBAddr(e.target.value)}
                      placeholder="Street address, city, state, PIN"
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Website
                      </label>
                      <input
                        type="url"
                        value={bWeb}
                        onChange={(e) => setBWeb(e.target.value)}
                        placeholder="https://yourstore.com"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Industry / Category
                      </label>
                      <select
                        value={bIndustry}
                        onChange={(e) => setBIndustry(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: '#fff' }}
                      >
                        <option>Mixed / General</option>
                        <option>Food & Grocery</option>
                        <option>Electronics & Technology</option>
                        <option>Fashion & Apparel</option>
                        <option>Health & Beauty</option>
                        <option>Home & Furniture</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Primary Owner / Manager Card */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#092c4c', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    👤 Primary Owner / Manager
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={oName}
                        onChange={(e) => setOName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: `1px solid ${errors.oName ? '#ef4444' : '#d1d5db'}`, outline: 'none' }}
                      />
                      {errors.oName && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.oName}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={oTitle}
                        onChange={(e) => setOTitle(e.target.value)}
                        placeholder="e.g. Store Owner / Manager"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={oEmail}
                        onChange={(e) => setOEmail(e.target.value)}
                        placeholder="owner@yourstore.com"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 2: MULTI-STORE LOCATIONS ── */}
            {currentStep === 2 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#092c4c', margin: 0 }}>
                      🏬 Your Store Locations
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      ({stores.length} store{stores.length !== 1 ? 's' : ''} added)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openStoreModal(null)}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    + Add Store
                  </button>
                </div>

                {/* Stores Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {stores.map((s, idx) => (
                    <div
                      key={s.code || idx}
                      style={{
                        background: '#fff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '16px',
                        position: 'relative',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{s.name}</div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            background: s.status === 'active' ? '#dcfce7' : '#f1f5f9',
                            color: s.status === 'active' ? '#15803d' : '#475569',
                          }}
                        >
                          {s.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                        <div>📍 {s.addr || 'No address specified'}</div>
                        <div>👤 {s.contact} {s.phone ? `• ${s.phone}` : ''}</div>
                        <div>🏷️ {s.type} • Code: {s.code}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => openStoreModal(idx)}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          Edit
                        </button>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <button
                          type="button"
                          onClick={() => deleteStore(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Store Box */}
                  <div
                    onClick={() => openStoreModal(null)}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '140px',
                      cursor: 'pointer',
                      background: '#fafbfc',
                      color: '#64748b',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>➕</div>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Store Location</span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '12.5px',
                    color: '#1e40af',
                    fontWeight: 600,
                  }}
                >
                  💡 <strong>Starter Kirana plan</strong> includes 1 store location. You can upgrade to <strong>Vyapar Pro</strong> (up to 5 outlets) or <strong>Bharat Enterprise</strong> (unlimited outlets) later in your Plan settings.
                </div>
              </div>
            )}

            {/* ── SECTION 3: REVIEW & LAUNCH ── */}
            {currentStep === 3 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Stores</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{stores.length}</div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>{stores.filter((s) => s.status === 'active').length} Active Outlet(s)</div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Company</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bName || '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{bType}</div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Contact Owner</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{oName || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{bEmail}</div>
                  </div>
                </div>

                {/* Stores Summary List */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '14px', color: '#092c4c' }}>
                    Stores Configured
                  </div>
                  <div>
                    {stores.map((s) => (
                      <div
                        key={s.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 20px',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{s.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.type} • {s.contact}</div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: s.status === 'active' ? '#dcfce7' : '#f1f5f9',
                            color: s.status === 'active' ? '#15803d' : '#475569',
                          }}
                        >
                          {s.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleCompleteSetup}
                    disabled={loading}
                    style={{
                      background: '#092c4c',
                      color: '#fff',
                      border: 'none',
                      padding: '14px 40px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(9,44,76,0.25)',
                    }}
                  >
                    {loading ? 'Saving Setup...' : '✓ Complete Setup & Go to Dashboard'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Bottom Navigation Bar ── */}
      {!isFinished && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid #e5e7eb',
            position: 'sticky',
            bottom: 0,
            zIndex: 40,
            padding: '14px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={prevStep}
            style={{
              visibility: currentStep > 1 ? 'visible' : 'hidden',
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <span>Step <strong>{currentStep}</strong> of <strong>3</strong></span>
          </div>

          <button
            type="button"
            onClick={currentStep === 3 ? handleCompleteSetup : nextStep}
            disabled={loading}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 24px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {currentStep === 3 ? (loading ? 'Saving...' : 'Complete Setup') : 'Continue →'}
          </button>
        </div>
      )}

      {/* ── Add / Edit Store Modal ── */}
      {isStoreModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStoreModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#092c4c', margin: 0 }}>
                {editingStoreIdx !== null ? 'Edit Store Location' : 'Add Store Location'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Store Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={smName}
                  onChange={(e) => setSmName(e.target.value)}
                  placeholder="e.g. Eastern Branch"
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Store Code
                </label>
                <input
                  type="text"
                  value={smCode}
                  onChange={(e) => setSmCode(e.target.value)}
                  placeholder="e.g. EST-01"
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Contact Person <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={smContact}
                  onChange={(e) => setSmContact(e.target.value)}
                  placeholder="Manager name"
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={smPhone}
                  onChange={(e) => setSmPhone(e.target.value)}
                  placeholder="+91 555 000-0000"
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Address
              </label>
              <input
                type="text"
                value={smAddr}
                onChange={(e) => setSmAddr(e.target.value)}
                placeholder="Store address, market, street"
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Store Type
                </label>
                <select
                  value={smType}
                  onChange={(e) => setSmType(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: '#fff' }}
                >
                  <option>Retail Store</option>
                  <option>Warehouse</option>
                  <option>Outlet</option>
                  <option>Pop-up</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Status
                </label>
                <div style={{ display: 'flex', gap: '8px', height: '38px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setSmStatus('active')}
                    style={{
                      flex: 1,
                      height: '32px',
                      borderRadius: '20px',
                      border: 'none',
                      background: smStatus === 'active' ? '#dcfce7' : '#f1f5f9',
                      color: smStatus === 'active' ? '#15803d' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmStatus('inactive')}
                    style={{
                      flex: 1,
                      height: '32px',
                      borderRadius: '20px',
                      border: 'none',
                      background: smStatus === 'inactive' ? '#fee2e2' : '#f1f5f9',
                      color: smStatus === 'inactive' ? '#b91c1c' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(false)}
                style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveStore}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Save Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            zIndex: 99999,
            background: toastType === 'err' ? '#b91c1c' : '#092c4c',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastType === 'err' ? '⚠️' : '✓'}</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
