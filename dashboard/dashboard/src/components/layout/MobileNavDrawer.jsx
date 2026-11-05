/**
 * src/components/layout/MobileNavDrawer.jsx
 * -----------------------------------------
 * Full-screen Modern Mobile Navigation Drawer.
 * Clean light aesthetic with smooth Framer Motion animations.
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
  { id: 'overview', label: 'Overview', num: '01', icon: LayoutDashboard },
  { id: 'live', label: 'Live Monitoring', num: '02', icon: Activity },
  { id: 'digital-twin', label: 'Digital Twin 3D', num: '03', icon: Box, highlight: true },
  { id: 'agents', label: 'AI Insights & Agents', num: '04', icon: Cpu },
  { id: 'predictions', label: 'Degradation Predictions', num: '05', icon: TrendingUp },
  { id: 'health', label: 'Battery Health Analytics', num: '06', icon: HeartPulse },
  { id: 'charging', label: 'Charging Optimizer', num: '07', icon: BatteryCharging },
  { id: 'maintenance', label: 'Maintenance & Contactor', num: '08', icon: Wrench },
  { id: 'analytics', label: 'Historical Data Lake', num: '09', icon: History },
  { id: 'settings', label: 'Settings & Sensors', num: '10', icon: Settings },
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
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: '0%' }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px 20px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 20,
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} color="#FFFFFF" />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Battery<span style={{ color: '#2563EB' }}>Twin</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>
                  MOBILE NAVIGATION
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
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Connection Status Pill */}
          <div
            style={{
              margin: '18px 0',
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: connected ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${connected ? '#BBF7D0' : '#FECACA'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: connected ? '#16A34A' : '#DC2626',
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: connected ? '#15803D' : '#B91C1C' }}>
                {connected ? 'HARDWARE TELEMETRY ONLINE' : 'GATEWAY DISCONNECTED'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
              {selectedBattery || 'BATTERY_01'}
            </span>
          </div>

          {/* Navigation Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid transparent',
                    backgroundColor: item.highlight ? '#EFF6FF' : '#FFFFFF',
                    color: item.highlight ? '#2563EB' : '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.highlight ? '#EFF6FF' : '#FFFFFF')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: item.highlight ? '#DBEAFE' : '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} color={item.highlight ? '#2563EB' : '#475569'} />
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                    {item.num}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Footer */}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              BatteryTwin &bull; AI Digital Twin Platform
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
