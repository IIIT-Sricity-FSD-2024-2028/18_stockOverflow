/**
 * App_employee.jsx - Main Application Controller for Employee Module
 * 
 * Follows the same architectural structure as App_consumer.jsx:
 * 1. Single Page Application (SPA) routing between employee views:
 *    - Dashboard ('dashboard') -> matching employee-dashboard.html
 *    - Validations Queue ('validations') -> matching employee-validations.html
 *    - User Queries ('queries') -> matching employee-queries.html
 * 2. Universal layout shell via <EmployeeLayout_employee />.
 * 3. Centralized API and data services in `utils/api_employee.js` and `data/mockData_employee.js`.
 */

import React, { useState } from 'react';
import './employee.css';

// Layout
import EmployeeLayout_employee from './components/layout/EmployeeLayout_employee';

// Employee Page Views
import DashboardPage_employee from './pages/DashboardPage_employee';
import ValidationsPage_employee from './pages/ValidationsPage_employee';
import QueriesPage_employee from './pages/QueriesPage_employee';

export default function App_employee({ onSwitchModule }) {
  // ─── 1. Navigation & View Routing State ───
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage_employee onNavigate={setCurrentView} />;
      case 'validations':
        return <ValidationsPage_employee />;
      case 'queries':
        return <QueriesPage_employee />;
      default:
        return <DashboardPage_employee onNavigate={setCurrentView} />;
    }
  };

  return (
    <EmployeeLayout_employee
      activeMenu={currentView}
      onNavigate={setCurrentView}
      onSwitchModule={onSwitchModule}
    >
      {renderView()}
    </EmployeeLayout_employee>
  );
}
