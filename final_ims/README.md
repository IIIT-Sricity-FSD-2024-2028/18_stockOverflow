# StockOverflow – Inventory Lifecycle Management System
## Academic Project Submission & Individual Evaluation Document

---

## 📌 Submission Information



## 1. Project Overview

**StockOverflow** is a multi-stakeholder retail inventory lifecycle system connecting Administrators, Retailers, Suppliers, Cashier Billers (POS), and Consumers. 

This submission documents the complete working project with special emphasis on the **Consumer Module**—the customer-facing Single Page Application (SPA) where shoppers can browse catalog inventory in real-time across physical store branches, reserve items for in-store pickup, track their orders, and file returns and verified reviews.

---

## 2. Prerequisites & Dependencies

### System Requirements:
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or `v10.x`
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge

### Dependencies Overview:
- **Backend (`/backend/package.json`)**:
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
  - `class-validator`, `class-transformer`
  - `@nestjs/swagger`, `swagger-ui-express`
- **React Frontend (`/React-frontend/package.json`)**:
  - `react`: `^18.2.0`, `react-dom`: `^18.2.0`
  - `vite`: `^5.1.4`, `@vitejs/plugin-react`: `^4.2.1`
  - `lucide-react`: `^0.344.0` (Icons)
  - `chart.js`: `^4.5.1` (Interactive trend charts)

---

## 3. Step-by-Step Project Setup & Execution

Follow these steps to run the complete working project on a fresh machine:

### Step 1: Start the Backend (NestJS Server)
Open a terminal in the root directory of the unzipped project:
```bash
cd backend
npm install
npm run start:dev
```
- The backend server will start at: **`http://localhost:3001`**
- REST API endpoints are exposed at: **`http://localhost:3001/api`**
- Swagger API documentation is accessible at: **`http://localhost:3001/api/docs`**

---

### Step 2: Start the React Frontend (Vite Server)
Open a **second terminal** window:
```bash
cd React-frontend
npm install
npm run dev
```
- The React application will start at: **`http://localhost:5173`**
- Open **`http://localhost:5173`** in your browser.

---

## 4. Testing & Demonstration Instructions

### Quick Demo Accounts:
| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Consumer / Customer** | `customer@stockoverflow.com` | `pass1234` | Full access to storefront, cart, reservations, and orders |
| **Retailer (Store Owner)** | `john@gmail.com` | `pass1234` | Full access to inventory, POS cashier billing, and POs |
| **Biller (Cashier)** | `jones@gmail.com` | `pass1234` | Point-of-Sale terminal and reservation fulfillment |

---

### Step-by-Step Consumer Module Test Flow:

1. **Storefront & Location Selection**:
   - Access the homepage at `http://localhost:5173`.
   - Log in using `customer@stockoverflow.com` / `pass1234` (or switch to the Consumer portal).
   - Click the **"Deliver to [Store]"** location widget in the top navigation bar to select a nearby retail branch (e.g., *Downtown Store* vs. *Westside Branch*).

2. **Catalog Search & Multi-Criteria Filtering**:
   - Navigate to the **Products** catalog view (`src/consumer/pages/ProductSearchPage_consumer.jsx`).
   - Type in the search box (e.g., `"MacBook"` or `"Apple"`). Notice the real-time search reaction.
   - Use dropdown filters for **Category**, **Brand**, and **Stock Status** (*In Stock*, *Low Stock*, *Out of Stock*).
   - Use the **Sort** dropdown to arrange items by *Price: Low to High* or *Alphabetically*.

