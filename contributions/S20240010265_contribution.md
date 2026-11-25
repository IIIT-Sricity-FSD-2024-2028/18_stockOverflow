# Contribution Report - Redux Evaluation

**Name:** Yogeswar Stalin  
**Roll No:** S20240010265  
**Branch:** yogesh-redux  

## Modules Worked On
- Landing Page
- Login & Registration (Auth + Verification Pending)
- Employee Module
- Admin Module

## What I Did
1. **Set up the Redux Store (`src/store/index.js`)**
   - Added Redux Toolkit (`configureStore`, `createSlice`) and wrapped the app with `<Provider store={store}>` in `main.jsx`.
   - Followed the `*-slice.js` and `*-actions.js` pattern to keep API calls in async thunks and state updates in slice reducers.

2. **Mapped Backend Controllers 1-to-1 with Slices**
   - `auth-slice.js` / `auth-actions.js`: login, register, logout, refresh user, landing retailer list, and biller request.
   - **Admin slices:** `users`, `roles`, `stores`, `settings`, `admin-reports`, and `revenue` (with CRUD thunks to fetch, create, update, and delete records in `db.json` / `users.json` before updating Redux state).
   - **Employee slices:** `assignments`, `queries`, and `employee-stats` (fetch assignments/queries, approve or reject verifications, reply to and resolve user tickets).

3. **Connected Pages to Redux Store**
   - Replaced local `useState` server data in Landing, Auth, Employee, and Admin pages with `useSelector` and `useDispatch`.
   - Updated `AuthContext.jsx` to read from `state.auth.user` so the remaining modules continue to work without issues.
   - Removed unused mock data files (`mockData_admin.js`, `mockData_employee.js`) and `DataSyncContext` listeners from Admin and Employee pages.
   - Fixed small backend DTO validation issues in `admin.dto.ts` and `api_employee.js` so role creation, store updates, and query replies save properly.

## Verification
- Verified both frontend (`npm run build`) and backend (`npm run build`) build cleanly.
- Tested login, admin CRUD (users, roles, stores, settings), and employee verification/query resolution against the backend JSON files.
