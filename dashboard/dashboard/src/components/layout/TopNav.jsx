/**
 * src/components/layout/TopNav.jsx
 * --------------------------------
 * Premium Light Sticky Navigation Bar for BatteryTwin.
 *
 * Characteristics:
 * - Clean 64px header with 16px backdrop blur and 1px hairline border (#E2E8F0)
 * - LEFT: BatteryTwin logo, gradient bolt, product title & AI BMS subtitle
 * - CENTER: Modern navigation pills (Overview, Live Monitoring, Digital Twin, AI Insights, Analytics)
 * - OPERATIONS DROPDOWN: Charging, Health Analytics, Maintenance
 * - RIGHT: Visible Connection Status (Connected / Simulated / Disconnected), Battery Selector, User Profile with Sign Out
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Menu,
  Settings,
  Volume2,
  VolumeX,
  ChevronDown,
  BatteryCharging,
  Wrench,
  History,
  LogOut,
  User,
  Shield,
  Activity,
  Box,
  Cpu,
  BarChart2
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { scrollToSection, useActiveSection } from '../../utils/scrollNavigation';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({
  liveData,
  connected,
  error,
  lastUpdated,
  selectedBattery,
  setSelectedBattery,
  isMuted,
  setIsMuted,
  setMobileOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = useActiveSection();
  const { user, logout } = useAuth();

  const [operationsOpen, setOperationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const operationsRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const isHomepage = location.pathname === '/' || location.pathname === '/dashboard';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (operationsRef.current && !operationsRef.current.contains(e.target)) {
        setOperationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e, sectionId, targetRoute) => {
    e.preventDefault();
    soundEffects.playClick();
    setOperationsOpen(false);

    if (isHomepage) {
      scrollToSection(sectionId);
    } else {
      navigate(`/dashboard#${sectionId}`);
      setTimeout(() => scrollToSection(sectionId), 120);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const isSimulator = liveData?.data_source === 'SIMULATOR';

  // Active status determinations
  const isOverviewActive = isHomepage && (!activeSection || activeSection === 'overview');
  const isLiveActive = isHomepage ? activeSection === 'live' : location.pathname === '/live';
  const isTwinActive = isHomepage ? activeSection === 'digital-twin' : location.pathname === '/digital-twin';
  const isAiActive = isHomepage ? activeSection === 'agents' || activeSection === 'predictions' : ['/agents', '/predictions'].includes(location.pathname);
  const isAnalyticsActive = isHomepage ? activeSection === 'analytics' : location.pathname === '/analytics';
  const isOperationsActive = ['/charging', '/health', '/maintenance', '/settings'].includes(location.pathname);

  return (
    <header
      style={{
        height: 64,
        minHeight: 64,
        padding: '0 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        userSelect: 'none',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* ── Left: Brand Title & Deep-Tech Subtitle ──────────────────── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={(e) => handleNavClick(e, 'overview', '/dashboard')}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
          }}
        >
          <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#0F172A',
                letterSpacing: '-0.03em',
              }}
            >
              Battery<span style={{ color: '#2563EB' }}>Twin</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                letterSpacing: '0.04em',
              }}
            >
              PRO
            </span>
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.70rem',
              color: '#64748B',
              letterSpacing: '0.01em',
              marginTop: 3,
            }}
          >
            AI Battery Monitoring &amp; Digital Twin
          </div>
        </div>
      </div>

      {/* ── Center: Primary Navigation Links ───────────────────────── */}
      <nav
        className="desktop-top-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#F8FAFC',
          padding: '4px 6px',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
        }}
      >
        {[
          { id: 'overview', label: 'Overview', path: '/dashboard', isActive: isOverviewActive, icon: Activity },
          { id: 'live', label: 'Live Monitoring', path: '/live', isActive: isLiveActive, icon: Activity },
          { id: 'digital-twin', label: 'Digital Twin', path: '/digital-twin', isActive: isTwinActive, icon: Box },
          { id: 'agents', label: 'AI Insights', path: '/agents', isActive: isAiActive, icon: Cpu },
          { id: 'analytics', label: 'Analytics', path: '/analytics', isActive: isAnalyticsActive, icon: BarChart2 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={(e) => handleNavClick(e, item.id, item.path)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: item.isActive ? '#FFFFFF' : 'transparent',
                color: item.isActive ? '#2563EB' : '#475569',
                fontFamily: 'Inter, sans-serif',
                fontWeight: item.isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: item.isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={item.isActive ? '#2563EB' : '#64748B'} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* More Tools / Operations Dropdown */}
        <div ref={operationsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOperationsOpen((p) => !p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: isOperationsActive ? '#FFFFFF' : 'transparent',
              color: isOperationsActive ? '#2563EB' : '#475569',
              fontFamily: 'Inter, sans-serif',
              fontWeight: isOperationsActive ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Operations</span>
            <ChevronDown size={13} style={{ transform: operationsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {operationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                width: 220,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 110,
              }}
            >
              <Link
                to="/charging"
                onClick={() => setOperationsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#0F172A',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <BatteryCharging size={16} color="#2563EB" />
                <span>Charging Optimization</span>
              </Link>

              <Link
                to="/health"
                onClick={() => setOperationsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#0F172A',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Activity size={16} color="#16A34A" />
                <span>Health Analytics</span>
              </Link>

              <Link
                to="/maintenance"
                onClick={() => setOperationsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#0F172A',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Wrench size={16} color="#D97706" />
                <span>Maintenance &amp; Relay</span>
              </Link>

              <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '4px 0' }} />

              <Link
                to="/settings"
                onClick={() => setOperationsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#64748B',
                  fontSize: '0.82rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Settings size={15} color="#64748B" />
                <span>Sensor &amp; Network Config</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Right: Live Status Capsule + Battery Selector + User Profile ─ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Connection Status Indicator */}
        <div
          className="status-capsule-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 12px',
            borderRadius: 9999,
            backgroundColor: connected
              ? isSimulator ? '#FFFBEB' : '#F0FDF4'
              : '#FEF2F2',
            border: `1px solid ${
              connected
                ? isSimulator ? '#FDE68A' : '#BBF7D0'
                : '#FECACA'
            }`,
            fontSize: '0.74rem',
            fontWeight: 600,
            color: connected
              ? isSimulator ? '#B45309' : '#15803D'
              : '#B91C1C',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: connected
                ? isSimulator ? '#D97706' : '#16A34A'
                : '#DC2626',
              boxShadow: `0 0 0 2px ${connected ? (isSimulator ? '#FDE68A' : '#BBF7D0') : '#FECACA'}`,
            }}
          />
          <span>
            {connected
              ? isSimulator ? 'Simulated Data' : 'Hardware Connected'
              : 'Disconnected'}
          </span>
        </div>

        {/* Battery Selector Dropdown */}
        <div
          className="battery-selector-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#334155',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span>{selectedBattery || 'BATTERY_01'}</span>
          <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>(4S3P)</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute telemetry audio' : 'Mute telemetry audio'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isMuted ? '#94A3B8' : '#2563EB',
            transition: 'all 0.2s ease',
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Admin Console Quick Pill (visible when admin) */}
        {user?.role === 'admin' && (
          <Link
            to="/admin/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: '#F5F3FF',
              border: '1px solid #DDD6FE',
              color: '#7C3AED',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Shield size={14} color="#7C3AED" />
            <span>Admin Console</span>
          </Link>
        )}

        {/* User Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px 5px 6px',
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: user?.role === 'admin' ? '#7C3AED' : '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.80rem',
                fontWeight: 700,
              }}
            >
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
              {user?.full_name || 'User'}
            </span>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 220,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                zIndex: 110,
              }}
            >
              <div style={{ paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                  {user?.full_name || 'Authenticated Operator'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', wordBreak: 'break-all' }}>
                  {user?.email || 'operator@batterytwin.local'}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: user?.role === 'admin' ? '#F5F3FF' : '#EFF6FF',
                      color: user?.role === 'admin' ? '#7C3AED' : '#2563EB',
                      border: `1px solid ${user?.role === 'admin' ? '#DDD6FE' : '#BFDBFE'}`,
                    }}
                  >
                    {user?.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/admin/dashboard');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#7C3AED',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Shield size={15} color="#7C3AED" />
                  <span>Admin Console</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#DC2626',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} color="#DC2626" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'none',
            width: 38,
            height: 38,
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0F172A',
          }}
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
