/**
 * src/context/AuthContext.jsx
 * ---------------------------
 * Global authentication state provider for BatteryTwin.
 *
 * Token strategy:
 *   - Access token: stored in React state (memory only) → immune to XSS
 *     localStorage attacks that target token theft.
 *   - Refresh token: stored in httpOnly cookie by the backend →
 *     not accessible to JavaScript.
 *   - On page reload: POST /api/auth/refresh is attempted immediately
 *     using the cookie; if it succeeds the session is silently restored.
 *
 * Roles:
 *   "user"  → redirected to /dashboard after login
 *   "admin" → redirected to /admin/dashboard after login
 *
 * Usage:
 *   const { user, login, adminLogin, logout, register, loading } = useAuth();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  loginUser,
  loginAdmin,
  logoutUser,
  registerUser,
  refreshAccessToken,
  fetchCurrentUser,
  setAuthToken,
  clearAuthToken,
} from '../services/api';

// ── Context ────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // UserProfile | null
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading]   = useState(true);   // true during initial restore
  const [error, setError]       = useState(null);

  // Track the silent-refresh timer so we can clear it on logout
  const refreshTimerRef = useRef(null);

  // ── Token management helpers ──────────────────────────────────

  const _storeToken = useCallback((tokenData) => {
    const { access_token, expires_in, role } = tokenData;
    setAccessToken(access_token);
    setAuthToken(access_token);          // inject into axios default headers

    // Schedule a silent refresh 60s before expiry
    const refreshIn = Math.max((expires_in - 60) * 1000, 10_000);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(_silentRefresh, refreshIn);
  }, []); // eslint-disable-line

  const _clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    clearAuthToken();
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // ── Silent token refresh ───────────────────────────────────────

  const _silentRefresh = useCallback(async () => {
    try {
      const tokenData = await refreshAccessToken();
      _storeToken(tokenData);
      // Re-fetch user profile in case role/state changed
      const profile = await fetchCurrentUser();
      setUser(profile);
    } catch {
      // Refresh token expired or invalid – force logout
      _clearSession();
    }
  }, [_storeToken, _clearSession]);

  // ── Restore session on page load ───────────────────────────────
  // Attempt silent token refresh using the httpOnly refresh cookie.
  // If the cookie is valid the session is restored transparently.
  // If not (expired / missing), the user is sent to login.

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const tokenData = await refreshAccessToken();
        _storeToken(tokenData);
        const profile = await fetchCurrentUser();
        setUser(profile);
      } catch {
        // No valid refresh token — start unauthenticated
        _clearSession();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []); // eslint-disable-line

  // ── Public auth actions ────────────────────────────────────────

  const login = useCallback(async (email, password, rememberMe = false) => {
    setError(null);
    const tokenData = await loginUser(email, password, rememberMe);
    _storeToken(tokenData);
    const profile = await fetchCurrentUser();
    setUser(profile);
    return profile;
  }, [_storeToken]);

  const adminLogin = useCallback(async (email, password) => {
    setError(null);
    const tokenData = await loginAdmin(email, password);
    _storeToken(tokenData);
    const profile = await fetchCurrentUser();
    setUser(profile);
    return profile;
  }, [_storeToken]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Best-effort logout – clear local state regardless
    } finally {
      _clearSession();
    }
  }, [_clearSession]);

  const register = useCallback(async (fullName, email, password, confirmPassword) => {
    setError(null);
    const profile = await registerUser(fullName, email, password, confirmPassword);
    return profile;
  }, []);

  // ── Derived helpers ────────────────────────────────────────────

  const isAuthenticated = Boolean(user && accessToken);
  const isAdmin = user?.role === 'admin';
  const isUser  = user?.role === 'user';

  const value = {
    user,
    accessToken,
    loading,
    error,
    setError,
    isAuthenticated,
    isAdmin,
    isUser,
    login,
    adminLogin,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
