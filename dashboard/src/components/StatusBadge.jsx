/**
 * StatusBadge.jsx
 * ---------------
 * Reusable pill badge for status labels (HEALTHY / WARNING / CRITICAL etc.)
 */

const COLORS = {
  // Health / severity
  HEALTHY:    { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  OK:         { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  DEGRADED:   { bg: '#451a03', text: '#fb923c', border: '#ea580c' },
  WARNING:    { bg: '#422006', text: '#fbbf24', border: '#d97706' },
  POOR:       { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  CRITICAL:   { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  URGENT:     { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  // Charging
  CHARGING:   { bg: '#0c1a3a', text: '#60a5fa', border: '#2563eb' },
  DISCHARGING:{ bg: '#2d1b69', text: '#a78bfa', border: '#7c3aed' },
  IDLE:       { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
  // Source
  SIMULATOR:  { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
  ESP32:      { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  // Relay
  ON:         { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  OFF:        { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  // Default
  UNKNOWN:    { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
  INFO:       { bg: '#0c1a3a', text: '#60a5fa', border: '#2563eb' },
  NORMAL:     { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  HIGH:       { bg: '#451a03', text: '#fb923c', border: '#ea580c' },
  LOW:        { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
};

export default function StatusBadge({ label, size = 'sm' }) {
  const key = (label || 'UNKNOWN').toUpperCase().replace(/\s+/g, '_');
  const c = COLORS[key] || COLORS.UNKNOWN;

  const padding = size === 'lg' ? '6px 14px' : '3px 10px';
  const fontSize = size === 'lg' ? '0.85rem' : '0.72rem';

  return (
    <span
      style={{
        display: 'inline-block',
        padding,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.05em',
        borderRadius: '9999px',
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        color: c.text,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label || 'UNKNOWN'}
    </span>
  );
}
