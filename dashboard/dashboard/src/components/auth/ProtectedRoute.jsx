/**
 * src/components/auth/ProtectedRoute.jsx
 * ----------------------------------------
 * Route guards for BatteryTwin.
 *
 * Components exported:
 *   <ProtectedRoute>       – any authenticated user (user or admin)
 *   <UserRoute>            – authenticated users with role === "user" only
 *   <AdminRoute>           – authenticated users with role === "admin" only
 *   <GuestRoute>           – only unauthenticated visitors (redirects logged-in users away)
 *
 * While the auth state is being restored (page refresh), a full-screen
 * loading spinner is shown so protected content never flashes before the
 * session check completes.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Loading spinner shown while session is being restored ──────────

function AuthLoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ink-950, #04040a)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      {/* Battery icon pulse */}
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid rgba(0,224,255,0.15)',
            borderTopColor: 'var(--signal, #e8ff47)',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--signal, #e8ff47)"
          strokeWidth="1.5"
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 22, height: 22,
          }}
        >
          <rect x="2" y="7" width="18" height="11" rx="2" />
          <path d="M22 11v3" strokeLinecap="round" />
          <path d="M7 11v3" strokeLinecap="round" strokeWidth="2" stroke="var(--signal, #e8ff47)" />
          <path d="M12 11v3" strokeLinecap="round" strokeWidth="2" stroke="var(--signal, #e8ff47)" />
        </svg>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.75rem',
          color: 'var(--mist-900, #9898b8)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Restoring session…
      </span>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── ProtectedRoute: any authenticated user ─────────────────────────

/**
 * Wraps any route that requires authentication.
 * Unauthenticated visitors are redirected to /login with the original
 * destination stored in location.state so they can be sent back after login.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}

// ── UserRoute: role === "user" only ────────────────────────────────

/**
 * Wraps routes that are only for normal users.
 * Admins are redirected to their own dashboard.
 */
export function UserRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
}

// ── AdminRoute: role === "admin" only ──────────────────────────────

/**
 * Wraps routes that require admin role.
 * Normal users receive a 403-style redirect to /dashboard instead of
 * an error page, which avoids leaking the existence of admin routes.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

// ── GuestRoute: unauthenticated only ──────────────────────────────

/**
 * Wraps public-only routes (login, register).
 * Already-authenticated users are redirected to their appropriate dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
