import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../store/auth-slice';
import {
  loginUser,
  registerUser,
  refreshAuthUser,
  logoutUser,
  saveSessionToStorage,
} from '../store/auth-actions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const saveSession = (userData) => {
    const sessionData = saveSessionToStorage(userData);
    dispatch(authActions.loginSuccess(sessionData));
    return sessionData;
  };

  const login = async (email, password) => {
    return await dispatch(loginUser(email, password));
  };

  const register = async (userData) => {
    return await dispatch(registerUser(userData));
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const refreshUser = async () => {
    return await dispatch(refreshAuthUser());
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
    saveSession(updated);
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
