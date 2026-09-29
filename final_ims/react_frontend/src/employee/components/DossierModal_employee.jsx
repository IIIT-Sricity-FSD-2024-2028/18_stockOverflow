/**
 * DossierModal_employee.jsx - Entity Verification Dossier Dialog Modal for Employee
 */

import React from 'react';

export default function DossierModal_employee({
  entity,
  onClose,
  onStatusChange,
}) {
  if (!entity) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Verification Dossier: {entity.entityName}
            </h3>
            <span className={`emp-pill ${entity.type}`} style={{ marginTop: '4px' }}>
              {entity.type}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
          >
            &times;
          </button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Owner Name</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{entity.owner}</div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Phone Contact</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{entity.contact}</div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{entity.email}</div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Tax GSTIN</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', marginTop: '2px', fontFamily: 'monospace' }}>{entity.gstin}</div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Address / Location</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', marginTop: '2px' }}>{entity.location}</div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Submitted Documents</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {entity.documents.map((doc, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      color: '#374151',
                    }}
                  >
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Auditor Notes</div>
              <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>{entity.notes}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#f9fafb',
          }}
        >
          <button
            type="button"
            className="emp-btn"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="emp-btn emp-btn-danger"
            onClick={() => onStatusChange(entity.id, 'rejected')}
          >
            Reject Registration
          </button>
          <button
            type="button"
            className="emp-btn emp-btn-success"
            onClick={() => onStatusChange(entity.id, 'approved')}
          >
            Approve Registration
          </button>
        </div>
      </div>
    </div>
  );
}
