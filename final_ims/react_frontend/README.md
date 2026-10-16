# StockOverflow - Complete Unified React Application
## FDFED Full Stack Project & Final Evaluation Submission

> **Course**: Full Stack Development (FDFED)  
> **Submitted Application Directory**: `/Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend`  
> **Backend Directory**: `/Users/yogeswar/personal/18_stockOverflow/final_ims/backend`  
> **Architecture**: End-to-End Reactive Single Page Application (SPA) with React 18, Vite 5 & NestJS REST Backend  
> **Data Integrity**: **100% Real Backend Integration — Zero Mock Data / LocalStorage Fallbacks**  

---

## 📋 Table of Contents
1. [Executive Summary & Architecture](#-executive-summary--architecture)
2. [Folder Locations & Submission Path](#-folder-locations--submission-path)
3. [All Modules & Working Functionalities](#-all-modules--working-functionalities)
4. [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
5. [End-to-End Cross-Module Integration Flows](#-end-to-end-cross-module-integration-flows)
6. [Demo Accounts & Credentials](#-demo-accounts--credentials)
7. [Viva & Technical Architecture Guide](#-viva--technical-architecture-guide)

---

## 🌟 Executive Summary & Architecture

**StockOverflow** is an end-to-end multi-stakeholder retail inventory lifecycle management platform. The application unifies all 6 system stakeholder portals into a single, cohesive, production-grade React application:

1. **🏠 Landing Page & Auth**: Floating navbar, hero visuals, supply chain workflow diagram, SaaS monetization pricing matrix, and unified Login/Register.
2. **⏳ Verification Pending Gate**: Real-time waiting room for newly registered retailers and suppliers until a company employee reviews and approves their compliance dossier.
3. **🛡️ Admin Module**: Executive dashboard, **Dual-View Platform Revenue & Monetization Engine** (Platform Earnings vs. Gross User Volume with individual actor filters and real CSV download), **Multi-Store Management Hub**, and User & RBAC governance.
4. **👔 Employee Module**: Dynamic Command Center with live duty toggle, **Entity Verification Desk** (inspect legal documents, approve or reject with deficiency logging), and **Support Ticket Helpdesk**.
5. **🏬 Retailer Module**: Multi-store branch operations, POS billing terminals, inventory stock auditing, reorder recommendations, and supplier purchase order dispatch.
6. **🚚 Supplier Module**: Wholesale catalog management, inventory dispatch, incoming PO confirmation/fulfillment, delivery status tracker, and subscription management.
7. **🛒 Consumer Module**: Storefront catalog browsing, product search & category filters, cart, physical store pickup holds, returns request desk, and restock notifications.
8. **📠 Biller / POS Module**: Fast cashier checkout, live product barcode/sku search, cart calculations, instant cash/card settlement, and printable receipt generation.

---

## 📁 Folder Locations & Submission Path

### 1. Unified React Frontend (To Submit):
```
final_ims/react_frontend/
```
*Contains the complete, consolidated React 18 application with all dependencies installed in `node_modules/`.*

### 2. NestJS Backend Server:
```
final_ims/backend/
```
*Provides the 30+ REST endpoints, automatic employee assignment distribution, verification gate validation, platform commission ledger, and file upload services.*

### 3. Submission Documentation:
```
final_ims/react_frontend/README.md
```

---

## 🚀 Step-by-Step Setup & How to Run

### Step 1: Start the Backend Server
In your first terminal:
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims/backend
npm install
npm run start:dev
```
*The NestJS backend runs on **[http://localhost:3001](http://localhost:3001)** (Swagger API documentation at **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**).*

### Step 2: Start the React Frontend Application
In your second terminal:
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend
npm run dev
```
*The Vite development server runs on **[http://localhost:5173](http://localhost:5173)** with automatic `/api` proxy routing to port 3001.*

### Step 3: Production Build Validation
To verify zero syntax, lint, or bundling errors:
```bash
cd /Users/yogeswar/personal/18_stockOverflow/final_ims/react_frontend
npm run build
```
*(Vite bundles 114 modules into `dist/` in ~1.2 seconds).*

---

## 🔑 Demo Accounts & Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@stockoverflow.com` | `Password123!` | Full financial governance, multi-store, and user CRUD |
| **Employee** | `employee@stockoverflow.com` | `Password123!` | Entity compliance verification & support helpdesk |
| **Retailer** | `retailer@stockoverflow.com` | `Password123!` | Store inventory, POS biller management, supplier POs |
| **Supplier** | `supplier@stockoverflow.com` | `Password123!` | Wholesale inventory dispatch, PO approvals, logistics |
| **Consumer** | `consumer@stockoverflow.com` | `Password123!` | Storefront catalog browsing, reservation holds, returns |
| **Biller** | `biller@stockoverflow.com` | `Password123!` | Cashier POS terminal checkout & receipt printing |

*Note: You can also use the **1-Click Refill Demo** buttons on the Login page (`/login`) for instantaneous sign-in.*

---

## 🔄 End-to-End Cross-Module Integration Flows

### Flow 1: Business Onboarding & Employee Verification Gate
1. Navigate to **Get Started** (`/register`).
2. Select **Retailer** or **Supplier** and register a new company account.
3. Upon registration, the business enters the backend with `profileStatus: 'pending'`.
4. The user is redirected to the **Verification Pending Waiting Room** (`/verification-pending`). They cannot access the dashboard yet.
5. In another tab (or top hub bar), switch to **👔 Employee Desk**.
6. Under **Action Queue: Pending Onboarding** or **All Validations**, click **Inspect Dossier** or **Approve**.
7. In the waiting room tab, click **Refresh Status** — the user is instantly admitted to their live dashboard!

### Flow 2: Live Support Helpdesk Across All Stakeholders
1. From any stakeholder dashboard (**Retailer**, **Supplier**, or **Consumer**), click the **"Contact Support"** button in the sidebar or navbar.
2. Fill in the subject, priority, and inquiry details, then submit.
3. Switch to **👔 Employee Desk** -> **User Queries Helpdesk**.
4. The ticket appears instantly in the live queue.
5. Select the ticket, type the official staff response, and click **Send Staff Reply & Resolve**.
6. The status transitions to **Resolved** and updates the live KPI counters.

### Flow 3: Dual-View Platform Revenue & Monetization Engine
1. In the top bar or sidebar, open **🛡️ Admin Portal** -> **Platform Revenue**.
2. **View 1 (Platform Revenue)** displays what businesses pay StockOverflow:
   - SaaS subscriptions collected (`Free ₹0`, `Growth ₹799`, `Enterprise ₹3,499`).
   - 2.0% transaction fee cut deducted from settled retail transactions.
3. **View 2 (Transaction Volume)** displays what businesses earn and transact:
   - Gross Merchandise Volume (GMV).
   - Net merchant payouts (98% after platform take).
4. Filter by **Retailers**, **Suppliers**, or **Consumers** to inspect localized economics.
5. Click **📥 Export CSV Ledger** to download an instant spreadsheet.

### Flow 4: Storefront Hold & POS Cashier Checkout
1. Open **🛒 Consumer Portal** -> Browse catalog -> Click **Reserve for Pickup**.
2. Select store branch and duration to place a reserved hold.
3. Switch to **📠 Biller / POS Terminal**.
4. Cashier scans or searches items, sees live discounts, and clicks **Pay with Cash/Card**.
5. Live receipt pops up with tax breakdown and order number, ready to print.

---

## 💡 Viva & Technical Architecture Guide

### 1. State Management & Hooks
- **`useState`**: Drives local modal states, form fields, tab filters, and view switching.
- **`useEffect` & `useCallback`**: Asynchronously fetch live backend datasets, handling loading and error states cleanly.
- **`useMemo`**: Used extensively in Admin Revenue and Employee tables to compute live financial aggregations and filter records efficiently without unnecessary re-renders.
- **`useContext` (`AuthContext`)**: Global session management tracking user credentials, token, role, and current store scope.

### 2. Clean Architecture & Modular Code
- **Separation of Concerns**: Each portal maintains its own `pages/`, `components/`, and `api/` directory (e.g. `api_admin.js`, `api_employee.js`, `supplierApi.js`).
- **Shared Components**: Reusable components (`ContactSupportModal`, `VerificationPendingPage`) facilitate cross-module capabilities.
- **Controlled Components**: All forms strictly bind input values and validate payloads before dispatching to backend endpoints.

---
*StockOverflow — Engineered for the FDFED Final Practical Evaluation.*
