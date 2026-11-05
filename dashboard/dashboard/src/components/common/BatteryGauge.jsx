/**
 * src/components/common/BatteryGauge.jsx
 * --------------------------------------
 * Modern Clean Battery Charge & Health Visualizer for BatteryTwin.
 */

import React from 'react';

export default function BatteryGauge({ soc = 0, soh = 100, charging = false }) {
  const clampedSoc = Math.max(0, Math.min(100, soc));
  const clampedSoh = Math.max(0, Math.min(100, soh));

  const fillColor = charging
    ? '#2563EB'
    : clampedSoc > 50
    ? '#16A34A'
    : clampedSoc > 20
    ? '#F59E0B'
    : '#DC2626';

  const fillWidth = (clampedSoc / 100) * 128;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Sleek Modern Battery Outline */}
      <svg width={172} height={84} viewBox="0 0 172 84" aria-label={`Battery ${clampedSoc}%`}>
        {/* Outer Casing */}
        <rect
          x={4}
          y={8}
          width={150}
          height={68}
          rx={12}
          ry={12}
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth={2}
        />
        {/* Terminal Cap (+) */}
        <rect
          x={156}
          y={26}
          width={10}
          height={32}
          rx={4}
          fill="#94A3B8"
        />

        {/* Charge Fill Bar */}
        <rect
          x={10}
          y={14}
          width={fillWidth}
          height={56}
          rx={8}
          fill={fillColor}
          opacity={0.9}
          style={{ transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), fill 0.4s ease' }}
        />

        {/* Dynamic Percentage Label */}
        <text
          x={78}
          y={49}
          textAnchor="middle"
          fill={fillWidth > 60 ? '#FFFFFF' : '#0F172A'}
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="-0.02em"
        >
          {clampedSoc.toFixed(1)}%
        </text>
      </svg>

      {/* SOH Subtitle Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
        <span>Capacity Retention:</span>
        <span style={{ fontWeight: 700, color: '#16A34A', fontFamily: 'JetBrains Mono' }}>
          {clampedSoh.toFixed(1)}% SOH
        </span>
      </div>
    </div>
  );
}
