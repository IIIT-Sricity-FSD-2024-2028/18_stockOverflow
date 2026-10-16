/**
 * App_consumer.jsx - Main Application Controller for Consumer Module
 * 
 * IN LAYMAN'S TERMS:
 * This is the central controller of the React Consumer Frontend.
 * It manages:
 * 1. Single Page Application (SPA) routing between views:
 *    - Home ('home') -> The full-width storefront landing page matching consumer-landingpage.html.
 *    - Products ('search') -> The sidebar catalog search portal matching productsearch.html.
 *    - Product Detail ('detail') -> 2-column specifications, hold reservation & reviews matching product-detail.html.
 *    - Cart ('cart') -> Reservation cart with quantity steppers matching cart.html.
 *    - Checkout ('checkout') -> Reservation finalization form matching checkout.html.
 *    - Confirmation ('confirmation') -> Printable receipt invoice matching sale-confirmation.html.
 *    - Orders ('orders') -> Order history and tracking matching orders.html.
 *    - Returns ('returns') -> RMA claim form matching return-management.html.
 *    - Feedback ('feedback') -> Star rating and review form matching feedback.html.
 *    - Restock Alerts ('restock') -> Back-in-stock notification form matching restockalert.html.
 * 2. Shared cart state across all components and persistence with localStorage (`imsAppStateV1`).
 * 3. Store location selection and session management.
 */

import React, { useState, useEffect, useMemo } from 'react';

// Page Views
import ConsumerLandingPage_consumer from './components/ConsumerLandingPage_consumer';
import ProductSearchPage_consumer from './pages/ProductSearchPage_consumer';
import ProductDetailPage_consumer from './pages/ProductDetailPage_consumer';
import CartPage_consumer from './pages/CartPage_consumer';
import CheckoutPage_consumer from './pages/CheckoutPage_consumer';
import OrderConfirmationPage_consumer from './pages/OrderConfirmationPage_consumer';
import OrdersPage_consumer from './pages/OrdersPage_consumer';
import ReturnManagementPage_consumer from './pages/ReturnManagementPage_consumer';
import FeedbackPage_consumer from './pages/FeedbackPage_consumer';
import RestockAlertPage_consumer from './pages/RestockAlertPage_consumer';

// API & Storage Helpers
import {
  fetchProducts,
  fetchStores,
  getLocalCart,
  saveLocalCart,
  getLocalSession,
} from './utils/api_consumer';

