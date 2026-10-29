/**
 * src/components/charts/DegradationTrendChart.jsx
 * -----------------------------------------------
 * Nexus Studio Editorial SOH Degradation Curve Extrapolation Chart.
 * Minimalist dark aesthetics with emerald actual SOH, electric lime projection, and ember EOL threshold.
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

export default function DegradationTrendChart({
  currentSoh = 100,
  degradationRate = 0.002,
  currentCycle = 0,
}) {
  const points = [];
  const baseCycles = Math.max(0, currentCycle);

  // Historical past points
  for (let c = Math.max(0, baseCycles - 100); c <= baseCycles; c += 20) {
    const s = 100 - c * degradationRate * 10;
    points.push({
      cycle: c,
      'Actual SOH': parseFloat(s.toFixed(1)),
      'Projected SOH': parseFloat(s.toFixed(1)),
    });
  }

  // Future projected points to EOL (80%)
  for (let c = baseCycles + 50; c <= baseCycles + 500; c += 50) {
    const s = Math.max(70, currentSoh - (c - baseCycles) * degradationRate * 10);
    points.push({
      cycle: c,
      'Projected SOH': parseFloat(s.toFixed(1)),
    });
  }

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
            SOH DEGRADATION CURVE & EOL PROJECTION
          </h3>
          <p
            style={{
              fontSize: '0.72rem',
              color: '#9898b8',
              margin: '3px 0 0 0',
              fontFamily: 'Cabinet Grotesk',
            }}
          >
            Non-linear capacity decay extrapolation based on electro-chemical degradation rate ({degradationRate.toFixed(4)}/cyc)
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.72rem',
            color: '#ff9d7a',
            fontFamily: 'JetBrains Mono',
            background: 'rgba(40, 12, 12, 0.6)',
            padding: '4px 10px',
            borderRadius: 9999,
            border: '1px solid rgba(255, 107, 53, 0.3)',
          }}
        >
          <span>EOL THRESHOLD: 80.0% SOH</span>
        </div>
      </div>

      <div style={{ height: 260, width: '100%', marginTop: 6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
            <XAxis
              dataKey="cycle"
              stroke="#9898b8"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              domain={[70, 100]}
              stroke="#9898b8"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
              unit="%"
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
            <ReferenceLine
              y={80}
              stroke="#ff6b35"
              strokeDasharray="4 4"
              label={{ value: 'EOL Cutoff (80%)', fill: '#ff6b35', fontSize: 10, position: 'top', fontFamily: 'JetBrains Mono' }}
            />
            <Line
              type="monotone"
              dataKey="Actual SOH"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Projected SOH"
              stroke="#e8ff47"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
