/**
 * VerificationActionModal.jsx
 * 
 * Interactive UI Modal for approving or rejecting verification requests
 * for Retailers, Suppliers, and Store activation requests in Employee Dashboard.
 */

import React, { useState, useEffect } from 'react';

const COMMON_REJECTION_REASONS = [
  {
    label: 'Invalid or Missing GSTIN Tax Certificate',
    text: 'GSTIN tax certificate is missing, invalid, or could not be verified on the official registry.',
  },
  {
    label: 'Business Registration Name Mismatch',
    text: 'The submitted trade name does not match the official legal entity records on file.',
  },
  {
    label: 'Unverifiable Physical Premises / Lease Agreement',
    text: 'Store address documentation or commercial lease agreement is illegible or unverifiable.',
  },
  {
    label: 'Incomplete Identity or Contact Verification',
    text: 'Primary business owner identity documentation or direct phone contact verification failed.',
  },
  {
    label: 'Product Catalog / Quality Standards Deficiency',
    text: 'Wholesale product catalog contains insufficient details, missing SKUs, or non-compliant pricing.',
  },
  {
    label: 'Custom Reason...',
    text: '',
  },
];

export default function VerificationActionModal({
  isOpen,
  mode = 'approve', // 'approve' | 'reject'
  entity = null,
  onClose,
  onConfirm,
}) {
  const [remarks, setRemarks] = useState('');
  const [selectedReasonIdx, setSelectedReasonIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorText('');
      setIsSubmitting(false);
      if (mode === 'approve') {
        setRemarks('All business compliance documents and credentials verified successfully.');
      } else {
        setSelectedReasonIdx(0);
        setRemarks(COMMON_REJECTION_REASONS[0].text);
      }
    }
  }, [isOpen, mode, entity]);

  if (!isOpen || !entity) return null;

  const isApprove = mode === 'approve';

  const handleReasonPresetChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedReasonIdx(idx);
    if (idx < COMMON_REJECTION_REASONS.length - 1) {
      setRemarks(COMMON_REJECTION_REASONS[idx].text);
    } else {
      setRemarks('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isApprove && !remarks.trim()) {
      setErrorText('Please specify a rejection reason so the applicant knows what to rectify.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText('');
      await onConfirm(entity.id, isApprove ? 'approved' : 'rejected', remarks.trim());
      onClose();
    } catch (err) {
      setErrorText(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isApprove
              ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)'
              : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: isApprove ? '#d1fae5' : '#fee2e2',
                color: isApprove ? '#059669' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {isApprove ? '✓' : '✕'}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 800,
                  color: isApprove ? '#065f46' : '#991b1b',
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {isApprove ? 'Authorize & Approve Request' : 'Reject Verification Request'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                {isApprove
                  ? 'Approve credentials and unlock dashboard access for this account.'
                  : 'Reject application and provide actionable feedback to the applicant.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto' }}>
          {errorText && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#991b1b',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span>
              <span>{errorText}</span>
            </div>
          )}

          {/* Entity Summary Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {entity.entityName || 'Unnamed Business'}
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '1px' }}>
                  ID: {entity.id}
                </div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: entity.type === 'retailer' ? '#dbeafe' : entity.type === 'supplier' ? '#fef3c7' : '#dcfce7',
                  color: entity.type === 'retailer' ? '#1d4ed8' : entity.type === 'supplier' ? '#b45309' : '#15803d',
                }}
              >
                {entity.type}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Owner: </span>
                <strong style={{ color: '#334155' }}>{entity.owner || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>GSTIN: </span>
                <strong style={{ color: '#334155', fontFamily: 'monospace' }}>{entity.gstin || 'Unspecified'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Email: </span>
                <strong style={{ color: '#334155' }}>{entity.email || entity.contact || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Location: </span>
                <strong style={{ color: '#334155' }}>{entity.location || 'India'}</strong>
              </div>
            </div>
          </div>

          {/* Mode-Specific Inputs */}
          {isApprove ? (
            <div>
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#065f46',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <span>
                  Authorizing this account will set their status to <strong>Active</strong>. The user will immediately be unlocked into their dashboard.
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Approval Notes / Auditor Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. All KYC and GSTIN documents checked against MCA registry."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Select Common Deficiency Reason:
                </label>
                <select
                  value={selectedReasonIdx}
                  onChange={handleReasonPresetChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {COMMON_REJECTION_REASONS.map((r, idx) => (
                    <option key={idx} value={idx}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#991b1b',
                    marginBottom: '6px',
                  }}
                >
                  Deficiency Feedback (Mandatory & Visible to Applicant) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Detail the exact document or information required so the applicant can correct and resubmit..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    fontSize: '12.5px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#fffaf0',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                borderRadius: '8px',
                border: 'none',
                background: isApprove ? '#10b981' : '#ef4444',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isApprove
                  ? '0 2px 10px rgba(16, 185, 129, 0.35)'
                  : '0 2px 10px rgba(239, 68, 68, 0.35)',
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s infinite linear' }}>⟳</span>
                  <span>Processing...</span>
                </>
              ) : isApprove ? (
                <>
                  <span>✓</span>
                  <span>Authorize &amp; Approve</span>
                </>
              ) : (
                <>
                  <span>✕</span>
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
