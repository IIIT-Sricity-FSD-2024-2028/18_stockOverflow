# Contribution Report - Redux Evaluation

**Name:** Kathiriya Krish Rajeshbhai  
**Roll No:** S20240010111
**Branch:** krishV2  

## Modules Worked On
- Consumer Module (Storefront, Catalog Search, Product Details, Cart, Checkout, In-Store Reservations, Orders & Invoice Receipts, RMA Returns, Customer Reviews, Restock Watchlist)
- Biller Module (Cashier POS Terminal, Live Branch Scoping, Real-time Customer Pre-order Holds, Line Items Stepper & Dynamic Round-off Math, Checkout Charges & Printable Receipts, Sales Transaction Logs)

## What I Did

1. **Architected and Configured Modular Redux Stores**
   - Installed and configured `@reduxjs/toolkit` and `react-redux` in the unified `final_ims/react_frontend`.
   - Built isolated, modular Redux stores with clean public barrel files (`index.js`):
     - **Consumer Store (`src/consumer/redux/store.js`):** Wrapped `App_consumer.jsx` in `<Provider store={consumerStore}>`.
     - **Biller Store (`src/biller/redux/store.js`):** Wrapped `App_biller.jsx` in `<Provider store={billerStore}>`.
   - Used `createSlice` and `createAsyncThunk` for clean separation between asynchronous API communications and synchronous state updates.

2. **Implemented Redux Slices for Consumer Module (6 Slices)**
   - **`catalogSlice.js`:** Manages live products list, physical store locations (`stores`), and active branch filtering (`selectedStoreId`) with `fetchCatalogProducts` and `fetchStoreLocations` async thunks.
   - **`cartSlice.js`:** Handles reservation cart items, quantity stepper math, store branch preservation, and automatic persistence to `localStorage` (`imsAppStateV1.cart`).
   - **`ordersSlice.js`:** Manages verified order history, active pickup reservations, checkout submissions (`submitReservationHold`), and printable itemized invoice fetching (`fetchOrderReceipt`).
   - **`returnsSlice.js`:** Handles 2-step RMA return claims: order lookup verification (`lookupOrderForReturn`) and claim submission with resolution options (`submitReturnClaim`).
   - **`feedbackSlice.js`:** Manages verified customer reviews and 5-star to 1-star breakdown bars (`fetchProductReviews`), automatically recalculating product rating averages upon review submission (`submitReview`).
   - **`restockSlice.js`:** Manages back-in-stock watch alert subscriptions, threshold tracking, and priority levels (`High`, `Medium`, `Low`).

3. **Implemented Redux Slices for Biller Module (4 Slices)**
   - **`billerCatalogSlice.js`:** Handles retailer-scoped physical branch stores, active cashier store assignment (`currentStoreId`), catalog products, walk-in customer creation, category navigation, and search/sort filters.
   - **`billerCartSlice.js`:** Manages POS line items, quantities, adjustments (shipping, tax, discounts, coupons), payment methods (`Cash`, `Card`, `UPI`, `Net Banking`), and dynamic auto-roundoff calculations via memoized selectors.
   - **`billerReservationsSlice.js`:** Handles real-time polling of incoming customer in-store pickup holds (`fetchBillerReservations`), approving holds directly into the POS cart, and cancellation release to return reserved stock back to store inventory.
   - **`billerTransactionsSlice.js`:** Handles POS checkout processing (`createBillerTransaction`), official sales receipt generation, and transaction history logs (`fetchBillerTransactions`).

4. **Connected All Component Views to Redux**
   - **Consumer:** Replaced local state and prop drilling across `ProductSearchPage_consumer.jsx`, `ProductDetailPage_consumer.jsx`, `CartPage_consumer.jsx`, `CheckoutPage_consumer.jsx`, `OrdersPage_consumer.jsx`, `OrderConfirmationPage_consumer.jsx`, `ReturnManagementPage_consumer.jsx`, `RestockAlertPage_consumer.jsx`, and `FeedbackPage_consumer.jsx` using `useSelector` and `useDispatch`.
   - **Biller (POS):** Connected `PosScreen.jsx` and `BillerTransactionsView.jsx` directly to the Redux store, enabling instant reactive updates across stock levels, incoming customer orders, and transaction receipts.
   - Preserved 100% of original visual layouts, badge styles, responsiveness, and localized INR currency formatting.


## Verification
- Verified production build via `npm run build` in `final_ims/react_frontend`: **Passed with 0 errors** (`vite v5.4.21`).
- Verified complete state flow from Customer hold reservation in `App_consumer` to real-time arrival, approval, and POS checkout in `App_biller`.
- Verified clean git history on `krishV2`, in sync with remote `origin/krishV2`.