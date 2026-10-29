/**
 * src/pages/AdminDashboard.jsx
 * ----------------------------
 * BatteryTwin Administrator Dashboard.
 * Protected by AdminRoute — only role === "admin" can access this.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBatteryData } from '../hooks/useBatteryData';

// ── Icons ──────────────────────────────────────────────────────────

const ShieldIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BatteryIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <rect x="2" y="7" width="18" height="11" rx="2" />
    <path d="M22 11v3" />
    <path d="M7 11v3" strokeWidth="2.5" />
    <path d="M12 11v3" strokeWidth="2.5" />
  </svg>
);

const LogOutIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ExternalIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ── Quick link data ────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Live Monitoring',    path: '/live',         desc: 'Real-time sensor telemetry' },
  { label: 'Digital Twin',       path: '/digital-twin', desc: '3D twin state & simulation' },
  { label: 'Health Analytics',   path: '/health',       desc: 'SOH, RUL, degradation trends' },
  { label: 'Charging Optimizer', path: '/charging',     desc: 'Adaptive charging strategies' },
  { label: 'AI Agents',          path: '/agents',       desc: 'LangGraph multi-agent pipeline' },
  { label: 'Maintenance',        path: '/maintenance',  desc: 'Service recommendations' },
  { label: 'Analytics',          path: '/analytics',    desc: 'Historical data & reports' },
  { label: 'Settings',           path: '/settings',     desc: 'System configuration' },
];

// ── Component ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { liveData, connected } = useBatteryData();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  const statusColor =
    liveData?.battery_status === 'HEALTHY'  ? 'var(--status-healthy, #10b981)' :
    liveData?.battery_status === 'DEGRADED' ? 'var(--status-warning, #f59e0b)' :
    liveData?.battery_status === 'CRITICAL' ? 'var(--status-critical, #ef4444)' :
    'var(--mist-900, #9898b8)';

  return (
    <div style={styles.page}>
      <div style={styles.gridBg} aria-hidden="true" />

      <div style={styles.container}>

        {/* ── Header ───────────────────────────────────────────── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.shieldBadge}>
              <ShieldIcon size={18} />
            </div>
            <div>
              <h1 style={styles.pageTitle}>Admin Dashboard</h1>
              <p style={styles.pageSubtitle}>BatteryTwin Administrator Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} style={styles.logoutBtn}>
            <LogOutIcon />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </header>

        {/* ── Identity card ─────────────────────────────────────── */}
        <div style={styles.identityCard}>
          <div style={styles.identityLeft}>
            <div style={styles.avatarRing}>
              <span style={styles.avatarInitial}>
                {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <div>
              <p style={styles.userName}>{user?.full_name ?? 'Administrator'}</p>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <div style={styles.roleBadge}>
            <ShieldIcon size={13} />
            <span>ADMINISTRATOR</span>
          </div>
        </div>

        {/* ── Live battery status ───────────────────────────────── */}
        <div style={styles.statusStrip}>
          <div style={styles.statusItem}>
            <BatteryIcon />
            <span style={styles.statusLabel}>Battery</span>
            <span style={{ ...styles.statusValue, color: statusColor }}>
              {liveData?.battery_status ?? '—'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>SOC</span>
            <span style={styles.statusValue}>
              {liveData?.soc_percent != null ? `${liveData.soc_percent.toFixed(1)} %` : '—'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>SOH</span>
            <span style={styles.statusValue}>
              {liveData?.soh_percent != null ? `${liveData.soh_percent.toFixed(1)} %` : '—'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Data Feed</span>
            <span style={{
              ...styles.statusValue,
              color: connected ? 'var(--status-healthy, #10b981)' : 'var(--status-critical, #ef4444)',
            }}>
              {connected ? '● LIVE' : '○ Offline'}
            </span>
          </div>
        </div>

        {/* ── System modules ────────────────────────────────────── */}
        <section aria-label="System navigation">
          <h2 style={styles.sectionTitle}>System Modules</h2>
          <div style={styles.grid}>
            {QUICK_LINKS.map(({ label, path, desc }) => (
              <Link key={path} to={path} style={styles.quickCard}>
                <div style={styles.quickCardInner}>
                  <span style={styles.quickLabel}>{label}</span>
                  <span style={styles.quickDesc}>{desc}</span>
                </div>
                <ExternalIcon />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--ink-950, #04040a)',
    fontFamily: 'var(--font-body, system-ui, sans-serif)',
    position: 'relative',
    padding: '0 0 64px',
  },
  gridBg: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none',
  },
  container: {
    position: 'relative', zIndex: 1,
    maxWidth: 1100, margin: '0 auto',
    padding: '32px 24px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  shieldBadge: {
    width: 44, height: 44, borderRadius: 12,
    background: 'rgba(192,132,252,0.12)',
    border: '1px solid rgba(192,132,252,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#c084fc',
  },
  pageTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.5rem', color: 'var(--mist-100, #f0f0f8)',
    margin: 0, letterSpacing: '-0.01em',
  },
  pageSubtitle: {
    fontSize: '0.78rem', color: 'var(--mist-900, #9898b8)',
    margin: '2px 0 0', fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.04em',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.20)',
    borderRadius: 9, padding: '9px 16px',
    color: 'var(--status-critical, #ef4444)',
    fontFamily: 'var(--font-body, system-ui)', fontWeight: 600,
    fontSize: '0.82rem', cursor: 'pointer',
  },
  identityCard: {
    background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid rgba(192,132,252,0.15)',
    borderRadius: 14, padding: '16px 20px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  },
  identityLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  avatarRing: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(192,132,252,0.15)',
    border: '2px solid rgba(192,132,252,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.1rem', color: '#c084fc',
  },
  userName: {
    fontWeight: 600, fontSize: '0.95rem',
    color: 'var(--mist-100, #f0f0f8)', margin: 0,
  },
  userEmail: {
    fontSize: '0.78rem', color: 'var(--mist-900, #9898b8)',
    margin: '2px 0 0', fontFamily: 'var(--font-mono, monospace)',
  },
  roleBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(192,132,252,0.10)',
    border: '1px solid rgba(192,132,252,0.25)',
    borderRadius: 20, padding: '5px 12px',
    color: '#c084fc', fontSize: '0.7rem',
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.08em', fontWeight: 700,
  },
  statusStrip: {
    background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '14px 20px',
    display: 'flex', alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0 20px', flex: '1 1 120px',
  },
  statusDivider: {
    width: 1, height: 28,
    background: 'rgba(255,255,255,0.07)', flexShrink: 0,
  },
  statusLabel: {
    fontSize: '0.72rem', color: 'var(--mist-900, #9898b8)',
    fontFamily: 'var(--font-mono, monospace)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  statusValue: {
    fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--mist-100, #f0f0f8)', marginLeft: 4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1rem', color: 'var(--mist-500, #dcdcec)',
    margin: '0 0 14px', letterSpacing: '0.01em',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  quickCard: {
    background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '14px 16px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    textDecoration: 'none',
    color: 'var(--mist-100, #f0f0f8)',
    transition: 'border-color 0.2s, background 0.2s',
  },
  quickCardInner: { display: 'flex', flexDirection: 'column', gap: 3 },
  quickLabel: {
    fontWeight: 600, fontSize: '0.88rem',
    color: 'var(--mist-100, #f0f0f8)',
  },
  quickDesc: {
    fontSize: '0.72rem', color: 'var(--mist-900, #9898b8)',
  },
};
