/**
 * ValidationsPage_employee.jsx - Employee Entity Verification Desk Page View
 * 
 * Features:
 * 1. Filter tabs across entity types and statuses (Pending, Approved, Rejected).
 * 2. Real-time search by entity name, owner, and GSTIN.
 * 3. Approve and Reject state transitions with audit notes.
 * 4. Dossier modal with deep legal document inspection.
 * 5. Dynamic persistence that updates the Employee Dashboard immediately.
 */

import React, { useState, useMemo } from 'react';
import { INITIAL_VALIDATIONS } from '../data/mockData_employee';
import DossierModal_employee from '../components/DossierModal_employee';

export default function ValidationsPage_employee() {
  const [validations, setValidations] = useState(() => {
    try {
      const saved = localStorage.getItem('stockoverflow_employee_validations');
      return saved ? JSON.parse(saved) : INITIAL_VALIDATIONS;
    } catch {
      return INITIAL_VALIDATIONS;
    }
  });

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const persistValidations = (newItems) => {
    setValidations(newItems);
    try {
      localStorage.setItem('stockoverflow_employee_validations', JSON.stringify(newItems));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Could not save validations to localStorage', e);
    }
  };

  const handleResetValidations = () => {
    if (window.confirm('Reset verification queue back to initial demo entities?')) {
      persistValidations(INITIAL_VALIDATIONS);
    }
  };

  const filteredItems = useMemo(() => {
    return validations.filter((item) => {
      const matchesSearch =
        item.entityName.toLowerCase().includes(search.toLowerCase()) ||
        item.owner.toLowerCase().includes(search.toLowerCase()) ||
        (item.gstin && item.gstin.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (['retailer', 'supplier', 'store'].includes(filter)) {
        return item.type === filter;
      }
      if (['pending', 'approved', 'rejected'].includes(filter)) {
        return item.status === filter;
      }
      return true;
    });
  }, [validations, filter, search]);

  const handleStatusChange = (id, newStatus, reason = '') => {
    const updated = validations.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          notes: reason ? reason : item.notes,
          decidedAt: new Date().toISOString(),
          decidedBy: 'Sarah Connor (Compliance Auditor)',
        };
      }
      return item;
    });

    persistValidations(updated);

    if (selectedEntity && selectedEntity.id === id) {
      setSelectedEntity((prev) => ({
        ...prev,
        status: newStatus,
        notes: reason ? reason : prev.notes,
      }));
    }
  };

  const handleQuickReject = (id, name) => {
    const reason = window.prompt(
      `Enter rejection reason for ${name}:`,
      'Invalid tax documentation or missing store lease.'
    );
    if (reason !== null && reason.trim()) {
      handleStatusChange(id, 'rejected', reason.trim());
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="emp-page-title">Entity Verification Desk</h1>
          <p className="emp-page-subtitle">
            Review legal dossiers, verify GSTIN certificates, and approve or reject onboarding registrations.
          </p>
        </div>
        <button
          type="button"
          className="emp-btn"
          style={{ background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db' }}
          onClick={handleResetValidations}
          title="Reset to default verification queue"
        >
          ↻ Reset Queue Data
        </button>
      </div>

      {/* ── Filter Tabs & Search Card ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${validations.length})` },
            { key: 'pending', label: `⏳ Pending (${validations.filter(v => v.status === 'pending').length})` },
            { key: 'retailer', label: 'Retailers' },
            { key: 'supplier', label: 'Suppliers' },
            { key: 'store', label: 'Stores' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                borderRight: '1px solid #e5e7eb',
                cursor: 'pointer',
                background: filter === tab.key ? '#5b67ca' : '#ffffff',
                color: filter === tab.key ? '#ffffff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by name, GSTIN, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '7px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12.5px',
            outline: 'none',
            width: '240px',
          }}
        />
      </div>

      {/* ── Validations Queue Table ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Business Entity
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  GSTIN / Tax ID
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Submitted Date
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    No validation records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background:
                              item.type === 'retailer' ? '#3b82f6' : item.type === 'supplier' ? '#f59e0b' : '#10b981',
                            color: '#ffffff',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                        >
                          {item.entityName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1d2e' }}>{item.entityName}</div>
                          <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                            {item.owner} &bull; {item.location}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`emp-pill ${item.type}`}>{item.type.toUpperCase()}</span>
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#4b5563' }}>
                      {item.gstin || 'PENDING'}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '12px' }}>
                      {item.submittedDate}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`emp-pill ${item.status}`}>{item.status.toUpperCase()}</span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {item.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="emp-btn emp-btn-success"
                              onClick={() => handleStatusChange(item.id, 'approved')}
                              title="Approve entity"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="emp-btn emp-btn-danger"
                              onClick={() => handleQuickReject(item.id, item.entityName)}
                              title="Reject with note"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="emp-btn"
                          style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
                          onClick={() => setSelectedEntity(item)}
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Dossier Modal */}
      <DossierModal_employee
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
