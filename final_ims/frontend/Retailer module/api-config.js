// Shared API configuration and retailer session helpers.
(function () {
  var defaultBase =
    window.location && window.location.hostname
      ? window.location.protocol + '//' + window.location.hostname + ':3001'
      : 'http://localhost:3001';

  window.API_BASE_URL = window.API_BASE_URL || defaultBase;
  if (document && document.documentElement) {
    document.documentElement.setAttribute('data-retailer-auth', 'checking');
    if (!document.getElementById('retailer-auth-style')) {
      var authStyle = document.createElement('style');
      authStyle.id = 'retailer-auth-style';
      authStyle.textContent =
        'html[data-retailer-auth="checking"] body{visibility:hidden;}';
      document.head.appendChild(authStyle);
    }
  }

  var COLLECTION_PATHS = [
    '/api/products',
    '/api/customers',
    '/api/billers',
    '/api/returns',
    '/api/stock-adjustments',
    '/api/transactions',
    '/api/purchase-orders',
    '/api/stores',
  ];

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem('so_session') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function writeSession(session) {
    if (!session) return null;
    localStorage.setItem('so_session', JSON.stringify(session));
    return session;
  }

  function redirectToLogin() {
    window.location.href = '../index.html';
  }

  function revealRetailerPage() {
    if (document && document.documentElement) {
      document.documentElement.setAttribute('data-retailer-auth', 'ready');
    }
  }

  function guardRetailerSession() {
    var session = readSession();
    if (
      !session ||
      String(session.role || '').toLowerCase() !== 'retailer' ||
      String(session.status || 'Active') !== 'Active'
    ) {
      redirectToLogin();
      return null;
    }
    if (!session.profileId && !(session.profile && session.profile.businessName)) {
      window.location.href = '../index.html';
      return null;
    }
    return session;
  }

  function getRetailerId(session) {
    var activeSession = session || readSession();
    return String(
      (activeSession && (activeSession.profileId || activeSession.id)) || '',
    ).trim();
  }

  function normalizeStoreId(value, fallback) {
    var raw = String(value || fallback || '').trim();
    return raw || '';
  }

  function getStoresFromProfile(profile) {
    var stores = Array.isArray(profile && profile.stores) ? profile.stores : [];
    return stores.map(function (store, index) {
      var id = normalizeStoreId(
        store && (store.code || store.storeId || store.id),
        'store-' + (index + 1),
      );
      return {
        id: id,
        code: id,
        name: String(store && store.name || 'Store ' + (index + 1)).trim(),
        address: String(store && store.address || '').trim(),
        contactPerson: String(store && store.contactPerson || '').trim(),
        phone: String(store && store.phone || '').trim(),
        type: String(store && store.type || '').trim(),
        status: String(store && store.status || 'active').trim(),
      };
    });
  }

  function buildInitials(name) {
    return String(name || 'RT')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join('')
      .toUpperCase() || 'RT';
  }

  function getCurrentStoreId(session) {
    var activeSession = session || readSession();
    return normalizeStoreId(
      activeSession && activeSession.currentStoreId,
      activeSession && activeSession.storeId,
    );
  }

  function setCurrentStore(storeId) {
    var session = guardRetailerSession();
    if (!session) return;
    session.currentStoreId = normalizeStoreId(storeId);
    session.storeId = session.currentStoreId;
    syncSessionStores(session);
  }

  function getCurrentStore(session) {
    var activeSession = session || readSession();
    var stores = getStoresFromProfile(activeSession && activeSession.profile);
    var currentStoreId = getCurrentStoreId(activeSession);
    return (
      stores.find(function (store) {
        return store.id === currentStoreId;
      }) ||
      stores[0] ||
      null
    );
  }

  function syncSessionStores(session) {
    if (!session) return null;
    var stores = getStoresFromProfile(session.profile);
    var allowedStoreIds = stores.map(function (store) {
      return store.id;
    });
    session.accessibleStoreIds = allowedStoreIds;

    if (!allowedStoreIds.length) {
      session.currentStoreId = '';
      session.storeId = '';
      session.store = '';
      return writeSession(session);
    }

    if (allowedStoreIds.indexOf(session.currentStoreId) === -1) {
      session.currentStoreId = allowedStoreIds[0];
    }

    session.storeId = session.currentStoreId;
    var currentStore = getCurrentStore(session);
    session.store = currentStore ? currentStore.name : '';
    return writeSession(session);
  }

  async function request(path, options) {
    var response = await fetch(window.API_BASE_URL + path, options || {});
    var contentType = response.headers.get('content-type') || '';
    var payload =
      contentType.indexOf('application/json') >= 0
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      var message =
        payload && typeof payload === 'object'
          ? Array.isArray(payload.message)
            ? payload.message.join(', ')
            : payload.message || payload.error || 'Request failed'
          : String(payload || 'Request failed');
      throw new Error(message);
    }

    return payload;
  }

  function withQuery(path, params) {
    var search = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        search.set(key, String(value).trim());
      }
    });
    if (!search.toString()) return path;
    return path + (path.indexOf('?') >= 0 ? '&' : '?') + search.toString();
  }

  function shouldAppendScope(path) {
    return COLLECTION_PATHS.some(function (prefix) {
      return String(path || '').indexOf(prefix) === 0;
    });
  }

  function buildScopedPath(path, extraParams) {
    var session = readSession();
    var params = extraParams ? { ...extraParams } : {};
    if (shouldAppendScope(path)) {
      params.retailerId = params.retailerId || getRetailerId(session);
      params.storeId = params.storeId || getCurrentStoreId(session);
    }
    return withQuery(path, params);
  }

  function withScopedPayload(payload) {
    var session = readSession();
    var nextPayload = payload ? { ...payload } : {};
    if (nextPayload.retailerId == null) {
      nextPayload.retailerId = getRetailerId(session);
    }
    if (nextPayload.storeId == null) {
      nextPayload.storeId = getCurrentStoreId(session);
    }
    return nextPayload;
  }

  function getStockStatus(product) {
    var qty = Number(product && product.qty) || 0;
    var min = Number(product && product.min) || 10;
    var max = Number(product && product.max) || 0;

    if (qty <= 0) return 'out';
    if (qty <= min || (max > 0 && qty / max <= 0.2)) return 'low';
    return 'ok';
  }

  function toInventoryProduct(product) {
    return {
      sku: product.sku,
      name: product.name,
      cat: product.category,
      qty: Number(product.qty) || 0,
      max: Number(product.max) || 0,
      min: Number(product.min) || 0,
      price: Number(product.price) || 0,
      emoji: product.emoji || 'PKG',
      soldThisMonth: Number(product.soldThisMonth) || 0,
      trend: product.trend || 'up',
      productImg: product.productImg || '',
    };
  }

  function toPurchaseOrderProduct(product) {
    return {
      id: product.id,
      name: product.name,
      emoji: product.emoji || 'PKG',
      sku: product.sku,
      cat: product.category,
      price: Number(product.price) || 0,
      qty: 1,
      stock: Number(product.qty) || 0,
      stockStatus: getStockStatus(product),
      productImg: product.productImg || '',
    };
  }

  function getErrorMessage(error) {
    if (!error) return 'Something went wrong';
    if (typeof error === 'string') return error;
    return error.message || 'Something went wrong';
  }

  function ensureToastRoot() {
    var existing = document.getElementById('retailer-toast-root');
    if (existing) return existing;

    var root = document.createElement('div');
    root.id = 'retailer-toast-root';
    root.style.position = 'fixed';
    root.style.top = '20px';
    root.style.right = '20px';
    root.style.zIndex = '9999';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.gap = '10px';
    root.style.pointerEvents = 'none';
    document.body.appendChild(root);
    return root;
  }

  function showToast(message, kind) {
    if (!document || !document.body) return;

    var palette = {
      success: { bg: '#ecfdf3', border: '#a7f3d0', text: '#065f46' },
      error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
      info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    };
    var tone = palette[kind] || palette.info;
    var root = ensureToastRoot();
    var toast = document.createElement('div');

    toast.textContent = message;
    toast.style.minWidth = '240px';
    toast.style.maxWidth = '360px';
    toast.style.padding = '12px 14px';
    toast.style.borderRadius = '12px';
    toast.style.border = '1px solid ' + tone.border;
    toast.style.background = tone.bg;
    toast.style.color = tone.text;
    toast.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.12)';
    toast.style.fontFamily = '"Nunito Sans", sans-serif';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '700';
    toast.style.lineHeight = '1.4';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

    root.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 180);
    }, 2800);
  }

  async function refreshRetailerSession() {
    var session = guardRetailerSession();
    if (!session) return null;
    var selectedStoreId = getCurrentStoreId(session);

    try {
      var user = await request('/api/users/' + encodeURIComponent(session.id));
      if (String(user.role || '').toLowerCase() !== 'retailer') {
        localStorage.removeItem('so_session');
        redirectToLogin();
        return null;
      }

      var nextSession = {
        ...session,
        ...user,
        role: 'retailer',
        currentStoreId: selectedStoreId || user.currentStoreId || user.storeId,
        storeId: selectedStoreId || user.storeId || user.currentStoreId,
        initials: buildInitials(user.name),
      };
      syncSessionStores(nextSession);
      var refreshedSession = readSession();
      if (
        !refreshedSession ||
        (!refreshedSession.profileId &&
          !(refreshedSession.profile && refreshedSession.profile.businessName))
      ) {
        window.location.href = '../index.html';
        return null;
      }
      return refreshedSession;
    } catch (_error) {
      localStorage.removeItem('so_session');
      redirectToLogin();
      return null;
    }
  }

  function buildStoreSwitcher() {
    var topbarLeft = document.querySelector('.topbar-left');
    if (!topbarLeft) return;

    var session = readSession();
    var stores = getStoresFromProfile(session && session.profile);
    if (!stores.length) return;

    var existing = document.getElementById('retailerStoreSwitcherWrap');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.id = 'retailerStoreSwitcherWrap';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '8px';
    wrap.style.padding = '6px 10px';
    wrap.style.border = '1px solid #e5e7eb';
    wrap.style.borderRadius = '10px';
    wrap.style.background = '#fff';

    var label = document.createElement('span');
    label.textContent = 'Store';
    label.style.fontSize = '12px';
    label.style.fontWeight = '700';
    label.style.color = '#6b7280';

    var select = document.createElement('select');
    select.id = 'retailerStoreSwitcher';
    select.style.border = 'none';
    select.style.outline = 'none';
    select.style.background = 'transparent';
    select.style.fontFamily = '"Nunito Sans", sans-serif';
    select.style.fontSize = '13px';
    select.style.fontWeight = '700';
    select.style.color = '#111827';
    select.style.cursor = 'pointer';

    stores.forEach(function (store) {
      var option = document.createElement('option');
      option.value = store.id;
      option.textContent = store.name;
      select.appendChild(option);
    });

    select.value = getCurrentStoreId(session) || stores[0].id;
    select.addEventListener('change', function () {
      setCurrentStore(select.value);
      var current = getCurrentStore(readSession());
      if (current) {
        var activeSession = readSession();
        activeSession.store = current.name;
        writeSession(activeSession);
      }
      window.dispatchEvent(
        new CustomEvent('retailer:store-changed', {
          detail: { storeId: select.value },
        }),
      );
      window.location.reload();
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    topbarLeft.appendChild(wrap);
  }

  function applyAvatarAndProfileUi() {
    var session = readSession();
    if (!session) return;

    var initials = buildInitials(session.name);
    ['avatar', 'topbarAvatar', 'sidebarAvatar'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = initials;
    });

    document
      .querySelectorAll('.topbar-avatar, .tb-avatar')
      .forEach(function (el) {
        el.textContent = initials;
      });
  }

  function openProfilePage() {
    var currentPath = String(window.location && window.location.pathname || '')
      .toLowerCase();
    if (
      currentPath.endsWith('/retailer_profile.html') ||
      currentPath.endsWith('retailer_profile.html')
    ) {
      return;
    }
    window.location.href = 'Retailer_Profile.html';
  }

  function renderProfileModal() {
    var session = readSession();
    var profileModal = document.getElementById('profileModal');
    var profileContent = document.getElementById('profileContent');
    if (!profileModal || !profileContent || !session) return;

    var stores = getStoresFromProfile(session.profile);
    var currentStore = getCurrentStore(session);
    var initials = buildInitials(session.name);
    var profile = session.profile || {};

    profileContent.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:18px;font-family:Nunito Sans, sans-serif;">' +
        '<div style="display:flex;align-items:center;gap:16px;">' +
          '<div style="width:60px;height:60px;border-radius:50%;background:#5b67ca;color:#fff;font-size:20px;font-weight:800;display:flex;align-items:center;justify-content:center;">' + initials + '</div>' +
          '<div>' +
            '<div style="font-size:18px;font-weight:800;color:#111827;">' + escapeHtml(session.name) + '</div>' +
            '<div style="font-size:13px;color:#6b7280;">' + escapeHtml(session.email || '') + '</div>' +
            '<div style="font-size:13px;color:#6b7280;">Retailer' + (currentStore ? ' • ' + escapeHtml(currentStore.name) : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;color:#374151;">' +
          '<div><strong>Business:</strong> ' + escapeHtml(profile.businessName || '-') + '</div>' +
          '<div><strong>Business Email:</strong> ' + escapeHtml(profile.businessEmail || '-') + '</div>' +
          '<div><strong>Phone:</strong> ' + escapeHtml(profile.businessPhone || '-') + '</div>' +
          '<div><strong>Tax ID:</strong> ' + escapeHtml(profile.taxId || '-') + '</div>' +
          '<div style="grid-column:span 2;"><strong>Address:</strong> ' + escapeHtml(profile.address || '-') + '</div>' +
          '<div style="grid-column:span 2;"><strong>Website:</strong> ' + escapeHtml(profile.website || '-') + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:8px;color:#111827;">Stores</div>' +
          '<div style="display:flex;flex-direction:column;gap:8px;">' +
            (stores.length
              ? stores
                  .map(function (store) {
                    return (
                      '<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">' +
                        '<div>' +
                          '<div style="font-weight:700;color:#111827;">' + escapeHtml(store.name) + '</div>' +
                          '<div style="font-size:12px;color:#6b7280;">' + escapeHtml(store.address || store.type || 'Store profile') + '</div>' +
                        '</div>' +
                        '<div style="font-size:12px;font-weight:700;color:#4b5563;">' + escapeHtml(store.status || 'active') + '</div>' +
                      '</div>'
                    );
                  })
                  .join('')
              : '<div style="font-size:13px;color:#6b7280;">No stores configured yet.</div>') +
          '</div>' +
        '</div>' +
        '<button onclick="logout()" style="margin-top:16px;padding:8px 16px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;">Logout</button>' +
      '</div>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function initializeRetailerUi() {
    var session = guardRetailerSession();
    if (!session) return;
    var refreshedSession = await refreshRetailerSession();
    if (!refreshedSession) return;
    applyAvatarAndProfileUi();
    buildStoreSwitcher();
    renderProfileModal();
    revealRetailerPage();
  }

  window.RetailerApi = {
    request: function (path, options, queryParams) {
      return request(buildScopedPath(path, queryParams), options);
    },
    getSession: readSession,
    refreshSession: refreshRetailerSession,
    getRetailerId: getRetailerId,
    getCurrentStore: getCurrentStore,
    getCurrentStoreId: getCurrentStoreId,
    setCurrentStore: setCurrentStore,
    getStoresFromProfile: function () {
      return getStoresFromProfile(readSession() && readSession().profile);
    },
    getProducts: function () {
      return request(buildScopedPath('/api/products'));
    },
    getProduct: function (id) {
      return request(buildScopedPath('/api/products/' + id));
    },
    createProduct: function (payload) {
      return request('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    updateProduct: function (id, payload) {
      return request('/api/products/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    deleteProduct: function (id) {
      return request(buildScopedPath('/api/products/' + id), { method: 'DELETE' });
    },
    getCustomers: function () {
      return request(buildScopedPath('/api/customers'));
    },
    createCustomer: function (payload) {
      return request('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    updateCustomer: function (id, payload) {
      return request('/api/customers/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    deleteCustomer: function (id) {
      return request(buildScopedPath('/api/customers/' + id), {
        method: 'DELETE',
      });
    },
    getBillers: function () {
      return request(buildScopedPath('/api/billers'));
    },
    createBiller: function (payload) {
      return request('/api/billers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    updateBiller: function (id, payload) {
      return request('/api/billers/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    deleteBiller: function (id) {
      return request(buildScopedPath('/api/billers/' + id), { method: 'DELETE' });
    },
    getSuppliers: function () {
      return request('/api/suppliers');
    },
    getStores: function () {
      return request(buildScopedPath('/api/stores'));
    },
    getWarehouses: function () {
      return request(buildScopedPath('/api/stores'));
    },
    deleteWarehouse: function (id) {
      return request('/api/warehouses/' + id, { method: 'DELETE' });
    },
    getReturns: function () {
      return request(buildScopedPath('/api/returns'));
    },
    updateReturn: function (id, payload) {
      return request('/api/returns/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    createReturn: function (payload) {
      return request('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    getStockAdjustments: function () {
      return request(buildScopedPath('/api/stock-adjustments'));
    },
    getTransactions: function () {
      return request(buildScopedPath('/api/transactions'));
    },
    getPurchasedProducts: function () {
      return request(buildScopedPath('/api/transactions/purchased-products'));
    },
    createStockAdjustment: function (payload) {
      return request('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    deleteStockAdjustment: function (id) {
      return request(buildScopedPath('/api/stock-adjustments/' + id), {
        method: 'DELETE',
      });
    },
    getPurchaseOrders: function () {
      return request(buildScopedPath('/api/purchase-orders'));
    },
    createPurchaseOrder: function (payload) {
      return request('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withScopedPayload(payload)),
      });
    },
    getRetailerProfile: async function () {
      var session = await refreshRetailerSession();
      return session ? session.profile || null : null;
    },
  };

  window.RetailerApiUtils = {
    getStockStatus: getStockStatus,
    toInventoryProduct: toInventoryProduct,
    toPurchaseOrderProduct: toPurchaseOrderProduct,
  };

  window.RetailerUi = {
    getErrorMessage: getErrorMessage,
    showToast: showToast,
  };

  window.showProfileModal = openProfilePage;
  window.openRetailerProfilePage = openProfilePage;

  window.closeProfileModal = function () {
    var modal = document.getElementById('profileModal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  window.logout = function () {
    localStorage.removeItem('so_session');
    window.location.href = '../index.html';
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.showProfileModal = openProfilePage;
    initializeRetailerUi();
  });
})();
