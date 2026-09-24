# StockOverflow - Unified Multi-Module React Frontend

This repository houses the unified Single Page Application (SPA) for **StockOverflow**, built with **React 18 + Vite 5**.

It combines:
1. 🛒 **Consumer Module** (Merged from Krish React): Public marketplace, product search, detail specs, live inventory checks, reservation holds & cart, checkout, order tracking, returns (RMA), feedback, and restock alerts.
2. 🏬 **Retailer Module** (Abhiraj React Implementation): Full retailer store management, cashier POS billing, inventory overview, low-stock alerts, stock adjustments, multi-store management, supplier management & scorecards, reorder recommendations, purchase orders, purchase returns, billers governance, and subscription billing.
3. 🚚 **Supplier Module**: Wholesale supply shipments and dispatch manifests.
4. 🛡️ **Admin Module**: Master control center, role governance, user management, and analytics.

---

## 🏛️ Project Architecture & Folder Structure

```
react-frontend/ (and react_frontend/)
├── package.json
├── vite.config.js
├── index.html
├── README.md
├── public/
│   ├── Logo.png
│   ├── cart-image.png
│   └── assets/                  <-- High-res branding and landing images
└── src/
    ├── App.jsx                  <-- Central Root Hub & Multi-Module Switcher
    ├── main.jsx                 <-- Mounts App.jsx inside <AuthProvider>
    ├── index.css                <-- Unified Design System & Styling
    │
    ├── consumer/                <-- 🛒 Consumer Module (Complete & Active)
    │   ├── App_consumer.jsx     <-- Consumer SPA Controller & Router
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── CustomerLayout_consumer.jsx
    │   │   ├── CategoryFilter_consumer.jsx
    │   │   ├── ConsumerLandingPage_consumer.jsx
    │   │   ├── Footer_consumer.jsx
    │   │   ├── HeroSection_consumer.jsx
    │   │   ├── LocationWidget_consumer.jsx
    │   │   ├── Navbar_consumer.jsx
    │   │   ├── NotificationToast_consumer.jsx
    │   │   ├── ProductCard_consumer.jsx
    │   │   ├── ProductGrid_consumer.jsx
    │   │   ├── ReservationModal_consumer.jsx
    │   │   └── StoreModal_consumer.jsx
    │   ├── pages/
    │   │   ├── CartPage_consumer.jsx
    │   │   ├── CheckoutPage_consumer.jsx
    │   │   ├── FeedbackPage_consumer.jsx
    │   │   ├── OrderConfirmationPage_consumer.jsx
    │   │   ├── OrdersPage_consumer.jsx
    │   │   ├── ProductDetailPage_consumer.jsx
    │   │   ├── ProductSearchPage_consumer.jsx
    │   │   ├── RestockAlertPage_consumer.jsx
    │   │   └── ReturnManagementPage_consumer.jsx
    │   ├── utils/
    │   │   └── api_consumer.js
    │   └── data/
    │       └── mockProducts_consumer.js
    │
    ├── retailer/                <-- 🏬 Retailer Module (Complete & Active)
    │   ├── App_retailer.jsx     <-- Retailer Controller (Landing + Views)
    │   ├── components/
    │   │   ├── retailer/        <-- 15+ Retailer Views and Layout
    │   │   ├── landing/         <-- Retailer Landing Page & Biller Modal
    │   │   └── auth/            <-- Login Modal & Auth Forms
    │   ├── api/                 <-- retailerApi.js & client.js
    │   └── context/             <-- AuthContext.jsx
    │
    ├── supplier/                <-- 🚚 Supplier Module
    │   └── App_supplier.jsx
    │
    ├── admin/                   <-- 🛡️ Admin Module
    │   └── App_admin.jsx
    │
    ├── components/              <-- Retailer & shared components
    ├── api/                     <-- Scoped HTTP client & retailer API
    ├── context/                 <-- AuthContext
    └── css/                     <-- Modular stylesheets (retailer, consumer, landing, global)
```

---

## 🚀 How to Run

1. **Start the Backend** (NestJS):
   ```bash
   cd final_ims/backend
   npm run start:dev
   ```

2. **Start the React Frontend**:
   ```bash
   cd final_ims/react-frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧭 Multi-Module Portal Switcher
The **StockOverflow Hub bar** at the top of the browser window enables instant 1-click switching between:
- 🛒 **Consumer**: Public marketplace, catalog search, in-store pickup holds, orders, and reviews.
- 🏬 **Retailer**: Storefront cashier billing, POS, branch inventory, purchase orders, and analytics.
- 🚚 **Supplier**: Wholesale supply shipments and dispatch manifests.
- 🛡️ **Admin**: Master control center, user governance, and analytics.
