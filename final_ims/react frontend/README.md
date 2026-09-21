# StockOverflow - Consumer Landing Page (React Implementation)

This directory contains the full React conversion of the **Consumer Landing Page** for the StockOverflow Inventory Management System.

---

## 🏗️ Architecture & Component Decomposition

```
<ConsumerLandingPage /> (Parent / Common State Container)
  ├── <Navbar />
  │     ├── <LocationWidget />  (Child: invokes onLocationClick)
  │     ├── Nav Links (renders dynamic Cart item count badge)
  │     └── Logout Action       (Child: invokes onLogout callback)
  ├── <HeroSection />           (Child: invokes onBrowseClick callback)
  ├── <CategoryFilter />        (Child: invokes onSelectCategory & onSearchChange callbacks)
  ├── <ProductGrid />           (Child: renders list of ProductCards)
  │     └── <ProductCard />     (Child: invokes onViewProduct & onAddToCart callbacks)
  ├── <StoreModal />            (Child: location picker, invokes onSelectStore & onClose callbacks)
  ├── <NotificationToast />     (Child: displays alert feedback)
  └── <Footer />                (Child: displays metadata and copyright)
```

---

## 🔑 Key Concepts Implemented

### 1. Lifting State Up (Shared Data in `ConsumerLandingPage`)
- **`cart` & `cartCount`**: Shared between `<ProductCard />` (which adds items) and `<Navbar />` (which renders the live badge counter).
- **`selectedCategory`**: Filter state shared between `<CategoryFilter />` (which changes active category) and `<ProductGrid />` (which displays only matching products).
- **`searchQuery`**: Real-time keyword filter shared between `<CategoryFilter />` and `<ProductGrid />`.
- **`selectedStore`**: Active fulfillment center shared between `<Navbar />` (`LocationWidget`) and `<StoreModal />`.
- **`products`**: Catalog array loaded from the NestJS backend API (`/api/products`) with seamless fallback to `mockProducts.js` and `localStorage`.

### 2. Props Data Flow (Parent to Child)
- `<Navbar cartCount={cartCount} selectedStore={selectedStore} onLocationClick={...} onLogout={...} />`
- `<HeroSection onBrowseClick={...} />`
- `<CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={...} searchQuery={searchQuery} onSearchChange={...} totalCount={...} />`
- `<ProductGrid products={filteredProducts} loading={loading} onViewProduct={...} onAddToCart={...} selectedCategory={selectedCategory} />`
- `<ProductCard product={product} onViewProduct={...} onAddToCart={...} />`
- `<StoreModal isOpen={isStoreModalOpen} currentStore={selectedStore} stores={stores} onSelectStore={...} onClose={...} />`
- `<NotificationToast message={toastMessage} visible={!!toastMessage} />`
- `<Footer companyName="StockOverflow" year={2026} />`

### 3. Child-to-Parent Communication (Callbacks)
- **`onSelectCategory(category)`**: Invoked by `<CategoryFilter />` button clicks to update parent filter state.
- **`onSearchChange(text)`**: Invoked by `<CategoryFilter />` input box to update parent query state.
- **`onAddToCart(product)`**: Invoked by `<ProductCard />` "+ Cart" button to add product to cart, update badge count, persist to localStorage, and display a confirmation toast.
- **`onViewProduct(sku)`**: Invoked by `<ProductCard />` "View Details" button to store SKU in localStorage and notify user.
- **`onLocationClick()`**: Invoked by `<LocationWidget />` to trigger opening the store modal in the parent container.
- **`onSelectStore(storeName)`**: Invoked by `<StoreModal />` to update selected store location in the parent.
- **`onLogout()`**: Invoked by `<Navbar />` to clear session and reset user state.
- **`onBrowseClick()`**: Invoked by `<HeroSection />` to smoothly scroll down to the product catalog grid.

---

## 🚀 How to Run

1. Navigate to this folder:
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