3. **Product Details & Store-Wise Availability**:
   - Click on any product card (e.g., *Apple MacBook Pro 14"*).
   - Verify the 2-column specifications layout, image gallery thumbnails, and lead time.
   - Look at the right column: Verify the **Store-wise Availability breakdown** showing physical stock counts across individual store branches.
   - Verify the 5-star customer review distribution bars.

4. **Cart Management & In-Store Reservation Checkout**:
   - Click **"+ Reserve"** or **"Add to Cart"**.
   - Open the **Cart** from the top right navigation badge.
   - Adjust quantities using `+` and `−` stepper controls. Verify subtotal recalculates instantly.
   - Click **"Proceed to Checkout"**, verify customer contact info, select payment method (*Card*, *Cash on Pickup*, or *UPI*), and click **"Confirm Reservation"**.

5. **Order Tracking & Printable Receipt Invoice**:
   - The app redirects to the **Orders** page (`src/consumer/pages/OrdersPage_consumer.jsx`).
   - Verify the newly placed reservation hold appears in **Active Pickup Holds**.
   - For completed purchases, click **"View Invoice"** to open the printable itemized receipt modal with tax breakdown and barcode simulation.
   - Click **"Print Invoice"** to test native browser printing.

---

## 5. Individual Contribution & Specific File Manifest

### Student Responsibility:
I was solely responsible for the complete architecture, implementation, state management, styling, and backend integration of the **Consumer Module (`React-frontend/src/consumer/`)**.

### Detailed Manifest of Files Developed & Modified:

| # | File Name & Path | Type | Description of Contribution |
| :-: | :--- | :--- | :--- |
| **1** | `React-frontend/src/consumer/App_consumer.jsx` | Master Controller | Developed the root SPA controller for the consumer module, managing view routing (`currentView`), global `cart` state, store switching, and `localStorage` synchronization. |
| **2** | `React-frontend/src/consumer/utils/api_consumer.js` | Service Layer | Built the centralized API service wrapping `fetch()` requests (`/api/products`, `/api/stores`, `/api/reservations/requests`, `/api/transactions`, `/api/returns`) with automatic fallback to `localStorage` when offline. |
| **3** | `React-frontend/src/consumer/components/layout/CustomerLayout_consumer.jsx` | Layout Component | Developed the shared layout wrapping inner consumer pages with responsive sidebar navigation and sticky top header bar with live cart count badges. |
| **4** | `React-frontend/src/consumer/pages/ProductSearchPage_consumer.jsx` | Page View | Created the catalog portal featuring real-time keyword search, multi-facet dropdown filtering (Category, Brand, Stock Health), and price sorting using `useMemo`. |
| **5** | `React-frontend/src/consumer/pages/ProductDetailPage_consumer.jsx` | Page View | Implemented the 2-column product detail page with technical specs table, multi-thumbnail gallery, store-by-store stock breakdown, and rating distribution. |
| **6** | `React-frontend/src/consumer/pages/CartPage_consumer.jsx` | Page View | Built the shopping cart page with increment/decrement steppers (`+`/`−`), item removal, live subtotal computation, and checkout redirection. |
| **7** | `React-frontend/src/consumer/pages/CheckoutPage_consumer.jsx` | Page View | Designed the reservation checkout form capturing contact details, payment preferences, and dispatching hold requests to the retailer's POS system. |
| **8** | `React-frontend/src/consumer/pages/OrdersPage_consumer.jsx` | Page View | Implemented the order history center separating active pickup holds from fulfilled orders, with quick action triggers for reviews, returns, and invoices. |
| **9** | `React-frontend/src/consumer/pages/OrderConfirmationPage_consumer.jsx` | Modal / Page | Created the itemized printable receipt invoice component with subtotal, tax calculation, barcode simulation, and `window.print()` integration. |
| **10** | `React-frontend/src/consumer/pages/FeedbackPage_consumer.jsx` | Page View | Built the 5-star verified customer feedback submission portal with category tagging (*Quality*, *Pricing*, *Stock*, *Service*). |
| **11** | `React-frontend/src/consumer/pages/ReturnManagementPage_consumer.jsx` | Page View | Developed the RMA return claim portal enabling customers to request refunds/exchanges for delivered orders. |
| **12** | `React-frontend/src/consumer/pages/RestockAlertPage_consumer.jsx` | Page View | Built the back-in-stock alert subscription form for out-of-stock items. |
| **13** | `React-frontend/src/consumer/components/ConsumerLandingPage_consumer.jsx` | Component View | Created the full-width storefront landing view with hero banner, top-rated products by category, and store picker modal. |
| **14** | `React-frontend/src/consumer/components/ProductCard_consumer.jsx` | Component | Developed the reusable catalog product card displaying image, stock health badge, INR pricing, star rating, and direct detail links. |
| **15** | `React-frontend/src/consumer/components/ReservationModal_consumer.jsx` | Modal Component | Built the in-store pickup hold modal allowing users to reserve units at specific store locations directly from the detail view. |
| **16** | `React-frontend/src/consumer/components/StoreModal_consumer.jsx` | Modal Component | Created the branch selection modal allowing shoppers to switch between physical retail branches. |
| **17** | `React-frontend/src/consumer/components/Navbar_consumer.jsx` | Component | Developed the consumer navigation bar with branding, store selector trigger, cart badge counter, and profile actions. |
| **18** | `React-frontend/src/consumer/components/HeroSection_consumer.jsx` | Component | Built the hero banner section highlighting product categories and call-to-action buttons. |
| **19** | `React-frontend/src/consumer/components/NotificationToast_consumer.jsx` | Component | Implemented non-intrusive floating alert toasts for user actions (e.g., "Added to Cart!", "Reservation Confirmed!"). |
| **20** | `React-frontend/src/consumer/components/Footer_consumer.jsx` | Component | Developed the footer with brand information, copyright, and platform links. |
| **21** | `React-frontend/src/consumer/data/mockProducts_consumer.js` | Data Seed | Authored the offline fallback product catalog seed dataset containing high-fidelity items with specifications, images, and reviews. |
| **22** | `React-frontend/src/css/consumer.css` | Styling | Created custom CSS stylesheets containing responsive grid layouts, card hover effects, status chip colors, and modal animations. |
| **23** | `React-frontend/src/App.jsx` | Integration | Modified the root controller to cleanly mount the consumer module and handle role-based routing for consumer sessions. |
| **24** | `React-frontend/src/context/AuthContext.jsx` | State Context | Integrated consumer role normalization, session persistence, and logout cleanup into the global authentication context. |

---

## 6. Core Functionalities Implemented

### 1. Dynamic Catalog Discovery & Multi-Facet Search
- Instant debounced keyword search matching product name, SKU, brand, and category.
- Multi-dimensional filters (Category pills, Brand dropdown, and Stock Health: *In Stock*, *Low Stock*, *Out of Stock*).
- Dynamic client-side sorting (Price: Low to High, High to Low, Name: A to Z) optimized using React’s `useMemo` hook.

### 2. Comprehensive Product Specifications & Store-Wise Availability
- 2-column detailed view displaying full attributes, unit specifications, minimum order quantity, and lead time.
- Interactive multi-thumbnail gallery with live image switching.
- **Physical branch inventory breakdown** showing live unit allocations at individual store branches.
- Verified 5-star customer ratings with percentage distribution breakdown bars.

### 3. Shopping Cart & In-Store Reservation Hold Checkout
- Global cart state maintained in `App_consumer.jsx` and synced to `localStorage` (`imsAppStateV1`).
- Stepper controls (`+` and `−`) with automatic item removal upon reaching 0 quantity.
- **Omnichannel Reservation System**: Shoppers select a physical store branch and payment preference (*Card*, *Cash on Pickup*, *UPI*) to create reservation hold requests (`POST /api/reservations/requests`) linked directly to the retailer's POS terminal.

### 4. Order Tracking & Printable Invoice Receipts
- Centralized tracking interface separating active in-store pickup holds from completed purchases.
- On-demand printable invoice receipt modal displaying itemized pricing, calculated taxes, store instructions, and simulated barcode.
- Integrated with browser's native `window.print()` functionality.

### 5. Verified Customer Feedback & RMA Returns (Bonus)
- Interactive 5-star review form with category categorization (*Quality*, *Pricing*, *Stock*, *Service*) submitting directly to backend database.
- Return merchandise authorization (RMA) claim form for damaged, defective, or incorrect items.

---

