/**
 * SettingsPage_admin.jsx - Admin Platform Settings Page (Redux connected)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { settingsActions } from '../../store/settings-slice';
import { fetchSettingsData, updateSettingsData } from '../../store/settings-actions';

export default function SettingsPage_admin() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings);
  const loading = useSelector((state) => state.settings.loading);
  const saving = useSelector((state) => state.settings.saving);
  const saved = useSelector((state) => state.settings.saved);
  const error = useSelector((state) => state.settings.error);

  const [form, setForm] = useState(settings);

  useEffect(() => {
    dispatch(fetchSettingsData());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateSettingsData({
          reorderThreshold: Number(form.reorderThreshold) || 10,
          maxOrderQuantity: Number(form.maxOrderQuantity) || 100,
          lowStockAlertEnabled: Boolean(form.lowStockAlertEnabled),
          autoReorderEnabled: Boolean(form.autoReorderEnabled),
          currency: form.currency || 'INR',
          timezone: form.timezone || 'Asia/Kolkata',
        })
      );
      setTimeout(() => dispatch(settingsActions.clearSavedFlag()), 3000);
    } catch {
      // Error is tracked in Redux settings slice
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Settings</h1>
          <p className="admin-page-subtitle">Configure global platform policies, thresholds, and operational modes</p>
        </div>
        {saved && (
          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
            ✅ Settings updated successfully!
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="admin-card" style={{ maxWidth: '640px' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading settings from backend...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Low Stock Reorder Threshold
                </label>
                <input
                  type="number"
                  value={form.reorderThreshold ?? 10}
                  onChange={(e) => setForm({ ...form, reorderThreshold: parseInt(e.target.value, 10) || 0 })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Max Order Quantity
                </label>
                <input
                  type="number"
                  value={form.maxOrderQuantity ?? 100}
                  onChange={(e) => setForm({ ...form, maxOrderQuantity: parseInt(e.target.value, 10) || 0 })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Operating Currency
                </label>
                <input
                  type="text"
                  value={form.currency || 'INR'}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Timezone
                </label>
                <input
                  type="text"
                  value={form.timezone || 'Asia/Kolkata'}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '1rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>Low Stock Alerts</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Notify stores when inventory drops below threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.lowStockAlertEnabled)}
                  onChange={(e) => setForm({ ...form, lowStockAlertEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>Auto-Reorder Enabled</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automatically generate purchase orders for low stock</div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.autoReorderEnabled)}
                  onChange={(e) => setForm({ ...form, autoReorderEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Platform Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
