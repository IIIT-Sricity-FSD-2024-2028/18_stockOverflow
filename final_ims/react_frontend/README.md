# StockOverflow - Unified React Frontend

This is the unified React Single Page Application (SPA) for **StockOverflow**, built with **React 18 + Vite 5**.

It houses all core business portals under modular subdirectories in `src/` and connects them through a top-level orchestrator in `src/App.jsx`.

---

## 🏛️ Project Architecture

```
react_frontend/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── Logo.png
│   └── cart-image.png
└── src/
    ├── App.jsx                      <-- Central Root Hub & Module Switcher
    ├── main.jsx                     <-- Mounts App.jsx
    ├── index.css                    <-- Unified Design System & Styling
    │
    ├── consumer/                    <-- 🛒 Consumer Module (Complete & Active)
    │   ├── App_consumer.jsx         <-- Consumer SPA Controller & Router
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
    ├── supplier/                    <-- 🚚 Supplier Module (Ready for Components)
    │   ├── App_supplier.jsx
    │   ├── components/
    │   ├── pages/
    │   └── utils/
    │
    ├── retailer/                    <-- 🏬 Retailer Module (Ready for Components)
    │   ├── App_retailer.jsx
    │   ├── components/
    │   ├── pages/
    │   └── utils/
    │
    └── admin/                       <-- 🛡️ Admin Module (Ready for Components)
        ├── App_admin.jsx
        ├── components/
        ├── pages/
        └── utils/
```

---

## 🚀 How to Run

1. **Start the NestJS Backend**:
   ```bash
   cd final_ims/backend
   npm run start:dev
   ```

2. **Start the React Frontend**:
   ```bash
   cd final_ims/react_frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧭 Multi-Module Portal Switcher
At the top of the browser window, the **StockOverflow Hub bar** allows instant switching between:
- 🛒 **Consumer**: Public marketplace, catalog search, in-store pickup holds, and reviews.
- 🏬 **Retailer**: Storefront cashier billing, POS, and branch inventory.
- 🚚 **Supplier**: Wholesale supply shipments and dispatch manifests.
- 🛡️ **Admin**: Master control center, user governance, and analytics.
