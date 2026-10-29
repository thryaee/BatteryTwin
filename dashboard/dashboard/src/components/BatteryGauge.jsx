/**
 * BatteryGauge.jsx
 * ----------------
 * Animated battery icon showing SOC% and SOH% as a visual gauge.
 * Pure CSS/SVG — no extra charting library needed.
 */

export default function BatteryGauge({ soc = 0, soh = 100, charging = false }) {
  const clampedSoc = Math.max(0, Math.min(100, soc));
  const clampedSoh = Math.max(0, Math.min(100, soh));

  const fillColor =
    clampedSoc > 50 ? '#4ade80'
    : clampedSoc > 20 ? '#fbbf24'
    : '#f87171';

  const fillWidth = (clampedSoc / 100) * 120; // 120px max fill

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Battery outline */}
      <svg width={160} height={80} viewBox="0 0 160 80" aria-label={`Battery ${clampedSoc}%`}>
        {/* Outer casing */}
        <rect
          x={4} y={10} width={140} height={60}
          rx={8} ry={8}
          fill="none"
          stroke="#475569"
          strokeWidth={3}
        />
        {/* Battery terminal */}
        <rect x={144} y={28} width={12} height={24} rx={4} fill="#475569" />

        {/* Charge fill */}
        <rect
          x={10} y={16} width={fillWidth} height={48}
          rx={4}
          fill={fillColor}
          style={{ transition: 'width 0.5s ease, fill 0.5s ease' }}
        />

        {/* SOC% label */}
        <text
          x={74} y={47}
          textAnchor="middle"
          fill="white"
          fontSize={20}
          fontWeight="bold"
          fontFamily="monospace"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
        >
          {clampedSoc.toFixed(0)}%
        </text>

        {/* Lightning bolt when charging */}
        {charging && (
          <text x={74} y={68} textAnchor="middle" fill="#fbbf24" fontSize={13}>
            ⚡ Charging
          </text>
        )}
      </svg>

      {/* SOH indicator bar */}
      <div style={{ width: 148, textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>
          Health (SOH): {clampedSoh.toFixed(1)}%
        </div>
        <div
          style={{
            width: '100%', height: 6,
            background: '#1e293b',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${clampedSoh}%`,
              height: '100%',
              background:
                clampedSoh > 80 ? '#4ade80'
                : clampedSoh > 60 ? '#fbbf24'
                : '#f87171',
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
