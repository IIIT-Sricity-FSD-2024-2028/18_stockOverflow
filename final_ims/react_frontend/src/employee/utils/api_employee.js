/**
 * api_employee.js - Centralized API Service for React Employee Frontend
 * 
 * Provides communication with employee endpoints at http://localhost:3001/api.
 * Falls back to local storage and mockData_employee.js when backend is unreachable.
 */

import {
  INITIAL_VALIDATIONS,
  INITIAL_EMPLOYEE_TASKS,
  INITIAL_EMPLOYEE_QUERIES
} from '../data/mockData_employee';

const API_BASE_URL =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : 'http://localhost:3001/api';

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

export async function fetchValidations() {
  try {
    return await apiRequest('/employee/validations');
  } catch (_err) {
    return INITIAL_VALIDATIONS;
  }
}

export async function fetchEmployeeTasks() {
  try {
    return await apiRequest('/employee/tasks');
  } catch (_err) {
    return INITIAL_EMPLOYEE_TASKS;
  }
}

export async function fetchEmployeeQueries() {
  try {
    return await apiRequest('/employee/queries');
  } catch (_err) {
    return INITIAL_EMPLOYEE_QUERIES;
  }
}
