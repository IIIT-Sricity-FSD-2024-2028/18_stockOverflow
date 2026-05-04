document.addEventListener('DOMContentLoaded', function () {
  var API_BASE =
    window.location && window.location.hostname
      ? window.location.protocol + '//' + window.location.hostname + ':3001/api'
      : 'http://localhost:3001/api';

  var ROUTES = {
    admin: '../admin/dashboard.html',
    retailerSetup: '../Retailer module/Retailer-initial.html',
    retailerDashboard: '../Retailer module/Retialer_Dashboard.html',
    supplierSetup: '../supplier module/supplier-initial.html',
    supplier: '../supplier module/supplier-dashboard.html',
    biller: '../biller module/pos.html',
    consumer: '../customer module/consumer-landingpage.html',
  };

  function request(path, options) {
    return fetch(API_BASE + path, options || {}).then(async function (response) {
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
    });
  }

  function normalizeRole(value) {
    var role = String(value || 'consumer').trim().toLowerCase();
    return role === 'customer' ? 'consumer' : role;
  }

  function getInitials(name) {
    return String(name || 'SO')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join('')
      .toUpperCase() || 'SO';
  }

  function buildSession(user) {
    var role = normalizeRole(user && user.role);
    var accessibleStoreIds = Array.isArray(user && user.accessibleStoreIds)
      ? user.accessibleStoreIds.filter(Boolean)
      : [];

    return {
      id: user.id,
      name: user.name || 'User',
      email: user.email || '',
      role: role,
      status: user.status || 'Active',
      store: user.store || '',
      storeId: user.storeId || '',
      currentStoreId: user.currentStoreId || user.storeId || '',
      accessibleStoreIds: accessibleStoreIds,
      profileId: user.profileId || '',
      profile: user.profile || null,
      retailerId: user.retailerId || (user.profile && user.profile.retailerId) || (role === 'retailer' ? user.profileId : ''),
      initials: getInitials(user.name),
    };
  }

  function saveSession(user) {
    var session = buildSession(user);
    localStorage.setItem('so_session', JSON.stringify(session));
    return session;
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem('so_session') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function hasBillerStoreAccess(user) {
    var role = normalizeRole(user && user.role);
    if (role !== 'biller') return false;
    var storeId = String(
      (user && (user.currentStoreId || user.storeId)) || '',
    ).trim();
    var accessibleStoreIds = Array.isArray(user && user.accessibleStoreIds)
      ? user.accessibleStoreIds.filter(Boolean)
      : [];
    return Boolean((user && user.profileId) && storeId && accessibleStoreIds.length);
  }

  function getRedirectForRole(user) {
    var role = normalizeRole(user && user.role);

    if (role === 'admin') return ROUTES.admin;
    if (role === 'biller') {
      if (hasBillerStoreAccess(user)) {
        var billerStoreId = user.currentStoreId || user.storeId;
        return ROUTES.biller + '?storeId=' + encodeURIComponent(billerStoreId);
      }
      return '../auth/biller-pending.html';
    }
    if (role === 'supplier') {
      var hasSupplierProfile =
        Boolean(user && user.profileId) ||
        Boolean(user && user.profile && user.profile.businessName);
      return hasSupplierProfile
        ? ROUTES.supplier +
            (user && user.profileId
              ? '?supplierId=' + encodeURIComponent(user.profileId)
              : '')
        : ROUTES.supplierSetup;
    }
    if (role === 'retailer') {
      var hasProfile =
        Boolean(user && user.profileId) ||
        Boolean(user && user.profile && user.profile.businessName);
      return hasProfile ? ROUTES.retailerDashboard : ROUTES.retailerSetup;
    }

    return ROUTES.consumer;
  }

  function setError(targetId, message) {
    var el = document.getElementById(targetId);
    if (!el) return;
    el.textContent = message || '';
    el.style.display = message ? 'block' : 'none';
  }

  function toggleLoading(button, isLoading, label) {
    if (!button) return;
    button.disabled = Boolean(isLoading);
    button.dataset.originalLabel = button.dataset.originalLabel || button.textContent;
    button.textContent = isLoading ? label : button.dataset.originalLabel;
  }

  function wirePasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-target');
        var input = targetId ? document.getElementById(targetId) : null;
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    });
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var submitButton = event.target.querySelector('button[type="submit"]');
    setError('loginError', '');

    toggleLoading(submitButton, true, 'Signing In...');

    try {
      var user = await request('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(emailInput && emailInput.value || '').trim(),
          password: String(passwordInput && passwordInput.value || ''),
        }),
      });

      saveSession(user);
      window.location.href = getRedirectForRole(user);
    } catch (error) {
      setError('loginError', error.message || 'Unable to login');
    } finally {
      toggleLoading(submitButton, false);
    }
  }

  function validateRegisterForm() {
    var name = String(document.getElementById('name')?.value || '').trim();
    var email = String(document.getElementById('email')?.value || '').trim();
    var password = String(document.getElementById('password')?.value || '');
    var confirmPassword = String(
      document.getElementById('confirmPassword')?.value || '',
    );
    var role = normalizeRole(document.getElementById('role')?.value || '');

    if (name.length < 3) {
      throw new Error('Please enter your full name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (!role) {
      throw new Error('Please select a role.');
    }

    return {
      name: name,
      email: email.toLowerCase(),
      password: password,
      role: role,
      status: 'Active',
    };
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    var submitButton = event.target.querySelector('button[type="submit"]');
    var footer = document.querySelector('.auth-footer');
    var errorId = 'registerError';
    var existingError = document.getElementById(errorId);

    if (!existingError && footer) {
      existingError = document.createElement('div');
      existingError.id = errorId;
      existingError.className = 'invalid-feedback';
      existingError.style.display = 'none';
      existingError.style.textAlign = 'center';
      existingError.style.marginTop = '0.75rem';
      footer.parentNode.insertBefore(existingError, footer);
    }

    setError(errorId, '');
    toggleLoading(submitButton, true, 'Creating...');

    try {
      var payload = validateRegisterForm();
      var created = await request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (payload.role === 'biller') {
        await request('/billers/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            phone: 'Not provided',
            company: payload.name + ' Biller Request',
            country: 'India',
          }),
        });
      }

      if (payload.role === 'retailer') {
        saveSession(created);
        window.location.href = ROUTES.retailerSetup;
        return;
      }
      if (payload.role === 'supplier') {
        saveSession(created);
        window.location.href = ROUTES.supplierSetup;
        return;
      }
      if (payload.role === 'biller') {
        localStorage.removeItem('so_session');
        window.location.href = '../auth/biller-pending.html';
        return;
      }
      saveSession(created);
      window.location.href = getRedirectForRole(created);
    } catch (error) {
      setError(errorId, error.message || 'Unable to create account');
    } finally {
      toggleLoading(submitButton, false);
    }
  }

  function redirectAuthenticatedUser() {
    var session = readSession();
    var currentPath = String(window.location.pathname || '').toLowerCase();
    if (!session || currentPath.indexOf('/auth/') === -1) {
      return;
    }

    if (currentPath.endsWith('/login.html') || currentPath.endsWith('/register.html')) {
      return;
    }
  }

  window.StockOverflowAuth = {
    apiBase: API_BASE,
    readSession: readSession,
    saveSession: saveSession,
    getRedirectForRole: getRedirectForRole,
    getInitials: getInitials,
    normalizeRole: normalizeRole,
    logout: function() {
      localStorage.removeItem('so_session');
      window.location.href = '../auth/login.html';
    }
  };

  wirePasswordToggles();
  redirectAuthenticatedUser();

  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }
});
