import { authActions } from './auth-slice';

const API_BASE =
  typeof window !== 'undefined' && window.IMS_API_BASE_URL
    ? window.IMS_API_BASE_URL
    : '/api';

// Build consistent session object and persist to sessionStorage
export function saveSessionToStorage(userData) {
  const role = (userData.role || 'consumer').trim().toLowerCase();
  const initials =
    (userData.name || 'User')
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'SO';

  const hasProfile = Boolean(
    (userData.profile &&
      (userData.profile.businessName ||
        (Array.isArray(userData.profile.stores) && userData.profile.stores.length > 0))) ||
      (userData.store && userData.profileId && userData.profileId !== userData.id) ||
      (role === 'biller' && (userData.profileId || userData.profile?.retailerId))
  );

  const token =
    userData.token ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('so_token') : null) ||
    `sotk_${(userData.id || 'usr').replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}`;

  const storeId =
    userData.storeId ||
    userData.currentStoreId ||
    userData.profile?.stores?.[0]?.code ||
    '';

  const currentStoreId =
    userData.currentStoreId ||
    userData.storeId ||
    userData.profile?.stores?.[0]?.code ||
    '';

  const effectiveRetailerId =
    userData.retailerId ||
    userData.profile?.retailerId ||
    (role === 'retailer' ? userData.profileId || userData.id || '' : '');

  const sessionData = {
    id: userData.id,
    name: userData.name || (userData.email ? userData.email.split('@')[0] : 'User'),
    email: userData.email || '',
    role: role === 'customer' ? 'consumer' : role,
    status: userData.status || 'Active',
    store: userData.store || userData.profile?.stores?.[0]?.name || '',
    storeId,
    currentStoreId,
    accessibleStoreIds:
      Array.isArray(userData.accessibleStoreIds) && userData.accessibleStoreIds.length
        ? userData.accessibleStoreIds
        : [storeId].filter(Boolean),
    profileId: userData.profileId || '',
    profile: userData.profile || null,
    retailerId: effectiveRetailerId,
    hasProfile,
    initials,
    plan: userData.plan || 'growth',
    token,
  };

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('so_session', JSON.stringify(sessionData));
    sessionStorage.setItem('so_token', token);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('so_session');
    localStorage.removeItem('so_token');
  }

  return sessionData;
}

// Login thunk -> POST /api/users/login
export const loginUser = (email, password) => {
  return async (dispatch) => {
    dispatch(authActions.authRequestStarted());
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid email or password.');
      }

      const user = await res.json();
      const session = saveSessionToStorage(user);
      dispatch(authActions.loginSuccess(session));
      return session;
    } catch (err) {
      dispatch(authActions.authFailed(err.message || 'Unable to log in.'));
      throw err;
    }
  };
};

// Register thunk -> POST /api/users (+ optional subscription & assignment setup)
export const registerUser = (userData, subscriptionData = null) => {
  return async (dispatch) => {
    dispatch(authActions.authRequestStarted());
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to register account.');
      }

      const createdUser = await res.json();

      if (userData.role === 'retailer' || userData.role === 'supplier') {
        if (subscriptionData) {
          await fetch(`${API_BASE}/platform-revenue/subscriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: createdUser.id,
              userName: createdUser.name,
              userEmail: createdUser.email,
              userRole: userData.role,
              ...subscriptionData,
            }),
          }).catch(() => {});
        }
        await fetch(`${API_BASE}/employees/assignments/distribute`, { method: 'POST' }).catch(() => {});
      }

      const session = saveSessionToStorage({
        ...createdUser,
        role: userData.role,
        status: userData.role === 'retailer' || userData.role === 'supplier' ? 'Pending' : 'Active',
        profile: createdUser.profile || { profileStatus: 'pending' },
      });

      dispatch(authActions.loginSuccess(session));
      return session;
    } catch (err) {
      dispatch(authActions.authFailed(err.message || 'Unable to create account'));
      throw err;
    }
  };
};

// Refresh current user from DB -> GET /api/users/:id
export const refreshAuthUser = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.user?.id;
    if (!userId) return null;

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`);
      if (!res.ok) return null;
      const freshUser = await res.json();
      const session = saveSessionToStorage(freshUser);
      dispatch(authActions.loginSuccess(session));
      return session;
    } catch {
      return null;
    }
  };
};

// Load retailers list for Landing page biller signup -> GET /api/users?role=retailer
export const fetchRetailersForLanding = () => {
  return async (dispatch) => {
    try {
      const res = await fetch(`${API_BASE}/users?role=retailer`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        dispatch(
          authActions.setRetailers(
            data.map((r) => ({ id: r.id, name: r.name || r.businessName || r.email }))
          )
        );
      }
    } catch (err) {
      console.error('Failed to fetch retailers:', err);
    }
  };
};

// Biller apply from Landing page -> POST /api/billers/requests
export const applyBillerRequest = (billerData) => {
  return async () => {
    const res = await fetch(`${API_BASE}/billers/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billerData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Application submission failed');
    }

    return await res.json();
  };
};

// Logout thunk -> clear storage + reset Redux state
export const logoutUser = () => {
  return (dispatch) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('so_session');
        sessionStorage.removeItem('so_token');
        sessionStorage.removeItem('so_active_module');
        sessionStorage.removeItem('biller_pending_email');
      }
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            (k.startsWith('so_') ||
              k.startsWith('ims') ||
              k.startsWith('po_') ||
              k.startsWith('biller_') ||
              k.startsWith('stockoverflow_') ||
              k === 'supplier-module-current-supplier-id')
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (_e) {}

    dispatch(authActions.logout());
  };
};

