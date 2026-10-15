# StockOverflow - Frontend (React 18 + Vite)
## FDFED Individual Assignment Submission

> **Assigned Modules**: **🛡️ Admin Module** & **👔 Employee Module** (with **🏠 Landing Page** & **🔐 Auth**)  
> **Course**: Full Stack Development (FDFED)  
> **Architecture**: Single Page Application (SPA) with React 18 & Vite 5  
> **Status**: Fully Working & Self-Contained with Live Data Persistence  

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Folder to Submit & File Locations](#-folder-to-submit--file-locations)
3. [Individual Contribution File Manifest](#-individual-contribution-file-manifest)
4. [Prerequisites & Dependencies](#-prerequisites--dependencies)
5. [Setup & Execution Instructions](#-setup--execution-instructions)
6. [Core Working Functionalities (Detailed Breakdown)](#-core-working-functionalities)
7. [Step-by-Step Testing Checklist](#-step-by-step-testing-checklist)
8. [React Architecture & Viva Preparation Guide](#-react-architecture--viva-preparation-guide)

---

## 🌟 Project Overview

**StockOverflow** is a multi-stakeholder retail inventory lifecycle management system. This repository contains the complete **React Single Page Application (SPA)** converted from the initial HTML/JS prototypes.

For this individual evaluation, the following have been developed into fully interactive, state-driven React components:
- **Landing Page**: Modern conversion of `frontend/index.html` with floating pill navbar, hero section with real mockup visuals, stats counter, interactive role portal previews, workflow step diagram, and SaaS monetization pricing cards.
- **Authentication**: Interactive Login & Register with role selectors, 1-click demo credential autofill, and automatic insertion of newly registered businesses into the Employee Verification Queue.
- **Admin Module**: Executive Command Dashboard with meaningful metrics, **Dual-View Platform Revenue Engine** (Platform Earnings vs. Gross User Volume with individual Retailer/Supplier/Consumer filters and real CSV export), **Unified Multi-Store Management** with an Active Store Scope picker, and full User & Staff CRUD.
- **Employee Module**: Command Center with dynamic live-updating counters (daily checklist removed), **Entity Verification Desk** with document dossier inspection and rejection reason audit logging, and **Support Helpdesk** with threaded staff responses.

---

## 📁 Folder to Submit & File Locations

### 1. Folder for Submission:
```
/Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend
```

### 2. Submission README Location:
```
/Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend/README.md
```

### 3. ZIP File Generation Command:
To create a clean ZIP archive of the project excluding `node_modules` and `dist` (ideal for LMS upload limits):
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims
zip -r react_frontend_submission.zip react_frontend -x "react_frontend/node_modules/*" -x "react_frontend/dist/*"
```

---

## 👤 Individual Contribution File Manifest

The following files were specifically developed, converted, and modified:

### 1. Root & Navigation:
- `src/App.jsx` — Central application orchestrator, view router (Landing, Login, Register, Admin, Employee, Consumer, Retailer, Supplier), and sticky top evaluation hub bar.
- `src/main.jsx` — Application entry point mounting the root component.
- `src/index.css` — Global CSS variables, reset, and responsive base styles.

### 2. Landing & Authentication (`src/landing/` & `src/auth/`):
- `src/landing/LandingPage.jsx` — Modern landing page with floating pill nav, hero section, live stats strip, role cards, supply chain workflow, and SaaS pricing cards.
- `src/landing/landing.css` — Dedicated stylesheet for the landing page.
- `src/auth/LoginPage.jsx` — Role-aware login with one-click demo logins for all 5 roles, form validation, and session persistence.
- `src/auth/RegisterPage.jsx` — Multi-role business onboarding form (Retailer, Supplier, Consumer) that directly feeds into the Employee Verification Queue.
- `src/auth/auth.css` — Split-screen authentication stylesheet.

### 3. Admin Module (`src/admin/`):
- `src/admin/App_admin.jsx` — Admin SPA view router.
- `src/admin/components/layout/AdminLayout_admin.jsx` — Universal admin layout with **Active Store Scope Dropdown**, de-duplicated sidebar, and quick navigation.
- `src/admin/components/UserModal_admin.jsx` — Dialog modal for adding and editing user records with validation.
- `src/admin/components/StoreModal_admin.jsx` — Dialog modal for provisioning new regional store hubs.
- `src/admin/pages/DashboardPage_admin.jsx` — Executive dashboard with high-value KPIs, cross-module pending approval alert, and recent settled POS transactions.
- `src/admin/pages/RevenuePage_admin.jsx` — **Dual-View Revenue Engine**:
  * View 1: *Platform Revenue* (Subscriptions + 2% transaction commission).
  * View 2: *Gross Transaction Volume* (Merchant GMV, wholesale supplier orders, consumer spend).
  * Role filters: All, Retailers, Suppliers, Consumers.
  * Real downloadable CSV export.
- `src/admin/pages/StoresPage_admin.jsx` — Multi-store franchise management with branch cards, manager info, POS status, and **Active Hub Selection**.
- `src/admin/pages/UsersPage_admin.jsx` — User & staff management with search, role filters, Add/Edit/Delete modals, and local persistence.
- `src/admin/pages/RolesPage_admin.jsx` — Role-based access control (RBAC) permissions matrix.
- `src/admin/pages/ReportsPage_admin.jsx` — Data audit generator with date ranges and export simulation.
- `src/admin/pages/SettingsPage_admin.jsx` — Global platform configurations.
- `src/admin/data/mockData_admin.js` — Seed data engine for metrics, stores, users, roles, and dual-view stakeholder revenue records.
- `src/admin/admin.css` — Admin styling.

### 4. Employee Module (`src/employee/`):
- `src/employee/App_employee.jsx` — Employee SPA view router.
- `src/employee/components/layout/EmployeeLayout_employee.jsx` — Dedicated employee dashboard layout.
- `src/employee/components/DossierModal_employee.jsx` — Legal document inspection modal with audit notes and rejection reason handling.
- `src/employee/pages/DashboardPage_employee.jsx` — Dynamic Command Center with shift attendance toggle, real-time KPI counters (checklist removed), and Priority Action Queue.
- `src/employee/pages/ValidationsPage_employee.jsx` — Entity Verification Desk with filter tabs, live search, Approve/Reject logic, and local persistence.
- `src/employee/pages/QueriesPage_employee.jsx` — Support Helpdesk with status filter tabs, ticket selector, threaded conversation, and official staff responses.
- `src/employee/data/mockData_employee.js` — Seed data for employee tasks, validation queue, and support tickets.
- `src/employee/employee.css` — Employee desk styling.

---

## 🛠️ Prerequisites & Dependencies

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Modern evergreen browser (Chrome, Edge, Safari, Firefox)

Dependencies are defined in `package.json`:
- `react`: `^18.3.1`
- `react-dom`: `^18.3.1`
- `vite`: `^5.4.21`
- `@vitejs/plugin-react`: `^4.7.0`

---

## 🚀 Setup & Execution Instructions

### Option 1: Run the React Frontend Directly:
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Option 2: Unified Start from `final_ims/`:
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims
npm start
```

### Option 3: Run Production Build (Verification):
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend
npm run build
```
*(Builds in ~450ms with 0 errors).*

---

## ⚡ Core Working Functionalities

### 1. Modern Landing Page & Interactive Authentication:
- **Landing Page**: Hero section with real laptop mockups, live stats bar, multi-stakeholder role preview cards, supply chain workflow, and SaaS pricing cards.
- **1-Click Demo Login**: Sign in as Admin, Employee, Retailer, Supplier, or Consumer with 1 click.
- **Onboarding Pipeline**: Registering a new business (Retailer/Supplier) immediately inserts a new record into the Employee Verification Queue with status `pending`.

### 2. Admin Executive Dashboard:
- Filtered by the active store scope (`Global` or specific branch).
- Executive KPIs: Gross Platform Volume (GMV), Net Platform Commission (2%), Active Store Branches, Low Stock Alerts.
- Cross-module alert banner notifying the admin of pending verifications with a direct button to switch to the Employee Desk.
- Recent settled POS transactions table with real order amounts and 2% fee calculations.

### 3. Dual-View Platform Revenue & Monetization Engine:
- **View 1: Platform Revenue (What Users Pay Us)**:
  * Sum of SaaS subscriptions (Free ₹0, Growth ₹799, Enterprise ₹3,499) + 2.0% transaction fee.
  * Breakdown of commission earned vs. subscription revenue.
- **View 2: Gross Transaction Volume (What Users Earn/Spend)**:
  * Total Gross Merchandise Volume (GMV) traded through the platform.
  * Net merchant payout (98% after 2% fee).
  * Consumer spending analytics.
- **Individual Role Filtering**: Filter ledger by `All Stakeholders`, `Retailers Only`, `Suppliers Only`, or `Consumers Only`.
- **Export to CSV**: Real downloadable CSV file generated on the fly with custom filename.

### 4. Store Selection & Multi-Store Management:
- Unified view of all retail branches, managers, stock units, active staff, and POS terminal status.
- **Active Store Scope**: Clicking "Set as Active Hub" scopes administrative operations to that specific location and updates the topbar scope selector.
- Add Store modal to register new regional hubs.

### 5. Employee Command Center (Dynamic Live KPIs):
- Removed static checklist in favor of real-time dynamic counters:
  * *Pending Validations*: Automatically decreases as items are approved or rejected.
  * *Open Queries*: Automatically updates as support tickets are resolved.
  * *Processed Entities*: Tracks total completed actions.
- Priority Action Queue showing urgent pending onboarding dossiers and open support tickets.
- Shift Attendance tracker (Clock In / Clock Out toggle).

### 6. Employee Entity Verification Desk:
- Filter tabs: `All`, `Pending`, `Retailers`, `Suppliers`, `Stores`, `Approved`, `Rejected`.
- Real-time search by business name, GSTIN, and owner.
- **Approve**: Immediately transitions status from `pending` to `approved`.
- **Reject**: Prompts for a mandatory deficiency reason (e.g. "Expired GST registration"), records the audit note, and sets status to `rejected`.
- **Dossier Modal**: Deep legal inspection of uploaded documents (GSTIN Certificate, Lease Agreement, PAN Card).

### 7. Employee Support Queries Helpdesk:
- Split-pane layout with status filter tabs (`All`, `Open`, `In Progress`, `Resolved`).
- Real-time status update dropdown.
- **Threaded Conversation**: Staff types an official response, which is appended to the ticket history with agent name and timestamp, automatically setting the ticket to `In Progress`.

---

## 🧪 Step-by-Step Testing Checklist

| # | Feature | Steps | Expected Result |
|---|---|---|---|
| **1** | **Landing Page** | Open `http://localhost:5173`. Scroll through Features, Portals, and Pricing. | Clean, responsive landing page with working navigation anchors and visuals. |
| **2** | **1-Click Login** | Click "Sign In" in navbar -> Click "Refill Demo" under Admin -> Click "Sign In as Admin". | Authenticates immediately and launches the Admin Portal. |
| **3** | **Dual-View Revenue** | In Admin sidebar, click **Platform Revenue** -> Toggle between **View 1 (Platform Revenue)** and **View 2 (Transaction Volume)**. | KPIs, table columns, and explanation text update dynamically between the two monetization perspectives. |
| **4** | **Filter Revenue by Role** | Click **"Retailers Only"**, then **"Suppliers Only"**, then **"Consumers Only"**. | Table filters down to only the selected role, recalculating totals. |
| **5** | **Export CSV** | Click **"Export CSV Ledger"**. | Browser downloads `StockOverflow_Revenue_...csv` with accurate headers and data rows. |
| **6** | **Store Scope Picker** | In Admin topbar, change Store Scope dropdown from `Global Scope` to `Downtown Store`. | Header updates active branch scope; store management shows Downtown Store as active. |
| **7** | **Switch to Employee** | Click **"👔 Employee Desk"** in top hub bar (or sidebar footer). | Employee Command Center loads with dynamic live KPI counters. |
| **8** | **Approve Registration** | In Employee sidebar, click **"All Validations"** -> Click **"Approve"** on a pending retailer. | Status changes to green `APPROVED`; Employee Dashboard pending counter decrements by 1! |
| **9** | **Reject with Reason** | On a pending validation, click **"Dossier"** -> Click **"Reject with Reason"** -> Enter note -> Click **"Confirm Rejection"**. | Modal closes; item marked as `REJECTED` with audit note recorded. |
| **10** | **Reply to Query** | In Employee sidebar, click **"User Queries"** -> Select ticket -> Type response -> Click **"Send Response"**. | Reply appends to the conversation thread with timestamp; status updates. |
| **11** | **Register Pipeline** | Switch to Landing -> Click "Get Started" (Register) -> Fill in business details -> Submit. | Confirmation screen appears; new business appears inside Employee Verification Queue! |

---

## 💡 React Architecture & Viva Preparation Guide

### 1. State Management & Hooks:
- **`useState`**: Used for view routing, active tabs, modal visibility, search queries, form data, and dataset collections.
- **`useMemo`**: Used in `RevenuePage_admin.jsx`, `ValidationsPage_employee.jsx`, and `UsersPage_admin.jsx` to memoize filtered lists and aggregate financial totals, preventing costly recalculations on unrelated renders.
- **`useEffect`**: Used in `DashboardPage_employee.jsx` to listen to cross-page `storage` events so counters update live without manual page reloads.

### 2. Component Composition:
- Layout shells (`AdminLayout_admin`, `EmployeeLayout_employee`) use React's `children` prop for clean content projection.
- Dialog modals (`UserModal`, `StoreModal`, `DossierModal`) are isolated into `components/` and render conditionally (`if (!isOpen) return null`).

### 3. Controlled Forms:
- Form inputs in `LoginPage`, `RegisterPage`, and modals are fully controlled components with input state binding (`value={...}`) and validation before submission.

---
*Prepared for the FDFED Evaluation — StockOverflow React Inventory Management System.*
