import React, { createContext, useContext, useState, useEffect } from 'react';
import { retailerApi } from '../retailer/api/retailerApi';

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
      (userData.store && userData.profileId && userData.profileId !== userData.id) ||
      (role === 'biller' && (userData.profileId || userData.profile?.retailerId))
    );

    const token =
      userData.token ||
      localStorage.getItem('so_token') ||
      `sotk_${(userData.id || 'usr').replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    const storeId =
      userData.storeId ||
      userData.currentStoreId ||
      (userData.profile?.stores?.[0]?.code) ||
      '';

    const currentStoreId =
      userData.currentStoreId ||
      userData.storeId ||
      (userData.profile?.stores?.[0]?.code) ||
      '';

    const effectiveRetailerId =
      userData.retailerId ||
      userData.profile?.retailerId ||
      (role === 'retailer' ? (userData.profileId || userData.id || '') : '');

    const sessionData = {
      id: userData.id,
      name: userData.name || (userData.email ? userData.email.split('@')[0] : 'User'),
      email: userData.email || '',
      role: role === 'customer' ? 'consumer' : role,
      status: userData.status || 'Active',
      store: userData.store || (userData.profile?.stores?.[0]?.name) || '',
      storeId: storeId,
      currentStoreId: currentStoreId,
      accessibleStoreIds: Array.isArray(userData.accessibleStoreIds) && userData.accessibleStoreIds.length
        ? userData.accessibleStoreIds
        : [storeId].filter(Boolean),
      profileId: userData.profileId || '',
      profile: userData.profile || null,
      retailerId: effectiveRetailerId,
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
    try {
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
      localStorage.removeItem('so_session');
      localStorage.removeItem('so_token');
    } catch (_e) {}
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return null;
    try {
      const updated = await retailerApi.getCurrentUser(user.id);
      return saveSession(updated);
    } catch (e) {
      console.warn('Failed to refresh user:', e);
      return null;
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
