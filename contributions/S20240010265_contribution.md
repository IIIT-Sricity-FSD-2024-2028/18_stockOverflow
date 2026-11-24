# Individual Contribution Report — Redux Evaluation

- **Roll Number:** `S20240010265`
- **Contributor:** Yogeswar Stalin
- **Project:** StockOverflow — Multi-Stakeholder Inventory Lifecycle Management System
- **Branch:** `yogesh-redux` (merged into `main`)
- **Modules Covered:** Landing Page, Authentication (Login / Sign Up / Verification Gate), Admin Module, Employee Module
- **Tech Stack:** React 18, Redux Toolkit (`@reduxjs/toolkit`), React Redux (`react-redux`), NestJS, JSON Persistence (`db.json` & `users.json`)

---

## 1. Summary of Work Done
Implemented centralized **Redux state management** using the slice + async thunk action pattern (`*-slice.js` and `*-actions.js`) across the Landing Page, Authentication flow, Admin Command Center, and Employee Verification & Support Desk, mapped 1-to-1 with the NestJS backend controllers. Replaced local `useState` server-data copies and legacy `DataSyncContext` polling/events in these modules with Redux selectors (`useSelector`) and thunk dispatches (`useDispatch`) that persist changes to the backend database first and update Redux state only on a positive response.

---

## 2. Key Features & Technical Contributions

### A. Central Redux Store & DB-First Thunk Pattern
- Configured the shared Redux store in `final_ims/react_frontend/src/store/index.js` and wrapped `<App />` with `<Provider store={store}>` in `main.jsx`.
- Followed the 2-file pattern (`<resource>-slice.js` + `<resource>-actions.js`) for every backend resource:
  - Forms collect input and dispatch an async thunk.
  - The thunk sends the HTTP request (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) to the NestJS backend, which writes to `backend/data/db.json` or `backend/data/users.json`.
  - Only when the backend returns a successful response does the thunk dispatch the slice reducer (`addUser`, `updateUserInState`, `removeUserFromState`, etc.) to update the Redux store.

### B. 1-to-1 Backend Controller → Redux Slice Mapping

| Backend Controller / Endpoint | Slice & Actions (`src/store/`) | CRUD / Operations Implemented |
|---|---|---|
| `users.controller.ts` (`/api/users`) | `auth-slice.js`, `auth-actions.js` | `loginUser`, `registerUser`, `refreshAuthUser`, `fetchRetailersForLanding`, `applyBillerRequest`, `logoutUser` |
| `admin.controller.ts` (`/api/admin/users`) | `users-slice.js`, `users-actions.js` | `fetchUsersData`, `createUserData`, `updateUserData`, `deleteUserData` |
| `admin.controller.ts` (`/api/admin/roles`) | `roles-slice.js`, `roles-actions.js` | `fetchRolesData`, `createRoleData`, `updateRoleData`, `deleteRoleData` |
| `admin.controller.ts` (`/api/admin/stores`) | `stores-slice.js`, `stores-actions.js` | `fetchStoresData`, `createStoreData`, `updateStoreData`, `deleteStoreData`, `fetchStoreDetailsData` |
| `admin.controller.ts` (`/api/admin/settings`) | `settings-slice.js`, `settings-actions.js` | `fetchSettingsData`, `updateSettingsData` |
| `admin.controller.ts` (`/api/admin/dashboard/stats`, `/reports/summary`) | `admin-reports-slice.js`, `admin-reports-actions.js` | `fetchDashboardStatsData`, `fetchReportsSummaryData` |
| `platform-revenue.controller.ts` (`/api/platform-revenue/*`) | `revenue-slice.js`, `revenue-actions.js` | `fetchPlatformRevenueData` (summary, commissions, subscriptions, pricing tiers) |
| `employees.controller.ts` (`/api/employees/assignments`) | `assignments-slice.js`, `assignments-actions.js` | `fetchAssignmentsData`, `resolveAssignmentData` |
| `employees.controller.ts` (`/api/employees/queries`) | `queries-slice.js`, `queries-actions.js` | `fetchQueriesData`, `createQueryData`, `resolveQueryData` |
| `employees.controller.ts` (`/api/employees/stats`) | `employee-stats-slice.js`, `employee-stats-actions.js` | `fetchEmployeeStatsData`, `toggleOnDuty` |

