import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDataSync } from '../../context/DataSyncContext';
import { billerApi } from '../api/billerApi';
import ReceiptModal from './ReceiptModal';

export default function PosScreen({ onSwitchView, onLogout }) {
  const { user } = useAuth();

  // Currency Formatter
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const formatInr = (amt) => currencyFormatter.format(amt || 0);

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Store Affiliation & Scope
  const [stores, setStores] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(() => {
    return user?.currentStoreId || user?.storeId || '';
  });
  const [currentStoreName, setCurrentStoreName] = useState(() => {
    return user?.store || 'Retail Store';
  });

  // Categories
  const CATEGORIES = [
    { id: 'all', label: 'All Items', icon: '🏷️' },
    { id: 'electronics', label: 'Electronics', icon: '⚡' },
    { id: 'footwear', label: 'Footwear', icon: '👟' },
    { id: 'mobiles', label: 'Mobiles', icon: '📱' },
    { id: 'laptops', label: 'Laptops', icon: '💻' },
    { id: 'appliances', label: 'Appliances', icon: '🔌' },
    { id: 'accessories', label: 'Accessories', icon: '🎒' },
  ];
  const [activeCategory, setActiveCategory] = useState('all');

  // Products & Catalog
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'asc' | 'desc'
  const [loading, setLoading] = useState(true);

  // Cart / Line Items: array of { sku, name, price, quantity, total, isReserved, requestIds, maxStock, image, emoji }
  const [cart, setCart] = useState([]);
  const [stagedReservationIds, setStagedReservationIds] = useState({});

  // Checkout Calculations State
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState(0);
  const [roundoffEnabled, setRoundoffEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Customer Management
  const [customers, setCustomers] = useState(['Walk-in Customer']);
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');

  // Incoming Consumer Orders (Reservations)
  const [reservedOrders, setReservedOrders] = useState([]);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Receipt Modal State
  const [completedTx, setCompletedTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const toastTimeoutRef = useRef(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(''), 2500);
  };

  // 1. Initial Load: Stores, Products, Customers, Reservations
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      setLoading(true);
      try {
        const [storesData, productsData, customersData] = await Promise.all([
          billerApi.getStores().catch(() => []),
          billerApi.getProducts().catch(() => []),
          billerApi.getCustomers().catch(() => []),
        ]);

        if (!isMounted) return;

        // Stores Setup
        const storeList = Array.isArray(storesData) ? storesData : [];
        setStores(storeList);

        // Determine biller's assigned store
        const billerStoreId = user?.currentStoreId || user?.storeId || '';
        const matchedStore = storeList.find(
          (s) => (s.id || s.code) === billerStoreId
        );

        if (matchedStore) {
          setCurrentStoreId(matchedStore.id || matchedStore.code);
          setCurrentStoreName(matchedStore.name);
        } else if (billerStoreId) {
          setCurrentStoreId(billerStoreId);
          setCurrentStoreName(user?.store || 'Assigned Store');
        } else if (storeList.length > 0) {
          setCurrentStoreId(storeList[0].id || storeList[0].code);
          setCurrentStoreName(storeList[0].name);
        }

        // Products
        const prodList = Array.isArray(productsData) ? productsData : [];
        setProducts(prodList);

        // Customers
        const custList = Array.isArray(customersData) ? customersData : [];
        const names = ['Walk-in Customer'].concat(
          custList
            .map((c) => c.name)
            .filter((n) => n && n.toLowerCase() !== 'walk-in customer')
        );
        setCustomers(Array.from(new Set(names)));
      } catch (err) {
        console.error('POS initialization error:', err);
        showToast('Error loading POS catalog.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Real-time Incoming Orders Polling (Every 3.5 seconds)
  useEffect(() => {
    let isMounted = true;

    async function loadIncomingOrders() {
      try {
        const targetStoreId = currentStoreId || user?.storeId || '';
        const reservations = await billerApi.getReservations(targetStoreId).catch(() => []);
        if (!isMounted) return;

        if (Array.isArray(reservations)) {
          // Filter out already staged items in the current transaction
          const unstaged = reservations.filter((r) => !stagedReservationIds[r.requestId]);
          setReservedOrders(unstaged);
        }
      } catch (err) {
        // silent polling catch
      }
    }

    loadIncomingOrders();
    const interval = setInterval(loadIncomingOrders, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStoreId, user, stagedReservationIds]);

  // Real-time synchronization across modules
  useDataSync(['products', 'inventory', 'transactions'], async () => {
    try {
      const prods = await billerApi.getProducts().catch(() => []);
      if (Array.isArray(prods)) setProducts(prods);
      const targetStoreId = currentStoreId || user?.storeId || '';
      const reservations = await billerApi.getReservations(targetStoreId).catch(() => []);
      if (Array.isArray(reservations)) {
        const unstaged = reservations.filter((r) => !stagedReservationIds[r.requestId]);
        setReservedOrders(unstaged);
      }
    } catch (_e) {}
  });

  // Map category strings to normalized IDs
  const mapCategory = (cat) => {
    const s = String(cat || '').toLowerCase().trim();
    if (s.includes('elect') || s.includes('gadget')) return 'electronics';
    if (s.includes('shoe') || s.includes('footwear')) return 'footwear';
    if (s.includes('phone') || s.includes('mobile')) return 'mobiles';
    if (s.includes('comp') || s.includes('laptop')) return 'laptops';
    if (s.includes('appliance')) return 'appliances';
    if (s.includes('access') || s.includes('bag')) return 'accessories';
    return 'all';
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => mapCategory(p.category) === activeCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortOrder === 'asc') {
      list.sort((a, b) => (Number(a.priceUSD || a.price || 0)) - (Number(b.priceUSD || b.price || 0)));
    } else if (sortOrder === 'desc') {
      list.sort((a, b) => (Number(b.priceUSD || b.price || 0)) - (Number(a.priceUSD || a.price || 0)));
    }

    return list;
  }, [products, activeCategory, searchQuery, sortOrder]);

  // Cart Totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [cart]);

  const rawTotal = useMemo(() => {
    const raw = subtotal + Number(shipping) + Number(tax) - Number(discount) - Number(coupon);
    return Math.max(0, raw);
  }, [subtotal, shipping, tax, discount, coupon]);

  const finalTotal = useMemo(() => {
    return roundoffEnabled ? Math.round(rawTotal) : rawTotal;
  }, [rawTotal, roundoffEnabled]);

  const roundoffValue = useMemo(() => {
    return finalTotal - rawTotal;
  }, [finalTotal, rawTotal]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cart]);

  // Cart Operations
  const handleAddToCart = (product, addQty = 1) => {
    const sku = product.sku;
    const price = Number(product.priceUSD || product.price || 0);

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.sku === sku);
      if (idx >= 0) {
        const existing = prev[idx];
        const newQty = existing.quantity + addQty;
        const updated = {
          ...existing,
          quantity: newQty,
          total: newQty * price,
        };
        const next = [...prev];
        next[idx] = updated;
        return next;
      } else {
        return [
          ...prev,
          {
            sku: product.sku,
            name: product.name || 'Product',
            price: price,
            quantity: addQty,
            total: price * addQty,
            image: product.productImg || product.image || '',
            emoji: product.emoji || '📦',
            maxStock: product.qty || 50,
            isReserved: false,
            requestIds: [],
          },
        ];
      }
    });

    showToast(`Added ${product.name} to cart`);
  };

  const handleUpdateCartQty = (sku, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.sku === sku) {
            const nextQty = Math.max(0, item.quantity + delta);
            return {
              ...item,
              quantity: nextQty,
              total: nextQty * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    if (!cart.length) return;
    if (window.confirm('Clear all items from current order?')) {
      setCart([]);
      setStagedReservationIds({});
      showToast('Order cleared');
    }
  };

  // Add Reserved Order from Consumer to POS Cart
  const handleApproveReservedOrder = (reservation) => {
    const sku = reservation.sku;
    const safeQty = Math.max(1, Number(reservation.qty) || 1);
    const price = Number(reservation.priceUSD || 0);
    const requestId = reservation.requestId;

    // Track staged reservation
    if (requestId) {
      setStagedReservationIds((prev) => ({ ...prev, [requestId]: true }));
    }

    // Set Customer name automatically if provided in reservation
    if (reservation.customer && reservation.customer.trim()) {
      setSelectedCustomer(reservation.customer.trim());
    }

    // Set payment method if provided
    if (reservation.paymentMethod) {
      setPaymentMethod(reservation.paymentMethod);
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.sku === sku);
      if (idx >= 0) {
        const existing = prev[idx];
        const newQty = existing.quantity + safeQty;
        const reqIds = Array.from(
          new Set([...(existing.requestIds || []), requestId].filter(Boolean))
        );
        const next = [...prev];
        next[idx] = {
          ...existing,
          quantity: newQty,
          total: newQty * existing.price,
          isReserved: true,
          requestIds: reqIds,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            sku: reservation.sku,
            name: reservation.name || reservation.productName || 'Reserved Item',
            price: price,
            quantity: safeQty,
            total: price * safeQty,
            image: reservation.productImg || '',
            emoji: reservation.emoji || '📦',
            isReserved: true,
            requestIds: requestId ? [requestId] : [],
          },
        ];
      }
    });

    // Remove from UI reserved list
    setReservedOrders((prev) => prev.filter((r) => r.requestId !== requestId));
    showToast(`Approved order hold for ${reservation.name || 'product'}`);
  };

  // Add Custom Walk-in Customer
  const handleCreateCustomer = () => {
    const name = newCustomerName.trim();
    if (!name) return;

    if (!customers.includes(name)) {
      setCustomers((prev) => [...prev, name]);
      billerApi.createCustomer({
        name,
        phone: newCustomerPhone.trim(),
        email: `${name.toLowerCase().replace(/\s+/g, '')}@walkin.customer`,
      }).catch(() => {});
    }

    setSelectedCustomer(name);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setIsNewCustomerModalOpen(false);
    showToast(`Customer "${name}" selected`);
  };

  // Charge / Complete Purchase & Print Receipt
  const handleChargeOrder = async () => {
    if (!cart.length) {
      showToast('Please add items to cart before charging.');
      return;
    }

    if (!window.confirm(`Confirm payment of ${formatInr(finalTotal)} via ${paymentMethod}?`)) {
      return;
    }

    setIsCharging(true);

    try {
      // Gather all linked reservation requestIds
      const allRequestIds = [];
      cart.forEach((it) => {
        if (Array.isArray(it.requestIds) && it.requestIds.length > 0) {
          allRequestIds.push(...it.requestIds);
        }
      });

      const effectiveRetailerId =
        user?.retailerId ||
        user?.profile?.retailerId ||
        (user?.role === 'retailer' ? user?.id : '') ||
        '';

      const payload = {
        retailerId: effectiveRetailerId,
        customer: selectedCustomer || 'Walk-in Customer',
        store: currentStoreName || 'Retail Store',
        storeId: currentStoreId || 'default-store',
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          isReserved: Boolean(item.isReserved),
          requestIds: item.requestIds || [],
        })),
        shipping: Number(shipping) || 0,
        tax: Number(tax) || 0,
        coupon: Number(coupon) || 0,
        discount: Number(discount) || 0,
        roundoff: roundoffValue,
        status: 'Delivered',
      };

      const result = await billerApi.createTransaction(payload);

      // Attach cashier meta for receipt
      const txWithMeta = {
        ...result,
        billerName: user?.name || 'Cashier',
        store: currentStoreName,
        paymentMethod: paymentMethod,
      };

      setCompletedTx(txWithMeta);
      setIsReceiptOpen(true);

      // Reset cart and staged items
      setCart([]);
      setStagedReservationIds({});
      setShipping(0);
      setTax(0);
      setDiscount(0);
      setCoupon(0);
      setSelectedCustomer('Walk-in Customer');

      // Refresh catalog and reservations from backend
      billerApi.getProducts().then((p) => Array.isArray(p) && setProducts(p)).catch(() => {});
      billerApi.getReservations(currentStoreId).then((r) => Array.isArray(r) && setReservedOrders(r)).catch(() => {});

      showToast(`Sale completed successfully! Total: ${formatInr(finalTotal)}`);
    } catch (err) {
      console.error('POS Checkout failed:', err);
      const errMsg = err.message || 'Transaction could not be completed.';
      alert(`Checkout Error: ${errMsg}`);
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
      }}
    >
      {/* ── LEFT CATEGORY & MODULE SIDEBAR ── */}
      <aside
        style={{
          width: '88px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 6px',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
        }}
      >
        {/* Brand Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
          }}
          title="Stock Overflow POS"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>

        {/* Category Items */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  width: '100%',
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid #93c5fd' : '1px solid transparent',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: isActive ? '#1d4ed8' : '#64748b',
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 600, textAlign: 'center', lineHeight: 1.1 }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={() => onSwitchView && onSwitchView('transactions')}
            style={{
              width: '100%',
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#475569',
            }}
            title="Transactions History"
          >
            <span style={{ fontSize: '18px' }}>📑</span>
            <span style={{ fontSize: '10px', fontWeight: 700 }}>History</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fef2f2',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#dc2626',
            }}
            title="Sign Out"
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span style={{ fontSize: '10px', fontWeight: 700 }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div
        style={{
          marginLeft: '88px',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '12px',
          padding: '12px 14px',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* ── CENTER: PRODUCTS & INCOMING ORDERS ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          {/* Header Bar */}
          <header
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Clock & Biller Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>🕒</span> {currentTime || 'Live POS'}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {user?.name || 'Biller Staff'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Cashier POS Terminal
                </div>
              </div>
            </div>

            {/* Store Badge & Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                <span>🏪</span>
                <span>{currentStoreName}</span>
                {currentStoreId && (
                  <span style={{ fontSize: '10px', color: '#64748b', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                    {currentStoreId}
                  </span>
                )}
              </div>

              {/* Incoming Orders Button with Live Pulse */}
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(true)}
                style={{
                  position: 'relative',
                  padding: '7px 14px',
                  backgroundColor: reservedOrders.length > 0 ? '#fef3c7' : '#ffffff',
                  color: reservedOrders.length > 0 ? '#92400e' : '#475569',
                  border: reservedOrders.length > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📥</span> Incoming Orders
                {reservedOrders.length > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {reservedOrders.length}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Incoming Customer Orders Banner (Real-time Arrival) */}
          {reservedOrders.length > 0 && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🔔</span>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#92400e' }}>
                    New Customer Orders Ready for Pickup ({reservedOrders.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrdersModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b45309',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  View All Orders &rarr;
                </button>
              </div>

              {/* Horizontal Scroll of Arriving Orders */}
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {reservedOrders.slice(0, 4).map((res) => (
                  <div
                    key={res.requestId}
                    style={{
                      minWidth: '220px',
                      background: '#ffffff',
                      border: '1px solid #fcd34d',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                        {res.customer || 'Customer'}
                      </span>
                      <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        {res.paymentMethod || 'Cash'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      {res.name || res.productName} &times; <strong>{res.qty || 1}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>
                        {formatInr((Number(res.priceUSD || 0)) * (Number(res.qty) || 1))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApproveReservedOrder(res)}
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search, Filter & Catalog Controls */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products by title, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                backgroundColor: '#fff',
                outline: 'none',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          {/* Products Grid */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 220px)',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                Loading store inventory...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>No Products Found</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  Try a different search term or category filter.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                {filteredProducts.map((product, idx) => {
                  const cartItem = cart.find((it) => it.sku === product.sku);
                  const inCartQty = cartItem ? cartItem.quantity : 0;
                  const price = Number(product.priceUSD || product.price || 0);
                  const img = product.productImg || product.image || '';

                  return (
                    <div
                      key={`${product.sku || product.id || 'prod'}-${idx}`}
                      onClick={() => handleAddToCart(product)}
                      style={{
                        backgroundColor: inCartQty > 0 ? '#f0f9ff' : '#ffffff',
                        border: inCartQty > 0 ? '1.5px solid #38bdf8' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Image / Emoji */}
                      <div
                        style={{
                          height: '95px',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '1px solid #f1f5f9',
                          overflow: 'hidden',
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerHTML = `<span style="font-size:36px;">${product.emoji || '📦'}</span>`;
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '36px' }}>{product.emoji || '📦'}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          {product.category || 'General'}
                        </div>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '2px 0 6px',
                            minHeight: '32px',
                            lineHeight: 1.25,
                          }}
                        >
                          {product.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                            {formatInr(price)}
                          </span>

                          {/* Stepper Controls */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(product.sku, -1)}
                              disabled={inCartQty === 0}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: '1px solid #cbd5e1',
                                background: inCartQty > 0 ? '#fff' : '#f1f5f9',
                                color: inCartQty > 0 ? '#1e293b' : '#94a3b8',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: inCartQty > 0 ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>
                              {inCartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product, 1)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#2563eb',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: POS CART & CHECKOUT BILLING PANEL ── */}
        <aside
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            height: 'calc(100vh - 24px)',
            position: 'sticky',
            top: '12px',
          }}
        >
          {/* Cart Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Current Order</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart
              </div>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Selection Bar */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px' }}>👤</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={{
                flex: 1,
                height: '34px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#fff',
              }}
            >
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsNewCustomerModalOpen(true)}
              style={{
                height: '34px',
                padding: '0 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Add New Customer"
            >
              + Add
            </button>
          </div>

          {/* Cart Items List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Cart is empty</div>
                <div style={{ fontSize: '11.5px', marginTop: '4px' }}>
                  Click products or approve incoming orders to build a sale.
                </div>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.sku || item.id || 'cart'}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span>{formatInr(item.price)} each</span>
                      {item.isReserved && (
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 4px', borderRadius: '3px', fontSize: '9px', fontWeight: 700 }}>
                          Reserved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.sku, -1)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.sku, 1)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div style={{ textAlign: 'right', minWidth: '65px', marginLeft: '6px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                      {formatInr(item.total)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.sku)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Adjustments & Summary */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11.5px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatInr(subtotal)}</span>
            </div>

            {/* Quick Adjustments Accordion / Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '4px 0' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  Shipping (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shipping || ''}
                  placeholder="0"
                  onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: '100%', height: '28px', padding: '0 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: '100%', height: '28px', padding: '0 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
              </div>
            </div>

            {/* Roundoff Switch */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={roundoffEnabled}
                  onChange={(e) => setRoundoffEnabled(e.target.checked)}
                />
                Auto Roundoff
              </label>
              {roundoffValue !== 0 && (
                <span style={{ color: '#64748b', fontSize: '11px' }}>
                  {roundoffValue > 0 ? '+' : ''}{formatInr(roundoffValue)}
                </span>
              )}
            </div>

            {/* Total Payable */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                borderTop: '1.5px dashed #cbd5e1',
                paddingTop: '8px',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>TOTAL PAYABLE:</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
                {formatInr(finalTotal)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Payment Method:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {['Cash', 'Card', 'UPI', 'Net Banking'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '6px',
                      border: paymentMethod === m ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: paymentMethod === m ? '#eff6ff' : '#fff',
                      color: paymentMethod === m ? '#1d4ed8' : '#475569',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Place Order / Approve & Charge Button */}
            <button
              type="button"
              disabled={isCharging || cart.length === 0}
              onClick={handleChargeOrder}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: cart.length > 0 ? '#10b981' : '#94a3b8',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: cart.length > 0 && !isCharging ? 'pointer' : 'not-allowed',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: cart.length > 0 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                transition: 'background-color 0.2s',
              }}
            >
              {isCharging ? (
                'Processing Sale...'
              ) : (
                <>
                  <span>✓</span> Approve & Print Receipt ({formatInr(finalTotal)})
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* ── INCOMING CONSUMER ORDERS MODAL ── */}
      {isOrdersModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsOrdersModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                    Incoming Customer Orders for Pickup
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Reservations placed by consumers for {currentStoreName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {/* Orders List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reservedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>All Orders Handled!</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    There are no pending customer pickups right now.
                  </div>
                </div>
              ) : (
                reservedOrders.map((res) => (
                  <div
                    key={res.requestId}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                          {res.customer || 'Walk-in Customer'}
                        </span>
                        {res.customerEmail && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({res.customerEmail})</span>
                        )}
                        <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#3730a3', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          Hold ID: {res.requestId}
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '4px', fontWeight: 600 }}>
                        {res.name || res.productName} &times; {res.qty || 1}
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Payment: <strong>{res.paymentMethod || 'Cash'}</strong> | Total:{' '}
                        <strong style={{ color: '#0284c7' }}>
                          {formatInr((Number(res.priceUSD || 0)) * (Number(res.qty) || 1))}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleApproveReservedOrder(res);
                        setIsOrdersModalOpen(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>+</span> Approve Order
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW CUSTOMER MODAL ── */}
      {isNewCustomerModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsNewCustomerModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '380px',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800 }}>Add Store Customer</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. Johnathan Smith"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Phone Number (optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
                style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINTABLE INVOICE / RECEIPT MODAL ── */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={completedTx}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* ── FLOATING TOAST NOTIFICATION ── */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span> {toastMsg}
        </div>
      )}
    </div>
  );
}
