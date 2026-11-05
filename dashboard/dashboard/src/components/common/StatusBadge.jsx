/**
 * src/components/common/StatusBadge.jsx
 * -------------------------------------
 * Modern Commercial Pill Badge for BatteryTwin.
 * High-legibility status indicators with soft tint backgrounds and crisp borders.
 */

import React from 'react';

const STATUS_CONFIG = {
  HEALTHY:        { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'HEALTHY' },
  OK:             { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'OPTIMAL' },
  NORMAL:         { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'NORMAL' },
  BALANCED:       { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'BALANCED' },

  DEGRADED:       { dot: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'DEGRADED' },
  WARNING:        { dot: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'WARNING' },
  HIGH:           { dot: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'ELEVATED' },
  ELEVATED:       { dot: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'ELEVATED' },

  POOR:           { dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'POOR' },
  CRITICAL:       { dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'CRITICAL' },
  URGENT:         { dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'URGENT' },

  CHARGING:       { dot: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', label: 'CHARGING' },
  DISCHARGING:    { dot: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', label: 'DISCHARGING' },
  IDLE:           { dot: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', label: 'IDLE' },

  CONNECTED:      { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'CONNECTED' },
  DISCONNECTED:   { dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'DISCONNECTED' },

  SIMULATOR:      { dot: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'SIMULATOR DATA' },
  HARDWARE:       { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'ESP32 HARDWARE' },
  ESP32:          { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'ESP32 SENSORS' },
  ESP32_HARDWARE: { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'ESP32 HARDWARE' },

  ACTIVE:         { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'ACTIVE' },
  ARBITRATING:    { dot: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', label: 'ARBITRATING' },

  ON:             { dot: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', label: 'ENGAGED' },
  OFF:            { dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'DISENGAGED' },

  INFO:           { dot: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', label: 'INFO' },
  UNKNOWN:        { dot: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', label: 'UNKNOWN' },
};

export default function StatusBadge({ label, size = 'sm' }) {
  const key = (label || 'UNKNOWN').toUpperCase().replace(/\s+/g, '_');
  const cfg = STATUS_CONFIG[key] || {
    dot: '#64748B',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    text: '#475569',
    label: (label || 'UNKNOWN').toUpperCase(),
  };

  const isLg = size === 'lg' || size === 'md';
  const padding = isLg ? '5px 12px' : '3px 9px';
  const fontSize = isLg ? '0.74rem' : '0.67rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
        borderRadius: 9999,
        border: `1px solid ${cfg.border}`,
        backgroundColor: cfg.bg,
        color: cfg.text,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        userSelect: 'none',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          boxShadow: `0 0 0 2px ${cfg.bg}`,
          flexShrink: 0,
        }}
      />
      <span>{cfg.label}</span>
    </span>
  );
}
