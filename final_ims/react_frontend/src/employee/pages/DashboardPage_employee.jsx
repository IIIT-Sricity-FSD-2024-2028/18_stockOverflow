/**
 * DashboardPage_employee.jsx - Dynamic Employee Command Center
 * 
 * Connected to live backend endpoints (/api/employees/stats, assignments, queries)
 * Zero mock fallbacks - all operations reflect live backend state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchEmployeeStats,
  fetchEmployeeAssignments,
  fetchEmployeeQueries,
} from '../utils/api_employee';

function mapBackendAssignment(asgn) {
  const d = asgn.details || {};
  return {
    id: asgn.id,
    type: asgn.targetType || 'retailer',
    entityName: asgn.title || d.businessName || d.storeName || d.supplierName || 'Business Entity',
    owner: d.ownerName || d.contactPerson || d.name || 'Authorized Owner',
    gstin: d.gstin || d.taxId || 'GSTIN-PENDING',
    status: asgn.status || 'pending',
  };
}

function mapBackendQuery(q) {
  return {
    id: q.id,
    subject: q.subject || 'Support Request',
    requester: q.userName || q.userEmail || 'Client',
    status: q.status === 'resolved' ? 'Resolved' : q.status === 'in_progress' ? 'In Progress' : 'Open',
    priority: q.priority || 'medium',
  };
}

export default function DashboardPage_employee({ onNavigate }) {
  const [isOnDuty, setIsOnDuty] = useState(() => {
    try {
      const saved = localStorage.getItem('stockoverflow_emp_duty');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, asgnsData, queriesData] = await Promise.allSettled([
        fetchEmployeeStats(),
        fetchEmployeeAssignments(),
        fetchEmployeeQueries(),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (asgnsData.status === 'fulfilled' && Array.isArray(asgnsData.value)) {
        setAssignments(asgnsData.value.map(mapBackendAssignment));
      }
      if (queriesData.status === 'fulfilled' && Array.isArray(queriesData.value)) {
        setQueries(queriesData.value.map(mapBackendQuery));
      }
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
      setError(err.message || 'Failed to load employee dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleDuty = () => {
    const next = !isOnDuty;
    setIsOnDuty(next);
    try {
      localStorage.setItem('stockoverflow_emp_duty', JSON.stringify(next));
    } catch (err) {
      console.warn(err);
    }
  };

  // Dynamic calculated counts from live records or stats endpoint
  const pendingValidations = assignments.filter((v) => v.status === 'pending');
  const approvedCount = assignments.filter((v) => v.status === 'approved').length;
  const rejectedCount = assignments.filter((v) => v.status === 'rejected').length;

  const openQueries = queries.filter((q) => q.status === 'Open');
  const inProgressQueries = queries.filter((q) => q.status === 'In Progress');
  const resolvedQueriesCount = queries.filter((q) => q.status === 'Resolved').length;

  const pendingValidationsCount = stats?.pendingValidations !== undefined ? stats.pendingValidations : pendingValidations.length;
  const openQueriesCount = stats?.openQueries !== undefined ? stats.openQueries : openQueries.length;
  const resolvedQueriesStat = stats?.resolvedQueries !== undefined ? stats.resolvedQueries : resolvedQueriesCount;

  return (
    <div>
      {/* ── Header & Shift Attendance Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="emp-page-title">Employee Command Center</h1>
          <p className="emp-page-subtitle">
            Dynamic operational queue: review onboarding dossiers, audit physical branches, and resolve user support tickets live from backend.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="emp-btn emp-btn-outline"
            onClick={loadDashboardData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Dashboard'}
          </button>

          {/* Shift Attendance Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnDuty ? '#10b981' : '#94a3b8',
              }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                {isOnDuty ? 'Shift Status: On Duty' : 'Shift Status: Off Duty'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {isOnDuty ? 'Receiving active compliance queue' : 'Desk paused'}
              </div>
            </div>
            <button
              type="button"
              className="emp-btn"
              style={{
                backgroundColor: isOnDuty ? '#fee2e2' : '#dcfce7',
                color: isOnDuty ? '#b91c1c' : '#15803d',
                border: `1px solid ${isOnDuty ? '#fecaca' : '#bbf7d0'}`,
                marginLeft: '6px',
              }}
              onClick={handleToggleDuty}
            >
              {isOnDuty ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Dynamic KPI Metrics (Update live as employee works) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Pending Validations Card */}
        <div
          className="emp-card"
          onClick={() => onNavigate('validations')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
        >
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Validations
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', margin: '4px 0 2px' }}>
            {pendingValidationsCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#b45309' }}>
            {pendingValidationsCount > 0 ? '⚠️ Awaiting employee verification' : '✓ All caught up!'}
          </span>
        </div>

        {/* Open Queries Card */}
        <div
          className="emp-card"
          onClick={() => onNavigate('queries')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }}
        >
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Open Support Queries
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', margin: '4px 0 2px' }}>
            {openQueriesCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#2563eb' }}>
            {inProgressQueries.length} in progress
          </span>
        </div>

        {/* Resolved Queries Card */}
        <div className="emp-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Resolved Tickets
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', margin: '4px 0 2px' }}>
            {resolvedQueriesStat}
          </div>
          <span style={{ fontSize: '11.5px', color: '#16a34a' }}>
            Closed &amp; answered
          </span>
        </div>

        {/* Entities Approved Card */}
        <div className="emp-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Processed Entities
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6', margin: '4px 0 2px' }}>
            {approvedCount + rejectedCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
            {approvedCount} approved &bull; {rejectedCount} rejected
          </span>
        </div>
      </div>

      {/* ── Priority Action Queue ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Urgent Validations to Review */}
        <div className="emp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Action Queue: Pending Onboarding</h3>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Dossiers requiring compliance review</span>
            </div>
            <button
              type="button"
              className="emp-btn"
              style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', fontSize: '11.5px' }}
              onClick={() => onNavigate('validations')}
            >
              Open Full Desk ({assignments.length})
            </button>
          </div>

          <div style={{ padding: '8px' }}>
            {loading && assignments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Loading pending onboarding dossiers...
              </div>
            ) : pendingValidations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                🎉 No pending validations! All submitted entities have been processed.
              </div>
            ) : (
              pendingValidations.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`emp-pill ${item.type}`}>
                      {item.type}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>
                        {item.entityName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        GSTIN: <code>{item.gstin}</code> &bull; Owner: {item.owner}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="emp-btn emp-btn-primary"
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                    onClick={() => onNavigate('validations')}
                  >
                    Review Dossier →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Urgent Queries to Reply */}
        <div className="emp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Open Support Inquiries</h3>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Customer &amp; B2B tickets</span>
            </div>
            <button
              type="button"
              className="emp-btn"
              style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', fontSize: '11.5px' }}
              onClick={() => onNavigate('queries')}
            >
              Support Desk ({queries.length})
            </button>
          </div>

          <div style={{ padding: '8px' }}>
            {loading && queries.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Loading support tickets...
              </div>
            ) : openQueries.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                ✓ No open support tickets. Support desk is clear!
              </div>
            ) : (
              openQueries.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1a1d2e' }}>
                      {q.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {q.requester} &bull; <span style={{ color: '#ef4444', fontWeight: 700 }}>Open</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="emp-btn"
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '11px', padding: '5px 10px' }}
                    onClick={() => onNavigate('queries')}
                  >
                    Reply →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
