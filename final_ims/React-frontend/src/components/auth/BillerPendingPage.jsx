import React, { useState, useEffect } from 'react';
import { retailerApi } from '../../retailer/api/retailerApi';
import { useAuth } from '../../context/AuthContext';

export default function BillerPendingPage({ onBackToHome, onGoToLogin, onApproved }) {
  const { saveSession, logout } = useAuth();
  const [billerEmail, setBillerEmail] = useState(() => {
    return localStorage.getItem('biller_pending_email') || '';
  });
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [requestDetails, setRequestDetails] = useState(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());

  const checkStatus = async () => {
    if (!billerEmail) return;
    setChecking(true);
    try {
      const requests = await retailerApi.getBillerRequests();
      if (Array.isArray(requests)) {
        const req = requests.find((r) => r.email?.toLowerCase() === billerEmail.toLowerCase());
        if (req) {
          setRequestDetails(req);
          if (req.status === 'approved') {
            setStatus('approved');
            // If approved, trigger callback
            if (onApproved) {
              onApproved(req);
            }
          } else if (req.status === 'rejected') {
            setStatus('rejected');
          } else {
            setStatus('pending');
          }
        }
      }
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Error polling biller status:', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-poll every 3.5 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 3500);
    return () => clearInterval(interval);
  }, [billerEmail]);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#f5f6fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          background: '#ffffff',
          padding: '40px 32px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {status === 'approved' ? (
          <div>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Account Approved!
            </h1>
            <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '14px', marginBottom: '24px' }}>
              Your biller request has been approved by the store retailer! Your account is now active and ready to process store checkout transactions.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onApproved) onApproved(requestDetails);
                  else if (onGoToLogin) onGoToLogin();
                }}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Access POS Billing &rarr;
              </button>
            </div>
          </div>
        ) : status === 'rejected' ? (
          <div>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>
              Request Not Approved
            </h1>
            <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '14px', marginBottom: '24px' }}>
              Your request to join as a store biller was declined by the retailer. Please contact your store manager or apply under another retailer store.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('biller_pending_email');
                  if (onGoToLogin) onGoToLogin();
                }}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go to Login
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('biller_pending_email');
                  if (onBackToHome) onBackToHome();
                }}
                style={{
                  background: '#fff',
                  color: '#2563eb',
                  border: '1px solid #c7d2fe',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1d2e', marginBottom: '14px' }}>
              Account Pending Approval
            </h1>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '14px', marginBottom: '20px' }}>
              Your biller account has been created successfully. The store retailer is currently reviewing your request in their Billers portal. You will be able to access the POS module as soon as the retailer approves your request.
            </p>

            {/* Live Status Badge */}
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Status Check
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.3)',
                    }}
                  ></span>
                  Pending Approval
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#78350f', fontWeight: 600 }}>
                Applicant: <span style={{ fontWeight: 700, color: '#1e293b' }}>{requestDetails?.name || 'Biller Staff'}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#92400e', marginTop: '2px' }}>
                Email: {billerEmail || 'Waiting for submission'}
              </div>
              {requestDetails?.company && (
                <div style={{ fontSize: '12px', color: '#92400e', marginTop: '2px' }}>
                  Store / Outlet: {requestDetails.company}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#a16207', marginTop: '8px', borderTop: '1px dashed #fcd34d', paddingTop: '6px' }}>
                Auto-refreshing live (Last: {lastChecked})
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={checkStatus}
                disabled={checking}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 22px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {checking ? 'Checking...' : '🔄 Check Status Now'}
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  if (onGoToLogin) onGoToLogin();
                }}
                style={{
                  background: '#fff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Go to Login
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onBackToHome) onBackToHome();
                }}
                style={{
                  background: '#fff',
                  color: '#2563eb',
                  border: '1px solid #d8dcff',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
