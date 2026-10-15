/**
 * DossierModal_employee.jsx - Entity Verification Dossier Dialog Modal for Employee
 * Supports document inspection and mandatory rejection deficiency reason logging.
 */

import React, { useState } from 'react';

export default function DossierModal_employee({
  entity,
  onClose,
  onStatusChange,
}) {
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('Missing or expired legal documents.');

  if (!entity) return null;

  const handleConfirmReject = () => {
    onStatusChange(entity.id, 'rejected', rejectReason);
    setShowRejectPrompt(false);
    onClose();
  };

  const handleApprove = () => {
    onStatusChange(entity.id, 'approved', 'All compliance documents verified.');
    onClose();
  };

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
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              <span className={`emp-pill ${entity.type}`}>
                {entity.type.toUpperCase()}
              </span>
              <span className={`emp-pill ${entity.status}`}>
                {entity.status.toUpperCase()}
              </span>
            </div>
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
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Submitted Legal Documents</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {(entity.documents || ['GSTIN Certificate', 'Business Registration']).map((doc, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    📄 {doc} (Verified Format)
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f5f6fa', borderRadius: '8px', padding: '10px 12px', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Auditor &amp; Deficiency Notes</div>
              <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>
                {entity.notes || 'Submitted for compliance onboarding review.'}
              </div>
            </div>
          </div>

          {/* Rejection Prompt Box */}
          {showRejectPrompt && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                State Mandatory Rejection Reason:
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #f87171',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  marginBottom: '8px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="emp-btn"
                  style={{ background: '#fff', border: '1px solid #d1d5db' }}
                  onClick={() => setShowRejectPrompt(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="emp-btn emp-btn-danger"
                  onClick={handleConfirmReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb',
          }}
        >
          <button
            type="button"
            className="emp-btn"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
            onClick={onClose}
          >
            Close Dossier
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {entity.status === 'pending' && !showRejectPrompt && (
              <>
                <button
                  type="button"
                  className="emp-btn emp-btn-danger"
                  onClick={() => setShowRejectPrompt(true)}
                >
                  Reject with Reason
                </button>
                <button
                  type="button"
                  className="emp-btn emp-btn-success"
                  onClick={handleApprove}
                >
                  ✓ Approve Registration
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
