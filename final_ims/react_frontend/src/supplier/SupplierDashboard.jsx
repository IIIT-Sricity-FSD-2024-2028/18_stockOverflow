import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './supplier.css';
import ContactSupportModal from '../components/common/ContactSupportModal';
import { useDataSync } from '../context/DataSyncContext';
import {
  readSupplierId, readSession,
  getApiBase
} from './api/supplierApi';

import {
  // Profile
  selectSupplierId,
  selectSupplierProfile,
  selectSupplierDocuments,
  selectProfileLoading,
  selectProfileSaving,
  initSupplierProfile,
  updateSupplierProfile,
  setProfile as setProfileState,
  updateProfileField,
  setPlanTier,

  // Products
  selectSupplierProducts,
  selectFilteredProducts,
  selectProductSearch,
  selectProductModalOpen,
  selectEditingProductIdx,
  selectProductForm,
  selectProductsLoading,
  setProducts as setProductsState,
  setProductSearch as setProductSearchAction,
  openProductModal,
  closeProductModal,
  setProductForm as setProductFormState,
  updateProductFormField,
  saveSupplierProduct,
  deleteSupplierProduct,

  // Orders
  selectSupplierOrders,
  selectFilteredOrders,
  selectOrderSearch,
  selectOrderStatusFilter,
  selectOrderDateFrom,
  selectOrderDateTo,
  selectOrdersPage,
  selectOrderModalOpen,
  selectSelectedOrder,
  selectOrdersLoading,
  selectOrdersUpdating,
  selectSupplierStats,
  setOrders as setOrdersState,
  setOrderSearch as setOrderSearchAction,
  setOrderStatusFilter as setOrderStatusFilterAction,
  setOrderDateFrom as setOrderDateFromAction,
  setOrderDateTo as setOrderDateToAction,
  setOrdersPage as setOrdersPageAction,
  openOrderModal,
  closeOrderModal,
  setSelectedOrder as setSelectedOrderAction,
  fetchSupplierOrders,
  updateOrderStatus,

  // Retailers
  selectSupplierRetailers,
  selectFilteredRetailers,
  selectRetailerSearch,
  selectRetailerTabFilter,
  selectRetailerModalOpen,
  selectRetailerViewModalOpen,
  selectSelectedRetailer,
  selectRetailerForm,
  selectRetailersLoading,
  selectRetailersLinking,
  setRetailers as setRetailersState,
  setRetailerSearch as setRetailerSearchAction,
  setRetailerTabFilter as setRetailerTabFilterAction,
  openRetailerModal,
  closeRetailerModal,
  openRetailerViewModal,
  closeRetailerViewModal,
  setRetailerForm as setRetailerFormState,
  updateRetailerFormField,
  linkSupplierRetailer,

  // UI
  selectActiveTab,
  selectToast,
  selectProfilePopoverOpen,
  selectIsSupportModalOpen,
  selectPaymentModalOpen,
  selectSelectedPlan,
  selectPayMethod,
  selectPayingState,
  setActiveTab as setActiveTabAction,
  showToast as showToastAction,
  hideToast as hideToastAction,
  setProfilePopoverOpen as setProfilePopoverOpenAction,
  setSupportModalOpen as setSupportModalOpenAction,
  openPaymentModal as openPaymentModalAction,
  closePaymentModal as closePaymentModalAction,
  setPayMethod as setPayMethodAction,
  processPaymentThunk,
} from './redux';

// ── COLOR & STATUS CONSTANTS ──
const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

const STATUS_MAP = {
  pending: { label: 'Pending', badgeClass: 'badge-pending', dotColor: '#f59e0b' },
  approved: { label: 'Approved', badgeClass: 'badge-delivered', dotColor: '#10b981' },
  confirmed: { label: 'Confirmed', badgeClass: 'badge-confirmed', dotColor: '#3b82f6' },
  indelivery: { label: 'In Delivery', badgeClass: 'badge-shipped', dotColor: '#8b5cf6' },
  delivered: { label: 'Delivered', badgeClass: 'badge-delivered', dotColor: '#22c55e' },
  cancelled: { label: 'Cancelled', badgeClass: 'badge-cancelled', dotColor: '#ef4444' }
};

