# Contribution Report - Redux Evaluation

**Name:** Abhiraj Aayush  
**Roll No:** S20240010003  
**Branch:** main  

## Modules Worked On
- Retailer Module (`final_ims/react_frontend/src/retailer`)

## What I Did
1. **Set up the Retailer Redux Store (`src/retailer/redux/store.js` & `src/retailer/redux/index.js`)**
   - Configured Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`) and wrapped the Retailer module with `<Provider store={retailerStore}>` in `App_retailer.jsx`.
   - Exported the store, actions, async thunks, and selectors through `src/retailer/redux/index.js`.

2. **Implemented Retailer Redux Slices (`src/retailer/redux/slices/`)**
   - `productsSlice.js` & `stockAdjustSlice.js`: product catalog CRUD, inventory/low-stock/reorder state, and stock adjustment logs.
   - `dashboardSlice.js` & `storesSlice.js`: dashboard metrics, reservation cancellation, multi-store list, and store drawer analytics.
   - `customersSlice.js` & `billersSlice.js`: customer CRUD and biller management (CRUD, approve, and reject pending biller requests).
   - `suppliersSlice.js`, `purchaseOrdersSlice.js`, & `returnsSlice.js`: supplier directory, purchase orders/catalog management, and customer return records.
   - `profileSlice.js`, `notificationsSlice.js`, & `uiSlice.js`: business profile/subscription setup, header notifications, and SPA view/modal navigation state.

3. **Connected Retailer Views to Redux Store**
   - Replaced local `useState` server/UI state across `App_retailer.jsx`, `RetailerLayout.jsx`, and the retailer views (`DashboardView`, `ProductListView`, `AddProductView`, `EditProductView`, `InventoryView`, `LowStocksView`, `StockAdjustView`, `MultiStoreView`, `CustomersView`, `BillersView`, `SuppliersView`, `SupplierPerformanceView`, `ReorderView`, `PurchaseOrdersView`, `POProductsView`, `ReturnsView`, `ProfileView`, `SubscriptionPlanView`, `RetailerInitialWizard`) with `useSelector` and `useDispatch`.

## Verification
- Verified all 12 slices in `src/retailer/redux/slices/` are registered in `retailerStore` and wired to `retailerApi` async thunks.
- Verified `App_retailer.jsx`, `RetailerLayout.jsx`, and all retailer view components consume Redux selectors and dispatchers.
