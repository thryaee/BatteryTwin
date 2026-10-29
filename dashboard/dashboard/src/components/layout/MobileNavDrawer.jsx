/**
 * src/components/layout/MobileNavDrawer.jsx
 * -----------------------------------------
 * Full-screen Editorial Mobile Navigation Drawer adapted from Nexus Studio design system.
 * Features direct section scrolling, live telemetry indicator, and staggered reveals.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { scrollToSection } from '../../utils/scrollNavigation';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', num: '01', icon: LayoutDashboard },
  { id: 'digital-twin', label: 'Digital Twin 3D', num: '02', icon: Box, highlight: true },
  { id: 'live', label: 'Live Monitoring', num: '03', icon: Activity },
  { id: 'agents', label: 'AI Agents', num: '04', icon: Cpu },
  { id: 'health', label: 'Battery Health', num: '05', icon: HeartPulse },
  { id: 'predictions', label: 'Predictions', num: '06', icon: TrendingUp },
  { id: 'charging', label: 'Charging Optimizer', num: '07', icon: BatteryCharging },
  { id: 'maintenance', label: 'Maintenance', num: '08', icon: Wrench },
  { id: 'analytics', label: 'Historical Analytics', num: '09', icon: History },
  { id: 'settings', label: 'Settings', num: '10', icon: Settings },
];

export default function MobileNavDrawer({
  isOpen,
  onClose,
  connected,
  selectedBattery,
  setSelectedBattery,
}) {
  const handleItemClick = (e, id) => {
    e.preventDefault();
    soundEffects.playClick();
    onClose();
    setTimeout(() => {
      scrollToSection(id);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grain engineering-grid"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(4, 4, 10, 0.98)',
            backdropFilter: 'blur(30px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px 20px',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(232, 255, 71, 0.1)',
                  border: '1px solid rgba(232, 255, 71, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color="#e8ff47" />
              </div>
              <div>
                <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f8', letterSpacing: '-0.02em' }}>
                  BATTERY<span style={{ color: '#e8ff47' }}>TWIN</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.62rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>
                  NAVIGATION DECK
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              aria-label="Close navigation menu"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f0f0f8',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Staggered Navigation List */}
          <nav
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '24px 0',
              gap: 8,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{
                    delay: i * 0.03,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleItemClick(e, item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '10px 12px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: '#f0f0f8',
                      background: 'transparent',
                      border: '1px solid transparent',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.72rem',
                        color: '#9898b8',
                        letterSpacing: '0.08em',
                        width: 24,
                      }}
                    >
                      {item.num}
                    </span>
                    <Icon size={18} color="#9898b8" />
                    <span
                      style={{
                        fontFamily: 'Clash Display',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.highlight && (
                      <span
                        style={{
                          background: 'rgba(232, 255, 71, 0.15)',
                          border: '1px solid rgba(232, 255, 71, 0.4)',
                          color: '#e8ff47',
                          fontSize: '0.62rem',
                          fontFamily: 'JetBrains Mono',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontWeight: 700,
                        }}
                      >
                        3D
                      </span>
                    )}
                  </a>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer Metadata & Battery Selector */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
                <span className={connected ? 'pulse-dot-signal' : 'pulse-dot-ember'} />
                <span>{connected ? 'WS LIVE TELEMETRY' : 'REST POLLING'}</span>
              </div>

              <select
                value={selectedBattery}
                onChange={(e) => setSelectedBattery(e.target.value)}
                style={{
                  background: 'rgba(13, 13, 31, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e8ff47',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.72rem',
                  padding: '6px 10px',
                  borderRadius: 6,
                  outline: 'none',
                }}
              >
                <option value="BATTERY_01">BATTERY_01 (4S3P)</option>
                <option value="BATTERY_02">BATTERY_02 (AUX)</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
