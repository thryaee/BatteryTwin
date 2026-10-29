/**
 * src/components/layout/SectionJumpBar.jsx
 * ----------------------------------------
 * Sticky Section Navigation Pill Bar adapted from Nexus Studio.
 * Allows instant direct navigation to any section on the continuous editorial dashboard.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { scrollToSection, useActiveSection } from '../../utils/scrollNavigation';
import {
  LayoutDashboard,
  Box,
  Activity,
  Cpu,
  HeartPulse,
  TrendingUp,
  BatteryCharging,
  Wrench,
  History,
  Settings
} from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: '01 / DASHBOARD', icon: LayoutDashboard },
  { id: 'digital-twin', label: '02 / 3D TWIN', icon: Box, highlight: true },
  { id: 'live', label: '03 / LIVE SENSORS', icon: Activity },
  { id: 'agents', label: '04 / AI AGENTS', icon: Cpu },
  { id: 'health', label: '05 / HEALTH & SOH', icon: HeartPulse },
  { id: 'predictions', label: '06 / PREDICTIONS', icon: TrendingUp },
  { id: 'charging', label: '07 / CHARGING', icon: BatteryCharging },
  { id: 'maintenance', label: '08 / MAINTENANCE', icon: Wrench },
  { id: 'analytics', label: '09 / DATA LOGS', icon: History },
  { id: 'settings', label: '10 / SETTINGS', icon: Settings },
];

export default function SectionJumpBar() {
  const activeSection = useActiveSection();

  return (
    <div
      style={{
        position: 'sticky',
        top: 72,
        zIndex: 40,
        margin: '-8px -28px 24px -28px',
        padding: '10px 28px',
        background: 'rgba(4, 4, 10, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          minWidth: 'max-content',
        }}
      >
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const Icon = sec.icon;

          return (
            <motion.button
              key={sec.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => scrollToSection(sec.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 9999,
                fontSize: '0.68rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: isActive ? '1px solid #e8ff47' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? '#e8ff47' : 'rgba(13, 13, 31, 0.75)',
                color: isActive ? '#04040a' : '#9898b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 0 16px rgba(232, 255, 71, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
              data-cursor="hover"
            >
              <Icon size={12} color={isActive ? '#04040a' : '#9898b8'} />
              <span>{sec.label}</span>
              {sec.highlight && !isActive && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#e8ff47',
                    boxShadow: '0 0 4px #e8ff47',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
