/**
 * QueriesPage_employee.jsx - Employee User Queries & Support Page View
 * 
 * Converted from final_ims/frontend/employee module/employee-queries.html
 */

import React, { useState } from 'react';
import { INITIAL_EMPLOYEE_QUERIES } from '../data/mockData_employee';

export default function QueriesPage_employee() {
  const [queries, setQueries] = useState(INITIAL_EMPLOYEE_QUERIES);
  const [selectedQuery, setSelectedQuery] = useState(INITIAL_EMPLOYEE_QUERIES[0]);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert(`Reply sent to ${selectedQuery.requester}: "${replyText}"`);
    setReplyText('');
  };

  const handleStatusChange = (id, newStatus) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
    if (selectedQuery && selectedQuery.id === id) {
      setSelectedQuery((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="emp-page-title">User Queries &amp; Support Helpdesk</h1>
        <p className="emp-page-subtitle">
          Manage customer questions, retailer B2B inquiries, and supplier coordination tickets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
        {/* Ticket List */}
        <div className="emp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '13px' }}>
            Support Tickets ({queries.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {queries.map((q) => {
              const isSelected = selectedQuery && selectedQuery.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuery(q)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: isSelected ? '#fff6ee' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #4e7fd9' : '4px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#4e7fd9' }}>{q.id}</span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: q.status === 'Open' ? '#fee2e2' : q.status === 'In Progress' ? '#fef3c7' : '#dcfce7',
                        color: q.status === 'Open' ? '#b91c1c' : q.status === 'In Progress' ? '#b45309' : '#15803d',
                        fontWeight: 700,
                      }}
                    >
                      {q.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1d2e', marginBottom: '2px' }}>
                    {q.subject}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                    {q.requester} &bull; {q.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Detail & Reply Thread */}
        {selectedQuery && (
          <div className="emp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#4e7fd9' }}>{selectedQuery.id}</span>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 4px 0' }}>{selectedQuery.subject}</h2>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  From: <strong>{selectedQuery.requester}</strong> ({selectedQuery.email}) &bull; Date: {selectedQuery.date}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedQuery.status}
                  onChange={(e) => handleStatusChange(selectedQuery.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div
              style={{
                background: '#f9fafb',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#374151',
              }}
            >
              {selectedQuery.message}
            </div>

            <form onSubmit={handleSendReply}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>
                Staff Reply
              </label>
              <textarea
                rows={4}
                placeholder="Type response to user..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  marginBottom: '10px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="emp-btn emp-btn-primary">
                  Send Response
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
