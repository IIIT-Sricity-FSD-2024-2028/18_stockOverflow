import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../api/client';
import Chart from 'chart.js/auto';

export default function DashboardView({ setActiveView, onNavigate }) {
  const navigate = setActiveView || onNavigate;
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    customers: [],
    transactions: [],
    purchaseOrders: [],
    returns: [],
    suppliers: [],
    subscription: null,
  });

  const [activeFilter, setActiveFilter] = useState('1D');
  const [activeTransTab, setActiveTransTab] = useState('Sale');
  const [notifVisible, setNotifVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState('pro');
  const [pendingSwitchTier, setPendingSwitchTier] = useState(null);
  const [simPayMethod, setSimPayMethod] = useState('upi');

  // Heatmap tooltip
  const [heatTip, setHeatTip] = useState({ visible: false, x: 0, y: 0, text: '' });

  // Chart refs
  const salesChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const custDonutRef = useRef(null);
  const custDonutInstance = useRef(null);
  const revExpChartRef = useRef(null);
  const revExpChartInstance = useRef(null);
  const catDonutRef = useRef(null);
  const catDonutInstance = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes, transactionsRes, poRes, returnsRes, suppliersRes, subRes] =
        await Promise.all([
          request('/products').catch(() => []),
          request('/customers').catch(() => []),
          request('/transactions').catch(() => []),
          request('/purchase-orders').catch(() => []),
          request('/returns').catch(() => []),
          request('/suppliers').catch(() => []),
          request(`/platform-revenue/subscriptions/active?userId=${encodeURIComponent(user?.id || user?.userId || 'u-retailer-1')}`).catch(() => null),
        ]);

      setData({
        products: Array.isArray(productsRes) ? productsRes : [],
        customers: Array.isArray(customersRes) ? customersRes : [],
        transactions: Array.isArray(transactionsRes) ? transactionsRes : [],
        purchaseOrders: Array.isArray(poRes) ? poRes : [],
        returns: Array.isArray(returnsRes) ? returnsRes : [],
        suppliers: Array.isArray(suppliersRes) ? suppliersRes : [],
        subscription: subRes,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Calculations
  const formatCurrency = (val) => {
    const num = Math.round(Number(val || 0));
    if (num < 0) {
      return '-₹' + Math.abs(num).toLocaleString('en-IN');
    }
    return '₹' + num.toLocaleString('en-IN');
  };

  const deliveredPOs = data.purchaseOrders.filter((order) => {
    const s = String(order.status || '').toLowerCase();
    return s.includes('delivered') || s.includes('received');
  });

  const confirmedReturns = data.returns.filter((item) => {
    const s = String(item.status || '').toLowerCase();
    return s === 'approved' || s === 'exchanged' || s === 'confirmed';
  });

  const totalSales = data.transactions.reduce((sum, tx) => sum + (Number(tx.finalTotal) || 0), 0);
  const totalSalesReturn = confirmedReturns.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPurchase = deliveredPOs.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const purchaseReturn = 0;
  const netSales = totalSales - totalSalesReturn;
  const netPurchase = totalPurchase - purchaseReturn;
  const netProfit = netSales - netPurchase;
  const invoiceDue = data.purchaseOrders
    .filter((o) => String(o.status || '').toLowerCase().includes('pending'))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalExpenses = totalPurchase;
  const paymentReturns = 0;
  const commission = totalSales * 0.02;

  const lowStockProducts = data.products.filter(
    (p) => (Number(p.qty) || 0) <= (Number(p.min) || 0)
  );
  const pendingOrdersCount = data.purchaseOrders.filter((po) =>
    String(po.status || '').toLowerCase().includes('pending')
  ).length;

  const currentTier = data.subscription?.tier || 'pro';
  const currentStatus = data.subscription?.status || 'active';
  const tierDisplayMap = {
    free: 'Starter (₹0/mo)',
    pro: 'Growth (₹799/mo)',
    enterprise: 'Enterprise (₹3,499/mo)',
  };

  // Top selling products
  const defaultTopSelling = [
    { name: 'iPhone 15 Pro Max', price: '₹1,199', sales: '128 sold', pct: '+8%', up: true, emoji: '📱' },
    { name: 'Nike Air Max 2025', price: '₹189', sales: '95 sold', pct: '+5%', up: true, emoji: '👟' },
    { name: 'Sony WH-1000XM6', price: '₹349', sales: '74 sold', pct: '-2%', up: false, emoji: '🎧' },
    { name: 'MacBook Air M4', price: '₹1,099', sales: '61 sold', pct: '+11%', up: true, emoji: '💻' },
    { name: "Levi's 512 Jeans", price: '₹79', sales: '48 sold', pct: '+1%', up: true, emoji: '👖' },
  ];

  const defaultLowStock = [
    { name: 'Samsung Galaxy S25', id: '#PRD-00412', status: 'Low Stock', qty: '8 pcs', statusClass: 'low', emoji: '📱' },
    { name: 'Adidas Ultraboost 24', id: '#PRD-00289', status: 'Critical', qty: '3 pcs', statusClass: 'critical', emoji: '👟' },
    { name: 'Apple Watch Ultra 3', id: '#PRD-00587', status: 'Low Stock', qty: '12 pcs', statusClass: 'low', emoji: '⌚' },
    { name: 'Canon EOS R8', id: '#PRD-00341', status: 'Critical', qty: '2 pcs', statusClass: 'critical', emoji: '📷' },
    { name: 'Dyson V16 Vacuum', id: '#PRD-00198', status: 'Low Stock', qty: '7 pcs', statusClass: 'low', emoji: '🌀' },
  ];

  const defaultRecentSales = [
    { name: 'Wireless Headphones', category: 'Electronics', price: '₹129.99', date: '15 Jan 2025', status: 'completed', emoji: '🎧' },
    { name: 'Running Shoes Pro', category: 'Footwear', price: '₹89.50', date: '14 Jan 2025', status: 'pending', emoji: '👟' },
    { name: 'Smart Watch Series', category: 'Gadgets', price: '₹249.00', date: '13 Jan 2025', status: 'completed', emoji: '⌚' },
    { name: 'Laptop Stand Deluxe', category: 'Accessories', price: '₹45.00', date: '12 Jan 2025', status: 'processing', emoji: '💻' },
    { name: 'Yoga Mat Premium', category: 'Lifestyles', price: '₹87.56', date: '11 Jan 2025', status: 'completed', emoji: '🧘' },
  ];

  const defaultTransactions = {
    Sale: [
      { date: '15 Jan 2025', name: 'Alex Johnson', id: '#C-001', color: '#5b67ca', status: 'completed', total: '₹1,240' },
      { date: '14 Jan 2025', name: 'Sarah Williams', id: '#C-002', color: '#22c55e', status: 'pending', total: '₹890' },
      { date: '13 Jan 2025', name: 'Michael Brown', id: '#C-003', color: '#f59e0b', status: 'cancelled', total: '₹450' },
      { date: '12 Jan 2025', name: 'Emma Davis', id: '#C-004', color: '#ef4444', status: 'completed', total: '₹2,100' },
    ],
    Purchase: [
      { date: '15 Jan 2025', name: 'TechSupply Co.', id: '#S-001', color: '#3b82f6', status: 'completed', total: '₹5,800' },
      { date: '14 Jan 2025', name: 'Global Parts Ltd', id: '#S-002', color: '#8b5cf6', status: 'processing', total: '₹3,200' },
      { date: '12 Jan 2025', name: 'QuickShip Inc.', id: '#S-003', color: '#14b8a6', status: 'pending', total: '₹1,500' },
      { date: '10 Jan 2025', name: 'Premium Goods', id: '#S-004', color: '#ec4899', status: 'completed', total: '₹7,100' },
    ],
    Quotation: [
      { date: '14 Jan 2025', name: 'Raj Enterprises', id: '#Q-001', color: '#f59e0b', status: 'pending', total: '₹3,400' },
      { date: '13 Jan 2025', name: 'Singh & Co.', id: '#Q-002', color: '#5b67ca', status: 'processing', total: '₹890' },
      { date: '11 Jan 2025', name: 'Metro Retail', id: '#Q-003', color: '#22c55e', status: 'completed', total: '₹6,200' },
      { date: '09 Jan 2025', name: 'City Merchants', id: '#Q-004', color: '#ef4444', status: 'cancelled', total: '₹1,100' },
    ],
    Expenses: [
      { date: '15 Jan 2025', name: 'Office Rentals', id: '#E-001', color: '#6b7280', status: 'completed', total: '₹4,000' },
      { date: '13 Jan 2025', name: 'Marketing Spend', id: '#E-002', color: '#ef4444', status: 'pending', total: '₹1,200' },
      { date: '10 Jan 2025', name: 'Logistics Fees', id: '#E-003', color: '#f59e0b', status: 'completed', total: '₹780' },
      { date: '08 Jan 2025', name: 'Software Subs.', id: '#E-004', color: '#3b82f6', status: 'completed', total: '₹350' },
    ],
    Invoices: [
      { date: '15 Jan 2025', name: 'Client A Corp.', id: '#I-001', color: '#5b67ca', status: 'pending', total: '₹8,500' },
      { date: '12 Jan 2025', name: 'Client B Ltd.', id: '#I-002', color: '#22c55e', status: 'completed', total: '₹3,200' },
      { date: '10 Jan 2025', name: 'Acme Holdings', id: '#I-003', color: '#f59e0b', status: 'processing', total: '₹5,700' },
      { date: '07 Jan 2025', name: 'Nova Ventures', id: '#I-004', color: '#14b8a6', status: 'completed', total: '₹2,100' },
    ],
  };

  const defaultTopCustomers = [
    { name: 'Alex Johnson', location: 'Mumbai', orders: '34 Orders', amount: '₹8,965', color: '#5b67ca', init: 'AJ' },
    { name: 'Sarah Williams', location: 'Delhi', orders: '28 Orders', amount: '₹7,412', color: '#22c55e', init: 'SW' },
    { name: 'Michael Brown', location: 'Bangalore', orders: '21 Orders', amount: '₹5,890', color: '#f59e0b', init: 'MB' },
    { name: 'Emma Davis', location: 'Chennai', orders: '19 Orders', amount: '₹4,340', color: '#ef4444', init: 'ED' },
    { name: 'James Wilson', location: 'Hyderabad', orders: '15 Orders', amount: '₹3,120', color: '#8b5cf6', init: 'JW' },
  ];

  // Charts Effect
  useEffect(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Sales & Purchase Chart
    if (salesChartRef.current) {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      const ctx = salesChartRef.current.getContext('2d');
      salesChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Purchase',
              data: [0, 0, 0, 0, 0, 0, 0, 2.2, 0, 0, 0, 0],
              backgroundColor: '#5b67ca',
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.5,
              categoryPercentage: 0.7,
            },
            {
              label: 'Sales',
              data: [0, 0, 0, 0, 0, 0, 0, 13.8, 0, 0, 0, 0],
              backgroundColor: '#22c55e',
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.5,
              categoryPercentage: 0.7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ₹${(c.raw * 1000).toLocaleString('en-IN')}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { font: { size: 10 }, color: '#9ca3af' },
            },
            y: {
              grid: { color: '#f3f4f6' },
              border: { display: false },
              ticks: {
                callback: (v) => `₹${v}K`,
                font: { size: 10 },
                color: '#9ca3af',
              },
            },
          },
        },
      });
    }

    // 2. Customer Donut Chart
    if (custDonutRef.current) {
      if (custDonutInstance.current) custDonutInstance.current.destroy();
      const ctx = custDonutRef.current.getContext('2d');
      custDonutInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [
            {
              data: [0, 1],
              backgroundColor: ['#5b67ca', '#22c55e'],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${c.raw} customer(s)`,
              },
            },
          },
        },
      });
    }

    // 3. Revenue vs Expense Chart
    if (revExpChartRef.current) {
      if (revExpChartInstance.current) revExpChartInstance.current.destroy();
      const ctx = revExpChartRef.current.getContext('2d');
      revExpChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue',
              data: [0, 0, 0, 0, 0, 0, 0, 13.8, 0, 0, 0, 0],
              backgroundColor: '#5b67ca',
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.4,
              categoryPercentage: 0.8,
            },
            {
              label: 'Expense',
              data: [0, 0, 0, 0, 0, 0, 0, -2.2, 0, 0, 0, 0],
              backgroundColor: '#fca5a5',
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.4,
              categoryPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ₹${Math.abs(c.raw * 1000).toLocaleString('en-IN')}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { font: { size: 10 }, color: '#9ca3af' },
            },
            y: {
              grid: { color: '#f3f4f6' },
              border: { display: false },
              ticks: {
                callback: (v) => `₹${Math.abs(v)}K`,
                font: { size: 10 },
                color: '#9ca3af',
              },
            },
          },
        },
      });
    }

    // 4. Category Donut Chart
    if (catDonutRef.current) {
      if (catDonutInstance.current) catDonutInstance.current.destroy();
      const ctx = catDonutRef.current.getContext('2d');
      catDonutInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Electronics', 'Fashion', 'Home & Living'],
          datasets: [
            {
              data: [45, 32, 23],
              backgroundColor: ['#5b67ca', '#22c55e', '#f59e0b'],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    return () => {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (custDonutInstance.current) custDonutInstance.current.destroy();
      if (revExpChartInstance.current) revExpChartInstance.current.destroy();
      if (catDonutInstance.current) catDonutInstance.current.destroy();
    };
  }, [loading, data]);

  // Subscription Actions
  const handlePlanSelectionClick = (targetTier) => {
    if (targetTier === currentTier && currentStatus === 'active') return;
    if (currentTier !== 'free' && currentStatus === 'active') {
      setPendingSwitchTier(targetTier);
      setIsCancelModalOpen(true);
      return;
    }
    if (targetTier === 'free') {
      activateStarterDirectly();
    } else {
      setPendingTier(targetTier);
      setIsPaymentModalOpen(true);
    }
  };

  const activateStarterDirectly = async () => {
    try {
      const res = await request('/platform-revenue/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || user?.userId || 'u-retailer-1',
          userName: user?.name || 'Retailer User',
          userEmail: user?.email || 'retailer@stockoverflow.com',
          userRole: 'retailer',
          tier: 'free',
          billingCycle: 'monthly',
        }),
      });
      setData((prev) => ({ ...prev, subscription: res }));
      setIsTierModalOpen(false);
      showToast('Plan updated: Starter (₹0/mo) is now active.', 'success');
    } catch (err) {
      showToast('Error updating plan: ' + (err.message || err), 'danger');
    }
  };

  const executeSimulatedPayment = async () => {
    try {
      const res = await request('/platform-revenue/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || user?.userId || 'u-retailer-1',
          userName: user?.name || 'Retailer User',
          userEmail: user?.email || 'retailer@stockoverflow.com',
          userRole: 'retailer',
          tier: pendingTier,
          billingCycle: 'monthly',
          paymentMethod: simPayMethod === 'upi' ? 'UPI AutoPay' : simPayMethod === 'card' ? 'Credit Card' : 'NetBanking',
          paymentReference: 'PAY_SIM_' + Math.floor(100000 + Math.random() * 900000),
        }),
      });
      setData((prev) => ({ ...prev, subscription: res }));
      setIsPaymentModalOpen(false);
      setIsTierModalOpen(false);
      const tierName = pendingTier === 'enterprise' ? 'Enterprise (₹3,499/mo)' : 'Growth (₹799/mo)';
      showToast(`🎉 ${tierName} is now active for 30 days!`, 'success');
    } catch (err) {
      showToast('Payment error: ' + (err.message || err), 'danger');
    }
  };

  const executePlanCancellation = async () => {
    try {
      const res = await request('/platform-revenue/subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || user?.userId || 'u-retailer-1',
        }),
      });
      setData((prev) => ({ ...prev, subscription: res }));
      setIsCancelModalOpen(false);
      showToast('Subscription auto-renewal has been cancelled.', 'info');
      if (pendingSwitchTier === 'free') {
        activateStarterDirectly();
      } else if (pendingSwitchTier) {
        setPendingTier(pendingSwitchTier);
        setIsPaymentModalOpen(true);
      }
      setPendingSwitchTier(null);
    } catch (err) {
      showToast('Error cancelling subscription: ' + (err.message || err), 'danger');
    }
  };

  // Heatmap rendering
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  const heatData = [
    [0, 1, 2, 3, 2, 1, 0],
    [1, 2, 3, 4, 3, 2, 1],
    [2, 3, 4, 3, 2, 1, 0],
    [1, 2, 3, 4, 3, 2, 1],
    [0, 1, 2, 3, 4, 3, 2],
    [1, 2, 3, 2, 1, 0, 1],
    [2, 3, 2, 1, 0, 1, 2],
    [1, 2, 3, 4, 3, 2, 1],
    [0, 1, 2, 3, 2, 1, 0],
  ];

  return (
    <div className="content">
      {/* In-page Toast Notification */}
      {toastMessage && (
        <div
          className="so-toast"
          style={{
            background: toastMessage.type === 'danger' ? '#fee2e2' : toastMessage.type === 'info' ? '#eff6ff' : '#dcfce7',
            color: toastMessage.type === 'danger' ? '#991b1b' : toastMessage.type === 'info' ? '#1e40af' : '#166534',
            border: `1.5px solid ${toastMessage.type === 'danger' ? '#fca5a5' : toastMessage.type === 'info' ? '#93c5fd' : '#86efac'}`,
          }}
        >
          <span>{toastMessage.type === 'danger' ? '⚠️' : toastMessage.type === 'info' ? 'ℹ️' : '✓'}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="page-title">Retailer Dashboard</div>
            <span
              className="sub-tier-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{tierDisplayMap[currentTier] || 'Growth (₹799/mo)'}</span>
            </span>
          </div>
          <div className="page-subtitle">
            Welcome back, {user?.name || 'John'}! You have {pendingOrdersCount} pending orders today.
          </div>
        </div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => setIsTierModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#1e293b',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Manage Subscription
          </button>
        </div>
      </div>

      {/* NOTIFICATION BAR */}
      {notifVisible && (
        <div className="notification-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            ⚠️{' '}
            {lowStockProducts.length > 0 ? (
              <span>{lowStockProducts.length} product(s) are running low on stock.</span>
            ) : (
              <span>No products are running low on stock.</span>
            )}{' '}
            <a
              onClick={() => setActiveView('reorder')}
              style={{ color: '#92400e', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
            >
              Reorder now
            </a>{' '}
            to avoid stockouts.
          </span>
          <div className="close-btn" onClick={() => setNotifVisible(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>
      )}

      {/* SALES OVERVIEW */}
      <div className="section-label">Sales Overview</div>
      <div className="cards-grid">
        {/* Total Sales */}
        <div className="metric-card" onClick={() => setActiveView('dashboard')}>
          <div className="metric-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className="metric-info">
            <div className="metric-label">Total Sales</div>
            <div className="metric-value-row">
              <div className="metric-value">{formatCurrency(totalSales || 13780)}</div>
              <span className="badge up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="18,15 12,9 6,15" />
                </svg>
                0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Sales Return */}
        <div className="metric-card" onClick={() => setActiveView('returns')}>
          <div className="metric-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="metric-info">
            <div className="metric-label">Sales Return</div>
            <div className="metric-value-row">
              <div className="metric-value">{formatCurrency(totalSalesReturn || 1943)}</div>
              <span className="badge down">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
                0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Total Purchase */}
        <div className="metric-card" onClick={() => setActiveView('purchase-orders')}>
          <div className="metric-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div className="metric-info">
            <div className="metric-label">Total Purchase</div>
            <div className="metric-value-row">
              <div className="metric-value">{formatCurrency(totalPurchase || 2204)}</div>
              <span className="badge up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="18,15 12,9 6,15" />
                </svg>
                0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Return */}
        <div className="metric-card" onClick={() => setActiveView('returns')}>
          <div className="metric-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
          </div>
          <div className="metric-info">
            <div className="metric-label">Purchase Return</div>
            <div className="metric-value-row">
              <div className="metric-value">{formatCurrency(purchaseReturn)}</div>
              <span className="badge neutral">0.0%</span>
            </div>
          </div>
        </div>

        {/* 2% Commission */}
        <div className="metric-card">
          <div className="metric-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M14.5 9.5a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div className="metric-info">
            <div className="metric-label">2% Commission</div>
            <div className="metric-value-row">
              <div className="metric-value">{formatCurrency(commission || 276)}</div>
              <span className="badge up" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                2.0%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="section-label">Financial Summary</div>
      <div className="fin-cards-grid">
        {/* Net Profit */}
        <div className="fin-card">
          <div className="fin-card-top">
            <div>
              <div className="fin-card-val">{formatCurrency(netProfit || 9634)}</div>
              <div className="fin-card-label">Net Profit</div>
            </div>
            <div className="fin-card-icon" style={{ background: '#dcfce7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                <polyline points="16,7 22,7 22,13" />
              </svg>
            </div>
          </div>
          <hr className="fin-card-divider" />
          <div className="fin-card-footer">
            <span>0.0% vs last month</span>
            <a onClick={() => setActiveView('inventory-overview')}>View All</a>
          </div>
        </div>

        {/* Invoice Due */}
        <div className="fin-card">
          <div className="fin-card-top">
            <div>
              <div className="fin-card-val">{formatCurrency(invoiceDue)}</div>
              <div className="fin-card-label">Invoice Due</div>
            </div>
            <div className="fin-card-icon" style={{ background: '#fee2e2' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <hr className="fin-card-divider" />
          <div className="fin-card-footer">
            <span>Due within 7 days</span>
            <a onClick={() => setActiveView('purchase-orders')}>View All</a>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="fin-card">
          <div className="fin-card-top">
            <div>
              <div className="fin-card-val">{formatCurrency(totalExpenses || 2204)}</div>
              <div className="fin-card-label">Total Expenses</div>
            </div>
            <div className="fin-card-icon" style={{ background: '#fef3c7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
          </div>
          <hr className="fin-card-divider" />
          <div className="fin-card-footer">
            <span>0.0% vs last month</span>
            <a onClick={() => setActiveView('products')}>View All</a>
          </div>
        </div>

        {/* Payment Returns */}
        <div className="fin-card">
          <div className="fin-card-top">
            <div>
              <div className="fin-card-val">{formatCurrency(paymentReturns)}</div>
              <div className="fin-card-label">Payment Returns</div>
            </div>
            <div className="fin-card-icon" style={{ background: '#dbeafe' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
            </div>
          </div>
          <hr className="fin-card-divider" />
          <div className="fin-card-footer">
            <span>0.0% vs last month</span>
            <a onClick={() => setActiveView('returns')}>View All</a>
          </div>
        </div>
      </div>

      {/* TWO COL: SALES & PURCHASE + OVERALL INFO */}
      <div className="two-col">
        {/* Sales & Purchase Chart Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                <polyline points="17,6 23,6 23,12" />
              </svg>
            </div>
            <div className="panel-title">Sales & Purchase</div>
            <div className="filter-tabs">
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tab) => (
                <div
                  key={tab}
                  className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
          <div className="chart-area">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#5b67ca' }}></div>
                <div>
                  <div className="legend-val">{formatCurrency(totalPurchase || 2204)}</div>
                  <div className="legend-lbl">Total Purchase</div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#22c55e' }}></div>
                <div>
                  <div className="legend-val">{formatCurrency(totalSales || 13780)}</div>
                  <div className="legend-lbl">Total Sales</div>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', height: '190px' }}>
              <canvas ref={salesChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Overall Information Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div className="panel-title">Overall Information</div>
          </div>
          <div className="overall-stats">
            <div className="overall-stat" onClick={() => setActiveView('suppliers')}>
              <div className="overall-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="overall-stat-val">{data.suppliers.length || 13}</div>
              <div className="overall-stat-lbl">Suppliers</div>
            </div>

            <div className="overall-stat" onClick={() => setActiveView('customers')}>
              <div className="overall-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="overall-stat-val">{data.customers.length || 1}</div>
              <div className="overall-stat-lbl">Customers</div>
            </div>

            <div className="overall-stat" onClick={() => setActiveView('purchase-orders')}>
              <div className="overall-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="overall-stat-val">{data.transactions.length || 6}</div>
              <div className="overall-stat-lbl">Orders</div>
            </div>
          </div>

          <div className="panel-header" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div className="panel-title" style={{ fontSize: '13px' }}>
              Customer Overview
            </div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Today
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>

          <div className="cust-chart-row">
            <div className="donut-wrap" style={{ width: '140px', height: '140px' }}>
              <canvas ref={custDonutRef}></canvas>
              <div className="donut-center">
                <div className="donut-center-val">{data.customers.length || 1}</div>
                <div className="donut-center-lbl">Total</div>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-item">
                <div className="donut-legend-line" style={{ background: '#5b67ca' }}></div>
                <div>
                  <div className="donut-legend-val">0</div>
                  <div className="donut-legend-lbl">First Time</div>
                </div>
                <span className="badge up" style={{ marginLeft: 'auto' }}>
                  0%
                </span>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-line" style={{ background: '#22c55e' }}></div>
                <div>
                  <div className="donut-legend-val">1</div>
                  <div className="donut-legend-lbl">Return</div>
                </div>
                <span className="badge up" style={{ marginLeft: 'auto' }}>
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THREE COL: TOP SELLING, LOW STOCK, RECENT SALES */}
      <div className="three-col">
        {/* Top Selling Products */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div className="panel-title">Top Selling Products</div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Today
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div>
            {defaultTopSelling.map((p, idx) => (
              <div key={idx} className="product-item">
                <div className="product-avatar">{p.emoji}</div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">
                    {p.price}
                    <span className="meta-dot"></span>
                    {p.sales}
                  </div>
                </div>
                <span className={`badge ${p.up ? 'up' : 'down'}`}>{p.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: '#fee2e2' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="panel-title">Low Stock Products</div>
            <a className="panel-link" onClick={() => setActiveView('low-stocks')}>
              View All
            </a>
          </div>
          <div>
            {defaultLowStock.map((p, idx) => (
              <div key={idx} className="product-item">
                <div className="product-avatar">{p.emoji}</div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">{p.id}</div>
                </div>
                <div className="stock-info">
                  <div className={`stock-status ${p.statusClass}`}>{p.status}</div>
                  <div className="stock-qty">{p.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: '#dcfce7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div className="panel-title">Recent Sales</div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Today
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div>
            {defaultRecentSales.map((s, idx) => (
              <div key={idx} className="sale-item">
                <div className="product-avatar">{s.emoji}</div>
                <div className="sale-info">
                  <div className="sale-name">{s.name}</div>
                  <div className="sale-sub">
                    {s.category}
                    <span className="meta-dot"></span>
                    {s.price}
                  </div>
                </div>
                <div className="sale-right">
                  <div className="sale-date">{s.date}</div>
                  <span className={`status-pill ${s.status}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INVENTORY SECTION HEADER */}
      <div className="section-label" style={{ marginTop: '6px' }}>
        Inventory
      </div>

      {/* TWO COL EQUAL: REVENUE VS EXPENSE & RECENT TRANSACTIONS */}
      <div className="two-col-eq">
        {/* Revenue vs Expense */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: '#fef3c7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="panel-title">Revenue vs Expense</div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              2025
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div className="rev-exp-header">
            <div className="rev-exp-stats">
              <div>
                <div className="rev-stat-badge">
                  <div className="rev-stat-val">{formatCurrency(totalSales || 13780)}</div>
                  <span className="badge up">+0.0%</span>
                </div>
                <div className="rev-stat-lbl">Total Revenue</div>
              </div>
              <div>
                <div className="rev-stat-badge">
                  <div className="rev-stat-val">{formatCurrency(totalExpenses || 2204)}</div>
                  <span className="badge down">-0.0%</span>
                </div>
                <div className="rev-stat-lbl">Total Expense</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 18px 18px', position: 'relative', height: '190px' }}>
            <canvas ref={revExpChartRef}></canvas>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: '#dbeafe' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
            </div>
            <div className="panel-title">Recent Transactions</div>
            <a className="panel-link" onClick={() => setActiveView('purchase-orders')}>
              View All
            </a>
          </div>
          <div className="trans-tabs">
            {['Sale', 'Purchase', 'Quotation', 'Expenses', 'Invoices'].map((tab) => (
              <div
                key={tab}
                className={`trans-tab ${activeTransTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTransTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(defaultTransactions[activeTransTab] || []).map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{row.date}</td>
                    <td>
                      <div className="cust-cell">
                        <div className="avatar-sm" style={{ background: row.color }}>
                          {row.name
                            .split(' ')
                            .map((x) => x[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="cust-name">{row.name}</div>
                          <div className="cust-id">{row.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${row.status}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '13px' }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* THREE COL LAST: TOP CUSTOMERS, CATEGORY SALES, ORDER ACTIVITY */}
      <div className="three-col-last">
        {/* Top Customers */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="panel-title">Top Customers</div>
            <a className="panel-link" onClick={() => setActiveView('customers')}>
              View All
            </a>
          </div>
          <div>
            {defaultTopCustomers.map((c, idx) => (
              <div key={idx} className="top-cust-item">
                <div className="avatar-sm" style={{ background: c.color }}>
                  {c.init}
                </div>
                <div className="top-cust-info">
                  <div className="top-cust-name">{c.name}</div>
                  <div className="top-cust-sub">
                    {c.location}
                    <span className="meta-dot"></span>
                    {c.orders}
                  </div>
                </div>
                <div className="top-cust-amount">{c.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0110 10" />
              </svg>
            </div>
            <div className="panel-title">Category Sales</div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Month
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
              <canvas ref={catDonutRef}></canvas>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700 }}>100%</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Total</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '3px', height: '30px', borderRadius: '3px', background: '#5b67ca', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>45%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Electronics</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '3px', height: '30px', borderRadius: '3px', background: '#22c55e', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>32%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fashion</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '3px', height: '30px', borderRadius: '3px', background: '#f59e0b', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>23%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Home & Living</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
              Statistics
            </div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 12px',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: '#5b67ca' }}></div>
                  <span style={{ fontSize: '12px' }}>Electronics & Gadgets</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '12.5px' }}>45%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: '#22c55e' }}></div>
                  <span style={{ fontSize: '12px' }}>Fashion & Accessories</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '12.5px' }}>32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Activity Heatmap */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: '#f3f4f6' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="panel-title">Order Activity</div>
            <div className="panel-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Week
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div className="heatmap-wrap">
            <div className="heatmap-header">
              {days.map((d) => (
                <div key={d} className="heatmap-day-lbl">
                  {d}
                </div>
              ))}
            </div>
            <div className="heatmap-grid">
              <div className="heatmap-time-col">
                {times.map((t) => (
                  <div key={t} className="heatmap-time-lbl">
                    {t}
                  </div>
                ))}
              </div>
              <div className="heatmap-cells">
                {days.map((d, di) => (
                  <div key={d} className="heatmap-col">
                    {times.map((t, ti) => {
                      const h = heatData[ti][di];
                      const orders = h === 0 ? 0 : Math.floor(h * 45 + 15);
                      return (
                        <div
                          key={t}
                          className={`heatmap-cell h${h}`}
                          onMouseEnter={(e) =>
                            setHeatTip({
                              visible: true,
                              x: e.clientX + 10,
                              y: e.clientY - 28,
                              text: `${orders} orders on ${d} at ${t}`,
                            })
                          }
                          onMouseLeave={() => setHeatTip({ visible: false, x: 0, y: 0, text: '' })}
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {heatTip.visible && (
            <div
              className="heatmap-tooltip"
              style={{
                display: 'block',
                left: `${heatTip.x}px`,
                top: `${heatTip.y}px`,
              }}
            >
              {heatTip.text}
            </div>
          )}
        </div>
      </div>

      {/* SUBSCRIPTION PLAN MODAL */}
      {isTierModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTierModalOpen(false)}>
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '780px',
              width: '92%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Subscription & Plans
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Manage your 30-day membership cycle or upgrade to unlock higher store and SKU limits
                </p>
              </div>
              <button
                onClick={() => setIsTierModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            {/* Active Subscription Status Banner */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>
                    Current Plan: <strong>{tierDisplayMap[currentTier] || 'Growth Plan'}</strong>
                  </span>
                  <span
                    style={{
                      background: currentStatus === 'cancelled' ? '#fee2e2' : '#bbf7d0',
                      color: currentStatus === 'cancelled' ? '#b91c1c' : '#166534',
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentStatus === 'cancelled' ? 'CANCELLED' : 'ACTIVE'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  30-day billing cycle • Valid until next cycle (30 days left)
                </div>
              </div>
              {currentTier !== 'free' && currentStatus === 'active' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Plan
                </button>
              )}
            </div>

            {/* 3 Tier Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {/* Starter */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Starter</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                  ₹0 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 16px',
                    fontSize: '12px',
                    color: '#334155',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <li>✓ <strong>3 POs / week</strong> (Auto-resets)</li>
                  <li>✓ 1 Store Location</li>
                  <li>✓ Up to 50 SKUs</li>
                </ul>
                <button
                  onClick={() => handlePlanSelectionClick('free')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    border: currentTier === 'free' ? 'none' : '1px solid #cbd5e1',
                    background: currentTier === 'free' ? '#3b82f6' : '#f8fafc',
                    color: currentTier === 'free' ? '#fff' : '#1e293b',
                  }}
                >
                  {currentTier === 'free' ? 'Active Plan' : 'Select Starter (₹0)'}
                </button>
              </div>

              {/* Growth */}
              <div
                style={{
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f8faff',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  POPULAR
                </div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1d4ed8' }}>Growth</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                  ₹799 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 16px',
                    fontSize: '12px',
                    color: '#334155',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <li>✓ <strong>15 POs / week</strong></li>
                  <li>✓ Up to 5 Outlets</li>
                  <li>✓ Unlimited SKUs</li>
                </ul>
                <button
                  onClick={() => handlePlanSelectionClick('pro')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    border: 'none',
                    background: currentTier === 'pro' ? '#3b82f6' : '#2563eb',
                    color: '#fff',
                  }}
                >
                  {currentTier === 'pro' ? 'Active Plan' : 'Upgrade (₹799/mo)'}
                </button>
              </div>

              {/* Enterprise */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Enterprise</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                  ₹3,499 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 16px',
                    fontSize: '12px',
                    color: '#334155',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <li>✓ <strong>Unlimited POs</strong></li>
                  <li>✓ Unlimited Stores</li>
                  <li>✓ Dedicated Support</li>
                </ul>
                <button
                  onClick={() => handlePlanSelectionClick('enterprise')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    border: currentTier === 'enterprise' ? 'none' : '1px solid #cbd5e1',
                    background: currentTier === 'enterprise' ? '#3b82f6' : '#f8fafc',
                    color: currentTier === 'enterprise' ? '#fff' : '#1e293b',
                  }}
                >
                  {currentTier === 'enterprise' ? 'Active Plan' : 'Upgrade (₹3,499/mo)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SIMULATOR MODAL */}
      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '90%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Checkout & Payment
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Complete simulated sandbox payment
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {pendingTier === 'enterprise' ? 'Enterprise Plan' : 'Growth Plan'}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#1d4ed8' }}>
                  {pendingTier === 'enterprise' ? '₹3,499 / mo' : '₹799 / mo'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {pendingTier === 'enterprise' ? 'Unlimited POs • Unlimited Outlets' : '15 POs/wk • 5 Outlets • Unlimited SKUs'}
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#334155' }}>
                <span>30-Day Billing Cycle</span>
                <strong style={{ color: '#0f172a' }}>
                  Total: {pendingTier === 'enterprise' ? '₹3,499' : '₹799'}
                </strong>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['upi', 'card', 'netbanking'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSimPayMethod(m)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: simPayMethod === m ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                      background: simPayMethod === m ? '#eff6ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: simPayMethod === m ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {m === 'upi' ? '📱 UPI AutoPay' : m === 'card' ? '💳 Card' : '🏦 NetBanking'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={executeSimulatedPayment}
              style={{
                width: '100%',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              ✓ Pay {pendingTier === 'enterprise' ? '₹3,499' : '₹799'} & Activate Plan
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11.5px', color: '#94a3b8' }}>
              🔒 Sandbox Mode: Instant simulated payment.
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCancelModalOpen(false)}>
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '90%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Cancel Subscription Plan?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              You are currently subscribed to <strong>{tierDisplayMap[currentTier] || 'Growth Plan'}</strong>.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'left',
                fontSize: '12.5px',
                color: '#334155',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>What happens next:</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                <span>Plan access stays active until the end of your 30-day billing cycle.</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                <span>Auto-renewal will be stopped immediately.</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                <span>You can freely switch to Starter (₹0) or upgrade to another tier.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                style={{
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#fff',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Keep My Plan
              </button>
              <button
                type="button"
                onClick={executePlanCancellation}
                style={{
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Confirm & Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
