import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { billerApi } from '../api/billerApi';
import ReceiptModal from './ReceiptModal';

export default function BillerTransactionsView({ onBackToPos, onLogout }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const formatInr = (amt) => currencyFormatter.format(amt || 0);

  const currentStoreId = user?.currentStoreId || user?.storeId || '';
  const effectiveRetailerId =
    user?.retailerId || user?.profile?.retailerId || (user?.role === 'retailer' ? user?.id : '') || '';

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await billerApi.getTransactions(currentStoreId, effectiveRetailerId);
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentStoreId, effectiveRetailerId]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (t.orderId && t.orderId.toLowerCase().includes(q)) ||
        (t.customer && t.customer.toLowerCase().includes(q)) ||
        (t.store && t.store.toLowerCase().includes(q));

      const matchPay = !paymentFilter || (t.paymentMethod || '').toLowerCase() === paymentFilter.toLowerCase();
      return matchSearch && matchPay;
    });
  }, [transactions, search, paymentFilter]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (Number(t.finalTotal) || 0), 0);
  }, [transactions]);

  const totalItemsSold = useMemo(() => {
    return transactions.reduce((sum, t) => {
      const itms = Array.isArray(t.items) ? t.items : [];
      return sum + itms.reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0);
    }, 0);
  }, [transactions]);

  const handleOpenReceipt = (tx) => {
    setSelectedTx({
      ...tx,
      billerName: user?.name || 'Cashier',
    });
    setIsReceiptOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToPos}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>&larr;</span> Back to POS Screen
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Store Transactions & Invoice Records
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
            {user?.name} ({user?.store || currentStoreId || 'Cashier'})
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: '6px 14px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto', flex: 1 }}>
        {/* KPI Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Orders Processed
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {transactions.length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Total POS Revenue
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
              {formatInr(totalRevenue)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Items Sold
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
              {totalItemsSold}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#fff',
              outline: 'none',
              fontWeight: 600,
            }}
          >
            <option value="">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
              Loading transactions...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧾</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>No Transactions Found</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Completed POS sales will show up here.
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Store</th>
                  <th style={{ padding: '12px 16px' }}>Items</th>
                  <th style={{ padding: '12px 16px' }}>Payment</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Receipt Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const itms = Array.isArray(t.items) ? t.items : [];
                  const count = itms.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
                  const dateStr = t.timestamp ? new Date(t.timestamp).toLocaleString('en-IN') : 'N/A';

                  return (
                    <tr key={t.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {t.orderId}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {t.customer || 'Walk-in Customer'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {t.store || 'Retail Store'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {count} items
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                          }}
                        >
                          {t.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                        {formatInr(t.finalTotal)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(t)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🖨️ View / Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={selectedTx}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}
