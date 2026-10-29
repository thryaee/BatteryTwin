/**
 * LiveMetrics.jsx
 * ---------------
 * High-tech live sensor metric cards with sparklines and rate of change indicators.
 */

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Activity, Thermometer, BatteryCharging, TrendingUp, TrendingDown } from 'lucide-react';

const METRICS = [
  {
    key: 'voltage_v',
    label: 'Terminal Voltage',
    unit: 'V',
    color: '#00f0ff',
    decimals: 3,
    icon: Zap,
    nominal: '14.80 V',
  },
  {
    key: 'current_a',
    label: 'Pack Current',
    unit: 'A',
    color: '#10b981',
    decimals: 3,
    icon: Activity,
    nominal: '±2.00 A',
  },
  {
    key: 'temperature_c',
    label: 'Core Temperature',
    unit: '°C',
    color: '#f97316',
    decimals: 1,
    icon: Thermometer,
    nominal: '< 45.0 °C',
  },
  {
    key: 'soc_percent',
    label: 'State of Charge',
    unit: '%',
    color: '#a855f7',
    decimals: 1,
    icon: BatteryCharging,
    nominal: '20 - 80%',
  },
];

function MetricCard({ metric, value, history }) {
  const Icon = metric.icon;
  const chartData = history.map((h, i) => ({ i, v: h[metric.key] ?? 0 }));
  const isValid = value !== undefined && value !== null;

  // Calculate delta from previous reading
  const prevVal = history.length > 1 ? history[history.length - 2]?.[metric.key] : value;
  const delta = isValid && prevVal !== undefined ? value - prevVal : 0;
  const isRising = delta > 0.001;
  const isFalling = delta < -0.001;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 180,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'Rajdhani' }}>
          <Icon size={15} color={metric.color} />
          {metric.label.toUpperCase()}
        </div>
        <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
          {metric.nominal}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: metric.color, lineHeight: 1, fontFamily: 'JetBrains Mono' }}>
          {isValid ? value.toFixed(metric.decimals) : '—'}
          <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b', marginLeft: 4 }}>
            {metric.unit}
          </span>
        </div>

        {/* Delta Tag */}
        {delta !== 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.68rem',
              color: isRising ? '#10b981' : isFalling ? '#ef4444' : '#64748b',
              fontFamily: 'JetBrains Mono',
            }}
          >
            {isRising ? <TrendingUp size={12} /> : isFalling ? <TrendingDown size={12} /> : null}
            {Math.abs(delta).toFixed(metric.decimals > 1 ? 2 : 1)}
          </div>
        )}
      </div>

      {/* Mini sparkline */}
      {chartData.length > 2 && (
        <div style={{ marginTop: 4, height: 38 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                formatter={(v) => [`${v?.toFixed(metric.decimals)} ${metric.unit}`, metric.label]}
                contentStyle={{ background: '#030712', border: `1px solid ${metric.color}50`, fontSize: 11, borderRadius: 6 }}
                labelStyle={{ display: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function LiveMetrics({ liveData, history }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h2 className="tech-title" style={{ fontSize: '0.85rem', color: '#64748b', letterSpacing: '0.1em' }}>
          LIVE SENSOR TELEMETRY STREAM
        </h2>
        <span style={{ fontSize: '0.7rem', color: '#00f0ff', fontFamily: 'JetBrains Mono' }}>
          ⚡ 50Hz Real-Time Bus
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {METRICS.map((m) => (
          <MetricCard
            key={m.key}
            metric={m}
            value={liveData?.[m.key]}
            history={history}
          />
        ))}
      </div>
    </section>
  );
}
