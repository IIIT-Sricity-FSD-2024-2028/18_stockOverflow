/**
 * api_employee.js - HTTP client for Employee Backend API (/api/employees/*)
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

export async function fetchEmployeeStats(employeeId) {
  const qs = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  return await apiRequest(`/employees/stats${qs}`);
}

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

export async function resolveEmployeeAssignment(id, { action, status, rejectionReason, notes }) {
  const resolvedAction =
    action || (status === 'approved' || status === 'active' ? 'approve' : 'reject');
  const resolvedNotes = notes || rejectionReason || '';
  return await apiRequest(`/employees/assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: resolvedAction,
      notes: resolvedNotes || undefined,
    }),
  });
}

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

export async function resolveEmployeeQuery(id, { status, response, resolutionNotes }) {
  return await apiRequest(`/employees/queries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      response: response !== undefined ? response : resolutionNotes || '',
    }),
  });
}
