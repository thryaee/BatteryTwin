/**
 * src/components/common/MetricCard.jsx
 * ------------------------------------
 * High-Precision Commercial Telemetry Metric Card for BatteryTwin.
 *
 * Characteristics:
 * - Premium light card design (#FFFFFF) with crisp border (#E2E8F0) and soft shadow
 * - Icon with soft-tint circular badge
 * - Large readable typography with smooth AnimatedCounter
 * - Explanatory tooltip for technical metrics (SOC, SOH, RUL, Temp, Voltage, etc.)
 * - Dynamic trend indicator & clean sparkline
 * - Short plain-language description
 */

import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

const METRIC_TOOLTIPS = {
  'State of Charge': 'SOC represents the available electrochemical energy remaining in the battery pack, analogous to a fuel gauge.',
  'SOC': 'SOC represents the available electrochemical energy remaining in the battery pack, analogous to a fuel gauge.',
  'State of Health': 'SOH measures the battery’s current maximum capacity compared to its original rated capacity. 100% indicates brand new condition; 80% is the standard End-of-Life (EOL) threshold.',
  'SOH': 'SOH measures the battery’s current maximum capacity compared to its original rated capacity.',
  'Terminal Voltage': 'Combined electrical potential across all series cell groups in the 4S3P pack. Nominal operating voltage is ~14.80V.',
  'Pack Voltage': 'Combined electrical potential across all series cell groups in the 4S3P pack. Nominal operating voltage is ~14.80V.',
  'Pack Current': 'Net electrical current entering (charging, positive) or leaving (discharging, negative) the battery pack.',
  'Current': 'Net electrical current flow measured across the INA219 precision shunt resistor.',
  'Core Temp': 'Physical core cell temperature measured via DS18B20 digital thermal sensors. Optimal temperature range is 20°C to 35°C.',
  'Battery Temperature': 'Physical core cell temperature measured via DS18B20 digital thermal sensors. Optimal temperature range is 20°C to 35°C.',
  'Core Temperature': 'Physical core cell temperature measured via DS18B20 digital thermal sensors. Optimal temperature range is 20°C to 35°C.',
  'RUL Horizon': 'RUL (Remaining Useful Life) forecasts the number of complete charge-discharge cycles before pack capacity degrades to 80%.',
  'Remaining Useful Life': 'RUL (Remaining Useful Life) forecasts the number of complete charge-discharge cycles before pack capacity degrades to 80%.',
  'Predicted Remaining Life': 'Estimated remaining charge cycles before the battery reaches the 80% End-of-Life retirement criterion.',
  'Net Power': 'Instantaneous electrical power computed as P = V × I. Measured in Watts.',
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit = '',
  color = '#2563EB',
  decimals = 2,
  nominal = '',
  history = [],
  historyKey = '',
  sub = '',
  description = '',
  status = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Commercial color mappings
  let strokeColor = color;
  if (color === '#e8ff47' || color === '#00f0ff') strokeColor = '#2563EB';
  if (color === '#f0f0f8') strokeColor = '#0F172A';

  const tooltipText = METRIC_TOOLTIPS[label] || description || (nominal ? `Nominal target: ${nominal}` : '');

  return (
    <div
      style={{
        padding: '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        minWidth: 210,
        flex: 1,
        borderRadius: 18,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#CBD5E1';
        e.currentTarget.style.boxShadow = '0 8px 20px -2px rgba(15, 23, 42, 0.08), 0 3px 8px -1px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top Header: Icon + Label + Tooltip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {Icon && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: `${strokeColor}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={strokeColor} />
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </div>
            {nominal && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.01em',
                }}
              >
                {nominal}
              </div>
            )}
          </div>
        </div>

        {/* Info Tooltip Icon */}
        {tooltipText && (
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip((p) => !p)}
            aria-label={`About ${label}`}
          >
            <HelpCircle size={17} color="#94A3B8" />
            {showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  width: 240,
                  padding: '10px 14px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  lineHeight: 1.45,
                  borderRadius: 10,
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                  zIndex: 60,
                  pointerEvents: 'none',
                }}
              >
                {tooltipText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Metric Value Display */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
        <div
          style={{
            fontSize: '2.35rem',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.03em',
          }}
        >
          {isValid && !isNaN(numValue) ? (
            <AnimatedCounter
              end={numValue}
              decimals={decimals}
              duration={1.0}
            />
          ) : (
            isValid ? value : '—'
          )}
          {unit && (
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#64748B',
                marginLeft: 5,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {delta !== 0 && !isNaN(delta) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 6px',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
              backgroundColor: isRising ? '#F0FDF4' : '#FEF2F2',
              color: isRising ? '#16A34A' : '#DC2626',
            }}
          >
            {isRising ? <TrendingUp size={12} /> : isFalling ? <TrendingDown size={12} /> : null}
            <span>{Math.abs(delta).toFixed(decimals > 1 ? 2 : 1)}</span>
          </div>
        )}
      </div>

      {/* Subtitle / Short Explanation */}
      {(sub || description) && (
        <div
          style={{
            fontSize: '0.74rem',
            color: '#64748B',
            lineHeight: 1.35,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {sub || description}
        </div>
      )}

      {/* Micro Sparkline Chart */}
      {chartData.length > 2 && (
        <div style={{ marginTop: 2, height: 36, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                formatter={(v) => [`${v?.toFixed(decimals)} ${unit}`, label]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#0F172A',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  padding: '6px 10px',
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
