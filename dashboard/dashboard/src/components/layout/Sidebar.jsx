/**
 * src/components/layout/Sidebar.jsx
 * ---------------------------------
 * Nexus Studio Editorial Desktop Sidebar for BatteryTwin.
 *
 * Characteristics:
 * - Direct section navigation & scroll spy tracking for continuous dashboard
 * - Near-black surface (#080812) with minimal 1px hairline dividers
 * - Editorial grouped navigation with Clash Display headers
 * - Electric lime active accent (#e8ff47) with left hairline indicator
 * - Preserves collapse functionality, pack badges, and audio feedback
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Box,
  HeartPulse,
  TrendingUp,
  BatteryCharging,
  Cpu,
  Wrench,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { scrollToSection, useActiveSection } from '../../utils/scrollNavigation';

const NAV_GROUPS = [
  {
    category: 'TELEMETRY',
    items: [
      { id: 'overview', path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'digital-twin', path: '/digital-twin', label: 'Digital Twin 3D', icon: Box, highlight: true },
      { id: 'live', path: '/live', label: 'Live Monitoring', icon: Activity },
    ],
  },
  {
    category: 'INTELLIGENCE',
    items: [
      { id: 'agents', path: '/agents', label: 'AI Agents', icon: Cpu },
      { id: 'health', path: '/health', label: 'Battery Health', icon: HeartPulse },
      { id: 'predictions', path: '/predictions', label: 'Predictions', icon: TrendingUp },
      { id: 'charging', path: '/charging', label: 'Charging Optimizer', icon: BatteryCharging },
    ],
  },
  {
    category: 'OPERATIONS',
    items: [
      { id: 'maintenance', path: '/maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'analytics', path: '/analytics', label: 'Historical Analytics', icon: History },
      { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = useActiveSection();

  const handleNavClick = (e, item) => {
    e.preventDefault();
    soundEffects.playClick();

    const targetEl = document.getElementById(item.id);
    if (targetEl) {
      scrollToSection(item.id);
    } else {
      navigate(`/#${item.id}`);
      setTimeout(() => scrollToSection(item.id), 100);
    }
  };

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: collapsed ? 76 : 264,
        minWidth: collapsed ? 76 : 264,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'rgba(8, 8, 18, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        userSelect: 'none',
      }}
    >
      {/* ── Brand Header ────────────────────────────────────────────── */}
      <div
        style={{
          height: 72,
          padding: collapsed ? '0 12px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(232, 255, 71, 0.08)',
              border: '1px solid rgba(232, 255, 71, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => scrollToSection('overview')}
          >
            <Zap size={18} color="#e8ff47" />
          </div>

          {!collapsed && (
            <div style={{ cursor: 'pointer' }} onClick={() => scrollToSection('overview')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'Clash Display',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: '#f0f0f8',
                    letterSpacing: '-0.02em',
                  }}
                >
                  BATTERY<span style={{ color: '#e8ff47' }}>TWIN</span>
                </span>
                <span className="pulse-dot-signal" style={{ width: 5, height: 5 }} />
              </div>
              <div
                style={{
                  fontSize: '0.62rem',
                  color: '#9898b8',
                  fontFamily: 'JetBrains Mono',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                AUTONOMOUS AI BMS
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grouped Nav Links with Direct Scroll Navigation ─────────── */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? '16px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!collapsed && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                  color: 'rgba(152, 152, 184, 0.55)',
                  letterSpacing: '0.12em',
                  padding: '4px 10px 2px 10px',
                  textTransform: 'uppercase',
                }}
              >
                {group.category}
              </span>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item)}
                  data-cursor="hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'Cabinet Grotesk',
                    letterSpacing: '0.01em',
                    color: isActive ? '#ffffff' : '#9898b8',
                    background: isActive ? 'rgba(232, 255, 71, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(232, 255, 71, 0.25)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(232, 255, 71, 0.08)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '25%',
                        bottom: '25%',
                        width: 2.5,
                        borderRadius: '0 2px 2px 0',
                        backgroundColor: '#e8ff47',
                      }}
                    />
                  )}

                  <Icon
                    size={17}
                    color={isActive ? '#e8ff47' : '#9898b8'}
                    style={{ transition: 'color 0.2s ease', flexShrink: 0 }}
                  />

                  {!collapsed && <span>{item.label}</span>}

                  {item.highlight && !collapsed && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: 'rgba(232, 255, 71, 0.12)',
                        border: '1px solid rgba(232, 255, 71, 0.35)',
                        color: '#e8ff47',
                        fontSize: '0.58rem',
                        fontFamily: 'JetBrains Mono',
                        padding: '1px 6px',
                        borderRadius: 9999,
                        fontWeight: 700,
                      }}
                    >
                      3D
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Sidebar Footer / Collapse Toggle ─────────────────────────── */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot-emerald" style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
              4S3P ONLINE
            </span>
          </div>
        )}

        <button
          onClick={() => {
            soundEffects.playClick();
            setCollapsed(!collapsed);
          }}
          className="cyber-button"
          style={{
            padding: 6,
            borderRadius: '50%',
            width: 32,
            height: 32,
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          data-cursor="hover"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}
