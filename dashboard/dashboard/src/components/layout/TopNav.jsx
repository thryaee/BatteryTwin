/**
 * src/components/layout/TopNav.jsx
 * --------------------------------
 * Minimal, Premium, Sticky/Floating Top Navigation for BatteryTwin.
 *
 * Characteristics:
 * - Replaces the bulky permanent left sidebar, giving 100% of viewport width to content
 * - Thin, unobtrusive 58px header with 24px backdrop blur and 1px hairline border
 * - LEFT: Brand mark, BATTERYTWIN title, AUTONOMOUS AI BMS subtitle
 * - CENTER/RIGHT: Section navigation (OVERVIEW, LIVE, TWIN, HEALTH, AI, PREDICTIONS, OPERATIONS)
 * - OPERATIONS dropdown: Charging, Maintenance, Analytics
 * - FAR RIGHT: System status pill, Battery selector, Audio toggle, Settings icon, Mobile menu
 * - Real-time scroll spy: Highlights current section with Electric Lime (#e8ff47) active indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Menu, Settings, Volume2, VolumeX, ChevronDown,
  BatteryCharging, Wrench, History, LogOut,
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
  const dropdownRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const isHomepage = location.pathname === '/';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOperationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e, sectionId, dedicatedPath) => {
    e.preventDefault();
    soundEffects.playClick();
    setOperationsOpen(false);

    if (isHomepage) {
      scrollToSection(sectionId);
    } else {
      // Navigate to homepage with hash target
      navigate(`/#${sectionId}`);
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const isSimulator = liveData?.data_source === 'SIMULATOR';

  // Determine active state for navigation items
  const isOverviewActive = isHomepage ? activeSection === 'overview' : location.pathname === '/';
  const isLiveActive = isHomepage ? activeSection === 'live' : location.pathname === '/live';
  const isTwinActive = isHomepage ? activeSection === 'digital-twin' : location.pathname === '/digital-twin';
  const isHealthActive = isHomepage ? activeSection === 'health' : location.pathname === '/health';
  const isAiActive = isHomepage ? activeSection === 'agents' : location.pathname === '/agents';
  const isPredictionsActive = isHomepage ? activeSection === 'predictions' : location.pathname === '/predictions';
  const isOperationsActive = isHomepage
    ? ['charging', 'maintenance', 'analytics'].includes(activeSection)
    : ['/charging', '/maintenance', '/analytics'].includes(location.pathname);

  const navItems = [
    { id: 'overview', label: 'OVERVIEW', path: '/', isActive: isOverviewActive },
    { id: 'live', label: 'LIVE', path: '/live', isActive: isLiveActive },
    { id: 'digital-twin', label: 'TWIN', path: '/digital-twin', isActive: isTwinActive },
    { id: 'health', label: 'HEALTH', path: '/health', isActive: isHealthActive },
    { id: 'agents', label: 'AI', path: '/agents', isActive: isAiActive },
    { id: 'predictions', label: 'PREDICTIONS', path: '/predictions', isActive: isPredictionsActive },
  ];

  return (
    <header
      style={{
        height: 58,
        minHeight: 58,
        padding: '0 28px',
        background: 'rgba(4, 4, 10, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {/* ── Left: Brand Title & Deep-Tech Subtitle ──────────────────── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={(e) => handleNavClick(e, 'overview', '/')}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(232, 255, 71, 0.08)',
            border: '1px solid rgba(232, 255, 71, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={15} color="#e8ff47" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1 }}>
            <span
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontWeight: 700,
                fontSize: '1.02rem',
                color: '#f0f0f8',
                letterSpacing: '-0.02em',
              }}
            >
              BATTERY<span style={{ color: '#e8ff47' }}>TWIN</span>
            </span>
            <span className="pulse-dot-signal" style={{ width: 4, height: 4 }} />
          </div>
          <div
            style={{
              fontSize: '0.58rem',
              color: '#9898b8',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            AUTONOMOUS AI BMS
          </div>
        </div>
      </div>

      {/* ── Center/Right: Primary Section Navigator ─────────────────── */}
      <nav
        className="desktop-top-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: '100%',
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={isHomepage ? `#${item.id}` : item.path}
            onClick={(e) => handleNavClick(e, item.id, item.path)}
            style={{
              position: 'relative',
              height: 58,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: item.isActive ? 700 : 500,
              letterSpacing: '0.08em',
              color: item.isActive ? '#e8ff47' : '#9898b8',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer',
            }}
            data-cursor="hover"
          >
            <span>{item.label}</span>

            {/* Active Electric Lime Underline Indicator */}
            {item.isActive && (
              <motion.span
                layoutId="activeNavIndicator"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 14,
                  right: 14,
                  height: 2,
                  backgroundColor: '#e8ff47',
                  boxShadow: '0 0 10px rgba(232, 255, 71, 0.4)',
                  borderRadius: '2px 2px 0 0',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </a>
        ))}

        {/* ── Operations Dropdown ───────────────────────────────────── */}
        <div ref={dropdownRef} style={{ position: 'relative', height: 58, display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => {
              soundEffects.playClick();
              setOperationsOpen(!operationsOpen);
            }}
            style={{
              position: 'relative',
              height: 58,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 14px',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: isOperationsActive ? 700 : 500,
              letterSpacing: '0.08em',
              color: isOperationsActive ? '#e8ff47' : '#9898b8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            data-cursor="hover"
          >
            <span>OPERATIONS</span>
            <ChevronDown
              size={12}
              style={{
                transform: operationsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                color: isOperationsActive ? '#e8ff47' : '#9898b8',
              }}
            />

            {/* Active Electric Lime Indicator for Operations */}
            {isOperationsActive && (
              <motion.span
                layoutId="activeNavIndicator"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 14,
                  right: 14,
                  height: 2,
                  backgroundColor: '#e8ff47',
                  boxShadow: '0 0 10px rgba(232, 255, 71, 0.4)',
                  borderRadius: '2px 2px 0 0',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          {/* Floating Luxury Dropdown Menu */}
          <AnimatePresence>
            {operationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  top: 54,
                  right: 0,
                  width: 250,
                  background: 'rgba(8, 8, 18, 0.96)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  padding: 8,
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(232, 255, 71, 0.06)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: 'rgba(152, 152, 184, 0.6)',
                    fontFamily: 'JetBrains Mono',
                    letterSpacing: '0.1em',
                    padding: '6px 10px 4px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  SYSTEM OPERATIONS
                </div>

                {/* Charging Optimizer */}
                <div
                  onClick={(e) => handleNavClick(e, 'charging', '/charging')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: activeSection === 'charging' ? 'rgba(232, 255, 71, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  data-cursor="hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BatteryCharging size={15} color={activeSection === 'charging' ? '#e8ff47' : '#9898b8'} />
                    <span style={{ fontFamily: 'Cabinet Grotesk', fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8' }}>
                      Charging Optimizer
                    </span>
                  </div>
                  <Link
                    to="/charging"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.64rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                    title="Open Dedicated Route"
                  >
                    /07 ↗
                  </Link>
                </div>

                {/* Maintenance */}
                <div
                  onClick={(e) => handleNavClick(e, 'maintenance', '/maintenance')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: activeSection === 'maintenance' ? 'rgba(232, 255, 71, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  data-cursor="hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wrench size={15} color={activeSection === 'maintenance' ? '#e8ff47' : '#9898b8'} />
                    <span style={{ fontFamily: 'Cabinet Grotesk', fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8' }}>
                      Prescribed Maintenance
                    </span>
                  </div>
                  <Link
                    to="/maintenance"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.64rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                    title="Open Dedicated Route"
                  >
                    /08 ↗
                  </Link>
                </div>

                {/* Historical Analytics */}
                <div
                  onClick={(e) => handleNavClick(e, 'analytics', '/analytics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: activeSection === 'analytics' ? 'rgba(232, 255, 71, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  data-cursor="hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={15} color={activeSection === 'analytics' ? '#e8ff47' : '#9898b8'} />
                    <span style={{ fontFamily: 'Cabinet Grotesk', fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8' }}>
                      Historical Analytics
                    </span>
                  </div>
                  <Link
                    to="/analytics"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.64rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                    title="Open Dedicated Route"
                  >
                    /09 ↗
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── Far Right: Status, Battery Selector, Audio, Settings & Mobile Menu ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* System Status Indicator Capsule */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 9999,
            background: 'rgba(13, 13, 31, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.68rem',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#f0f0f8',
          }}
          className="status-capsule-desktop"
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: connected ? '#10b981' : '#f59e0b',
              boxShadow: `0 0 6px ${connected ? '#10b981' : '#f59e0b'}`,
            }}
          />
          <span>{connected ? 'WS LIVE' : 'REST'}</span>
        </div>

        {/* Battery Selector Dropdown */}
        <select
          value={selectedBattery}
          onChange={(e) => setSelectedBattery(e.target.value)}
          data-cursor="hover"
          style={{
            background: 'rgba(13, 13, 31, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f0f0f8',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.68rem',
            padding: '4px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            outline: 'none',
          }}
          className="battery-selector-desktop"
        >
          <option value="BATTERY_01">BATTERY_01 (4S3P)</option>
          <option value="BATTERY_02">BATTERY_02 (AUX)</option>
        </select>

        {/* Audio Mute Switch */}
        <button
          onClick={handleToggleMute}
          style={{
            background: 'rgba(13, 13, 31, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: isMuted ? '#9898b8' : '#e8ff47',
            padding: 6,
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
          data-cursor="hover"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Settings Control Icon (Small Settings/Menu) */}
        <button
          onClick={(e) => {
            if (isHomepage) {
              handleNavClick(e, 'settings', '/settings');
            } else {
              navigate('/settings');
            }
          }}
          style={{
            background: location.pathname === '/settings' || (isHomepage && activeSection === 'settings')
              ? 'rgba(232, 255, 71, 0.12)'
              : 'rgba(13, 13, 31, 0.75)',
            border: location.pathname === '/settings' || (isHomepage && activeSection === 'settings')
              ? '1px solid rgba(232, 255, 71, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            color: location.pathname === '/settings' || (isHomepage && activeSection === 'settings')
              ? '#e8ff47'
              : '#9898b8',
            padding: 6,
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Platform Preferences & Settings"
          data-cursor="hover"
        >
          <Settings size={14} />
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.20)',
            color: '#ef4444',
            padding: '5px 11px',
            borderRadius: 7,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
          title="Sign out"
        >
          <LogOut size={13} />
          {loggingOut ? 'SIGNING OUT' : 'LOGOUT'}
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setMobileOpen(true);
          }}
          style={{
            background: 'rgba(13, 13, 31, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f0f0f8',
            padding: 6,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          className="mobile-hamburger-btn"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
}
