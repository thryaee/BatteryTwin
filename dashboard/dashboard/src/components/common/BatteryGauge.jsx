/**
 * src/components/common/BatteryGauge.jsx
 * --------------------------------------
 * Nexus Studio Minimalist Automotive Battery Charge & Health Visualizer.
 */

import React from 'react';

export default function BatteryGauge({ soc = 0, soh = 100, charging = false }) {
  const clampedSoc = Math.max(0, Math.min(100, soc));
  const clampedSoh = Math.max(0, Math.min(100, soh));

  const fillColor =
    charging ? '#e8ff47'
    : clampedSoc > 50 ? '#10b981'
    : clampedSoc > 20 ? '#f59e0b'
    : '#ef4444';

  const fillWidth = (clampedSoc / 100) * 124;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Sleek Minimalist Automotive Pack Outline */}
      <svg width={168} height={82} viewBox="0 0 168 82" aria-label={`Battery ${clampedSoc}%`}>
        {/* Outer Casing */}
        <rect
          x={4}
          y={8}
          width={146}
          height={64}
          rx={8}
          ry={8}
          fill="rgba(8, 8, 18, 0.7)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={1.5}
        />
        {/* Terminal Cap */}
        <rect
          x={152}
          y={26}
          width={10}
          height={28}
          rx={3}
          fill="rgba(255, 255, 255, 0.2)"
        />

        {/* Charge Fill Bar */}
        <rect
          x={10}
          y={14}
          width={fillWidth}
          height={52}
          rx={5}
          fill={fillColor}
          opacity={0.88}
          style={{ transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), fill 0.5s ease' }}
        />

        {/* SOC% Label */}
        <text
          x={77}
          y={48}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={22}
          fontWeight="bold"
          fontFamily="JetBrains Mono"
          letterSpacing="-0.03em"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
        >
          {clampedSoc.toFixed(0)}%
        </text>

        {/* Charging Badge */}
        {charging && (
          <text
            x={77}
            y={70}
            textAnchor="middle"
            fill="#e8ff47"
            fontSize={9.5}
            fontFamily="JetBrains Mono"
            fontWeight="600"
            letterSpacing="0.08em"
          >
            ⚡ RAPID CHARGE ACTIVE
          </text>
        )}
      </svg>

      {/* SOH Health Capacity Indicator */}
      <div style={{ width: 154, textAlign: 'center' }}>
        <div
          style={{
            fontSize: '0.68rem',
            color: '#9898b8',
            marginBottom: 4,
            fontFamily: 'Cabinet Grotesk',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>HEALTH (SOH)</span>
          <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
            {clampedSoh.toFixed(1)}%
          </strong>
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${clampedSoh}%`,
              height: '100%',
              background: clampedSoh > 80 ? '#10b981' : clampedSoh > 60 ? '#f59e0b' : '#ef4444',
              borderRadius: 9999,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
