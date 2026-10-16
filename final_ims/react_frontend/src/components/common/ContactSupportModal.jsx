import React, { useState } from 'react';

/**
 * ContactSupportModal.jsx - Cross-Module Support Helpdesk Modal
 * 
 * Allows Consumers, Retailers, and Suppliers to submit live support queries/tickets
 * directly into the NestJS backend (/api/employees/queries).
 * The assigned employee immediately sees this ticket in the Employee Desk.
 */
export default function ContactSupportModal({ isOpen, onClose, userRole = 'consumer', defaultUser = null }) {
  const [userName, setUserName] = useState(defaultUser?.name || '');
  const [userEmail, setUserEmail] = useState(defaultUser?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTicketId, setSuccessTicketId] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim() || !userEmail.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a ticket subject.');
      return;
    }
    if (!message.trim()) {
      setError('Please explain your issue or question.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employees/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: defaultUser?.id || undefined,
          userName: userName.trim(),
          userEmail: userEmail.trim().toLowerCase(),
          userRole: userRole.toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          priority: priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit support query');
      }

      const created = await res.json();
      setSuccessTicketId(created.id || 'TKT-' + Math.floor(100 + Math.random() * 900));
    } catch (err) {
      setError(err.message || 'Network error submitting ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubject('');
    setMessage('');
    setError('');
    setSuccessTicketId(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬</span> Contact Employee Support
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Direct line to StockOverflow staff &amp; operations desk
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {successTicketId ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                ✓
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#0f172a' }}>
                Ticket Submitted Successfully!
              </h4>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.9rem' }}>
                Your query has been assigned to our operations desk. Reference ID:
              </p>
              <div
                style={{
                  display: 'inline-block',
                  background: '#f1f5f9',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: '#2563eb',
                  fontSize: '1rem',
                  marginBottom: '20px',
                }}
              >
                {successTicketId}
              </div>
              <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#94a3b8' }}>
                An employee will inspect and reply shortly.
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Full Name"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. In-store pickup question / stock inquiry"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
