/**
 * src/components/charts/RealtimeMultiChart.jsx
 * --------------------------------------------
 * Commercial Synchronized Sensor Telemetry Chart for BatteryTwin.
 * High-legibility light aesthetic with Blue Voltage, Purple Current, and Amber Temperature.
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
  title = 'REAL-TIME SENSOR TELEMETRY WAVEFORMS',
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
      style={{
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Header & Range Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3
            style={{
              fontSize: '1.02rem',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0',
            }}
          >
            {title}
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
            INA219 high-side shunt &amp; DS18B20 digital 1-Wire temperature bus
          </span>
        </div>

        {/* Range Selector Pills */}
        <div style={{ display: 'flex', gap: 4, backgroundColor: '#F8FAFC', padding: 4, borderRadius: 10, border: '1px solid #E2E8F0' }}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: 'none',
                backgroundColor: selectedRange === r ? '#FFFFFF' : 'transparent',
                color: selectedRange === r ? '#2563EB' : '#64748B',
                fontFamily: 'Inter, sans-serif',
                fontWeight: selectedRange === r ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                boxShadow: selectedRange === r ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Multi-Metric Chart Canvas */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              yAxisId="voltage"
              orientation="left"
              domain={['auto', 'auto']}
              stroke="#2563EB"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(v) => `${v}V`}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              domain={[15, 55]}
              stroke="#D97706"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°C`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
                fontSize: 12,
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif',
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingBottom: 10, fontFamily: 'Inter, sans-serif' }}
            />

            <Line
              yAxisId="voltage"
              type="monotone"
              dataKey="Voltage (V)"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="voltage"
              type="monotone"
              dataKey="Current (A)"
              stroke="#7C3AED"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="Temp (°C)"
              stroke="#D97706"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Synchronized Legend Badges */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#475569' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563EB' }} />
          <span style={{ fontWeight: 600 }}>Pack Voltage</span>
          <span style={{ color: '#94A3B8' }}>(Nominal 14.80V)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#475569' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7C3AED' }} />
          <span style={{ fontWeight: 600 }}>Net Current</span>
          <span style={{ color: '#94A3B8' }}>(Charge/Discharge)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#475569' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706' }} />
          <span style={{ fontWeight: 600 }}>Core Temperature</span>
          <span style={{ color: '#94A3B8' }}>(&lt; 45°C Normal)</span>
        </div>
      </div>
    </div>
  );
}
