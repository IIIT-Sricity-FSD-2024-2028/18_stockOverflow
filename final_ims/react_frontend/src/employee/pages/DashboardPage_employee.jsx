/**
 * DashboardPage_employee.jsx - Employee Command Center Page View
 * 
 * Converted from final_ims/frontend/employee module/employee-dashboard.html
 */

import React, { useState } from 'react';
import { INITIAL_EMPLOYEE_TASKS } from '../data/mockData_employee';

export default function DashboardPage_employee({ onNavigate }) {
  const [tasks, setTasks] = useState(INITIAL_EMPLOYEE_TASKS);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [clockInTime] = useState('09:00 AM');

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="emp-page-title">Employee Command Center</h1>
          <p className="emp-page-subtitle">
            Daily tasks, shift attendance, validation queues, and operational checks.
          </p>
        </div>

        {/* Shift Status Banner */}
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
            <div style={{ fontSize: '13px', fontWeight: 700 }}>
              {isOnDuty ? 'Shift Status: On Duty' : 'Shift Status: Off Duty'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {isOnDuty ? `Clocked in at ${clockInTime}` : 'Clocked out'}
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
            onClick={() => setIsOnDuty(!isOnDuty)}
          >
            {isOnDuty ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="emp-card" onClick={() => onNavigate('validations')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Validations
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', margin: '4px 0 2px' }}>
            2
          </div>
          <span style={{ fontSize: '11.5px', color: '#f59e0b' }}>Retailer &amp; Store reviews</span>
        </div>

        <div className="emp-card" onClick={() => onNavigate('queries')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Assigned Queries
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#3b82f6', margin: '4px 0 2px' }}>
            3
          </div>
          <span style={{ fontSize: '11.5px', color: '#3b82f6' }}>Open customer &amp; retailer tickets</span>
        </div>

        <div className="emp-card">
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Tasks Completed
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', margin: '4px 0 2px' }}>
            {completedCount} / {tasks.length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#10b981' }}>Daily shift progress</span>
        </div>

        <div className="emp-card">
          <span style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
            Assigned Hub
          </span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1d2e', margin: '6px 0 2px' }}>
            Downtown Store
          </div>
          <span style={{ fontSize: '11.5px', color: '#6b7280' }}>Station: Floor Terminal #2</span>
        </div>
      </div>

      {/* Two Columns: Daily Task Checklist & Quick Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Task Checklist */}
        <div className="emp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Daily Shift Checklist</h3>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {completedCount} of {tasks.length} done
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  background: task.done ? '#f8fafc' : '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  readOnly
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#5b67ca' }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    color: task.done ? '#9ca3af' : '#1a1d2e',
                    textDecoration: task.done ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {task.text}
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#6b7280',
                  }}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operational Actions */}
        <div className="emp-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 1rem 0' }}>Operational Shortcuts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              onClick={() => onNavigate('validations')}
              style={{
                padding: '12px 14px',
                background: '#eef0fd',
                borderRadius: '8px',
                border: '1px solid #c7d2fe',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', color: '#3730a3', display: 'block' }}>
                  Entity Verification Queue
                </strong>
                <span style={{ fontSize: '11.5px', color: '#4f46e5' }}>
                  Review submitted GSTINs, licenses, and store documents
                </span>
              </div>
              <span style={{ fontSize: '18px', color: '#4f46e5' }}>→</span>
            </div>

            <div
              onClick={() => onNavigate('queries')}
              style={{
                padding: '12px 14px',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', color: '#1e40af', display: 'block' }}>
                  User Helpdesk &amp; Queries
                </strong>
                <span style={{ fontSize: '11.5px', color: '#2563eb' }}>
                  Resolve customer reservation questions &amp; B2B invoice requests
                </span>
              </div>
              <span style={{ fontSize: '18px', color: '#2563eb' }}>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
