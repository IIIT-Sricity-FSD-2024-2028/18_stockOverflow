/**
 * mockData_employee.js - Centralized Seed Data for Employee Module
 */

export const INITIAL_VALIDATIONS = [
  {
    id: 'VAL-101',
    entityName: 'Apex Electronics Mart',
    type: 'retailer',
    owner: 'Ramesh Kulkarni',
    contact: '+91 98230 45678',
    email: 'ramesh@apexelectronics.in',
    gstin: '27AABCU9603R1ZM',
    location: 'Pune, Maharashtra',
    submittedDate: '2024-06-18',
    status: 'pending',
    documents: ['GSTIN Certificate', 'Store Lease Agreement', 'PAN Card'],
    notes: 'Submitted verification documents for Uptown Mall branch onboarding.'
  },
  {
    id: 'VAL-102',
    entityName: 'Nordic Direct Logistics',
    type: 'supplier',
    owner: 'Elena Rostova',
    contact: '+91 98111 23456',
    email: 'elena@nordicdirect.com',
    gstin: '07AAECN4812Q1ZX',
    location: 'Gurugram, Haryana',
    submittedDate: '2024-06-17',
    status: 'approved',
    documents: ['Import/Export Code', 'FSSAI License', 'Company Incorporation'],
    notes: 'Warehouse dispatch clearance verified.'
  },
  {
    id: 'VAL-103',
    entityName: 'Westside Superstore Outlet',
    type: 'store',
    owner: 'Priya Sharma (Manager)',
    contact: '+91 97321 65432',
    email: 'westside.ims@stockoverflow.com',
    gstin: '36AAACW1234P1Z9',
    location: 'Hyderabad, Telangana',
    submittedDate: '2024-06-16',
    status: 'pending',
    documents: ['Trade License', 'Fire Safety NOC'],
    notes: 'Branch readiness inspection pending fire safety certificate verification.'
  },
  {
    id: 'VAL-104',
    entityName: 'Kaveri Provisions & FMCG',
    type: 'retailer',
    owner: 'Suresh Babu',
    contact: '+91 94440 12345',
    email: 'suresh@kaverigrocery.com',
    gstin: '33AABCK8812L1ZQ',
    location: 'Chennai, Tamil Nadu',
    submittedDate: '2024-06-15',
    status: 'rejected',
    documents: ['GSTIN Document (Expired)'],
    notes: 'Rejected due to expired GST registration certificate. Resubmission requested.'
  }
];

export const INITIAL_EMPLOYEE_TASKS = [
  { id: 1, text: 'Verify 3 pending retailer GSTIN certificates', done: true, priority: 'high' },
  { id: 2, text: 'Perform shelf stock audit for Aisle 4 (Electronics)', done: false, priority: 'high' },
  { id: 3, text: 'Review customer return claim RMA #402', done: false, priority: 'medium' },
  { id: 4, text: 'Sync POS offline reconciliation ledger for Downtown Store', done: true, priority: 'medium' },
  { id: 5, text: 'Verify supplier dispatch invoice #SUP-902', done: false, priority: 'low' }
];

export const INITIAL_EMPLOYEE_QUERIES = [
  {
    id: 'QRY-401',
    subject: 'Store Pickup Hold Reservation Inquiry',
    requester: 'Ananya Roy',
    email: 'ananya@gmail.com',
    type: 'Consumer',
    priority: 'Medium',
    status: 'Open',
    date: '2024-06-18',
    message: 'Can I extend my hold reservation for the Sony WH-1000XM6 by an extra 24 hours? I am traveling.'
  },
  {
    id: 'QRY-402',
    subject: 'Missing GSTIN Invoice for Bulk Order #ORD-882',
    requester: 'Apex Retail',
    email: 'accounts@apexelectronics.in',
    type: 'Retailer',
    priority: 'High',
    status: 'In Progress',
    date: '2024-06-17',
    message: 'We require a B2B tax invoice with our GSTIN for our tax filing. The download link is failing.'
  },
  {
    id: 'QRY-403',
    subject: 'Supplier Catalog Sync Error',
    requester: 'Nordic Logistics',
    email: 'support@nordiclogistics.com',
    type: 'Supplier',
    priority: 'Low',
    status: 'Resolved',
    date: '2024-06-15',
    message: 'The wholesale price update for SKU PT001 did not reflect on the retailer dashboard.'
  }
];
