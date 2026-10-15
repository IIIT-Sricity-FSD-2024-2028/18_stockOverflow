import React, { createContext, useContext, useState, useEffect } from 'react';
import { retailerApi } from '../api/retailerApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('so_session');
      const token = localStorage.getItem('so_token');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.id || !parsed.role) {
        localStorage.removeItem('so_session');
        localStorage.removeItem('so_token');
        return null;
      }
      const effectiveToken = parsed.token || token;
      if (!effectiveToken) {
        localStorage.removeItem('so_session');
        localStorage.removeItem('so_token');
        return null;
      }
      parsed.token = effectiveToken;
      if (!token) {
        localStorage.setItem('so_token', effectiveToken);
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (userData) => {
    const role = (userData.role || 'consumer').trim().toLowerCase();
    const initials = (userData.name || 'User')
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'SO';

    const hasProfile = Boolean(
      (userData.profile && (userData.profile.businessName || (Array.isArray(userData.profile.stores) && userData.profile.stores.length > 0))) ||
      (userData.store && userData.profileId && userData.profileId !== userData.id)
    );

    const token =
      userData.token ||
      localStorage.getItem('so_token') ||
      `sotk_${(userData.id || 'usr').replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    const sessionData = {
      id: userData.id,
      name: userData.name || (userData.email ? userData.email.split('@')[0] : 'User'),
      email: userData.email || '',
      role: role === 'customer' ? 'consumer' : role,
      status: userData.status || 'Active',
      store: userData.store || (userData.profile?.stores?.[0]?.name) || '',
      storeId: userData.storeId || (userData.profile?.stores?.[0]?.code) || '',
      currentStoreId: userData.currentStoreId || userData.storeId || (userData.profile?.stores?.[0]?.code) || '',
      accessibleStoreIds: userData.accessibleStoreIds || [],
      profileId: userData.profileId || '',
      profile: userData.profile || null,
      retailerId: userData.retailerId || (role === 'retailer' ? (userData.profileId || userData.id || '') : ''),
      hasProfile: hasProfile,
      initials: initials,
      plan: userData.plan || 'growth',
      token: token,
    };

    localStorage.setItem('so_session', JSON.stringify(sessionData));
    localStorage.setItem('so_token', token);
    setUser(sessionData);
    return sessionData;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await retailerApi.login(email, password);
      const session = saveSession(loggedUser);
      return session;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const createdUser = await retailerApi.register(userData);
      return createdUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('so_session');
    localStorage.removeItem('so_token');
    localStorage.removeItem('so_active_module');
    localStorage.removeItem('supplier-module-current-supplier-id');
    localStorage.removeItem('imsAppStateV1');
    localStorage.removeItem('biller_pending_email');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const updated = await retailerApi.getCurrentUser(user.id);
      saveSession(updated);
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  const switchStore = (storeId) => {
    if (!user) return;
    const stores = Array.isArray(user.profile?.stores) ? user.profile.stores : [];
    const matched = stores.find((s) => (s.code || s.storeId || s.id) === storeId);
    const storeName = matched ? matched.name : user.store;

    const updated = {
      ...user,
      currentStoreId: storeId,
      storeId: storeId,
      store: storeName,
    };
    localStorage.setItem('so_session', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, switchStore, saveSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
