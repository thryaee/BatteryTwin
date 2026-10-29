/**
 * src/components/common/StatusBadge.jsx
 * -------------------------------------
 * Nexus Studio Editorial Status Pill Badge.
 * Replaces heavy cyberpunk neon glows with minimalist capsules,
 * clean typography, and restrained live pulsing indicator dots.
 */

import React from 'react';

const STATUS_CONFIG = {
  HEALTHY:        { dot: '#10b981', text: '#f0f0f8', label: 'HEALTHY' },
  OK:             { dot: '#10b981', text: '#f0f0f8', label: 'OPTIMAL' },
  NORMAL:         { dot: '#10b981', text: '#f0f0f8', label: 'NORMAL' },
  DEGRADED:       { dot: '#f59e0b', text: '#f0f0f8', label: 'DEGRADED' },
  WARNING:        { dot: '#f59e0b', text: '#f0f0f8', label: 'WARNING' },
  HIGH:           { dot: '#f59e0b', text: '#f0f0f8', label: 'ELEVATED' },
  POOR:           { dot: '#ef4444', text: '#f0f0f8', label: 'POOR' },
  CRITICAL:       { dot: '#ef4444', text: '#ff9d7a', label: 'CRITICAL' },
  URGENT:         { dot: '#ef4444', text: '#ff9d7a', label: 'URGENT' },

  CHARGING:       { dot: '#e8ff47', text: '#e8ff47', label: 'CHARGING' },
  DISCHARGING:    { dot: '#c4c4d8', text: '#f0f0f8', label: 'DISCHARGING' },
  IDLE:           { dot: '#9898b8', text: '#9898b8', label: 'IDLE' },

  SIMULATOR:      { dot: '#f59e0b', text: '#f0f0f8', label: 'SIMULATOR' },
  ESP32:          { dot: '#10b981', text: '#f0f0f8', label: 'ESP32 MQTT' },
  ESP32_HARDWARE: { dot: '#10b981', text: '#f0f0f8', label: 'ESP32 HARDWARE' },

  ON:             { dot: '#10b981', text: '#f0f0f8', label: 'ENGAGED' },
  OFF:            { dot: '#ef4444', text: '#f0f0f8', label: 'DISENGAGED' },

  INFO:           { dot: '#9898b8', text: '#f0f0f8', label: 'INFO' },
  UNKNOWN:        { dot: '#9898b8', text: '#9898b8', label: 'UNKNOWN' },
};

export default function StatusBadge({ label, size = 'sm' }) {
  const key = (label || 'UNKNOWN').toUpperCase().replace(/\s+/g, '_');
  const cfg = STATUS_CONFIG[key] || {
    dot: '#9898b8',
    text: '#f0f0f8',
    label: (label || 'UNKNOWN').toUpperCase(),
  };

  const isLg = size === 'lg' || size === 'md';
  const padding = isLg ? '5px 12px' : '3px 9px';
  const fontSize = isLg ? '0.72rem' : '0.64rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'JetBrains Mono',
        letterSpacing: '0.06em',
        borderRadius: 9999,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(13, 13, 31, 0.85)',
        color: cfg.text,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dot}`,
          flexShrink: 0,
        }}
      />
      <span>{cfg.label}</span>
    </span>
  );
}
