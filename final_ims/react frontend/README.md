# StockOverflow - Customer Module (Complete React Implementation)

This directory contains the full, modular React conversion of the entire **Customer Module** for the StockOverflow Inventory Management System.

---

## 🏗️ Architecture & Component Hierarchy

```
<App /> (Root Application State & SPA Router)
  │
  ├── <Navbar /> (Sticky Header with Search, Store Location Selector, Cart Badge & User Menu)
  │     └── <LocationWidget /> (Triggers StoreModal)
  │
  ├── Dynamic Page Views (Single Page Application Routing):
  │     ├── <ConsumerLandingPage />    (Home: Hero banner, Category chips, Featured Products)
  │     ├── <ProductSearchPage />      (Full Search: Multi-facet filters for Brand, Stock, Category & Sorting)
  │     ├── <ProductDetailPage />      (Detail: Image gallery, Specs table, Store stock, Reviews, Recommendations)
  │     ├── <CartPage />               (Cart: Quantity steppers, line totals, cost summary, checkout CTA)
  │     ├── <CheckoutPage />           (Checkout: Pickup vs Delivery, Contact details, Payment selection)
  │     ├── <OrderConfirmationPage />  (Invoice: Printable receipt card, Save to PDF, Email & WhatsApp)
  │     ├── <OrdersPage />             (Orders: Pending holds, Delivered orders, Review/Return/Invoice links)
  │     ├── <ReturnManagementPage />   (RMA: Order lookup, item selector, reason dropdown, photo upload)
  │     ├── <FeedbackPage />           (Reviews: 1-5 star picker, category tags, detailed comments)
  │     └── <RestockAlertPage />       (Alerts: Subscribe for restock notifications on out-of-stock items)
  │
  ├── Global Modals & Overlays:
  │     ├── <StoreModal />             (Physical store location switcher)
  │     ├── <ReservationModal />       (Direct in-store hold dialog with stock validation)
  │     └── <NotificationToast />      (Animated slide-in feedback alerts)
  │
  └── <Footer /> (Brand links and metadata)
```

---

## 🔑 Key Features Implemented (in Layman's Terms)

1. **Single Page Application (SPA) Router**:
   - Smooth, instantaneous view transitions without page reloads.
2. **Lifting State Up**:
   - Cart item count and cart items are shared across Navbar, Cart, Checkout, and Confirmation.
3. **Printable Invoice & PDF Generation**:
   - One-click `window.print()` formatting for official tax receipts on the Confirmation page and in Order history.
4. **Multi-Store Inventory Scoping**:
   - Selecting a fulfillment store (`Downtown Store`, `East Coast Hub`, `Global Hub`) dynamically filters available product stock.
5. **Verified Customer Feedback & Star Ratings**:
   - 1–5 star ratings, feedback categories, review distribution breakdown, and review submission directly to the backend.
6. **Return Management (RMA Claim Portal)**:
   - Order search, item picker, return reasons, and evidence attachment.
7. **Out-of-Stock Restock Alerts**:
   - Email/SMS notification subscription for back-in-stock items.

---

## 🚀 How to Run

1. Navigate to this directory:
   ```bash
   cd "react frontend"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```
