/**
 * App.jsx - Main Application Controller & Single-Page Router
 * 
 * IN LAYMAN'S TERMS:
 * This is the central controller of the React Customer Portal.
 * It manages:
 * 1. Single Page Application (SPA) routing between views:
 *    - Home ('home') -> The full-width storefront landing page.
 *    - Products ('search') -> The sidebar catalog search portal.
 *    - Product Detail ('detail') -> 2-column specifications, hold reservation & reviews.
 *    - Cart ('cart') -> Reservation cart with quantity steppers.
 *    - Checkout ('checkout') -> Reservation finalization form.
 *    - Confirmation ('confirmation') -> Printable receipt invoice.
 *    - Orders ('orders') -> Order history and tracking.
 *    - Returns ('returns') -> RMA claim form.
 *    - Feedback ('feedback') -> Star rating and review form.
 *    - Restock Alerts ('restock') -> Back-in-stock notification form.
 * 2. Shared cart state across all components and persistence with localStorage (`imsAppStateV1`).
 * 3. Store location selection and session management.
 */

import React, { useState, useEffect, useMemo } from 'react';

// Page Views
import ConsumerLandingPage from './components/ConsumerLandingPage';
import ProductSearchPage from './components/pages/ProductSearchPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import OrderConfirmationPage from './components/pages/OrderConfirmationPage';
import OrdersPage from './components/pages/OrdersPage';
import ReturnManagementPage from './components/pages/ReturnManagementPage';
import FeedbackPage from './components/pages/FeedbackPage';
import RestockAlertPage from './components/pages/RestockAlertPage';

// API & Storage Helpers
import {
  fetchProducts,
  fetchStores,
  getLocalCart,
  saveLocalCart,
  getLocalSession,
} from './utils/api';

