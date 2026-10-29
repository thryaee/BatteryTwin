/**
 * src/components/common/MetricCard.jsx
 * ------------------------------------
 * Nexus Studio Editorial Telemetry Metric Card.
 *
 * Characteristics:
 * - Large tabular numeric typography (JetBrains Mono & Clash Display)
 * - AnimatedCounter integration for smooth transitions
 * - Minimal, uncluttered micro sparkline
 * - Clean delta trending indicator
 */

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit = '',
  color = '#f0f0f8',
  decimals = 2,
  nominal = '',
  history = [],
  historyKey = '',
  sub = '',
}) {
  const chartData = historyKey && history.length > 1
    ? history.map((h, i) => ({ i, v: h[historyKey] ?? 0 }))
    : [];

  const isValid = value !== undefined && value !== null;
  const numValue = typeof value === 'number' ? value : parseFloat(value);

  // Delta calculation
  const prevVal = history.length > 1 && historyKey
    ? history[history.length - 2]?.[historyKey]
    : value;
  const delta = isValid && prevVal !== undefined ? numValue - prevVal : 0;
  const isRising = delta > 0.001;
  const isFalling = delta < -0.001;

  // Tone color for line & accents (defaulting to electric lime or subtle off-white)
  const strokeColor = color === '#00f0ff' ? '#e8ff47' : color;

  return (
    <div
      className="glass-panel"
      data-cursor="hover"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 170,
        flex: 1,
        borderRadius: 12,
        background: 'rgba(13, 13, 31, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Top Header: Label & Nominal Range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: '0.72rem',
            color: '#9898b8',
            fontWeight: 600,
            fontFamily: 'Cabinet Grotesk',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {Icon && <Icon size={14} color={strokeColor} />}
          <span>{label}</span>
        </div>
        {nominal && (
          <span
            style={{
              fontSize: '0.62rem',
              color: 'rgba(152, 152, 184, 0.6)',
              fontFamily: 'JetBrains Mono',
              letterSpacing: '0.05em',
            }}
          >
            {nominal}
          </span>
        )}
      </div>

      {/* Main Value Display */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 }}>
        <div
          style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: strokeColor,
            lineHeight: 1,
            fontFamily: 'JetBrains Mono',
            letterSpacing: '-0.02em',
          }}
        >
          {isValid && !isNaN(numValue) ? (
            <AnimatedCounter
              end={numValue}
              decimals={decimals}
              duration={1.2}
            />
          ) : (
            isValid ? value : '—'
          )}
          {unit && (
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#9898b8',
                marginLeft: 4,
                fontFamily: 'Cabinet Grotesk',
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {delta !== 0 && !isNaN(delta) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: '0.68rem',
              color: isRising ? '#10b981' : isFalling ? '#ef4444' : '#9898b8',
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
            }}
          >
            {isRising ? <TrendingUp size={12} /> : isFalling ? <TrendingDown size={12} /> : null}
            <span>{Math.abs(delta).toFixed(decimals > 1 ? 2 : 1)}</span>
          </div>
        )}
      </div>

      {sub && (
        <div
          style={{
            fontSize: '0.68rem',
            color: '#9898b8',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.02em',
          }}
        >
          {sub}
        </div>
      )}

      {/* Sparkline Chart */}
      {chartData.length > 2 && (
        <div style={{ marginTop: 4, height: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                formatter={(v) => [`${v?.toFixed(decimals)} ${unit}`, label]}
                contentStyle={{
                  background: '#080812',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: 11,
                  borderRadius: 6,
                  color: '#f0f0f8',
                  fontFamily: 'JetBrains Mono',
                }}
                labelStyle={{ display: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