### C. Module Integrations & Bug Fixes
- **Landing & Auth (`LandingPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `VerificationPendingPage.jsx`, `App.jsx`, `AuthContext.jsx`):**
  - Connected retailer dropdown loading, biller registration requests, biller login, standard login, registration, and verification polling to Redux `auth` state.
  - Updated `AuthContext.jsx` to read from `state.auth.user` and dispatch `auth-actions` so connected modules (`retailer`, `supplier`, `consumer`, `biller`) continue to function seamlessly.
- **Admin Module (`admin/pages/*`, `admin/components/*`, `admin/utils/api_admin.js`):**
  - Migrated `DashboardPage_admin.jsx`, `UsersPage_admin.jsx`, `RolesPage_admin.jsx`, `StoresPage_admin.jsx`, `StoreDashboardPage_admin.jsx`, `RevenuePage_admin.jsx`, `ReportsPage_admin.jsx`, and `SettingsPage_admin.jsx` to read displayed data from Redux and perform live backend CRUD.
  - Fixed `StoreDashboardPage_admin.jsx` crash (`handleRefresh` + empty-state fallback + renamed refresh button to `↻ Refresh Store Data`), removed unused `Store Scope` navbar dropdown from `AdminLayout_admin.jsx`, removed display-only `Set to Maintenance` toggle, renamed `Platform Order Throughput` to `Orders Processed`, wired `pendingValidations` to live `employeeStats`, and tightened `RevenuePage_admin.jsx` ID matching and recurring subscription labels.
- **Employee Module (`employee/pages/*`, `employee/components/layout/EmployeeLayout_employee.jsx`, `employee/utils/api_employee.js`):**
  - Connected `DashboardPage_employee.jsx`, `ValidationsPage_employee.jsx`, and `QueriesPage_employee.jsx` to Redux `assignments`, `queries`, and `employeeStats` slices.
  - Updated `EmployeeLayout_employee.jsx` to compute live sidebar badge counts and user initials from Redux.
  - Fixed `resolveEmployeeQuery` payload (`response` instead of `resolutionNotes`) to match backend `ResolveQueryDto`.
- **Backend Validation Fixes (`backend/src/admin/`):**
  - Fixed `CreateRoleDto` / `UpdateRoleDto` (`@IsObject()` on `permissions`) and added optional `code` / `status` support in `CreateStoreDto` / `UpdateStoreDto` and `AdminService.createStore()`.
- **Cleanup:**
  - Deleted unused `mockData_admin.js` and `mockData_employee.js` and removed legacy `DataSyncContext` usage from admin, employee, auth, and landing modules.

---

## 3. Files Added, Modified & Removed

### Added (`final_ims/react_frontend/src/store/`)
- `index.js`
- `auth-slice.js`, `auth-actions.js`
- `users-slice.js`, `users-actions.js`
- `roles-slice.js`, `roles-actions.js`
- `stores-slice.js`, `stores-actions.js`
- `settings-slice.js`, `settings-actions.js`
- `admin-reports-slice.js`, `admin-reports-actions.js`
- `revenue-slice.js`, `revenue-actions.js`
- `assignments-slice.js`, `assignments-actions.js`
- `queries-slice.js`, `queries-actions.js`
- `employee-stats-slice.js`, `employee-stats-actions.js`

### Modified
- **Root & Auth:** `main.jsx`, `App.jsx`, `context/AuthContext.jsx`, `landing/LandingPage.jsx`, `auth/LoginPage.jsx`, `auth/RegisterPage.jsx`, `auth/VerificationPendingPage.jsx`
- **Admin:** `admin/App_admin.jsx`, `admin/components/layout/AdminLayout_admin.jsx`, `admin/components/UserModal_admin.jsx`, `admin/components/StoreModal_admin.jsx`, `admin/pages/DashboardPage_admin.jsx`, `admin/pages/UsersPage_admin.jsx`, `admin/pages/RolesPage_admin.jsx`, `admin/pages/StoresPage_admin.jsx`, `admin/pages/StoreDashboardPage_admin.jsx`, `admin/pages/RevenuePage_admin.jsx`, `admin/pages/ReportsPage_admin.jsx`, `admin/pages/SettingsPage_admin.jsx`, `admin/utils/api_admin.js`
- **Employee:** `employee/App_employee.jsx`, `employee/components/layout/EmployeeLayout_employee.jsx`, `employee/pages/DashboardPage_employee.jsx`, `employee/pages/ValidationsPage_employee.jsx`, `employee/pages/QueriesPage_employee.jsx`, `employee/utils/api_employee.js`
- **Backend:** `backend/src/admin/dto/admin.dto.ts`, `backend/src/admin/admin.service.ts`

### Deleted
- `final_ims/react_frontend/src/admin/data/mockData_admin.js`
- `final_ims/react_frontend/src/employee/data/mockData_employee.js`

---

## 4. Verification Performed
- Ran `npm run build` in `final_ims/react_frontend` (`vite build`, 187 modules transformed) — passed with exit code `0`.
- Ran `npm run build` in `final_ims/backend` (`nest build`) — passed with exit code `0`.
- Tested live backend CRUD routes against a temporary server instance (`POST /users/login`, CRUD on `/admin/users`, `/admin/roles`, `/admin/stores`, `/admin/settings`, `/admin/dashboard/stats`, `/admin/reports/summary`, `/employees/queries`, `/employees/assignments`, `/employees/stats`) and confirmed persistence and clean build.
