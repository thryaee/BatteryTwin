/**
 * src/pages/AdminDashboard.jsx
 * ----------------------------
 * BatteryTwin Administrator Dashboard.
 * Protected by AdminRoute — only role === "admin" can access this.
 * Clean, modern light theme styling.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBatteryData } from '../hooks/useBatteryData';

// ── Icons ──────────────────────────────────────────────────────────

const ShieldIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BatteryIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
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

const ExternalIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ── Quick link data ────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Main Command Center', path: '/dashboard',    desc: 'Unified battery monitoring overview & metrics' },
  { label: 'Live Monitoring',    path: '/live',         desc: 'Real-time sensor telemetry & bus status' },
  { label: 'Digital Twin (3D)',  path: '/digital-twin', desc: '3D twin state & cell inspection' },
  { label: 'AI Predictions',     path: '/predictions',  desc: '5 prediction cards & degradation curves' },
  { label: 'Health Analytics',   path: '/health',       desc: 'SOH, RUL, and degradation trends' },
  { label: 'Charging Optimizer', path: '/charging',     desc: 'Adaptive charging strategies & governors' },
  { label: 'AI Agents Swarm',    path: '/agents',       desc: 'Multi-agent diagnostic pipeline' },
  { label: 'Maintenance',        path: '/maintenance',  desc: 'Cell balancing & service recommendations' },
  { label: 'Historical Analytics', path: '/analytics',  desc: 'Historical records & CSV export' },
  { label: 'Platform Settings',  path: '/settings',     desc: 'Hardware acceleration & gateway diagnostics' },
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
    liveData?.battery_status === 'HEALTHY'  ? '#16A34A' :
    liveData?.battery_status === 'DEGRADED' ? '#F59E0B' :
    liveData?.battery_status === 'CRITICAL' ? '#DC2626' :
    '#64748B';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Header ───────────────────────────────────────────── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.shieldBadge}>
              <ShieldIcon size={20} />
            </div>
            <div>
              <h1 style={styles.pageTitle}>Admin Dashboard</h1>
              <p style={styles.pageSubtitle}>BatteryTwin Enterprise Control Center</p>
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
            <ShieldIcon size={14} />
            <span>ADMINISTRATOR</span>
          </div>
        </div>

        {/* ── Live battery status ───────────────────────────────── */}
        <div style={styles.statusStrip}>
          <div style={styles.statusItem}>
            <BatteryIcon />
            <span style={styles.statusLabel}>Battery:</span>
            <span style={{ ...styles.statusValue, color: statusColor }}>
              {liveData?.battery_status ?? 'HEALTHY'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>SOC:</span>
            <span style={styles.statusValue}>
              {liveData?.soc_percent != null ? `${liveData.soc_percent.toFixed(1)} %` : '85.4 %'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>SOH:</span>
            <span style={styles.statusValue}>
              {liveData?.soh_percent != null ? `${liveData.soh_percent.toFixed(1)} %` : '96.2 %'}
            </span>
          </div>
          <div style={styles.statusDivider} />
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Data Feed:</span>
            <span style={{
              ...styles.statusValue,
              color: connected ? '#16A34A' : '#64748B',
            }}>
              {connected ? '● LIVE' : '○ Standby / Demo'}
            </span>
          </div>
        </div>

        {/* ── System modules ────────────────────────────────────── */}
        <section aria-label="System navigation">
          <h2 style={styles.sectionTitle}>System Modules &amp; Subsystems</h2>
          <div style={styles.grid}>
            {QUICK_LINKS.map(({ label, path, desc }) => (
              <Link key={path} to={path} style={styles.quickCard}>
                <div style={styles.quickCardInner}>
                  <span style={styles.quickLabel}>{label}</span>
                  <span style={styles.quickDesc}>{desc}</span>
                </div>
                <div style={styles.iconCircle}>
                  <ExternalIcon />
                </div>
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
    background: '#F8FAFC',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '0 0 64px',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  shieldBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563EB',
  },
  pageTitle: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
    fontSize: '1.65rem',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '0.85rem',
    color: '#64748B',
    margin: '3px 0 0',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 18px',
    color: '#DC2626',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  identityCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  identityLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#EFF6FF',
    border: '2px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#2563EB',
  },
  userName: {
    fontWeight: 700,
    fontSize: '1.02rem',
    color: '#0F172A',
    margin: 0,
  },
  userEmail: {
    fontSize: '0.82rem',
    color: '#64748B',
    margin: '3px 0 0',
    fontFamily: 'JetBrains Mono, monospace',
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#F5F3FF',
    border: '1px solid #DDD6FE',
    borderRadius: 20,
    padding: '6px 14px',
    color: '#7C3AED',
    fontSize: '0.74rem',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.06em',
    fontWeight: 700,
  },
  statusStrip: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    flex: '1 1 140px',
  },
  statusDivider: {
    width: 1,
    height: 28,
    background: '#E2E8F0',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: '0.75rem',
    color: '#64748B',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  statusValue: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#0F172A',
    marginLeft: 2,
    fontFamily: 'JetBrains Mono, monospace',
  },
  sectionTitle: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#0F172A',
    margin: '0 0 16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  quickCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    textDecoration: 'none',
    color: '#0F172A',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  quickCardInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  quickLabel: {
    fontWeight: 700,
    fontSize: '0.94rem',
    color: '#0F172A',
  },
  quickDesc: {
    fontSize: '0.78rem',
    color: '#64748B',
    lineHeight: 1.4,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563EB',
    flexShrink: 0,
  },
};
