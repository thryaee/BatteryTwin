/**
 * src/components/charts/RealtimeMultiChart.jsx
 * --------------------------------------------
 * Nexus Studio Editorial Synchronized Sensor Telemetry Chart.
 * Minimalist dark aesthetics with electric lime voltage, emerald current, and amber temperature.
 */

import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { soundEffects } from '../../utils/soundEffects';

const RANGES = ['5 min', '15 min', '1 hour', '24 hours'];

export default function RealtimeMultiChart({
  history = [],
  title = 'REAL-TIME SENSOR TELEMETRY',
}) {
  const [selectedRange, setSelectedRange] = useState('15 min');

  const handleRangeChange = (range) => {
    soundEffects.playClick();
    setSelectedRange(range);
  };

  const sliceCount = selectedRange === '5 min' ? 20 : selectedRange === '15 min' ? 45 : 60;
  const chartData = history.slice(-sliceCount).map((h, i) => ({
    i,
    time: h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `${i}s`,
    'Voltage (V)': h.voltage_v ? parseFloat(h.voltage_v.toFixed(3)) : 0,
    'Temp (°C)': h.temperature_c ? parseFloat(h.temperature_c.toFixed(1)) : 0,
    'Current (A)': h.current_a ? parseFloat(h.current_a.toFixed(3)) : 0,
  }));

  return (
    <div
      className="glass-panel"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'rgba(13, 13, 31, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
      }}
    >
      {/* Header & Range Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3
            style={{
              fontFamily: 'Clash Display',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#f0f0f8',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.72rem',
              color: '#9898b8',
              margin: '3px 0 0 0',
              fontFamily: 'Cabinet Grotesk',
            }}
          >
            Continuous physical INA219 & DS18B20 multi-bus synchronization
          </p>
        </div>

        {/* Range Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(8, 8, 18, 0.8)',
            padding: 3,
            borderRadius: 9999,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              data-cursor="hover"
              style={{
                background: selectedRange === r ? 'rgba(232, 255, 71, 0.12)' : 'transparent',
                borderColor: selectedRange === r ? '#e8ff47' : 'transparent',
                color: selectedRange === r ? '#e8ff47' : '#9898b8',
                border: '1px solid',
                padding: '4px 10px',
                fontSize: '0.68rem',
                borderRadius: 9999,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      {chartData.length > 1 ? (
        <div style={{ height: 260, width: '100%', marginTop: 6 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis
                dataKey="time"
                stroke="#9898b8"
                fontSize={10}
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                stroke="#9898b8"
                fontSize={10}
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8, 8, 18, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono',
                  color: '#f0f0f8',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono',
                  paddingTop: 10,
                }}
              />
              {/* Electric Lime for Voltage */}
              <Line
                type="monotone"
                dataKey="Voltage (V)"
                stroke="#e8ff47"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {/* Emerald for Current */}
              <Line
                type="monotone"
                dataKey="Current (A)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {/* Warm Amber for Temperature */}
              <Line
                type="monotone"
                dataKey="Temp (°C)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9898b8',
            fontSize: '0.78rem',
            fontFamily: 'JetBrains Mono',
          }}
        >
          Gathering live telemetry stream datapoints...
        </div>
      )}
    </div>
  );
}