export default function App() {
  // ─── 1. Navigation & View Routing State ─────────────────────────────────────
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  // ─── 2. Global Catalog & Stores State ───────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── 3. Global Store Location State ─────────────────────────────────────────
  const [selectedStore, setSelectedStore] = useState('Downtown Store');

  // ─── 4. Global Shopping Cart State ──────────────────────────────────────────
  const [cart, setCart] = useState(() => getLocalCart());

  // ─── 5. UI Feedback & User Session State ────────────────────────────────────
  const [toastMessage, setToastMessage] = useState('');
  const [userSession, setUserSession] = useState(() => getLocalSession());

  // ─── Fetch Initial Data on Startup ──────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        setLoading(true);
        const [productsData, storesData] = await Promise.all([
          fetchProducts(),
          fetchStores(),
        ]);

        if (isMounted) {
          setProducts(productsData);
          setStores(storesData);
          if (storesData && storesData.length > 0) {
            setSelectedStore(storesData[0].name || 'Downtown Store');
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to connect to catalog service.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Helper: Show Slide-in Toast Alert ──────────────────────────────────────
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // ─── Navigation Helper: Switch Views with Optional Parameters ───────────────
  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Cart Management Functions ──────────────────────────────────────────────
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.sku === product.sku);
      let updated;
      if (existingIdx >= 0) {
        updated = prevCart.map((item, idx) =>
          idx === existingIdx ? { ...item, qty: (Number(item.qty) || 1) + 1 } : item
        );
      } else {
        updated = [
          ...prevCart,
          {
            ...product,
            qty: 1,
            storeName: selectedStore,
          },
        ];
      }
      saveLocalCart(updated);
      return updated;
    });
    showToast(`🛒 Added "${product.name}" to cart!`);
  };

  const handleUpdateCartQty = (sku, newQty) => {
    setCart((prevCart) => {
      let updated;
      if (newQty <= 0) {
        updated = prevCart.filter((item) => item.sku !== sku);
      } else {
        updated = prevCart.map((item) =>
          item.sku === sku ? { ...item, qty: newQty } : item
        );
      }
      saveLocalCart(updated);
      return updated;
    });
  };

  const handleRemoveFromCart = (sku) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.sku !== sku);
      saveLocalCart(updated);
      return updated;
    });
    showToast('Item removed from cart.');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setCart([]);
      saveLocalCart([]);
      showToast('Cart cleared.');
    }
  };

  // ─── User Authentication & Logout ───────────────────────────────────────────
  const handleLogout = () => {
    if (window.confirm('Do you want to log out from your session?')) {
      localStorage.removeItem('so_session');
      setUserSession(null);
      showToast('You have been logged out.');
      navigateTo('home');
    }
  };

  return (
    <div className="stockoverflow-app-root">
      {/* 1. HOME VIEW (Storefront Landing Page) */}
      {currentView === 'home' && (
        <ConsumerLandingPage
          products={products}
          stores={stores}
          selectedStore={selectedStore}
          cart={cart}
          userSession={userSession}
          loading={loading}
          error={error}
          onAddToCart={handleAddToCart}
          onViewProduct={(sku) => navigateTo('detail', { sku })}
          onSelectStore={(storeName) => setSelectedStore(storeName)}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          toastMessage={toastMessage}
        />
      )}

      {/* 2. PRODUCTS SEARCH & CATALOG VIEW */}
      {currentView === 'search' && (
        <ProductSearchPage
          products={products}
          stores={stores}
          selectedStore={selectedStore}
          cart={cart}
          userSession={userSession}
          loading={loading}
          onAddToCart={handleAddToCart}
          onViewProduct={(sku) => navigateTo('detail', { sku })}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
        />
      )}

      {/* 3. PRODUCT DETAIL VIEW */}
      {currentView === 'detail' && (
        <ProductDetailPage
          sku={viewParams.sku || (products[0] && products[0].sku) || 'PT001'}
          products={products}
          stores={stores}
          selectedStore={selectedStore}
          cart={cart}
          userSession={userSession}
          onAddToCart={handleAddToCart}
          onViewProduct={(sku) => navigateTo('detail', { sku })}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* 4. SHOPPING & RESERVATION CART VIEW */}
      {currentView === 'cart' && (
        <CartPage
          cart={cart}
          userSession={userSession}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
        />
      )}

      {/* 5. CHECKOUT & FINALIZE ORDER VIEW */}
      {currentView === 'checkout' && (
        <CheckoutPage
          cart={cart}
          selectedStore={selectedStore}
          stores={stores}
          userSession={userSession}
          onOrderPlaced={(orderId) => {
            setCart([]);
            saveLocalCart([]);
            navigateTo('confirmation', { orderId });
          }}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* 6. ORDER CONFIRMATION & PRINTABLE INVOICE VIEW */}
      {currentView === 'confirmation' && (
        <OrderConfirmationPage
          orderId={viewParams.orderId || ''}
          cart={cart}
          userSession={userSession}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* 7. MY ORDERS & TRACKING VIEW */}
      {currentView === 'orders' && (
        <OrdersPage
          cart={cart}
          userSession={userSession}
          onWriteReview={(sku) => navigateTo('feedback', { sku })}
          onInitiateReturn={(sku, orderId) => navigateTo('returns', { sku, orderId })}
          onViewInvoice={(orderId) => navigateTo('confirmation', { orderId })}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
        />
      )}

      {/* 8. RETURN & RMA MANAGEMENT VIEW */}
      {currentView === 'returns' && (
        <ReturnManagementPage
          initialSku={viewParams.sku || ''}
          initialOrderId={viewParams.orderId || ''}
          cart={cart}
          userSession={userSession}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* 9. VERIFIED CUSTOMER FEEDBACK & REVIEWS VIEW */}
      {currentView === 'feedback' && (
        <FeedbackPage
          initialSku={viewParams.sku || ''}
          cart={cart}
          userSession={userSession}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* 10. OUT-OF-STOCK RESTOCK ALERTS VIEW */}
      {currentView === 'restock' && (
        <RestockAlertPage
          initialSku={viewParams.sku || ''}
          cart={cart}
          userSession={userSession}
          onNavigate={(view) => navigateTo(view)}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}
    </div>
  );
}
