import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  loginUser as loginRequest,
  verifyLoginOtp as verifyLoginOtpRequest,
  registerUser as registerRequest,
  updateProfile as updateProfileRequest,
  updatePassword as updatePasswordRequest,
  uploadProfileAvatar as uploadProfileAvatarRequest
} from '../lib/api';
import {
  clearStoredAuth,
  loadSessionAuth,
  loadStoredAuth,
  saveStoredAuth
} from '../lib/auth';

const AuthContext = createContext(null);

function getInitialAuth() {
  return loadStoredAuth() || loadSessionAuth();
}

export function AuthProvider({ children }) {
  const initialAuth = getInitialAuth();
  const [user, setUser] = useState(initialAuth?.user || null);
  const [token, setToken] = useState(initialAuth?.token || null);
  const [loading, setLoading] = useState(Boolean(initialAuth?.token));

  const persistAuth = (nextAuth) => {
    const shouldPersist = Boolean(loadStoredAuth());
    saveStoredAuth(nextAuth, shouldPersist);
  };

  useEffect(() => {
    let ignore = false;

    async function hydrateUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);

        if (!ignore) {
          const nextAuth = { token, user: data.user };
          setUser(data.user);
          persistAuth(nextAuth);
        }
      } catch (error) {
        if (!ignore) {
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    hydrateUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (credentials, rememberMe = true) => {
    const data = await loginRequest(credentials);
    if (!data.token || !data.user) {
      return data;
    }

    saveStoredAuth(data, rememberMe);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const verifyLoginOtp = async (payload, rememberMe = true) => {
    const data = await verifyLoginOtpRequest(payload);
    saveStoredAuth(data, rememberMe);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    saveStoredAuth(data, true);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (payload) => {
    const data = await updateProfileRequest(token, payload);
    const nextAuth = { token, user: data.user };
    setUser(data.user);
    persistAuth(nextAuth);
    return data;
  };

  const updatePassword = async (payload) => {
    return updatePasswordRequest(token, payload);
  };

  const uploadAvatar = async (file) => {
    const data = await uploadProfileAvatarRequest(token, file);
    const nextAuth = { token, user: data.user };
    setUser(data.user);
    persistAuth(nextAuth);
    return data;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      verifyLoginOtp,
      register,
      updateProfile,
      updatePassword,
      uploadAvatar,
      logout
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
