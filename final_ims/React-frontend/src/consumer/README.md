# 🛒 Consumer Module - StockOverflow (React Frontend)

## 📌 Student Details
- **Student Name:** [Your Name]
- **Roll Number / Student ID:** [Your Roll Number]
- **Group:** Group 18 (18_stockOverflow)
- **Module:** Consumer / Shopper Storefront (`src/consumer`)

---

## 🎯 Overview
This is the **Consumer Module** of StockOverflow, built with **React 18** and **Vite**. It provides an omnichannel storefront where customers can browse live inventory across physical retail stores, reserve items for in-store pickup, and track their orders.

---

## ⚡ 3 Core Working Functionalities

### 1. Product Catalog Search & Multi-Facet Filtering
- **What it does:**
  - Real-time search bar that filters products instantly by Name, SKU, Brand, or Category.
  - Dropdown filters for **Category**, **Brand**, and **Stock Status** (*In Stock*, *Low Stock*, *Out of Stock*).
  - Sorting options to arrange items by Price (*Low to High*, *High to Low*) or Alphabetically.
- **Key Files:** `src/consumer/pages/ProductSearchPage_consumer.jsx`, `src/consumer/components/ProductCard_consumer.jsx`
- **React Concepts Used:**
  - `useState` for storing active search queries and selected filter options.
  - `useMemo` to filter and sort the product list efficiently without lag.

---

### 2. Product Details & Real-Time Store Inventory
- **What it does:**
  - Clicking any product opens a detailed view showing technical specifications (SKU, Category, Brand, Price, Lead Time).
  - Shows real-time stock availability across different physical store branches (e.g., Downtown Store, Westside Store).
  - Interactive image gallery with clickable thumbnails and star rating breakdown.
- **Key Files:** `src/consumer/pages/ProductDetailPage_consumer.jsx`
- **React Concepts Used:**
  - `useState` for managing active image thumbnails and selected pickup branch.
  - `useEffect` to fetch product data and reviews when the page loads.
  - Props passing to send product information from the catalog into the detail view.

---

### 3. Cart Management & In-Store Reservation Checkout
- **What it does:**
  - Shoppers can add products to the cart directly from the catalog or detail page.
  - Cart includes quantity steppers (`+` and `−`) and item removal buttons with live subtotal calculation.
  - Checkout form allows users to enter contact info and place an **In-Store Pickup Reservation Hold** that connects to the retailer POS.
  - Cart automatically saves to browser `localStorage` so items are not lost on page refresh.
- **Key Files:** `src/consumer/pages/CartPage_consumer.jsx`, `src/consumer/pages/CheckoutPage_consumer.jsx`, `src/consumer/App_consumer.jsx`
- **React Concepts Used:**
  - **Lifting State Up:** Cart state is kept in `App_consumer.jsx` so the navbar cart badge, cart page, and checkout always stay in sync.
  - `localStorage` sync to persist cart data across browser reloads.
  - Controlled inputs (`value` + `onChange`) for contact details and payment options on checkout.

---

## 🚀 How to Run the Project

1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Start the React Frontend:**
   ```bash
   cd React-frontend
   npm install
   npm run dev
   ```

3. Open **`http://localhost:5173`** in your browser and switch to the **Consumer** role.

---

## 🧠 Key React Concepts to Explain in Viva
- **Components & JSX:** Clean functional components dividing the UI into reusable pieces (Navbar, Cards, Filters, Pages).
- **`useState`:** Tracks changing UI data like search text, cart items, and active views.
- **`useEffect`:** Handles data fetching from the backend API when components mount.
- **`useMemo`:** Optimizes performance by recalculating filtered products and cart subtotals only when their data changes.
- **Lifting State Up:** Storing the shared `cart` state in `App_consumer.jsx` and passing updater functions as props.

---

## 🎬 Quick 3-Step Demo Guide for Evaluation
1. **Show Search & Filter:** Open Catalog (`Products`), type `"MacBook"` in the search box, and filter by `"In Stock"`.
2. **Show Product Details:** Click a product, show the specs table and the store branch stock counts.
3. **Show Cart & Checkout:** Click `+ Reserve`, open the Cart, change quantity with `+`/`−`, proceed to checkout, and submit reservation.
