/**
 * services/api.js
 * ---------------
 * Axios client for all REST calls to the FastAPI backend.
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Battery endpoints ──────────────────────────────────────────────
export const fetchLatestReading = (batteryId = 'BATTERY_01') =>
  api.get(`/api/battery/latest?battery_id=${batteryId}`).then(r => r.data);

export const fetchReadingHistory = (batteryId = 'BATTERY_01', limit = 100) =>
  api.get(`/api/battery/history?battery_id=${batteryId}&limit=${limit}`).then(r => r.data);

// ── Twin endpoints ─────────────────────────────────────────────────
export const fetchTwinState = (batteryId = 'BATTERY_01') =>
  api.get(`/api/twin/state?battery_id=${batteryId}`).then(r => r.data);

export const fetchTwinHistory = (batteryId = 'BATTERY_01', hours = 24) =>
  api.get(`/api/twin/history?battery_id=${batteryId}&hours=${hours}`).then(r => r.data);

export const fetchTwinStats = (batteryId = 'BATTERY_01') =>
  api.get(`/api/twin/stats?battery_id=${batteryId}`).then(r => r.data);

// ── Agent endpoints ────────────────────────────────────────────────
export const fetchLatestAgentResult = (batteryId = 'BATTERY_01') =>
  api.get(`/api/agents/latest?battery_id=${batteryId}`).then(r => r.data);

export const fetchAgentHistory = (batteryId = 'BATTERY_01', limit = 20) =>
  api.get(`/api/agents/history?battery_id=${batteryId}&limit=${limit}`).then(r => r.data);

export const triggerAgentRun = () =>
  api.post('/api/agents/run').then(r => r.data);

export const fetchRelayStatus = () =>
  api.get('/api/agents/relay/status').then(r => r.data);

export const overrideRelay = (relayState, reason = 'Manual override') =>
  api.post('/api/agents/relay/override', { relay_state: relayState, reason }).then(r => r.data);

// ── Health ─────────────────────────────────────────────────────────
export const fetchHealth = () =>
  api.get('/health').then(r => r.data);

export default api;
