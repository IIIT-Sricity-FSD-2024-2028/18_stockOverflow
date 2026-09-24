import React, { createContext, useContext, useState, useEffect } from 'react';
import { retailerApi } from '../api/retailerApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('so_session');
      return saved ? JSON.parse(saved) : null;
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

    const sessionData = {
      id: userData.id,
      name: userData.name || 'User',
      email: userData.email || '',
      role: role === 'customer' ? 'consumer' : role,
      status: userData.status || 'Active',
      store: userData.store || (userData.profile?.stores?.[0]?.name) || '',
      storeId: userData.storeId || (userData.profile?.stores?.[0]?.code) || '',
      currentStoreId: userData.currentStoreId || userData.storeId || (userData.profile?.stores?.[0]?.code) || '',
      accessibleStoreIds: userData.accessibleStoreIds || [],
      profileId: userData.profileId || userData.id,
      profile: userData.profile || null,
      retailerId: userData.retailerId || userData.profileId || userData.id,
      initials: initials,
      plan: userData.plan || 'growth',
    };

    localStorage.setItem('so_session', JSON.stringify(sessionData));
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

  const logout = () => {
    localStorage.removeItem('so_session');
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
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, switchStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
