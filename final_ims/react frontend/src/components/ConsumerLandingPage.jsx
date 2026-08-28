import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import StoreModal from './StoreModal';
import NotificationToast from './NotificationToast';
import Footer from './Footer';
import {
  fetchProducts,
  fetchStores,
  getLocalCart,
  saveLocalCart,
  getLocalSession
} from '../utils/api';

/**
 * ConsumerLandingPage (Parent Container Component)
 * 
 * Demonstrates:
 * 1. Lifting State Up:
 *    - `cart` / `cartCount`: Shared between ProductCard (which adds items) and Navbar (which renders the badge counter).
 *    - `selectedCategory`: Shared between CategoryFilter (which triggers updates) and ProductGrid (which filters items).
 *    - `searchQuery`: Shared between CategoryFilter search input and ProductGrid filtered list.
 *    - `selectedStore`: Shared between Navbar LocationWidget and StoreModal picker.
 *    - `products`: Shared catalog data used by CategoryFilter to calculate categories and ProductGrid to render cards.
 * 
 * 2. Child-to-Parent Callbacks:
 *    - `handleSelectCategory(category)`: Passed to CategoryFilter
 *    - `handleSearchChange(query)`: Passed to CategoryFilter
 *    - `handleAddToCart(product)`: Passed to ProductGrid -> ProductCard
 *    - `handleViewProduct(sku)`: Passed to ProductGrid -> ProductCard
 *    - `handleOpenStoreModal()`: Passed to Navbar -> LocationWidget
 *    - `handleCloseStoreModal()`: Passed to StoreModal
 *    - `handleSelectStore(storeName)`: Passed to StoreModal
 *    - `handleLogout()`: Passed to Navbar
 *    - `handleBrowseClick()`: Passed to HeroSection
 */
export default function ConsumerLandingPage() {
  // ─── Lifted States ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('Global Hub');
  
  const [cart, setCart] = useState(() => getLocalCart());
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userSession, setUserSession] = useState(() => getLocalSession());

  // ─── Initialize Data ────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [productsData, storesData] = await Promise.all([
          fetchProducts(),
          fetchStores()
        ]);
        if (isMounted) {
          setProducts(productsData);
          setStores(storesData);
          if (storesData && storesData.length > 0) {
            setSelectedStore(storesData[0].name || 'Global Hub');
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch product catalog.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Compute Total Cart Quantity ────────────────────────────────────────────
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  }, [cart]);

  // ─── Derive Unique Categories from Products ─────────────────────────────────
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category && String(p.category).trim()) {
        set.add(String(p.category).trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // ─── Filtered Products (by Category and Search Keyword) ─────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(p.name || '').toLowerCase().includes(query) ||
        String(p.sku || '').toLowerCase().includes(query) ||
        String(p.brand || '').toLowerCase().includes(query) ||
        String(p.category || '').toLowerCase().includes(query);

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // ─── Helper for Toast Notifications ─────────────────────────────────────────
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // ─── Child-to-Parent Callbacks ──────────────────────────────────────────────

  // 1. Callback for Category Selection (from CategoryFilter)
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  // 2. Callback for Search Input Change (from CategoryFilter)
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // 3. Callback for Adding to Cart (from ProductCard)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.sku === product.sku);
      let updatedCart;
      if (existingIndex >= 0) {
        updatedCart = prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, qty: 1 }];
      }
      saveLocalCart(updatedCart);
      return updatedCart;
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  // 4. Callback for Viewing Product Detail (from ProductCard)
  const handleViewProduct = (sku) => {
    try {
      localStorage.setItem('imsSelectedSku', sku);
    } catch (_e) {
      // Ignore storage error
    }
    showToast(`Viewing product SKU: ${sku}`);
  };

  // 5. Callback for Opening Store Selection Modal (from LocationWidget / Navbar)
  const handleOpenStoreModal = () => {
    setIsStoreModalOpen(true);
  };

  // 6. Callback for Closing Store Selection Modal (from StoreModal)
  const handleCloseStoreModal = () => {
    setIsStoreModalOpen(false);
  };

  // 7. Callback for Selecting a Store (from StoreModal)
  const handleSelectStore = (storeName) => {
    setSelectedStore(storeName);
    showToast(`Delivery location updated to: ${storeName}`);
  };

  // 8. Callback for Logout (from Navbar)
  const handleLogout = () => {
    localStorage.removeItem('so_session');
    setUserSession(null);
    showToast('Logged out successfully.');
  };

  // 9. Callback for Hero CTA "Browse Products" (from HeroSection)
  const handleBrowseClick = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="consumer-app-shell">
      <div className="consumer-container">
        {/* Navigation Bar */}
        <Navbar
          cartCount={cartCount}
          selectedStore={selectedStore}
          onLocationClick={handleOpenStoreModal}
          onLogout={handleLogout}
          userSession={userSession}
        />

        {/* Hero Section */}
        <HeroSection
          onBrowseClick={handleBrowseClick}
        />

        {/* Category & Search Filter Bar */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalCount={filteredProducts.length}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          selectedCategory={selectedCategory}
        />

        {/* Footer */}
        <Footer companyName="StockOverflow" year={2026} />

        {/* Store Selection Modal */}
        <StoreModal
          isOpen={isStoreModalOpen}
          currentStore={selectedStore}
          stores={stores}
          onSelectStore={handleSelectStore}
          onClose={handleCloseStoreModal}
        />

        {/* Notification Toast Alert */}
        <NotificationToast
          message={toastMessage}
          visible={!!toastMessage}
        />
      </div>
    </div>
  );
}
