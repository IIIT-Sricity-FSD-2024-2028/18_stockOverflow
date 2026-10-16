import React, { useState, useEffect } from 'react';

/**
 * VerificationPendingPage.jsx - React port of verification-pending.html
 * 
 * Displayed when an unverified Retailer or Supplier logs in.
 * Shows 'Pending Review' or 'Rejected' (with employee rejection reason).
 */
export default function VerificationPendingPage({ user, onRefreshUser, onLogout, onNavigate }) {
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(user || {});
  const [rejectionReason, setRejectionReason] = useState(
    user?.profile?.rejectionReason || user?.rejectionReason || ''
  );
  const [status, setStatus] = useState(
    user?.profile?.profileStatus || user?.status || 'pending'
  );

  useEffect(() => {
    if (user) {
      setUserData(user);
      const st = user?.profile?.profileStatus || user?.status || 'pending';
      setStatus(st);
      setRejectionReason(user?.profile?.rejectionReason || user?.rejectionReason || '');
    }
  }, [user]);

  const isRejected = String(status).toLowerCase() === 'rejected';

  const checkStatus = async () => {
    setChecking(true);
    try {
      if (onRefreshUser) {
        const updated = await onRefreshUser();
        if (updated) {
          setUserData(updated);
          const st = updated?.profile?.profileStatus || updated?.status || 'pending';
          setStatus(st);
          setRejectionReason(updated?.profile?.rejectionReason || updated?.rejectionReason || '');
          if (String(st).toLowerCase() === 'active') {
            // Unlocked!
            window.location.reload();
          }
        }
      } else if (userData?.id) {
        const res = await fetch(`/api/users/${userData.id}`);
        if (res.ok) {
          const fresh = await res.json();
          setUserData(fresh);
          const st = fresh?.profile?.profileStatus || fresh?.status || 'pending';
          setStatus(st);
          setRejectionReason(fresh?.profile?.rejectionReason || fresh?.rejectionReason || '');
          if (String(st).toLowerCase() === 'active') {
            window.location.reload();
          }
        }
      }
    } catch (err) {
      console.warn('Failed to check status:', err);
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: '#f5f6fa',
      color: '#1a1d2e',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '44px 36px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        textAlign: 'center',
        maxWidth: '520px',
        width: '100%',
        border: '1px solid #e5e7eb',
      }}>
        {/* Status Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: isRejected ? '#fee2e2' : '#fef3c7',
          color: isRejected ? '#ef4444' : '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 20px',
        }}>
          {isRejected ? '✕' : '⏳'}
        </div>

        {/* Status Heading */}
        <h1 style={{ fontSize: '23px', fontWeight: 700, margin: '0 0 12px' }}>
          {isRejected ? 'Registration Rejected' : 'Verification in Progress'}
        </h1>

        {/* Status Message */}
        <p style={{ color: '#6b7280', lineHeight: 1.6, fontSize: '14px', margin: '0 0 24px' }}>
          {isRejected
            ? 'Unfortunately, your business registration could not be verified. Please review the reason below and contact support if needed.'
            : 'Your account and business details have been submitted and assigned to an employee for validation. Access to your dashboard will be unlocked once approved.'}
        </p>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 16px',
          textAlign: 'left',
          fontSize: '13px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Account Name</span>
            <span style={{ color: '#1e293b', fontWeight: 700 }}>{userData.name || 'User'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Registered Email</span>
            <span style={{ color: '#1e293b', fontWeight: 700 }}>{userData.email || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Account Role</span>
            <span style={{ color: '#1e293b', fontWeight: 700, textTransform: 'capitalize' }}>
              {userData.role || 'Business'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Current Status</span>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              backgroundColor: isRejected ? '#fee2e2' : '#fef3c7',
              color: isRejected ? '#b91c1c' : '#b45309',
            }}>
              {isRejected ? 'Rejected' : 'Pending Review'}
            </span>
          </div>
        </div>

        {/* Rejection Box */}
        {isRejected && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1.5px solid #fca5a5',
            borderRadius: '14px',
            padding: '18px 20px',
            textAlign: 'left',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                ✕
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#b91c1c' }}>
                  Reason for Rejection
                </div>
                <div style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '2px' }}>
                  From the StockOverflow Verification Team
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '13.5px',
              color: '#7f1d1d',
              lineHeight: 1.65,
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              padding: '10px 14px',
              fontStyle: 'italic',
              borderLeft: '3px solid #ef4444',
            }}>
              {rejectionReason || 'Business documents or details did not meet our verification requirements.'}
            </div>
            <div style={{ fontSize: '12px', color: '#9f1239', marginTop: '10px' }}>
              You may re-register with corrected business details or contact employee support.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={checkStatus}
            disabled={checking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#5b67ca',
              color: '#ffffff',
              padding: '11px 24px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: checking ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking ? 'Checking...' : 'Check Status Again'}
          </button>

          {isRejected && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                border: '1px solid #fca5a5',
                padding: '11px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Re-Register
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('landing');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              color: '#5b67ca',
              border: '1px solid #d8dcff',
              padding: '11px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>

          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              else if (onNavigate) onNavigate('login');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '11px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
