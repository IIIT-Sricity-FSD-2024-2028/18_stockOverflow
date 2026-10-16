/**
 * api_employee.js - Real Backend API Service for React Employee Operations
 * 
 * Directly connects to the NestJS employees endpoints via Vite proxy (/api)
 * or window.IMS_API_BASE_URL (http://localhost:3001/api).
 * Zero mock fallbacks - all operations reflect live backend assignments and tickets.
 */

const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : '/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMsg =
      data && typeof data === 'object'
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || data.error || 'Request failed'
        : String(data || 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

// ─── 1. Employee Dashboard & Statistics ──────────────────────────────────────
export async function fetchEmployeeStats(employeeId) {
  const qs = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  return await apiRequest(`/employees/stats${qs}`);
}

// ─── 2. Verification Assignments (Work Distribution) ──────────────────────────
export async function distributeEmployeeWork() {
  return await apiRequest('/employees/assignments/distribute', {
    method: 'POST',
  });
}

export async function fetchEmployeeAssignments(employeeId, status) {
  const params = new URLSearchParams();
  if (employeeId) params.set('employeeId', employeeId);
  if (status) params.set('status', status);
  const qs = params.toString();
  return await apiRequest(`/employees/assignments${qs ? `?${qs}` : ''}`);
}

export async function fetchEmployeeAssignmentById(id) {
  return await apiRequest(`/employees/assignments/${id}`);
}

export async function resolveEmployeeAssignment(id, { status, rejectionReason, notes }) {
  return await apiRequest(`/employees/assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status, // 'approved' | 'rejected'
      rejectionReason: rejectionReason || undefined,
      notes: notes || undefined,
    }),
  });
}

// ─── 3. Employee Support Helpdesk & Queries ──────────────────────────────────
export async function fetchEmployeeQueries(employeeId, status) {
  const params = new URLSearchParams();
  if (employeeId) params.set('employeeId', employeeId);
  if (status) params.set('status', status);
  const qs = params.toString();
  return await apiRequest(`/employees/queries${qs ? `?${qs}` : ''}`);
}

export async function createEmployeeQuery(queryData) {
  return await apiRequest('/employees/queries', {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
}

export async function resolveEmployeeQuery(id, { status, resolutionNotes }) {
  return await apiRequest(`/employees/queries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status, // 'in_progress' | 'resolved' | 'closed'
      resolutionNotes,
    }),
  });
}

// ─── 4. Aliases for legacy component calls ───────────────────────────────────
export async function fetchValidations(employeeId, status) {
  return await fetchEmployeeAssignments(employeeId, status);
}

export async function fetchEmployeeTasks(employeeId, status) {
  return await fetchEmployeeAssignments(employeeId, status);
}
