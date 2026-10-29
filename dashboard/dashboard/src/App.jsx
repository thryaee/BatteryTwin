/**
 * src/App.jsx
 * -----------
 * Master Router configuration for BatteryTwin application.
 *
 * Auth Architecture:
 * - AuthProvider wraps the entire tree so useAuth() is available everywhere.
 * - GuestRoute  – public-only pages (login, register, forgot-password).
 *                 Redirects already-authenticated users to their dashboard.
 * - ProtectedRoute – any authenticated user (user or admin).
 * - UserRoute   – role === "user" only; admins are sent to /admin/dashboard.
 * - AdminRoute  – role === "admin" only; users are sent to /dashboard.
 *
 * Session Restoration:
 * - On page refresh, AuthProvider calls POST /api/auth/refresh using the
 *   httpOnly cookie.  ProtectedRoute / AdminRoute show a loading spinner
 *   until the check completes, so protected content never flashes for a
 *   fraction of a second before the redirect fires.
 *
 * Route map:
 *   /login              → LoginPage        (GuestRoute)
 *   /register           → RegisterPage     (GuestRoute)
 *   /forgot-password    → ForgotPasswordPage (GuestRoute)
 *   /dashboard          → AppLayout + all subsystem pages (UserRoute)
 *   /admin/dashboard    → AdminDashboard   (AdminRoute)
 *   /                   → redirect to /dashboard
 *   *                   → redirect to /login
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Auth ───────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext';
import {
  GuestRoute,
  UserRoute,
  AdminRoute,
} from './components/auth/ProtectedRoute';

// ── Auth pages (no AppLayout shell) ───────────────────────────────
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// ── Admin ──────────────────────────────────────────────────────────
import AdminDashboard    from './pages/AdminDashboard';

// ── Main app shell + pages (existing) ─────────────────────────────
import AppLayout         from './components/layout/AppLayout';
import MainDashboard     from './pages/MainDashboard';
import LiveMonitoring    from './pages/LiveMonitoring';
import DigitalTwinPage   from './pages/DigitalTwinPage';
import HealthAnalytics   from './pages/HealthAnalytics';
import PredictionsPage   from './pages/PredictionsPage';
import ChargingOptimization from './pages/ChargingOptimization';
import AIAgentsPage      from './pages/AIAgentsPage';
import MaintenancePage   from './pages/MaintenancePage';
import HistoricalAnalytics from './pages/HistoricalAnalytics';
import SettingsPage      from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Root redirect ──────────────────────────────────── */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* ── Guest-only routes (redirect if already logged in) ─ */}
          <Route element={<GuestRoute />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Admin-only routes ──────────────────────────────── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* ── Authenticated user routes (AppLayout shell) ────── */}
          <Route element={<UserRoute />}>
            <Route element={<AppLayout />}>
              {/* /dashboard → main scroll-driven homepage */}
              <Route path="/dashboard" element={<MainDashboard />} />

              {/* Full-featured subsystem pages */}
              <Route path="/live"          element={<LiveMonitoring />} />
              <Route path="/digital-twin" element={<DigitalTwinPage />} />
              <Route path="/health"        element={<HealthAnalytics />} />
              <Route path="/predictions"   element={<PredictionsPage />} />
              <Route path="/charging"      element={<ChargingOptimization />} />
              <Route path="/agents"        element={<AIAgentsPage />} />
              <Route path="/maintenance"   element={<MaintenancePage />} />
              <Route path="/analytics"     element={<HistoricalAnalytics />} />
              <Route path="/settings"      element={<SettingsPage />} />
            </Route>
          </Route>

          {/* ── Catch-all: redirect unknown URLs to login ──────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
