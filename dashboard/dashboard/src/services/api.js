/**
 * services/api.js
 * ---------------
 * Axios client for all REST calls to the FastAPI backend.
 *
 * Auth strategy:
 *   - Access tokens are injected via setAuthToken() after login/refresh.
 *   - The refresh token is an httpOnly cookie managed by the backend.
 *   - On 401 responses, the interceptor attempts one silent token refresh
 *     then retries the original request. If refresh fails, it clears
 *     the token and reloads to the login page.
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // needed for the httpOnly refresh token cookie
});

// ── Token injection ────────────────────────────────────────────────

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// ── Silent-refresh interceptor ─────────────────────────────────────

let _isRefreshing = false;
let _refreshQueue = [];   // requests queued while refresh is in flight

function _processQueue(error, token = null) {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401 errors that haven't been retried yet
    // and are NOT the refresh endpoint itself (avoid infinite loops)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/api/auth/refresh') &&
      !original.url?.includes('/api/auth/login')
    ) {
      if (_isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await api.post('/api/auth/refresh');
        const newToken = data.access_token;
        setAuthToken(newToken);
        _processQueue(null, newToken);
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        _processQueue(refreshError, null);
        clearAuthToken();
        // Redirect to login only in a browser context
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth endpoints ─────────────────────────────────────────────────

export const registerUser = (fullName, email, password, confirmPassword) =>
  api.post('/api/auth/register', {
    full_name: fullName,
    email,
    password,
    confirm_password: confirmPassword,
  }).then((r) => r.data);

export const loginUser = (email, password, rememberMe = false) =>
  api.post('/api/auth/login', { email, password, remember_me: rememberMe })
    .then((r) => r.data);

export const loginAdmin = (email, password) =>
  api.post('/api/auth/admin/login', { email, password }).then((r) => r.data);

export const logoutUser = () =>
  api.post('/api/auth/logout').then((r) => r.data);

export const refreshAccessToken = () =>
  api.post('/api/auth/refresh').then((r) => r.data);

export const fetchCurrentUser = () =>
  api.get('/api/auth/me').then((r) => r.data);

export const forgotPassword = (email) =>
  api.post('/api/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, newPassword, confirmPassword) =>
  api.post('/api/auth/reset-password', {
    token,
    new_password: newPassword,
    confirm_password: confirmPassword,
  }).then((r) => r.data);

// ── Battery endpoints ──────────────────────────────────────────────

export const fetchLatestReading = (batteryId = 'BATTERY_01') =>
  api.get(`/api/battery/latest?battery_id=${batteryId}`).then((r) => r.data);

export const fetchReadingHistory = (batteryId = 'BATTERY_01', limit = 100) =>
  api.get(`/api/battery/history?battery_id=${batteryId}&limit=${limit}`).then((r) => r.data);

// ── Twin endpoints ─────────────────────────────────────────────────

export const fetchTwinState = (batteryId = 'BATTERY_01') =>
  api.get(`/api/twin/state?battery_id=${batteryId}`).then((r) => r.data);

export const fetchTwinHistory = (batteryId = 'BATTERY_01', hours = 24) =>
  api.get(`/api/twin/history?battery_id=${batteryId}&hours=${hours}`).then((r) => r.data);

export const fetchTwinStats = (batteryId = 'BATTERY_01') =>
  api.get(`/api/twin/stats?battery_id=${batteryId}`).then((r) => r.data);

// ── Agent endpoints ────────────────────────────────────────────────

export const fetchLatestAgentResult = (batteryId = 'BATTERY_01') =>
  api.get(`/api/agents/latest?battery_id=${batteryId}`).then((r) => r.data);

export const fetchAgentHistory = (batteryId = 'BATTERY_01', limit = 20) =>
  api.get(`/api/agents/history?battery_id=${batteryId}&limit=${limit}`).then((r) => r.data);

export const triggerAgentRun = () =>
  api.post('/api/agents/run').then((r) => r.data);

export const fetchRelayStatus = () =>
  api.get('/api/agents/relay/status').then((r) => r.data);

export const overrideRelay = (relayState, reason = 'Manual override') =>
  api.post('/api/agents/relay/override', { relay_state: relayState, reason }).then((r) => r.data);

// ── Health ─────────────────────────────────────────────────────────

export const fetchHealth = () =>
  api.get('/health').then((r) => r.data);

export default api;