const CATEGORIES = [
  'Electronics', 'Computers', 'Fashion', 'Furniture', 'Mobile',
  'Bags', 'Appliances', 'Food & Beverage', 'Sports', 'Beauty', 'Mixed'
];

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand',
  'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export default function SupplierDashboard({ onSwitchModule, onLogout }) {
  const dispatch = useDispatch();

  // ── REDUX STATE SELECTORS ──
  // Profile
  const supplierId = useSelector(selectSupplierId);
  const profile = useSelector(selectSupplierProfile);
  const documents = useSelector(selectSupplierDocuments);
  const profileLoading = useSelector(selectProfileLoading);
  const profileSaving = useSelector(selectProfileSaving);

  // Products
  const products = useSelector(selectSupplierProducts);
  const filteredProducts = useSelector(selectFilteredProducts);
  const productSearch = useSelector(selectProductSearch);
  const productModalOpen = useSelector(selectProductModalOpen);
  const editingProductIdx = useSelector(selectEditingProductIdx);
  const productForm = useSelector(selectProductForm);
  const productsLoading = useSelector(selectProductsLoading);

  // Orders
  const orders = useSelector(selectSupplierOrders);
  const filteredOrders = useSelector(selectFilteredOrders);
  const orderSearch = useSelector(selectOrderSearch);
  const orderStatusFilter = useSelector(selectOrderStatusFilter);
  const orderDateFrom = useSelector(selectOrderDateFrom);
  const orderDateTo = useSelector(selectOrderDateTo);
  const ordersPage = useSelector(selectOrdersPage);
  const orderModalOpen = useSelector(selectOrderModalOpen);
  const selectedOrder = useSelector(selectSelectedOrder);
  const ordersLoading = useSelector(selectOrdersLoading);
  const ordersUpdating = useSelector(selectOrdersUpdating);
  const stats = useSelector(selectSupplierStats);

  // Retailers
  const retailers = useSelector(selectSupplierRetailers);
  const filteredRetailers = useSelector(selectFilteredRetailers);
  const retailerSearch = useSelector(selectRetailerSearch);
  const retailerTabFilter = useSelector(selectRetailerTabFilter);
  const retailerModalOpen = useSelector(selectRetailerModalOpen);
  const retailerViewModalOpen = useSelector(selectRetailerViewModalOpen);
  const selectedRetailer = useSelector(selectSelectedRetailer);
  const retailerForm = useSelector(selectRetailerForm);
  const retailersLoading = useSelector(selectRetailersLoading);
  const retailersLinking = useSelector(selectRetailersLinking);

  // UI
  const activeTab = useSelector(selectActiveTab);
  const toast = useSelector(selectToast);
  const profilePopoverOpen = useSelector(selectProfilePopoverOpen);
  const isSupportModalOpen = useSelector(selectIsSupportModalOpen);
  const paymentModalOpen = useSelector(selectPaymentModalOpen);
  const selectedPlan = useSelector(selectSelectedPlan);
  const payMethod = useSelector(selectPayMethod);
  const payingState = useSelector(selectPayingState);

  // ── REDUX DISPATCH WRAPPERS ──
  const showToast = useCallback((message, type = 'ok') => {
    dispatch(showToastAction({ message, type }));
    setTimeout(() => {
      dispatch(hideToastAction());
    }, 3000);
  }, [dispatch]);

  const handleTabChange = (tab) => {
    dispatch(setActiveTabAction(tab));
  };

  const setProfile = useCallback((updaterOrObj) => {
    if (typeof updaterOrObj === 'function') {
      const next = updaterOrObj(profile);
      dispatch(setProfileState(next));
    } else {
      dispatch(setProfileState(updaterOrObj));
    }
  }, [dispatch, profile]);

  const setProductForm = useCallback((updaterOrObj) => {
    if (typeof updaterOrObj === 'function') {
      const next = updaterOrObj(productForm);
      dispatch(setProductFormState(next));
    } else {
      dispatch(setProductFormState(updaterOrObj));
    }
  }, [dispatch, productForm]);

  const setRetailerForm = useCallback((updaterOrObj) => {
    if (typeof updaterOrObj === 'function') {
      const next = updaterOrObj(retailerForm);
      dispatch(setRetailerFormState(next));
    } else {
      dispatch(setRetailerFormState(updaterOrObj));
    }
  }, [dispatch, retailerForm]);

  const setProductSearch = (val) => dispatch(setProductSearchAction(val));
  const setOrderSearch = (val) => dispatch(setOrderSearchAction(val));
  const setOrderStatusFilter = (val) => dispatch(setOrderStatusFilterAction(val));
  const setOrderDateFrom = (val) => dispatch(setOrderDateFromAction(val));
  const setOrderDateTo = (val) => dispatch(setOrderDateToAction(val));
  const setOrdersPage = (val) => dispatch(setOrdersPageAction(val));
  const setRetailerSearch = (val) => dispatch(setRetailerSearchAction(val));
  const setRetailerTabFilter = (val) => dispatch(setRetailerTabFilterAction(val));
  const setProductModalOpen = (val) => { if (!val) dispatch(closeProductModal()); };
  const setRetailerModalOpen = (val) => { if (!val) dispatch(closeRetailerModal()); };
  const setOrderModalOpen = (val) => { if (!val) dispatch(closeOrderModal()); };
  const setRetailerViewModalOpen = (val) => { if (!val) dispatch(closeRetailerViewModal()); };
  const setPaymentModalOpen = (val) => { if (!val) dispatch(closePaymentModalAction()); };
  const setProfilePopoverOpen = (val) => dispatch(setProfilePopoverOpenAction(val));
  const setIsSupportModalOpen = (val) => dispatch(setSupportModalOpenAction(val));
  const setPayMethod = (val) => dispatch(setPayMethodAction(val));
  const setSelectedOrder = (order) => dispatch(setSelectedOrderAction(order));
  const setSelectedRetailer = (ret) => dispatch(openRetailerViewModal(ret));

  // ── INITIAL DATA LOAD ──
  const initSupplierPortal = useCallback(async () => {
    const sess = readSession() || {};
    const sid = readSupplierId() || sess.profileId || sess.supplierId || '';

    // Initialize profile, products, retailers, and documents via Redux thunk
    await dispatch(initSupplierProfile());

    // Fetch purchase orders via Redux thunk
    dispatch(fetchSupplierOrders({ supplierId: sid, userEmail: sess.email || '' }));
  }, [dispatch]);

  useEffect(() => {
    initSupplierPortal();
  }, [initSupplierPortal]);

  useDataSync(['orders', 'products', 'users'], () => {
    initSupplierPortal();
  });

  // ── SAVE PROFILE ──
  const handleSaveProfile = async () => {
    try {
      if (supplierId) {
        await dispatch(updateSupplierProfile({ supplierId, profileData: profile })).unwrap();
      }
      showToast('Supplier profile updated successfully!');
    } catch {
      showToast('Saved profile locally!');
    }
  };

  // ── PRODUCT ACTIONS ──
  const handleOpenProductModal = (idx = null) => {
    dispatch(openProductModal(idx));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      showToast('Please fill in Product Name and Unit Price.');
      return;
    }
    try {
      await dispatch(
        saveSupplierProduct({
          productForm,
          editingProductIdx,
          supplierId,
          currentProducts: products,
        })
      ).unwrap();
      showToast(editingProductIdx !== null ? 'Product updated successfully!' : 'New product added to catalog!');
    } catch (err) {
      showToast(err?.message || err || 'Failed to save product.', 'err');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await dispatch(
        deleteSupplierProduct({
          productId: id,
          supplierId,
          currentProducts: products,
        })
      ).unwrap();
      showToast('Product removed from catalog.');
    } catch (err) {
      showToast(err?.message || err || 'Failed to delete product', 'err');
    }
  };

  // ── RETAILER ACTIONS ──
  const handleOpenRetailerModal = () => {
    dispatch(openRetailerModal());
  };

  const handleSaveRetailer = async () => {
    if (!retailerForm.name || !retailerForm.email) {
      alert('Please enter Retailer Name and Email.');
      return;
    }
    try {
      await dispatch(
        linkSupplierRetailer({
          retailerForm,
          supplierId,
          currentRetailers: retailers,
        })
      ).unwrap();
      showToast('Retailer linked successfully!');
    } catch (err) {
      alert(err?.message || err || 'Please enter Retailer Name and Email.');
    }
  };

  // ── ORDER ACTIONS ──
  const handleOpenOrderModal = (order) => {
    dispatch(openOrderModal(order));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await dispatch(
        updateOrderStatus({ orderId, newStatus })
      ).unwrap();
      showToast(`Order ${orderId} updated to ${res.rawStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update PO status on backend:', err);
      showToast(`Failed to update order ${orderId}`, 'err');
    }
  };

  // ── EXPORT CSV ──
  const handleExportCsv = () => {
    const headers = ['Order ID', 'Retailer', 'Product', 'Quantity', 'Amount (INR)', 'Order Date', 'Est Delivery', 'Status'];
    const rows = orders.map(o => [
      o.id,
      `"${(o.retailer || '').replace(/"/g, '""')}"`,
      `"${(o.product || '').replace(/"/g, '""')}"`,
      o.qty,
      o.amount || (o.qty * 525),
      o.date,
      o.delivery,
      o.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported as CSV.');
  };

  // ── PAYMENT UPGRADE ──
  const handleOpenPaymentModal = (planName, price) => {
    dispatch(openPaymentModalAction({ name: planName, price }));
  };

  const handleProcessPayment = async () => {
    try {
      await dispatch(processPaymentThunk(selectedPlan)).unwrap();
    } catch (err) {
      showToast('Payment processing failed', 'err');
    }
  };

  // Breadcrumb helper
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'profile': return 'Supplier Profile';
      case 'products': return 'Product Catalog';
      case 'orders': return 'Purchase Orders';
      case 'retailers': return 'Retailer List';
      case 'performance': return 'My Performance';
      case 'plan': return 'Subscription Plan';
      default: return 'Dashboard';
    }
  };

  return (
    <>
      <div className="supplier-dashboard-wrapper" style={{ display: 'flex', width: '100%', minHeight: '100vh', flex: 1 }}>

        {/* ══════ SIDEBAR ══════ */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sidebar-logo">
              <img src="/Logo.png" alt="StockOverflow" onError={(e) => { e.target.src = 'Logo.png'; }} />
            </div>
          </div>

          <div className="sb-body">
            {/* MAIN GROUP */}
            <div className="sb-group">
              <div className="sb-group-label">Main</div>
              <div className="sb-menus">
                <div
                  className={`sb-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleTabChange('dashboard')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
                      <rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
                      <rect x="1.5" y="9.5" width="5" height="5" rx="1"/>
                      <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Dashboard</span>
                </div>
              </div>
            </div>

            <div className="sb-divider"></div>

            {/* MY BUSINESS GROUP */}
            <div className="sb-group">
              <div className="sb-group-label">My Business</div>
              <div className="sb-menus">
                <div
                  className={`sb-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => handleTabChange('profile')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="8" cy="5.5" r="3"/>
                      <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Supplier Profile</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>

                <div
                  className={`sb-item ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => handleTabChange('products')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M8 1L15 4.5v7L8 15 1 11.5v-7L8 1z"/>
                      <path d="M1 4.5L8 8l7-3.5M8 8v7"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Product Catalog</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>

                <div
                  className={`sb-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleTabChange('orders')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/>
                      <polyline points="9,2 9,6 13,6"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Purchase Orders</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>
              </div>
            </div>

            <div className="sb-divider"></div>

            {/* RETAILERS GROUP */}
            <div className="sb-group">
              <div className="sb-group-label">Retailers</div>
              <div className="sb-menus">
                <div
                  className={`sb-item ${activeTab === 'retailers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('retailers')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="1" width="14" height="14" rx="1.5"/>
                      <line x1="4" y1="1" x2="4" y2="15"/>
                      <line x1="1" y1="8" x2="15" y2="8"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Retailer List</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>

                <div
                  className={`sb-item ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => handleTabChange('performance')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <polyline points="2,13 5.5,8.5 8.5,11 13.5,4"/>
                      <polyline points="10.5,4 13.5,4 13.5,7"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">My Performance</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>
              </div>
            </div>

            <div className="sb-divider"></div>

            {/* PLANS & BILLING GROUP */}
            <div className="sb-group">
              <div className="sb-group-label">Plans &amp; Billing</div>
              <div className="sb-menus">
                <div
                  className={`sb-item ${activeTab === 'plan' ? 'active' : ''}`}
                  onClick={() => handleTabChange('plan')}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <polygon points="8 1 10.3 5.7 15.5 6.5 11.8 10.1 12.6 15.3 8 12.8 3.4 15.3 4.2 10.1 0.5 6.5 5.7 5.7 8 1"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Subscription Plan</span>
                  <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
                </div>
              </div>
            </div>

            <div className="sb-divider"></div>

            {/* SETTINGS & SUPPORT GROUP */}
            <div className="sb-group">
              <div className="sb-group-label">Help & Settings</div>
              <div className="sb-menus">
                <div
                  className="sb-item"
                  onClick={() => setIsSupportModalOpen(true)}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="8" cy="8" r="7"/>
                      <path d="M6 6.5a2 2 0 113.2 1.6c-.6.4-.7.9-.7 1.4v.5M8 12.5h.01"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Contact Support</span>
                </div>
                <div
                  className="sb-item"
                  onClick={() => onLogout ? onLogout() : (onSwitchModule ? onSwitchModule('login') : (window.location.href = '/'))}
                >
                  <span className="sb-item-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M10.5 8H2.5M5,5 2,8 5,11"/>
                      <path d="M6 3.5h5.5a2 2 0 012 2v5a2 2 0 01-2 2H6"/>
                    </svg>
                  </span>
                  <span className="sb-item-label">Logout</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR USER INFO */}
          <div className="sb-user">
            <div className="sb-avatar">{profile.supplierName ? profile.supplierName.slice(0, 2).toUpperCase() : 'SP'}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{profile.supplierName || 'Supplier'}</div>
              <div className="sb-user-email">{profile.email || 'supplier@stockoverflow.in'}</div>
            </div>
          </div>
        </aside>

        {/* ══════ MAIN CONTAINER ══════ */}
        <div className="main">
          {/* TOPBAR */}
          <header className="topbar">
            <div className="topbar-left">
              <div className="breadcrumb">
                <span style={{ color: 'var(--text-3)', cursor: 'pointer' }} onClick={() => handleTabChange('dashboard')}>Home</span>
                <span className="bc-sep">/</span>
                <span className="current">{getTabTitle()}</span>
              </div>
            </div>
            <div className="topbar-right" style={{ position: 'relative' }}>
              <div className="notif-btn" onClick={() => showToast('No unread notifications')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <div className="notif-dot"></div>
              </div>

              {/* AVATAR & DROPDOWN */}
              <button
                className="topbar-avatar"
                type="button"
                onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
              >
                {profile.supplierName ? profile.supplierName[0].toUpperCase() : 'S'}
              </button>

              {profilePopoverOpen && (
                <div className="profile-popover" style={{ display: 'block', top: '55px', right: '0' }}>
                  <div className="profile-popover-head">
                    <div className="profile-popover-avatar">
                      {profile.supplierName ? profile.supplierName.slice(0, 2).toUpperCase() : 'SP'}
                    </div>
                    <div>
                      <div className="profile-popover-name">{profile.supplierName}</div>
                      <div className="profile-popover-sub">{profile.supplierCode}</div>
                    </div>
                  </div>
                  <div className="profile-popover-grid">
                    <div className="profile-popover-item">
                      <div className="profile-popover-label">Email</div>
                      <div className="profile-popover-value">{profile.email}</div>
                    </div>
                    <div className="profile-popover-item">
                      <div className="profile-popover-label">Phone</div>
                      <div className="profile-popover-value">{profile.phone}</div>
                    </div>
                    <div className="profile-popover-item">
                      <div className="profile-popover-label">Category</div>
                      <div className="profile-popover-value">{profile.category}</div>
                    </div>
                    <div className="profile-popover-item">
                      <div className="profile-popover-label">State</div>
                      <div className="profile-popover-value">{profile.state}</div>
                    </div>
                  </div>
                  <div className="profile-popover-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      type="button"
                      onClick={() => { setProfilePopoverOpen(false); handleTabChange('profile'); }}
                    >
                      Open Profile
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${getApiBase()}/suppliers/directory`);
                        showToast('Directory API endpoint copied!');
                      }}
                    >
                      Directory API
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* PAGE BODY */}
          <div className="page-body">

            {/* ══════════════════════════════════════════════
                TAB 1: DASHBOARD
                ══════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="section active" id="sec-dashboard">
                <div className="page-header">
                  <div>
                    <div className="page-title">Welcome back, {profile.supplierName}</div>
                    <div className="page-sub">Here's what's happening with your supply chain today.</div>
                  </div>
                  <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
                      Add Product
                    </button>
                  </div>
                </div>

                {/* 5 STAT CARDS */}
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: '22px' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>₹</div>
                    <div className="stat-val" style={{ color: '#059669' }}>
                      ₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-lbl">Total Completed Sales</div>
                    <div className="stat-sub" style={{ color: '#15803d' }}>↑ {stats.deliveredCount} POs Fulfilled</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><line x1="1" y1="7" x2="15" y2="7"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#2563eb' }}>
                      ₹{stats.netPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-lbl">Net Supplier Payout</div>
                    <div className="stat-sub" style={{ color: '#2563eb' }}>98% Payout Rate</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 5v6M5 8h6"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#7c3aed' }}>
                      ₹{stats.fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-lbl">2% Platform Fee</div>
                    <div className="stat-sub" style={{ color: '#7c3aed' }}>2.0% Commission</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/></svg>
                    </div>
                    <div className="stat-val">{stats.pendingCount}</div>
                    <div className="stat-lbl">Pending Orders</div>
                    <div className="stat-sub" style={{ color: '#b45309' }}>{orders.length} total orders (₹{stats.pendingVal.toFixed(2)} pending)</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,12 6,7 9,10 14,4"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#7c3aed' }}>{stats.fulfillmentRate}%</div>
                    <div className="stat-lbl">Fulfilment Rate</div>
                    <div className="stat-sub" style={{ color: '#15803d' }}>↑ {stats.deliveredCount} delivered orders</div>
                  </div>
                </div>

                {/* SALES & FULFILMENT INTELLIGENCE BANNER */}
                <div style={{ background: 'linear-gradient(135deg, #092c4c 0%, #1e429f 100%)', borderRadius: '10px', padding: '22px 24px', color: '#fff', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 14px rgba(9,44,76,.18)' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Sales &amp; Fulfilment Intelligence</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '4px' }}>
                      ₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Gross Completed Sales
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                      Net supplier payout: ₹{stats.netPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (after 2.0% platform fee of ₹{stats.fee.toFixed(2)})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '95px' }}>
                      <div style={{ fontSize: '11px', color: '#bfdbfe', fontWeight: 600 }}>Fulfilled POs</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{stats.deliveredCount}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '105px' }}>
                      <div style={{ fontSize: '11px', color: '#bfdbfe', fontWeight: 600 }}>Pending Value</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>₹{stats.pendingVal.toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '105px' }}>
                      <div style={{ fontSize: '11px', color: '#bfdbfe', fontWeight: 600 }}>Avg PO Value</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>₹{stats.avgPoVal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* RECENT ORDERS TABLE */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#eef3fc' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4"><path d="M9 1H3a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V5L9 1z"/><polyline points="9,1 9,5 12,5"/></svg>
                      </div>
                      Recent Orders
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => handleTabChange('orders')}>View All</button>
                  </div>
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Order ID</th><th>Retailer</th><th>Product</th><th>Qty</th><th>Date</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.slice(0, 5).map(o => (
                            <tr key={o.id}>
                              <td style={{ fontWeight: 700, color: '#2e6bc5', cursor: 'pointer' }} onClick={() => handleOpenOrderModal(o)}>
                                {o.id}
                              </td>
                              <td>{o.retailer}</td>
                              <td>{o.product}</td>
                              <td>{o.qty}</td>
                              <td>{o.date}</td>
                              <td>
                                <span className={`badge ${STATUS_MAP[o.status]?.badgeClass || 'badge-pending'}`}>
                                  <span className="badge-dot" style={{ background: STATUS_MAP[o.status]?.dotColor || '#f59e0b' }}></span>
                                  {STATUS_MAP[o.status]?.label || o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="6" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-3)' }}>No purchase orders linked yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOP RETAILERS BY VOLUME */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#dcfce7' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#22c55e" strokeWidth="1.4"><rect x="1" y="1" width="11" height="11" rx="1"/><line x1="4" y1="1" x2="4" y2="12"/></svg>
                      </div>
                      Top Retailers by Volume
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {retailers.slice(0, 4).map((ret, index) => {
                      const color = COLORS[index % COLORS.length];
                      const maxOrders = Math.max(1, retailers[0]?.orders || 4);
                      return (
                        <div key={ret.code || index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="sup-avt" style={{ background: color, width: '32px', height: '32px', borderRadius: '7px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                            {ret.name ? ret.name.slice(0, 2).toUpperCase() : 'RT'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{ret.name}</span>
                              <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>{ret.orders} orders</span>
                            </div>
                            <div style={{ marginTop: '6px' }}>
                              <div className="pbar">
                                <div className="pbar-fill" style={{ width: `${Math.round((ret.orders / maxOrders) * 100)}%`, background: color }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 2: SUPPLIER PROFILE
                ══════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="section active" id="sec-profile">
                <div className="page-header">
                  <div>
                    <div className="page-title">Supplier Profile</div>
                    <div className="page-sub">Manage your business info, contact details and branding</div>
                  </div>
                  <div className="page-actions">
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="2,6.5 5,9.5 11,3.5"/></svg>
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#eef3fc' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4"><rect x="1" y="2" width="11" height="9" rx="1.5"/><line x1="1" y1="5.5" x2="12" y2="5.5"/></svg>
                      </div>
                      Business Information
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Supplier Name <span className="req">*</span></label>
                        <input
                          type="text"
                          value={profile.supplierName}
                          onChange={e => setProfile(p => ({ ...p, supplierName: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Supplier Code</label>
                        <input
                          type="text"
                          value={profile.supplierCode}
                          readOnly
                          style={{ background: '#f9fafb' }}
                        />
                      </div>
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Business Email <span className="req">*</span></label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Phone</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="fg fg-3">
                      <div className="field">
                        <label className="field-label">Category</label>
                        <select
                          value={profile.category}
                          onChange={e => setProfile(p => ({ ...p, category: e.target.value }))}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label">State</label>
                        <select
                          value={profile.state}
                          onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                        >
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label">Payment Terms</label>
                        <select
                          value={profile.paymentTerms}
                          onChange={e => setProfile(p => ({ ...p, paymentTerms: e.target.value }))}
                        >
                          <option>Net 15</option>
                          <option>Net 30</option>
                          <option>Net 45</option>
                          <option>Net 60</option>
                          <option>Immediate</option>
                          <option>Advance</option>
                        </select>
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: '14px' }}>
                      <label className="field-label">Address</label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                      />
                    </div>

                    <div className="fg fg-2">
                      <div className="field">
                        <label className="field-label">Website</label>
                        <input
                          type="text"
                          value={profile.website}
                          onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">GST Number / Tax ID</label>
                        <input
                          type="text"
                          value={profile.gstNumber}
                          onChange={e => setProfile(p => ({ ...p, gstNumber: e.target.value, taxId: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: '14px' }}>
                      <label className="field-label">About / Description</label>
                      <textarea
                        rows="2"
                        value={profile.description}
                        onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: "'Nunito Sans', sans-serif" }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                    </div>
                  </div>
                </div>

                {/* SECURITY & CREDENTIALS */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#fef3c7' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#f59e0b" strokeWidth="1.4"><rect x="2" y="5" width="9" height="7" rx="1.5"/><path d="M4.5 5V3.5a2 2 0 014 0V5"/></svg>
                      </div>
                      Security &amp; Credentials
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div className="fg fg-3">
                      <div className="field">
                        <label className="field-label">Current Password</label>
                        <input type="password" placeholder="••••••••"/>
                      </div>
                      <div className="field">
                        <label className="field-label">New Password</label>
                        <input type="password" placeholder="••••••••"/>
                      </div>
                      <div className="field">
                        <label className="field-label">Confirm Password</label>
                        <input type="password" placeholder="••••••••"/>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => showToast('Password updated successfully!')}>Update Password</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 3: PRODUCT CATALOG
                ══════════════════════════════════════════════ */}
            {activeTab === 'products' && (
              <div className="section active" id="sec-products">
                <div className="page-header">
                  <div>
                    <div className="page-title">Product Catalog</div>
                    <div className="page-sub">Manage products you supply to retailers</div>
                  </div>
                  <div className="page-actions">
                    <div className="search-wrap">
                      <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
                      <input
                        type="text"
                        placeholder="Search products…"
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        style={{ paddingLeft: '34px' }}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
                      Add Product
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="tbl-wrap">
                    <table className="tbl" id="prodTable">
                      <thead>
                        <tr>
                          <th className="tbl-check"><input type="checkbox"/></th>
                          <th>SKU</th>
                          <th>PRODUCT NAME</th>
                          <th>CATEGORY</th>
                          <th>UNIT PRICE</th>
                          <th>MIN ORDER</th>
                          <th>STOCK</th>
                          <th>STATUS</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p, idx) => (
                            <tr key={p.id}>
                              <td><input type="checkbox"/></td>
                              <td style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-3)' }}>
                                {p.id}
                              </td>
                              <td>
                                <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: '13px' }}>{p.name}</div>
                                <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>{[p.brand, p.variant].filter(Boolean).join(' | ') || p.desc}</div>
                              </td>
                              <td>
                                <span className="badge" style={{ background: '#eef3fc', color: '#1e429f' }}>{p.cat}</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px' }}>Unit: {p.unit}</div>
                              </td>
                              <td style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                                INR {Number(p.price).toLocaleString('en-IN')}
                              </td>
                              <td>{p.moq} {p.unit === 'Piece' ? 'units' : p.unit}</td>
                              <td style={{ fontWeight: 700, color: p.stock < 10 ? 'var(--danger)' : p.stock < 50 ? 'var(--warning)' : 'var(--success)' }}>
                                {p.stock}
                              </td>
                              <td>
                                <span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                  <span className="badge-dot" style={{ background: p.status === 'active' ? '#22c55e' : '#9ca3af' }}></span>
                                  {p.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleOpenProductModal(idx)}
                                    title="Edit Product"
                                    style={{ padding: '4px 8px' }}
                                  >
                                    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2l2 2-7.5 7.5H2.5v-2L10 2z"/></svg>
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleDeleteProduct(p.id)}
                                    title="Delete Product"
                                    style={{ padding: '4px 8px', color: 'var(--danger)' }}
                                  >
                                    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 12,4"/><line x1="5" y1="4" x2="5" y2="11"/><line x1="9" y1="4" x2="9" y2="11"/><path d="M4 4l.8-2h4.4l.8 2"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>No products found matching your search.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 4: PURCHASE ORDERS
                ══════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div className="section active" id="sec-orders">
                <div className="page-header">
                  <div>
                    <div className="page-title">Purchase Orders</div>
                    <div className="page-sub">Orders received from all your retailers</div>
                  </div>
                  <div className="page-actions">
                    <button className="btn btn-outline btn-sm" onClick={handleExportCsv}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 9l-3 3-3-3M8 12V4"/><polyline points="2,4 5,1 8,4"/><line x1="2" y1="7" x2="5" y2="7"/></svg>
                      Export
                    </button>
                  </div>
                </div>

                <div className="card">
                  {/* FILTER BAR */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="search-wrap" style={{ maxWidth: '260px' }}>
                      <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
                      <input
                        type="text"
                        placeholder="Search orders…"
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        style={{ paddingLeft: '34px' }}
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      style={{ width: 'auto', height: '40px', padding: '0 30px 0 10px' }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="indelivery">In Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <input
                      type="date"
                      value={orderDateFrom}
                      onChange={e => setOrderDateFrom(e.target.value)}
                      style={{ height: '40px', padding: '0 10px', width: 'auto' }}
                    />
                    <input
                      type="date"
                      value={orderDateTo}
                      onChange={e => setOrderDateTo(e.target.value)}
                      style={{ height: '40px', padding: '0 10px', width: 'auto' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => showToast('Filters applied')}>Apply</button>
                  </div>

                  {/* TABLE */}
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>ORDER ID</th>
                          <th>RETAILER</th>
                          <th>PRODUCT</th>
                          <th>QTY</th>
                          <th>ORDER DATE</th>
                          <th>EST. DELIVERY</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map(o => (
                            <tr key={o.id}>
                              <td
                                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
                                onClick={() => handleOpenOrderModal(o)}
                              >
                                {o.id}
                              </td>
                              <td>{o.retailer}</td>
                              <td>{o.product}</td>
                              <td style={{ fontWeight: 700 }}>{o.qty}</td>
                              <td>{o.date}</td>
                              <td>{o.delivery}</td>
                              <td>
                                <span className={`badge ${STATUS_MAP[o.status]?.badgeClass || 'badge-pending'}`}>
                                  <span className="badge-dot" style={{ background: STATUS_MAP[o.status]?.dotColor || '#f59e0b' }}></span>
                                  {STATUS_MAP[o.status]?.label || o.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {(o.status === 'pending' || o.status === 'draft') && (
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '4px 8px', fontSize: '11px', fontWeight: 700 }}
                                      onClick={() => handleUpdateOrderStatus(o.id, 'approved')}
                                      title="Approve Purchase Order"
                                    >
                                      ✓ Approve
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleOpenOrderModal(o)}
                                    title="View Order Details"
                                    style={{ padding: '4px 8px' }}
                                  >
                                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>No purchase orders found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-3)' }}>
                      Showing 1-{filteredOrders.length} of {filteredOrders.length} orders
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>‹</button>
                      <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>1</button>
                      <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>›</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 5: RETAILER LIST
                ══════════════════════════════════════════════ */}
            {activeTab === 'retailers' && (
              <div className="section active" id="sec-retailers">
                <div className="page-header">
                  <div>
                    <div className="page-title">Retailer List</div>
                    <div className="page-sub">Your registered retailers — fulfilment details &amp; relationship status</div>
                  </div>
                  <div className="page-actions">
                    <div className="search-wrap">
                      <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
                      <input
                        type="text"
                        placeholder="Search retailers…"
                        value={retailerSearch}
                        onChange={e => setRetailerSearch(e.target.value)}
                        style={{ paddingLeft: '34px' }}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenRetailerModal}>
                      <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
                      Add Retailer
                    </button>
                  </div>
                </div>

                <div className="card">
                  {/* SUBTABS */}
                  <div style={{ display: 'flex', gap: '16px', padding: '0 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div
                      style={{ padding: '12px 4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderBottom: retailerTabFilter === 'all' ? '2px solid var(--primary)' : '2px solid transparent', color: retailerTabFilter === 'all' ? 'var(--primary)' : 'var(--text-2)' }}
                      onClick={() => setRetailerTabFilter('all')}
                    >
                      All Retailers
                    </div>
                    <div
                      style={{ padding: '12px 4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderBottom: retailerTabFilter === 'active' ? '2px solid var(--primary)' : '2px solid transparent', color: retailerTabFilter === 'active' ? 'var(--primary)' : 'var(--text-2)' }}
                      onClick={() => setRetailerTabFilter('active')}
                    >
                      Active
                    </div>
                    <div
                      style={{ padding: '12px 4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderBottom: retailerTabFilter === 'inactive' ? '2px solid var(--primary)' : '2px solid transparent', color: retailerTabFilter === 'inactive' ? 'var(--primary)' : 'var(--text-2)' }}
                      onClick={() => setRetailerTabFilter('inactive')}
                    >
                      Inactive
                    </div>
                  </div>

                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="tbl-check"><input type="checkbox"/></th>
                          <th>RETAILER</th>
                          <th>CONTACT</th>
                          <th>STATE</th>
                          <th>LAST ORDER</th>
                          <th>FULFILMENT</th>
                          <th>RATING GIVEN</th>
                          <th>STATUS</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRetailers.length > 0 ? (
                          filteredRetailers.map((r, idx) => {
                            const color = COLORS[idx % COLORS.length];
                            return (
                              <tr key={r.code || idx}>
                                <td><input type="checkbox"/></td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="sup-avt" style={{ background: color, width: '32px', height: '32px', borderRadius: '7px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                      {r.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: '13px' }}>{r.name}</div>
                                      <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>{r.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{r.contact}</div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>{r.email}</div>
                                </td>
                                <td>{r.state}</td>
                                <td>{r.lastOrder}</td>
                                <td>
                                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: r.fulfilment >= 90 ? 'var(--success)' : r.fulfilment >= 80 ? 'var(--warning)' : 'var(--danger)', marginBottom: '4px' }}>
                                    {r.fulfilment}%
                                  </div>
                                  <div className="pbar" style={{ width: '100px' }}>
                                    <div className="pbar-fill" style={{ width: `${r.fulfilment}%`, background: r.fulfilment >= 90 ? 'var(--success)' : r.fulfilment >= 80 ? 'var(--warning)' : 'var(--danger)' }}></div>
                                  </div>
                                </td>
                                <td style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>{Number(r.ratingGiven).toFixed(1)} star</td>
                                <td>
                                  <span className={`badge ${r.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                    <span className="badge-dot" style={{ background: r.status === 'active' ? '#22c55e' : '#9ca3af' }}></span>
                                    {r.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => { setSelectedRetailer(r); setRetailerViewModalOpen(true); }}
                                    title="View Retailer"
                                    style={{ padding: '4px 8px' }}
                                  >
                                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>No retailers found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 6: MY PERFORMANCE
                ══════════════════════════════════════════════ */}
            {activeTab === 'performance' && (
              <div className="section active" id="sec-performance">
                <div className="page-header">
                  <div>
                    <div className="page-title">My Performance</div>
                    <div className="page-sub">Ratings and feedback given by your retailers</div>
                  </div>
                </div>

                {/* 4 STAT CARDS */}
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '22px' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,12 6,7 9,10 14,4"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#7c3aed' }}>3.0</div>
                    <div className="stat-lbl">Average Rating</div>
                    <div className="stat-sub" style={{ color: '#15803d' }}>1 feedback entries</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,12 6,7 9,10 14,4"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#059669' }}>100%</div>
                    <div className="stat-lbl">Order Fulfilment</div>
                    <div className="stat-sub" style={{ color: '#15803d' }}>{stats.deliveredCount} delivered orders</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><polyline points="5,8 7,10 11,5"/></svg>
                    </div>
                    <div className="stat-val" style={{ color: '#2563eb' }}>{retailers.length}</div>
                    <div className="stat-lbl">Retailers Connected</div>
                    <div className="stat-sub" style={{ color: '#2563eb' }}>{retailers.filter(r => r.status === 'active').length} active retailers</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M5 3V2a2 2 0 014 0v1"/></svg>
                    </div>
                    <div className="stat-val">0</div>
                    <div className="stat-lbl">Low Stock Products</div>
                    <div className="stat-sub" style={{ color: '#15803d' }}>products below MOQ</div>
                  </div>
                </div>

                {/* RATINGS GIVEN BY RETAILERS CARD */}
                <div className="card" style={{ marginBottom: '22px' }}>
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#ede9fe' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#6d28d9" strokeWidth="1.4"><polygon points="6.5 1 8.2 4.6 12 5.1 9.2 7.8 9.9 11.5 6.5 9.7 3.1 11.5 3.8 7.8 1 5.1 4.8 4.6 6.5 1"/></svg>
                      </div>
                      Ratings Given by Retailers
                    </div>
                  </div>
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>RETAILER</th><th>QUALITY</th><th>DELIVERY</th><th>COMM.</th><th>PRICING</th><th>OVERALL</th><th>COMMENT</th><th>DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retailers.filter(r => Number(r.ratingGiven) > 0).length > 0 ? (
                          retailers.filter(r => Number(r.ratingGiven) > 0).map(ret => (
                            <tr key={ret.id || ret.code}>
                              <td style={{ fontWeight: 700 }}>{ret.name}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div className="pbar" style={{ width: '60px' }}><div className="pbar-fill" style={{ width: `${(Number(ret.ratingGiven) / 5) * 100}%`, background: '#d97706' }}></div></div>
                                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{Number(ret.ratingGiven).toFixed(1)} / 5</span>
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-3)' }}>{ret.orders || 0} orders • {ret.fulfilment || 100}% fulfilment</td>
                              <td>-</td>
                              <td>-</td>
                              <td style={{ color: '#d97706', fontWeight: 800, fontSize: '13px' }}>{Number(ret.ratingGiven).toFixed(1)}</td>
                              <td style={{ color: 'var(--text-2)', fontSize: '12.5px' }}>Overall rating given by {ret.name}</td>
                              <td style={{ color: 'var(--text-3)', fontSize: '12px' }}>{ret.lastOrder || 'Recent'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)' }}>
                              No retailer ratings received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PERFORMANCE BREAKDOWN BY RETAILER CARD */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">
                      <div className="card-icon" style={{ background: '#dbeafe' }}>
                        <svg viewBox="0 0 13 13" fill="none" stroke="#2563eb" strokeWidth="1.4"><rect x="1" y="1" width="11" height="11" rx="2"/></svg>
                      </div>
                      Performance Breakdown by Retailer
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {retailers.length > 0 ? (
                      retailers.slice(0, 5).map((ret, index) => {
                        const color = COLORS[index % COLORS.length];
                        return (
                          <div key={ret.code || index} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0', borderBottom: index < 4 ? '1px solid var(--border-light)' : 'none' }}>
                            <div className="sup-avt" style={{ background: color, width: '36px', height: '36px', borderRadius: '8px', fontSize: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                              {(ret.name || 'RT').slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: '13px' }}>{ret.name}</div>
                                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: ret.ratingGiven > 0 ? '#d97706' : 'var(--text-3)' }}>
                                  {ret.ratingGiven > 0 ? `Score ${Number(ret.ratingGiven).toFixed(1)}` : 'Score N/A'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div className="pbar" style={{ flex: 1 }}>
                                  <div className="pbar-fill" style={{ width: `${ret.fulfilment || 0}%`, background: (ret.fulfilment || 0) >= 90 ? 'var(--success)' : (ret.fulfilment || 0) >= 80 ? 'var(--warning)' : 'var(--danger)' }}></div>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                                  {ret.fulfilment || 0}% fulfilment | {ret.orders || 0} orders
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-3)' }}>
                        No retailer activity recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 7: SUBSCRIPTION PLAN
                ══════════════════════════════════════════════ */}
            {activeTab === 'plan' && (
              <div className="section active" id="sec-plan">
                <div className="page-header">
                  <div>
                    <div className="page-title">SaaS Growth &amp; Subscription Plans</div>
                    <div className="page-sub">Tiered membership plans designed for MSME suppliers, distributors, and manufacturers across India</div>
                  </div>
                </div>

                {/* CURRENT ACTIVE BANNER */}
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '24px 28px', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#94a3b8' }}>CURRENT ACTIVE MEMBERSHIP</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#7c3aed', color: '#fff' }}>Active Subscription</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '6px' }}>
                        {profile.planTier || 'Bharat Enterprise'} (₹{profile.planPrice || 3499}/mo)
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '520px' }}>
                        Enterprise multi-depot sync, custom ERP integration, unlimited stores &amp; products, 24/7 account manager.
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>CATALOG UTILIZATION</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {products.length} Products (Unlimited)
                      </div>
                      <div className="pbar" style={{ width: '160px', marginTop: '6px', background: 'rgba(255,255,255,0.2)' }}>
                        <div className="pbar-fill" style={{ width: '15%', background: '#ef4444' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 TIERS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                  {/* TIER 1 */}
                  <div className="card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Starter Kirana</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px' }}>Free forever for MSME onboarding</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '18px' }}>
                      ₹0 <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>/ month</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-2)', marginBottom: '24px' }}>
                      <div>✔ 1 Store Location</div>
                      <div>✔ Up to 50 Products Catalog</div>
                      <div>✔ UPI QR &amp; POS Billing Terminal</div>
                      <div>✔ Daily WhatsApp Sales Summary</div>
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                      onClick={() => handleOpenPaymentModal('Starter Kirana', 0)}
                    >
                      Downgrade to Free
                    </button>
                  </div>

                  {/* TIER 2 */}
                  <div className="card" style={{ padding: '24px', borderRadius: '12px', border: '2px solid #2563eb', position: 'relative' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>Vyapar Pro</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px' }}>For growing distributors &amp; suppliers</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '18px' }}>
                      ₹799 <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>/ month</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-2)', marginBottom: '24px' }}>
                      <div>✔ <strong>Up to 5 Retail Outlets</strong></div>
                      <div>✔ <strong>Unlimited Products &amp; SKUs</strong></div>
                      <div>✔ GST E-Invoice &amp; e-Way Bill Generator</div>
                      <div>✔ WhatsApp &amp; SMS Low Stock Alerts</div>
                      <div>✔ Automated Reorder Suggestions</div>
                      <div>✔ Priority Verification Staff Support</div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', background: '#2563eb' }}
                      onClick={() => handleOpenPaymentModal('Vyapar Pro', 799)}
                    >
                      Upgrade to Pro
                    </button>
                  </div>

                  {/* TIER 3 */}
                  <div className="card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #7c3aed' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed' }}>Bharat Enterprise</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px' }}>Multi-depot suppliers &amp; large FMCG</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '18px' }}>
                      ₹3,499 <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>/ month</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-2)', marginBottom: '24px' }}>
                      <div>✔ <strong>Unlimited Stores &amp; Outlets</strong></div>
                      <div>✔ Multi-Warehouse Stock Transfer &amp; Depots</div>
                      <div>✔ Bulk Supplier POs &amp; Credit Terms</div>
                      <div>✔ Dedicated 24/7 Account Manager</div>
                      <div>✔ Custom ERP &amp; Tally Prime Sync API</div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', background: '#0f172a' }}
                      disabled={profile.planTier === 'Bharat Enterprise'}
                    >
                      {profile.planTier === 'Bharat Enterprise' ? 'Current Active Plan' : 'Select Enterprise'}
                    </button>
                  </div>
                </div>

                {/* INVOICES TABLE */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Billing Invoices &amp; Transaction Receipts</div>
                  </div>
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>INVOICE #</th><th>DATE</th><th>DESCRIPTION</th><th>AMOUNT</th><th>FEE</th><th>TIER</th><th>STATUS</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--primary)' }}>SO-INV-2026-089</td>
                          <td>01 Sep 2026</td>
                          <td>Vyapar Pro Subscription (Monthly)</td>
                          <td>₹799.00</td>
                          <td>₹143.82</td>
                          <td>Growth Tier</td>
                          <td><span className="badge badge-delivered"><span className="badge-dot" style={{ background: '#22c55e' }}></span>Paid</span></td>
                          <td><button className="btn btn-outline btn-sm" onClick={() => showToast('Invoice receipt downloaded')}>Download</button></td>
                        </tr>
                        <tr>
                          <td style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--primary)' }}>SO-INV-2026-071</td>
                          <td>01 Aug 2026</td>
                          <td>Starter Kirana Onboarding</td>
                          <td>₹0.00</td>
                          <td>₹0.00</td>
                          <td>Free Tier</td>
                          <td><span className="badge badge-delivered"><span className="badge-dot" style={{ background: '#22c55e' }}></span>Active</span></td>
                          <td><button className="btn btn-outline btn-sm" onClick={() => showToast('Starter tier has zero charge.')}>View</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div> {/* end page-body */}
        </div> {/* end main */}
      </div> {/* end flex layout */}

      {/* ══════════════════════════════════════════════
          MODAL 1: ADD / EDIT PRODUCT
          ══════════════════════════════════════════════ */}
      <div
        className={`modal-bg ${productModalOpen ? 'open active' : ''}`}
        id="productModal"
        onClick={e => { if (e.target.classList.contains('modal-bg')) setProductModalOpen(false); }}
      >
        <div className="modal">
          <div className="modal-title">
            <div className="card-icon" style={{ background: '#eef3fc', marginRight: '4px' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4"><path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z"/></svg>
            </div>
            <span>{editingProductIdx !== null ? 'Edit Product' : 'Add New Product'}</span>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Product Name <span className="req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Laptop 15-inch"
                value={productForm.name}
                onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">SKU</label>
              <input
                type="text"
                value={productForm.sku}
                readOnly
                style={{ background: '#f9fafb' }}
              />
            </div>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Brand</label>
              <input
                type="text"
                placeholder="e.g. Lenovo"
                value={productForm.brand}
                onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">Product Variant</label>
              <input
                type="text"
                placeholder="e.g. 16GB RAM / 512GB SSD"
                value={productForm.variant}
                onChange={e => setProductForm(p => ({ ...p, variant: e.target.value }))}
              />
            </div>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Category <span className="req">*</span></label>
              <select
                value={productForm.cat}
                onChange={e => setProductForm(p => ({ ...p, cat: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Unit of Measure</label>
              <select
                value={productForm.unit}
                onChange={e => setProductForm(p => ({ ...p, unit: e.target.value }))}
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

          <div className="fg fg-3">
            <div className="field">
              <label className="field-label">Unit Price (₹) <span className="req">*</span></label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">Stock Qty</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={productForm.stock}
                onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">Min Order Qty</label>
              <input
                type="number"
                placeholder="1"
                min="1"
                value={productForm.moq}
                onChange={e => setProductForm(p => ({ ...p, moq: e.target.value }))}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '14px' }}>
            <label className="field-label">Description</label>
            <input
              type="text"
              placeholder="Brief product description"
              value={productForm.desc}
              onChange={e => setProductForm(p => ({ ...p, desc: e.target.value }))}
            />
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => setProductModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveProduct}>
              {editingProductIdx !== null ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL 2: ADD RETAILER
          ══════════════════════════════════════════════ */}
      <div
        className={`modal-bg ${retailerModalOpen ? 'open active' : ''}`}
        id="retailerModal"
        onClick={e => { if (e.target.classList.contains('modal-bg')) setRetailerModalOpen(false); }}
      >
        <div className="modal">
          <div className="modal-title">
            <div className="card-icon" style={{ background: '#dbeafe', marginRight: '4px' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#2563eb" strokeWidth="1.4"><rect x="1" y="1" width="11" height="11" rx="1.5"/><line x1="4" y1="1" x2="4" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/></svg>
            </div>
            <span>Link New Retailer</span>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Retailer Code</label>
              <input type="text" value={retailerForm.code} readOnly style={{ background: '#f9fafb' }}/>
            </div>
            <div className="field">
              <label className="field-label">Retailer / Business Name <span className="req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Apex Electronics Hub"
                value={retailerForm.name}
                onChange={e => setRetailerForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Karthik Raja"
                value={retailerForm.contact}
                onChange={e => setRetailerForm(p => ({ ...p, contact: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">Business Email <span className="req">*</span></label>
              <input
                type="email"
                placeholder="orders@retailer.in"
                value={retailerForm.email}
                onChange={e => setRetailerForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Phone</label>
              <input
                type="tel"
                placeholder="+91 98450 12345"
                value={retailerForm.phone}
                onChange={e => setRetailerForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field-label">State</label>
              <select
                value={retailerForm.state}
                onChange={e => setRetailerForm(p => ({ ...p, state: e.target.value }))}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="field-label">Payment Terms</label>
              <select
                value={retailerForm.terms}
                onChange={e => setRetailerForm(p => ({ ...p, terms: e.target.value }))}
              >
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
                <option>COD</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Credit Limit (₹)</label>
              <input
                type="number"
                value={retailerForm.creditLimit}
                onChange={e => setRetailerForm(p => ({ ...p, creditLimit: e.target.value }))}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '14px' }}>
            <label className="field-label">Address</label>
            <input
              type="text"
              placeholder="e.g. Brigade Road, Bengaluru"
              value={retailerForm.addr}
              onChange={e => setRetailerForm(p => ({ ...p, addr: e.target.value }))}
            />
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => setRetailerModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveRetailer}>Link Retailer</button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL 3: VIEW ORDER DETAILS
          ══════════════════════════════════════════════ */}
      <div
        className={`modal-bg ${orderModalOpen ? 'open active' : ''}`}
        id="orderModal"
        onClick={e => { if (e.target.classList.contains('modal-bg')) setOrderModalOpen(false); }}
      >
        <div className="modal" style={{ width: 'min(580px,94vw)' }}>
          <div className="modal-title">
            <div className="card-icon" style={{ background: '#eef3fc', marginRight: '4px' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" strokeWidth="1.4"><path d="M9 1H3a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V5L9 1z"/><polyline points="9,1 9,5 12,5"/></svg>
            </div>
            <span>Order Details – {selectedOrder?.id}</span>
          </div>

          {selectedOrder && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Retailer</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{selectedOrder.retailer}</div>
              </div>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Product</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{selectedOrder.product}</div>
              </div>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Quantity</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{selectedOrder.qty} units</div>
              </div>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb' }}>₹{(selectedOrder.amount || selectedOrder.qty * 525).toFixed(2)}</div>
              </div>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Order Date</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{selectedOrder.date}</div>
              </div>
              <div style={{ background: '#f8f9fb', border: '1px solid var(--border-light)', borderRadius: '7px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Current Status</div>
                <span className={`badge ${STATUS_MAP[selectedOrder.status]?.badgeClass || 'badge-pending'}`}>
                  <span className="badge-dot" style={{ background: STATUS_MAP[selectedOrder.status]?.dotColor || '#f59e0b' }}></span>
                  {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>
            </div>
          )}

          {/* STATUS ACTION BUTTONS */}
          {selectedOrder && (
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)' }}>Update Workflow:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedOrder.status !== 'approved' && (
                  <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 700 }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'approved')}>
                    ✓ Approve Order
                  </button>
                )}
                {selectedOrder.status !== 'confirmed' && (
                  <button className="btn btn-sm" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}>
                    Confirm
                  </button>
                )}
                {selectedOrder.status !== 'indelivery' && (
                  <button className="btn btn-sm" style={{ background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd' }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'indelivery')}>
                    In Delivery
                  </button>
                )}
                {selectedOrder.status !== 'delivered' && (
                  <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}>
                    Mark Delivered
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && (
                  <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setOrderModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL 4: VIEW RETAILER DETAILS
          ══════════════════════════════════════════════ */}
      <div
        className={`modal-bg ${retailerViewModalOpen ? 'open active' : ''}`}
        id="retailerViewModal"
        onClick={e => { if (e.target.classList.contains('modal-bg')) setRetailerViewModalOpen(false); }}
      >
        <div className="modal" style={{ width: 'min(500px,94vw)' }}>
          <div className="modal-title">
            <div className="card-icon" style={{ background: '#dcfce7', marginRight: '4px' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#22c55e" strokeWidth="1.4"><rect x="1" y="1" width="11" height="11" rx="1.5"/></svg>
            </div>
            <span>Retailer Profile – {selectedRetailer?.name}</span>
          </div>

          {selectedRetailer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>CODE</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRetailer.code}</div>
              </div>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>CONTACT</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRetailer.contact}</div>
              </div>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>EMAIL</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRetailer.email}</div>
              </div>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>PHONE</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRetailer.phone}</div>
              </div>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>TERMS</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRetailer.terms}</div>
              </div>
              <div style={{ background: '#f8f9fb', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700 }}>FULFILMENT</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{selectedRetailer.fulfilment}%</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setRetailerViewModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL 5: PAYMENT GATEWAY
          ══════════════════════════════════════════════ */}
      <div
        className={`modal-bg ${paymentModalOpen ? 'open active' : ''}`}
        id="paymentGatewayModal"
        onClick={e => { if (e.target.classList.contains('modal-bg')) setPaymentModalOpen(false); }}
      >
        <div className="modal" style={{ width: 'min(520px,94vw)', borderRadius: '14px', padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e429f 100%)', padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Secure Payment Gateway</div>
                <div style={{ fontSize: '12px', color: '#93c5fd' }}>StockOverflow Verified Merchant Billing</div>
              </div>
            </div>
            <button
              onClick={() => setPaymentModalOpen(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* PLAN BILL SUMMARY */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                <span>{selectedPlan.name} (Monthly)</span>
                <span>₹{selectedPlan.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>
                <span>GST (18% Goods &amp; Services Tax)</span>
                <span>₹{(selectedPlan.price * 0.18).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
                <span>Total Payable</span>
                <span style={{ color: '#2563eb' }}>₹{(selectedPlan.price * 1.18).toFixed(2)}</span>
              </div>
            </div>

            {/* PAYMENT TABS */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
              <button
                className={`btn btn-sm ${payMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPayMethod('upi')}
              >
                UPI / QR
              </button>
              <button
                className={`btn btn-sm ${payMethod === 'card' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPayMethod('card')}
              >
                Card (RuPay/Visa)
              </button>
              <button
                className={`btn btn-sm ${payMethod === 'net' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPayMethod('net')}
              >
                NetBanking
              </button>
            </div>

            {/* UPI */}
            {payMethod === 'upi' && (
              <div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'inline-block', padding: '8px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <svg width="120" height="120" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff"/>
                      <rect x="10" y="10" width="26" height="26" fill="#0f172a"/>
                      <rect x="14" y="14" width="18" height="18" fill="#ffffff"/>
                      <rect x="18" y="18" width="10" height="10" fill="#0f172a"/>
                      <rect x="64" y="10" width="26" height="26" fill="#0f172a"/>
                      <rect x="68" y="14" width="18" height="18" fill="#ffffff"/>
                      <rect x="72" y="18" width="10" height="10" fill="#0f172a"/>
                      <rect x="10" y="64" width="26" height="26" fill="#0f172a"/>
                      <rect x="14" y="68" width="18" height="18" fill="#ffffff"/>
                      <rect x="18" y="72" width="10" height="10" fill="#0f172a"/>
                      <rect x="42" y="14" width="8" height="8" fill="#0f172a"/>
                      <rect x="52" y="24" width="6" height="6" fill="#0f172a"/>
                      <rect x="42" y="34" width="16" height="16" fill="#0f172a"/>
                      <rect x="14" y="44" width="8" height="12" fill="#0f172a"/>
                      <rect x="64" y="44" width="12" height="8" fill="#0f172a"/>
                      <rect x="80" y="52" width="10" height="10" fill="#0f172a"/>
                      <rect x="44" y="64" width="12" height="12" fill="#0f172a"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginTop: '6px' }}>
                    Scan with GPay, PhonePe, Paytm or BHIM
                  </div>
                </div>
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label className="field-label">Or Enter UPI ID</label>
                  <input type="text" defaultValue="supplier@upi" />
                </div>
              </div>
            )}

            {/* CARD */}
            {payMethod === 'card' && (
              <div>
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label className="field-label">Card Number</label>
                  <input type="text" defaultValue="4532 •••• •••• 8892" />
                </div>
                <div className="fg fg-2" style={{ marginBottom: '12px' }}>
                  <div className="field"><label className="field-label">Valid Thru</label><input type="text" defaultValue="08/29" /></div>
                  <div className="field"><label className="field-label">CVV</label><input type="password" defaultValue="882" /></div>
                </div>
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label className="field-label">Cardholder Name</label>
                  <input type="text" defaultValue={profile.supplierName} />
                </div>
              </div>
            )}

            {/* NETBANKING */}
            {payMethod === 'net' && (
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">Select Popular Indian Bank</label>
                <select style={{ width: '100%' }}>
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleProcessPayment}
                disabled={payingState}
                style={{ background: '#2563eb' }}
              >
                {payingState ? 'Authorizing Payment...' : 'Pay Securely'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ContactSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userRole="supplier"
        defaultUser={{ name: profile.supplierName || 'Supplier', email: profile.email || '' }}
      />

      {/* ══════════════════════════════════════════════
          TOAST NOTIFICATION
          ══════════════════════════════════════════════ */}
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#22c55e" strokeWidth="2">
          <circle cx="9" cy="9" r="7.5"/>
          <polyline points="5.5,9 7.5,11.5 12,6.5"/>
        </svg>
        <span>{toast.message}</span>
      </div>

    </>
  );
}
