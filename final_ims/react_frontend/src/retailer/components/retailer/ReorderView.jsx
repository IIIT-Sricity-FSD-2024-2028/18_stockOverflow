import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function ReorderView({ onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await retailerApi.getProducts(user?.retailerId);
        if (Array.isArray(data)) {
          const mapped = data.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            qty: Number(p.qty || 0),
            min: Number(p.min || 10),
            suggested: Math.max(20, (Number(p.max || 50)) - (Number(p.qty || 0))),
            supplier: p.supplier || 'Primary Supplier',
            leadTime: '3 Days',
            status: Number(p.qty || 0) <= 5 ? 'Critical' : Number(p.qty || 0) <= Number(p.min || 10) ? 'Low Stock' : 'Adequate',
            statusColor: Number(p.qty || 0) <= 5 ? '#ef4444' : Number(p.qty || 0) <= Number(p.min || 10) ? '#f59e0b' : '#22c55e',
          }));
          setProducts(mapped);
        }
      } catch (e) {
        console.error('Failed to load reorder recommendations:', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="content" style={{ padding: '24px 28px 40px', flex: 1, overflow: 'auto', boxSizing: 'border-box' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-.4px', color: '#092c4c', margin: 0 }}>
            Reorder Recommendations
          </h1>
          <p className="page-subtitle" style={{ fontSize: '12.5px', color: '#646b72', marginTop: '3px' }}>
            AI & threshold based inventory replenishment guidance and safety stock buffers
          </p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-section" style={{ background: '#fff', border: '1px solid #e6eaed', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e6eaed' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#092c4c' }}>
            Recommended Purchase Orders ({products.length})
          </div>
          <div style={{ fontSize: '12px', color: '#646b72' }}>
            Updated in real-time from store sales velocity
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8f9fb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Product</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>SKU</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Current Stock</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Min Threshold</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Suggested Qty</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Preferred Supplier</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Lead Time</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Urgency</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#212b36', textTransform: 'uppercase', letterSpacing: '.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e6eaed' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#212b36' }}>{item.name}</td>
                  <td style={{ padding: '12px 16px', color: '#646b72' }}>{item.sku}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: item.qty <= item.min ? '#ef4444' : '#212b36' }}>
                    {item.qty} units
                  </td>
                  <td style={{ padding: '12px 16px', color: '#646b72' }}>{item.min} units</td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2e6bc5' }}>+{item.suggested} units</td>
                  <td style={{ padding: '12px 16px', color: '#212b36', fontWeight: 600 }}>{item.supplier}</td>
                  <td style={{ padding: '12px 16px', color: '#646b72' }}>{item.leadTime}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: item.statusColor === '#ef4444' ? '#fee2e2' : '#fef3c7', color: item.statusColor === '#ef4444' ? '#b91c1c' : '#92400e' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => onNavigate && onNavigate('purchase-orders')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '5px',
                        background: '#2e6bc5',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Create PO
                    </button>
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
