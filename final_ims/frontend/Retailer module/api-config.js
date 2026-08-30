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
    if (!session) {
      redirectToLogin();
      return null;
    }
    var role = String(session.role || '').toLowerCase();
    if (role !== 'retailer' && role !== 'admin') {
      redirectToLogin();
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
    var targetUserId = session.id || session.profileId;
    if (!targetUserId) return session;

    try {
      var user = await request('/api/users/' + encodeURIComponent(targetUserId));
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
      return refreshedSession || session;
    } catch (_error) {
      console.warn('Backend session refresh warning:', _error);
      return session;
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
    ['avatar', 'topbarAvatar', 'userAvatar', 'sidebarAvatar'].forEach(function (id) {
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

  /* ═══════════════════════════════════════════════════════
     GLOBAL TOPBAR STYLES & CONTROLLERS (PROFILE & NOTIFICATIONS)
  ═══════════════════════════════════════════════════════ */
  function injectGlobalTopbarStyles() {
    if (document.getElementById('so-topbar-global-styles')) return;
    var style = document.createElement('style');
    style.id = 'so-topbar-global-styles';
    style.textContent = `
      .profile-popover{position:absolute;top:54px;right:26px;width:280px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,.12);padding:16px;display:none;z-index:9999;text-align:left;font-family:'Nunito Sans',sans-serif;}
      .profile-popover.open{display:block;}
      .profile-popover-head{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
      .profile-popover-avatar{width:42px;height:42px;border-radius:12px;background:#2e6bc5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0;}
      .profile-popover-name{font-size:15px;font-weight:700;color:#111827;}
      .profile-popover-sub{font-size:11.5px;color:#6b7280;margin-top:2px;}
      .profile-popover-grid{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:14px;}
      .profile-popover-item{background:#f9fafb;border-radius:8px;padding:8px 10px;}
      .profile-popover-label{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;}
      .profile-popover-value{font-size:12px;font-weight:600;color:#111827;word-break:break-word;}
      .profile-popover-actions{display:flex;gap:8px;}
      .profile-popover-actions button{flex:1;justify-content:center;padding:8px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #e5e7eb;background:#fff;color:#111827;}
      .profile-popover-actions button.btn-primary{background:#2e6bc5;color:#fff;border:none;}

      /* NOTIFICATION POPOVER */
      .so-notif-popover{position:absolute;top:54px;right:66px;width:340px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 16px 36px rgba(0,0,0,0.12);display:none;z-index:9999;font-family:'Nunito Sans',sans-serif;text-align:left;overflow:hidden;}
      .so-notif-popover.open{display:block;}
      .so-notif-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f3f4f6;background:#fafbfc;}
      .so-notif-head-title{font-size:13.5px;font-weight:800;color:#111827;display:flex;align-items:center;gap:6px;}
      .so-notif-badge{background:#ef4444;color:#fff;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:10px;}
      .so-notif-clear{background:none;border:none;font-size:11.5px;font-weight:700;color:#6b7280;cursor:pointer;}
      .so-notif-clear:hover{color:#ef4444;}
      .so-notif-list{max-height:300px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px;}
      .so-notif-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:8px;background:#f9fafb;border:1px solid #f3f4f6;position:relative;transition:background .12s;}
      .so-notif-item:hover{background:#f3f4f6;}
      .so-notif-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;}
      .so-notif-icon.return{background:#eff6ff;color:#2563eb;}
      .so-notif-icon.stock{background:#fff7ed;color:#ea580c;}
      .so-notif-body{flex:1;min-width:0;}
      .so-notif-title{font-size:12.5px;font-weight:700;color:#111827;margin-bottom:2px;}
      .so-notif-msg{font-size:11.5px;color:#4b5563;line-height:1.4;word-break:break-word;}
      .so-notif-time{font-size:10.5px;color:#9ca3af;margin-top:4px;font-weight:600;}
      .so-notif-close{border:none;background:none;color:#9ca3af;font-size:14px;cursor:pointer;padding:2px 4px;border-radius:4px;line-height:1;transition:color .12s;}
      .so-notif-close:hover{color:#ef4444;background:#fee2e2;}
      .so-notif-empty{padding:26px 16px;text-align:center;color:#9ca3af;font-size:12.5px;}
    `;
    document.head.appendChild(style);
  }

  function setupGlobalProfilePopover() {
    var topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.getElementById('profilePopover')) {
      var pop = document.createElement('div');
      pop.id = 'profilePopover';
      pop.className = 'profile-popover';
      pop.innerHTML = (
        '<div class="profile-popover-head">' +
          '<div class="profile-popover-avatar" id="profilePopoverAvatar">JO</div>' +
          '<div>' +
            '<div class="profile-popover-name" id="profilePopoverName">Retailer Profile</div>' +
            '<div class="profile-popover-sub" id="profilePopoverCode">Retailer</div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-popover-grid">' +
          '<div class="profile-popover-item">' +
            '<div class="profile-popover-label">Email</div>' +
            '<div class="profile-popover-value" id="profilePopoverEmail">-</div>' +
          '</div>' +
          '<div class="profile-popover-item">' +
            '<div class="profile-popover-label">Phone</div>' +
            '<div class="profile-popover-value" id="profilePopoverPhone">-</div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-popover-actions">' +
          '<button onclick="window.location.href=\'Retailer_Profile.html\'" type="button">Edit Profile</button>' +
          '<button class="btn-primary" onclick="if(window.DB){DB.logout();}localStorage.removeItem(\'so_session\');window.location.href=\'../index.html\'" type="button">Logout</button>' +
        '</div>'
      );
      topbarRight.appendChild(pop);
    }

    document.querySelectorAll('.topbar-avatar, .tb-avatar, #topbarAvatar, #userAvatar, #avatar').forEach(function(el) {
      el.style.cursor = 'pointer';
      el.onclick = function(e) {
        window.toggleProfilePopover(e);
      };
    });

    window.toggleProfilePopover = function(e) {
      if (e) e.stopPropagation();
      var popover = document.getElementById('profilePopover');
      if (popover) {
        popover.classList.toggle('open');
        if (popover.classList.contains('open')) {
          var notifPop = document.getElementById('retailerNotifPopover');
          if (notifPop) notifPop.classList.remove('open');
          var session = readSession() || {};
          var name = session.name || (session.profile && session.profile.name) || 'Retailer Profile';
          var email = session.email || '-';
          var phone = session.phone || (session.profile && session.profile.businessPhone) || '-';
          var initials = buildInitials(name);

          var nameEl = document.getElementById('profilePopoverName');
          if (nameEl) nameEl.textContent = name;
          var emailEl = document.getElementById('profilePopoverEmail');
          if (emailEl) emailEl.textContent = email;
          var phoneEl = document.getElementById('profilePopoverPhone');
          if (phoneEl) phoneEl.textContent = phone;
          var popAvatar = document.getElementById('profilePopoverAvatar');
          if (popAvatar) popAvatar.textContent = initials;
          var codeEl = document.getElementById('profilePopoverCode');
          if (codeEl) codeEl.textContent = (session.profile && session.profile.business && session.profile.business.retailerCode) || 'Retailer';
        }
      }
    };
  }

  var activeRetailerNotifications = [];

  async function fetchAndRenderNotifications() {
    try {
      var dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
      var [returns, products] = await Promise.all([
        request(buildScopedPath('/api/returns')).catch(function() { return []; }),
        request(buildScopedPath('/api/products')).catch(function() { return []; })
      ]);

      var returnList = Array.isArray(returns) ? returns : [];
      var prodList = Array.isArray(products) ? products : [];

      var notifs = [];

      // 1. Pending Returns
      returnList.forEach(function(r) {
        var status = String(r.status || '').toLowerCase();
        if (status === 'pending') {
          var id = 'return-' + (r.id || Math.random());
          if (!dismissed.includes(id)) {
            notifs.push({
              id: id,
              type: 'return',
              title: 'Return Request Pending',
              msg: 'Customer ' + (r.customer || 'Consumer') + ' requested return for ' + (r.product || 'item') + (r.qty ? ' (Qty: ' + r.qty + ')' : ''),
              time: r.date ? new Date(r.date).toLocaleDateString('en-IN') : 'Recent',
              link: 'Returns_Management.html'
            });
          }
        }
      });

      // 2. Low Stock Alerts
      prodList.forEach(function(p) {
        var qty = Number(p.qty != null ? p.qty : (p.initialQty || 0));
        var min = Number(p.min != null ? p.min : (p.minStockAlert != null ? p.minStockAlert : (p.reorderPoint != null ? p.reorderPoint : 10)));
        if (qty <= min) {
          var id = 'stock-' + (p.sku || p.id);
          if (!dismissed.includes(id)) {
            notifs.push({
              id: id,
              type: 'stock',
              title: qty === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
              msg: (p.name || 'Product') + ' is at ' + qty + ' units (Min Alert: ' + min + ')',
              time: 'Inventory Alert',
              link: 'Low_Stocks.html'
            });
          }
        }
      });

      activeRetailerNotifications = notifs;
      updateNotificationUi();
    } catch(err) {
      console.warn('Could not load notifications:', err);
    }
  }

  function updateNotificationUi() {
    var count = activeRetailerNotifications.length;
    document.querySelectorAll('.notif-dot').forEach(function(dot) {
      dot.style.display = count > 0 ? 'block' : 'none';
    });

    var popover = document.getElementById('retailerNotifPopover');
    if (!popover) return;

    var badge = popover.querySelector('.so-notif-badge');
    if (badge) badge.textContent = count;

    var listEl = popover.querySelector('.so-notif-list');
    if (!listEl) return;

    if (count === 0) {
      listEl.innerHTML = '<div class="so-notif-empty">🎉 All caught up! No unread notifications.</div>';
      return;
    }

    listEl.innerHTML = activeRetailerNotifications.map(function(n) {
      var icon = n.type === 'return' ? '↩️' : '⚠️';
      return (
        '<div class="so-notif-item" id="notif-' + escapeHtml(n.id) + '">' +
          '<div class="so-notif-icon ' + escapeHtml(n.type) + '">' + icon + '</div>' +
          '<div class="so-notif-body" onclick="window.location.href=\'' + escapeHtml(n.link) + '\'" style="cursor:pointer;">' +
            '<div class="so-notif-title">' + escapeHtml(n.title) + '</div>' +
            '<div class="so-notif-msg">' + escapeHtml(n.msg) + '</div>' +
            '<div class="so-notif-time">' + escapeHtml(n.time) + '</div>' +
          '</div>' +
          '<button class="so-notif-close" title="Dismiss and delete" onclick="dismissRetailerNotification(event, \'' + escapeHtml(n.id) + '\')">✕</button>' +
        '</div>'
      );
    }).join('');
  }

  window.dismissRetailerNotification = function(e, id) {
    if (e) e.stopPropagation();
    var dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
    }
    activeRetailerNotifications = activeRetailerNotifications.filter(function(n) { return n.id !== id; });
    updateNotificationUi();
  };

  window.clearAllRetailerNotifications = function(e) {
    if (e) e.stopPropagation();
    var dismissed = JSON.parse(localStorage.getItem('so_dismissed_notifications') || '[]');
    activeRetailerNotifications.forEach(function(n) {
      if (!dismissed.includes(n.id)) dismissed.push(n.id);
    });
    localStorage.setItem('so_dismissed_notifications', JSON.stringify(dismissed));
    activeRetailerNotifications = [];
    updateNotificationUi();
  };

  function setupGlobalNotificationPopover() {
    var topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.getElementById('retailerNotifPopover')) {
      var pop = document.createElement('div');
      pop.id = 'retailerNotifPopover';
      pop.className = 'so-notif-popover';
      pop.innerHTML = (
        '<div class="so-notif-head">' +
          '<div class="so-notif-head-title">Notifications <span class="so-notif-badge">0</span></div>' +
          '<button class="so-notif-clear" onclick="clearAllRetailerNotifications(event)">Clear All</button>' +
        '</div>' +
        '<div class="so-notif-list">' +
          '<div class="so-notif-empty">Loading notifications...</div>' +
        '</div>'
      );
      topbarRight.appendChild(pop);
    }

    document.querySelectorAll('.tb-icon-btn, .topbar-icon-btn').forEach(function(btn) {
      btn.style.cursor = 'pointer';
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var p = document.getElementById('retailerNotifPopover');
        if (p) {
          p.classList.toggle('open');
          var profPop = document.getElementById('profilePopover');
          if (profPop) profPop.classList.remove('open');
        }
      };
    });

    document.addEventListener('click', function(e) {
      var notifPop = document.getElementById('retailerNotifPopover');
      var profPop = document.getElementById('profilePopover');
      if (notifPop && notifPop.classList.contains('open') && !notifPop.contains(e.target)) {
        notifPop.classList.remove('open');
      }
      if (profPop && profPop.classList.contains('open') && !profPop.contains(e.target)) {
        var isAvatar = false;
        document.querySelectorAll('.topbar-avatar, .tb-avatar, #topbarAvatar, #userAvatar, #avatar').forEach(function(av) {
          if (av && av.contains(e.target)) isAvatar = true;
        });
        if (!isAvatar) {
          profPop.classList.remove('open');
        }
      }
    });

    fetchAndRenderNotifications();
  }

  async function initializeRetailerUi() {
    var session = guardRetailerSession();
    if (!session) return;
    var refreshedSession = await refreshRetailerSession();
    if (!refreshedSession) return;
    injectGlobalTopbarStyles();
    setupGlobalProfilePopover();
    setupGlobalNotificationPopover();
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

  window.IMS_API = window.RetailerApi;

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
