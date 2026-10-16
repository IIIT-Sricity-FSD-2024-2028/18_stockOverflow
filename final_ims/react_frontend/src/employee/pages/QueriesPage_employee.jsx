/**
 * QueriesPage_employee.jsx - Employee User Queries & Support Helpdesk
 * 
 * Connected to live backend endpoints (/api/employees/queries)
 * Zero mock fallbacks - all operations reflect live customer and supplier tickets.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEmployeeQueries, resolveEmployeeQuery } from '../utils/api_employee';

function mapBackendQuery(q) {
  const statusStr =
    q.status === 'in_progress' ? 'In Progress' :
    q.status === 'resolved' ? 'Resolved' :
    'Open';

  const priorityStr =
    q.priority ? (q.priority.charAt(0).toUpperCase() + q.priority.slice(1)) : 'Medium';

  return {
    id: q.id,
    requester: q.userName || q.userEmail || 'Support Client',
    email: q.userEmail || '-',
    category: q.userRole ? (q.userRole.charAt(0).toUpperCase() + q.userRole.slice(1)) : 'Support Inquiry',
    subject: q.subject || 'Support Ticket',
    priority: priorityStr,
    status: statusStr,
    backendStatus: q.status || 'pending',
    message: q.message || '',
    date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Today',
    replies: q.response
      ? [
          {
            sender: q.assignedEmployeeName || 'Support Agent (Sarah Connor)',
            message: q.response,
            timestamp: q.resolvedAt ? new Date(q.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          },
        ]
      : [],
  };
}

export default function QueriesPage_employee() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadQueries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployeeQueries();
      const list = Array.isArray(data) ? data.map(mapBackendQuery) : [];
      setQueries(list);
      if (list.length > 0 && !selectedQueryId) {
        setSelectedQueryId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load employee queries:', err);
      setError(err.message || 'Failed to load support queries from backend');
    } finally {
      setLoading(false);
    }
  }, [selectedQueryId]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  // Filter queries based on status tab
  const filteredQueries = useMemo(() => {
    if (filterTab === 'all') return queries;
    return queries.filter((q) => q.status.toLowerCase() === filterTab.toLowerCase());
  }, [queries, filterTab]);

  const selectedQuery = queries.find((q) => q.id === selectedQueryId) || filteredQueries[0] || queries[0];

  const handleStatusChange = async (id, newStatusStr) => {
    const backendStatus =
      newStatusStr === 'In Progress' ? 'in_progress' :
      newStatusStr === 'Resolved' ? 'resolved' :
      'pending';

    try {
      await resolveEmployeeQuery(id, { status: backendStatus });
      await loadQueries();
    } catch (err) {
      alert(`Error updating ticket status: ${err.message}`);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;

    try {
      setSending(true);
      await resolveEmployeeQuery(selectedQuery.id, {
        status: 'resolved',
        resolutionNotes: replyText.trim(),
      });
      alert(`Reply sent and ticket resolved: "${replyText.trim()}"`);
      setReplyText('');
      await loadQueries();
    } catch (err) {
      alert(`Error sending ticket reply: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="emp-page-title">User Queries &amp; Support Helpdesk</h1>
          <p className="emp-page-subtitle">
            Provide direct resolution to retailer catalog issues, supplier fulfillment delays, and consumer returns live from backend.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="emp-btn emp-btn-outline"
            onClick={loadQueries}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Tickets'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Queries' },
          { id: 'open', label: 'Open' },
          { id: 'in progress', label: 'In Progress' },
          { id: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterTab === tab.id ? '1px solid #2563eb' : '1px solid #e5e7eb',
              background: filterTab === tab.id ? '#eff6ff' : '#ffffff',
              color: filterTab === tab.id ? '#2563eb' : '#6b7280',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && queries.length === 0 ? (
        <div className="emp-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>
          Loading support tickets live from backend...
        </div>
      ) : queries.length === 0 ? (
        <div className="emp-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>
          No support tickets created yet. When retailers, suppliers, or consumers submit queries via "Contact Support", they will appear here in real time.
        </div>
      ) : (
        /* ── Split-Screen Layout ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: '1.25rem' }}>
          {/* Left: Query List */}
          <div className="emp-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '13px' }}>
              Ticket Queue ({filteredQueries.length})
            </div>

            <div style={{ maxHeight: '620px', overflowY: 'auto' }}>
              {filteredQueries.map((q) => {
                const isSelected = selectedQuery && selectedQuery.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQueryId(q.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#6b7280' }}>
                        {q.id}
                      </span>
                      <span className={`emp-pill ${q.status.toLowerCase().replace(' ', '-')}`}>
                        {q.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1d2e', marginBottom: '2px' }}>
                      {q.subject}
                    </div>

                    <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '6px' }}>
                      {q.requester} &bull; <span style={{ color: '#9ca3af' }}>{q.category}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af' }}>
                      <span>Priority: <strong style={{ color: q.priority === 'High' ? '#ef4444' : '#f59e0b' }}>{q.priority}</strong></span>
                      <span>{q.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Ticket Detail & Chat View */}
          {selectedQuery ? (
            <div className="emp-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Ticket Topbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7280', fontWeight: 700 }}>
                      {selectedQuery.id}
                    </span>
                    <span className={`emp-pill ${selectedQuery.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedQuery.status}
                    </span>
                    <span className="emp-pill in-review">
                      {selectedQuery.category}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1d2e', margin: 0 }}>
                    {selectedQuery.subject}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Requester: <strong>{selectedQuery.requester}</strong> ({selectedQuery.email})
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <select
                  value={selectedQuery.status}
                  onChange={(e) => handleStatusChange(selectedQuery.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Resolved">Status: Resolved</option>
                </select>
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minHeight: '200px' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '14px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Initial Client Description
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#1e293b' }}>
                    {selectedQuery.message}
                  </p>
                </div>

                {/* Conversation Thread */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Staff Updates &amp; Conversation Thread ({selectedQuery.replies.length})
                  </div>

                  {selectedQuery.replies.length === 0 ? (
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                      No staff responses logged yet. Type your answer below to reply and resolve.
                    </div>
                  ) : (
                    selectedQuery.replies.map((reply, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#15803d', fontWeight: 700, marginBottom: '4px' }}>
                          <span>{reply.sender}</span>
                          <span>{reply.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#14532d' }}>
                          {reply.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Post Official Staff Response
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply or resolution explanation here..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="submit"
                    className="emp-btn emp-btn-primary"
                    disabled={sending || !replyText.trim()}
                  >
                    {sending ? 'Sending...' : 'Send Staff Reply & Resolve'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="emp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              Select a query from the list to inspect details and send responses.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
