/**
 * LiveMetrics.jsx
 * ---------------
 * Grid of live sensor metric cards: Voltage, Current, Temperature, SOC.
 * Each card shows current value + sparkline from recent history.
 */

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const METRICS = [
  {
    key: 'voltage_v',
    label: 'Voltage',
    unit: 'V',
    color: '#60a5fa',
    decimals: 3,
    icon: '⚡',
  },
  {
    key: 'current_a',
    label: 'Current',
    unit: 'A',
    color: '#34d399',
    decimals: 3,
    icon: '〜',
  },
  {
    key: 'temperature_c',
    label: 'Temperature',
    unit: '°C',
    color: '#f97316',
    decimals: 1,
    icon: '🌡',
  },
  {
    key: 'soc_percent',
    label: 'State of Charge',
    unit: '%',
    color: '#a78bfa',
    decimals: 1,
    icon: '🔋',
  },
];

function MetricCard({ metric, value, history }) {
  const chartData = history.map((h, i) => ({ i, v: h[metric.key] ?? 0 }));
  const isValid = value !== undefined && value !== null;

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 180,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
          {metric.icon} {metric.label.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 800, color: metric.color, lineHeight: 1 }}>
        {isValid ? value.toFixed(metric.decimals) : '—'}
        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b', marginLeft: 4 }}>
          {metric.unit}
        </span>
      </div>

      {/* Mini sparkline */}
      {chartData.length > 2 && (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={metric.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              formatter={(v) => [`${v?.toFixed(metric.decimals)} ${metric.unit}`, metric.label]}
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }}
              labelStyle={{ display: 'none' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function LiveMetrics({ liveData, history }) {
  return (
    <section>
      <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em' }}>
        LIVE SENSOR READINGS
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