export default function App_consumer({ onSwitchModule, onLogout }) {
  // ─── 1. Navigation & View Routing State ─────────────────────────────────────
  const [currentView, setCurrentView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSku = params.get('sku');
      if (urlSku) return 'detail';
    } catch {}
    return 'home';
  });
  const [viewParams, setViewParams] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSku = params.get('sku');
      if (urlSku) return { sku: urlSku };
    } catch {}
    return {};
  });

  // ─── 2. Global Catalog & Stores State ───────────────────────────────────────
  const [products, setProducts] = useState(() => {
    try {
      const local = localStorage.getItem('so_inventory') || localStorage.getItem('imsRetailerProductsV1');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── 3. Global Store Location State ─────────────────────────────────────────
  // The API filters by a store ID, while the UI shows a store name.  Keeping
  // the ID here prevents location changes from producing invalid API queries.
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    try {
      return localStorage.getItem('imsSelectedStoreId') || '';
    } catch {
      return '';
    }
  });

  // ─── 4. Global Shopping Cart State ──────────────────────────────────────────
  const [cart, setCart] = useState(() => getLocalCart());

  // ─── 5. Logged In User Session ──────────────────────────────────────────────
  const [userSession, setUserSession] = useState(() => getLocalSession());

  // ─── 6. Temporary Toast Message ─────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // ─── 7. Fetch Products & Stores on Mount & Store Change ─────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedProducts, fetchedStores] = await Promise.all([
          fetchProducts(selectedStoreId),
          fetchStores(),
        ]);

        if (isMounted) {
          setProducts(fetchedProducts);
          setStores(fetchedStores);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Backend offline or failed to fetch. Falling back to local data.', err);
          setError('Could not connect to backend server. Operating in offline/cached mode.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedStoreId]);

  const selectedStore = useMemo(() => {
    const matched = stores.find((store) => String(store.id) === String(selectedStoreId));
    return matched?.name || 'Downtown Store';
  }, [stores, selectedStoreId]);

  // ─── 8. Cart Operations ─────────────────────────────────────────────────────
  const handleAddToCart = (product, quantity = 1) => {
    if (!product?.sku) return;

    const productStoreId = product.storeId || selectedStoreId || '';
    const productStoreName =
      product.storeName ||
      stores.find((store) => String(store.id) === String(productStoreId))?.name ||
      selectedStore;

    setCart((prevCart) => {
      // A SKU held at two branches needs two separate reservation requests.
      const existingIdx = prevCart.findIndex(
        (item) => item.sku === product.sku && String(item.storeId || '') === String(productStoreId)
      );
      let updatedCart;
      if (existingIdx > -1) {
        updatedCart = [...prevCart];
        const newQty = Number(updatedCart[existingIdx].qty || 1) + Number(quantity);
        updatedCart[existingIdx] = {
          ...updatedCart[existingIdx],
          qty: newQty,
        };
      } else {
        updatedCart = [
          ...prevCart,
          {
            sku: product.sku,
            name: product.name,
            priceUSD: Number(product.priceUSD || product.price || 0),
            price: Number(product.priceUSD || product.price || 0),
            productImg: product.productImg || '',
            emoji: product.emoji || '📦',
            qty: Number(quantity),
            category: product.category || 'General',
            storeId: productStoreId,
            storeName: productStoreName,
          },
        ];
      }
      saveLocalCart(updatedCart);
      return updatedCart;
    });

    showToast(`Added ${product.name} to cart!`);
  };

  const handleUpdateCartQty = (sku, newQty, storeId = '') => {
    setCart((prevCart) => {
      let updated;
      if (newQty <= 0) {
        updated = prevCart.filter(
          (item) => !(item.sku === sku && String(item.storeId || '') === String(storeId || ''))
        );
      } else {
        updated = prevCart.map((item) =>
          item.sku === sku && String(item.storeId || '') === String(storeId || '')
            ? { ...item, qty: newQty }
            : item
        );
      }
      saveLocalCart(updated);
      return updated;
    });
  };

  const handleRemoveFromCart = (sku, storeId = '') => {
    setCart((prevCart) => {
      const updated = prevCart.filter(
        (item) => !(item.sku === sku && String(item.storeId || '') === String(storeId || ''))
      );
      saveLocalCart(updated);
      return updated;
    });
    showToast('Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    saveLocalCart([]);
  };

  // ─── 9. SPA Navigation Handlers ─────────────────────────────────────────────
  const navigateTo = (view, params = {}) => {
    setViewParams(params);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (skuOrProduct) => {
    const sku =
      typeof skuOrProduct === 'object' && skuOrProduct !== null
        ? skuOrProduct.sku || skuOrProduct.id || skuOrProduct.name
        : String(skuOrProduct || '');
    try {
      localStorage.setItem('imsSelectedSku', sku);
    } catch {}
    navigateTo('detail', { sku });
  };

  const handleSelectStore = (store) => {
    const matched =
      typeof store === 'object'
        ? store
        : stores.find((entry) => entry.name === store || String(entry.id) === String(store));
    const nextStoreId = matched?.id || (typeof store === 'string' ? store : '');
    const nextStoreName = matched?.name || (typeof store === 'string' ? store : 'Downtown Store');

    setSelectedStoreId(nextStoreId);
    try {
      localStorage.setItem('imsSelectedStoreId', nextStoreId);
    } catch {}
    showToast(`Store location switched to: ${nextStoreName}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('so_session');
    localStorage.removeItem('so_token');
    setUserSession(null);
    showToast('Logged out successfully.');
    if (onLogout) {
      onLogout();
    } else {
      navigateTo('home');
    }
  };

  const handleReservationsSubmitted = () => {
    handleClearCart();
    // The vanilla checkout creates pending holds.  A sale confirmation is only
    // available after a retailer fulfils the request at POS.
    navigateTo('orders');
  };

  const handleWriteReview = (sku) => {
    navigateTo('feedback', { sku });
  };

  const handleInitiateReturn = (sku, orderId) => {
    navigateTo('returns', { sku, orderId });
  };

  const handleViewInvoice = (orderId) => {
    navigateTo('confirmation', { orderId });
  };

  // ─── 10. View Router Switcher ───────────────────────────────────────────────
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <ConsumerLandingPage_consumer
            products={products}
            stores={stores}
            selectedStore={selectedStore}
            cart={cart}
            userSession={userSession}
            loading={loading}
            error={error}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onSelectStore={handleSelectStore}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            toastMessage={toastMessage}
          />
        );

      case 'search':
        return (
          <ProductSearchPage_consumer
            products={products}
            stores={stores}
            selectedStore={selectedStore}
            selectedStoreId={selectedStoreId}
            cart={cart}
            userSession={userSession}
            loading={loading}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );

      case 'detail': {
        const targetSku =
          viewParams?.sku ||
          localStorage.getItem('imsSelectedSku') ||
          (products[0] && products[0].sku) ||
          'PT001';
        return (
          <ProductDetailPage_consumer
            key={targetSku}
            sku={targetSku}
            products={products}
            stores={stores}
            selectedStore={selectedStore}
            selectedStoreId={selectedStoreId}
            cart={cart}
            userSession={userSession}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );
      }

      case 'cart':
        return (
          <CartPage_consumer
            cart={cart}
            userSession={userSession}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage_consumer
            cart={cart}
            selectedStore={selectedStore}
            stores={stores}
            userSession={userSession}
            onReservationsSubmitted={handleReservationsSubmitted}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );

      case 'confirmation':
        return (
          <OrderConfirmationPage_consumer
            orderId={viewParams.orderId}
            cart={cart}
            userSession={userSession}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );

      case 'orders':
        return (
          <OrdersPage_consumer
            cart={cart}
            userSession={userSession}
            onWriteReview={handleWriteReview}
            onInitiateReturn={handleInitiateReturn}
            onViewInvoice={handleViewInvoice}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );

      case 'returns':
        return (
          <ReturnManagementPage_consumer
            initialSku={viewParams.sku || ''}
            initialOrderId={viewParams.orderId || ''}
            cart={cart}
            userSession={userSession}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );

      case 'feedback':
        return (
          <FeedbackPage_consumer
            initialSku={viewParams.sku || ''}
            cart={cart}
            userSession={userSession}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );

      case 'restock':
        return (
          <RestockAlertPage_consumer
            initialSku={viewParams.sku || ''}
            cart={cart}
            userSession={userSession}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            showToast={showToast}
          />
        );

      default:
        return (
          <ConsumerLandingPage_consumer
            products={products}
            stores={stores}
            selectedStore={selectedStore}
            cart={cart}
            userSession={userSession}
            loading={loading}
            error={error}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onSelectStore={handleSelectStore}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            toastMessage={toastMessage}
          />
        );
    }
  };

  return (
    <div className="consumer-module-root">
      {renderCurrentView()}
    </div>
  );
}
