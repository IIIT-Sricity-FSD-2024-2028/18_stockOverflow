import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SupplierPerformanceView({ supplier, onBack, onNavigate }) {
  const [supplierData, setSupplierData] = useState(
    supplier || {
      id: 'SUP-001',
      name: 'Acme Supplies Ltd',
      email: 'acme@supplies.com',
      phone: '+91 98765 43210',
      category: 'Electronics',
      rating: '4.9',
      status: 'Active',
    }
  );

  const deliveryChartRef = useRef(null);
  const deliveryChartInstance = useRef(null);
  const spendChartRef = useRef(null);
  const spendChartInstance = useRef(null);

  const poHistory = [
    { id: 'PO-2026-001', date: '14 Sep 2026', items: 'Lenovo IdeaPad 3 (10 pcs)', total: '₹4,50,000', timing: 'On Time (2 Days)', status: 'Delivered' },
    { id: 'PO-2026-004', date: '02 Sep 2026', items: 'Sony WH-1000XM6 (15 pcs)', total: '₹3,75,000', timing: 'On Time (3 Days)', status: 'Delivered' },
    { id: 'PO-2026-007', date: '18 Aug 2026', items: 'Apple Series 5 Watch (8 pcs)', total: '₹2,39,992', timing: 'Early (1 Day)', status: 'Delivered' },
    { id: 'PO-2026-009', date: '05 Aug 2026', items: 'Amazon Echo Dot (25 pcs)', total: '₹1,12,500', timing: 'On Time (2 Days)', status: 'Delivered' },
  ];

  useEffect(() => {
    if (deliveryChartRef.current) {
      if (deliveryChartInstance.current) deliveryChartInstance.current.destroy();
      const ctx = deliveryChartRef.current.getContext('2d');
      deliveryChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'On-Time Delivery %',
              data: [94, 96, 95, 98, 97, 98.4],
              borderColor: '#2e6bc5',
              backgroundColor: 'rgba(46, 107, 197, 0.1)',
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 80, max: 100, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    if (spendChartRef.current) {
      if (spendChartInstance.current) spendChartInstance.current.destroy();
      const ctx = spendChartRef.current.getContext('2d');
      spendChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'Procurement (₹ in Lakhs)',
              data: [2.1, 3.4, 2.8, 4.2, 3.9, 4.5],
              backgroundColor: '#5b67ca',
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    return () => {
      if (deliveryChartInstance.current) deliveryChartInstance.current.destroy();
      if (spendChartInstance.current) spendChartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="content" style={{ padding: '24px 28px 48px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onBack}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#2e6bc5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← Back to Suppliers
            </button>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#092c4c' }}>
              {supplierData.name}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c', margin: '8px 0 2px 0' }}>
            Supplier Performance Scorecard
          </h1>
          <p style={{ fontSize: '13px', color: '#646b72', margin: 0 }}>
            Procurement reliability, fulfillment SLA compliance, and spend history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate && onNavigate('purchase-orders')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#2e6bc5',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            + Create New PO
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#646b72', marginBottom: '4px' }}>On-Time Delivery Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d' }}>98.4%</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>✓ Above SLA (95%)</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#646b72', marginBottom: '4px' }}>Order Accuracy</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#092c4c' }}>99.1%</div>
          <div style={{ fontSize: '11px', color: '#646b72', marginTop: '4px' }}>Zero damaged returns</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#646b72', marginBottom: '4px' }}>Average Lead Time</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>2.4 Days</div>
          <div style={{ fontSize: '11px', color: '#646b72', marginTop: '4px' }}>Avg response: 1.8 hrs</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#646b72', marginBottom: '4px' }}>Overall Quality Rating</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>★ 4.9 / 5.0</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>Top Tier Vendor</div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#092c4c', marginBottom: '14px' }}>
            On-Time Delivery Trend (Past 6 Months)
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={deliveryChartRef}></canvas>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#092c4c', marginBottom: '14px' }}>
            Monthly Procurement Spend (₹ in Lakhs)
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={spendChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* RECENT FULFILLMENT HISTORY */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#092c4c' }}>
            Recent Purchase Order Fulfillment History
          </div>
          <div style={{ fontSize: '12px', color: '#646b72' }}>
            Showing last {poHistory.length} completed purchase orders
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Nunito Sans', sans-serif" }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>PO Number</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Delivery Date</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Items Description</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Timing</th>
                <th style={{ padding: '10px 18px', textAlign: 'center', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {poHistory.map((po) => (
                <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#2e6bc5' }}>{po.id}</td>
                  <td style={{ padding: '12px 18px', color: '#646b72' }}>{po.date}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#092c4c' }}>{po.items}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700 }}>{po.total}</td>
                  <td style={{ padding: '12px 18px', color: '#16a34a', fontWeight: 600 }}>{po.timing}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 700 }}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
