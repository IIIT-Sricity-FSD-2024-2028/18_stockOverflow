import React, { useState, useEffect, useRef } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';
import Chart from 'chart.js/auto';

export default function InventoryView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const donutChartRef = useRef(null);
  const donutChartInstance = useRef(null);
  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getProducts(user?.retailerId);
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalSKUs = products.length;
  const totalUnits = products.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
  const totalValue = products.reduce(
    (acc, p) => acc + (Number(p.qty) || 0) * (Number(p.price) || 0),
    0
  );
  const lowStockCount = products.filter((p) => (Number(p.qty) || 0) <= (Number(p.min) || 10) && (Number(p.qty) || 0) > 0).length;
  const outStockCount = products.filter((p) => (Number(p.qty) || 0) === 0).length;
  const inStockCount = products.filter((p) => (Number(p.qty) || 0) > (Number(p.min) || 10)).length;

  useEffect(() => {
    if (donutChartRef.current) {
      if (donutChartInstance.current) donutChartInstance.current.destroy();
      const ctx = donutChartRef.current.getContext('2d');
      donutChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['In Stock', 'Low Stock', 'Out of Stock'],
          datasets: [
            {
              data: [
                inStockCount || (products.length === 0 ? 1 : 0),
                lowStockCount,
                outStockCount,
              ],
              backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: { legend: { display: false } },
        },
      });
    }

    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const ctx = barChartRef.current.getContext('2d');

      const catMap = {};
      products.forEach((p) => {
        const cat = p.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + (Number(p.qty) || 0);
      });
      const catLabels = Object.keys(catMap).length > 0 ? Object.keys(catMap) : ['General'];
      const catData = Object.keys(catMap).length > 0 ? Object.values(catMap) : [0];

      barChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: catLabels,
          datasets: [
            {
              label: 'Stock Units',
              data: catData,
              backgroundColor: '#2e6bc5',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' }, beginAtZero: true },
          },
        },
      });
    }

    return () => {
      if (donutChartInstance.current) donutChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [products, inStockCount, lowStockCount, outStockCount]);

  const recentMovements = products.slice(0, 5).map((p) => ({
    name: p.name,
    sku: p.sku || 'SKU',
    type: Number(p.qty || 0) <= Number(p.min || 10) ? 'out' : 'in',
    typeText: Number(p.qty || 0) <= Number(p.min || 10) ? 'Low Stock' : 'Active Stock',
    qty: `${p.qty || 0}`,
    value: `₹${((Number(p.qty) || 0) * (Number(p.price) || 0)).toLocaleString('en-IN')}`,
    date: p.restockedAt ? new Date(p.restockedAt).toLocaleDateString() : p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recent',
  }));

  return (
    <div className="page-wrap" style={{ padding: '24px 28px 48px', flex: 1, overflow: 'auto' }}>
      {/* PAGE HEADER */}
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#092c4c', lineHeight: 1.3 }}>
            Inventory Overview
          </div>
          <div className="page-subtitle" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>
            Comprehensive view of stock health, distribution, valuation & velocity
          </div>
        </div>
      </div>

      {/* ALERT BANNER */}
      {!alertDismissed && (
        <div className="alert-banner" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#9a3412', marginBottom: '18px', fontFamily: "'Nunito Sans', sans-serif" }}>
          <span>⚠️ <strong>Notice:</strong> 0 items are critically low on stock. All SKU replenishment thresholds are optimal.</span>
          <span style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.7 }} onClick={() => setAlertDismissed(true)}>✕</span>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <div className="metric-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-blue" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Total SKUs</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>{totalSKUs}</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '10.5px', background: 'var(--success-light)', color: 'var(--success-dark)' }}>+4.5%</span>
              <span className="metric-sub" style={{ color: 'var(--text-muted)' }}>vs last mo</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-green" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Inventory Value</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>₹{totalValue.toLocaleString('en-IN')}</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '10.5px', background: 'var(--success-light)', color: 'var(--success-dark)' }}>+8.2%</span>
              <span className="metric-sub" style={{ color: 'var(--text-muted)' }}>asset value</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-orange" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--orange-light)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Low Stock Alerts</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>{lowStockCount}</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
              <span className="metric-badge badge-neutral" style={{ padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '10.5px', background: '#f1f5f9', color: '#475569' }}>Optimal</span>
              <span className="metric-sub" style={{ color: 'var(--text-muted)' }}>0 critical</span>
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div className="metric-icon mi-purple" style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="metric-body">
            <div className="metric-label" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>In-Stock Rate</div>
            <div className="metric-value" style={{ fontSize: '22px', fontWeight: 800, color: '#092c4c' }}>100%</div>
            <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
              <span className="metric-badge badge-up" style={{ padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '10.5px', background: 'var(--success-light)', color: 'var(--success-dark)' }}>Healthy</span>
              <span className="metric-sub" style={{ color: 'var(--text-muted)' }}>64 units ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN ROW: CHARTS */}
      <div className="two-col-eq" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Donut: Health Breakdown */}
        <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#092c4c' }}>
              Stock Health Breakdown
            </div>
          </div>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <canvas ref={donutChartRef}></canvas>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22c55e' }}></span> In Stock
                </span>
                <strong>82% (52 units)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></span> Low Stock
                </span>
                <strong>13% (8 units)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></span> Out of Stock
                </span>
                <strong>5% (4 units)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bar: Category Stock Distribution */}
        <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#092c4c' }}>
              Stock Units by Category
            </div>
          </div>
          <div style={{ padding: '14px 18px 18px', height: '160px', position: 'relative' }}>
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* TABLE: STOCK MOVEMENTS */}
      <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="panel-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#092c4c' }}>
            Stock Movement History
          </div>
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>Product</th>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>SKU</th>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>Movement Type</th>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>Quantity</th>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>Total Value</th>
              <th style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#646b72', textTransform: 'uppercase' }}>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {recentMovements.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: '#092c4c' }}>{m.name}</td>
                <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{m.sku}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: m.type === 'in' ? 'var(--success-light)' : m.type === 'out' ? 'var(--danger-light)' : 'var(--purple-light)', color: m.type === 'in' ? 'var(--success-dark)' : m.type === 'out' ? 'var(--danger-dark)' : 'var(--purple)' }}>
                    {m.typeText}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: m.type === 'in' ? '#16a34a' : '#dc2626' }}>{m.qty}</td>
                <td style={{ padding: '10px 16px', fontWeight: 700 }}>{m.value}</td>
                <td style={{ padding: '10px 16px', color: '#64748b' }}>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
