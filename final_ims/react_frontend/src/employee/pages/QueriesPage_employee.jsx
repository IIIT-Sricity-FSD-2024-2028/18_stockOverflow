/**
 * QueriesPage_employee.jsx - Employee User Queries & Support Helpdesk
 * 
 * Features:
 * 1. Multi-tab filtering (All, Open, In Progress, Resolved).
 * 2. Real-time ticket status updating.
 * 3. Threaded message conversation with staff reply appending.
 * 4. Dynamic persistence updating the Employee Dashboard live.
 */

import React, { useState, useMemo } from 'react';
import { INITIAL_EMPLOYEE_QUERIES } from '../data/mockData_employee';

export default function QueriesPage_employee() {
  const [queries, setQueries] = useState(() => {
    try {
      const saved = localStorage.getItem('stockoverflow_employee_queries');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEE_QUERIES;
    } catch {
      return INITIAL_EMPLOYEE_QUERIES;
    }
  });

  const [selectedQueryId, setSelectedQueryId] = useState(() => {
    try {
      const saved = localStorage.getItem('stockoverflow_employee_queries');
      const list = saved ? JSON.parse(saved) : INITIAL_EMPLOYEE_QUERIES;
      return list[0]?.id || 'TKT-401';
    } catch {
      return 'TKT-401';
    }
  });

  const [filterTab, setFilterTab] = useState('all');
  const [replyText, setReplyText] = useState('');

  const persistQueries = (updated) => {
    setQueries(updated);
    try {
      localStorage.setItem('stockoverflow_employee_queries', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Could not save queries to localStorage', e);
    }
  };

  const handleResetQueries = () => {
    if (window.confirm('Reset support tickets back to initial demo queue?')) {
      persistQueries(INITIAL_EMPLOYEE_QUERIES);
      setSelectedQueryId(INITIAL_EMPLOYEE_QUERIES[0].id);
    }
  };

  // Filter queries based on status tab
  const filteredQueries = useMemo(() => {
    if (filterTab === 'all') return queries;
    return queries.filter((q) => q.status.toLowerCase() === filterTab.toLowerCase());
  }, [queries, filterTab]);

  const selectedQuery = queries.find((q) => q.id === selectedQueryId) || filteredQueries[0] || queries[0];

  const handleStatusChange = (id, newStatus) => {
    const updated = queries.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    persistQueries(updated);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;

    const newReply = {
      sender: 'Sarah Connor (Support Agent)',
      message: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = queries.map((q) => {
      if (q.id === selectedQuery.id) {
        const existingReplies = q.replies || [];
        return {
          ...q,
          replies: [...existingReplies, newReply],
          status: q.status === 'Open' ? 'In Progress' : q.status,
        };
      }
      return q;
    });

    persistQueries(updated);
    alert(`Reply sent to ${selectedQuery.requester}: "${replyText}"`);
    setReplyText('');
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="emp-page-title">User Queries &amp; Support Helpdesk</h1>
          <p className="emp-page-subtitle">
            Manage customer questions, retailer B2B inquiries, and supplier coordination tickets.
          </p>
        </div>
        <button
          type="button"
          className="emp-btn"
          style={{ background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db' }}
          onClick={handleResetQueries}
          title="Reset to default queries queue"
        >
          ↻ Reset Tickets Data
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
        {[
          { key: 'all', label: `All Tickets (${queries.length})` },
          { key: 'open', label: `Open (${queries.filter(q => q.status === 'Open').length})` },
          { key: 'in progress', label: `In Progress (${queries.filter(q => q.status === 'In Progress').length})` },
          { key: 'resolved', label: `Resolved (${queries.filter(q => q.status === 'Resolved').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterTab === tab.key ? '1px solid #4e7fd9' : '1px solid #e5e7eb',
              background: filterTab === tab.key ? '#eff6ff' : '#ffffff',
              color: filterTab === tab.key ? '#2563eb' : '#6b7280',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Split-Pane Support Helpdesk ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.25rem' }}>
        {/* Left Pane: Ticket List */}
        <div className="emp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '13px', background: '#f9fafb' }}>
            Inquiry Tickets ({filteredQueries.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '580px', overflowY: 'auto' }}>
            {filteredQueries.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '12.5px' }}>
                No tickets matching this filter.
              </div>
            ) : (
              filteredQueries.map((q) => {
                const isSelected = selectedQuery && selectedQuery.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQueryId(q.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb' }}>{q.id}</span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: q.status === 'Open' ? '#fee2e2' : q.status === 'In Progress' ? '#fef3c7' : '#dcfce7',
                          color: q.status === 'Open' ? '#b91c1c' : q.status === 'In Progress' ? '#b45309' : '#15803d',
                          fontWeight: 700,
                        }}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                      {q.subject}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {q.requester} &bull; <span style={{ textTransform: 'capitalize' }}>{q.type}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Ticket Detail & Thread */}
        {selectedQuery ? (
          <div className="emp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb' }}>{selectedQuery.id}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 6px 0', color: '#0f172a' }}>
                  {selectedQuery.subject}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Requester: <strong>{selectedQuery.requester}</strong> ({selectedQuery.email}) &bull; Date: {selectedQuery.date}
                </span>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Status:</span>
                <select
                  value={selectedQuery.status}
                  onChange={(e) => handleStatusChange(selectedQuery.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Original Inquirer Message */}
            <div
              style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                Inquiry Description:
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#1e293b' }}>
                {selectedQuery.message}
              </div>
            </div>

            {/* Conversation Thread / Staff Replies */}
            {selectedQuery.replies && selectedQuery.replies.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Staff Responses ({selectedQuery.replies.length}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedQuery.replies.map((reply, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '12px 14px',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '12px', color: '#1e40af' }}>{reply.sender}</strong>
                        <span style={{ fontSize: '11px', color: '#60a5fa' }}>{reply.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e3a8a' }}>{reply.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Reply Form */}
            <form onSubmit={handleSendReply}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Official Staff Response
              </label>
              <textarea
                rows={4}
                placeholder="Type response to inquirer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  marginBottom: '10px',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  Sending a response will automatically set ticket to <strong>In Progress</strong>.
                </span>
                <button type="submit" className="emp-btn emp-btn-primary">
                  Send Response →
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="emp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Select a ticket from the left list to view inquiry details.
          </div>
        )}
      </div>
    </div>
  );
}
