/**
 * DigitalTwinView.jsx
 * --------------------
 * Visual representation of the Digital Twin state.
 * Shows the full twin data dict, data source badge, uptime,
 * and a multi-axis chart for all key metrics over time.
 */

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatusBadge from './StatusBadge';

function TwinField({ label, value, unit = '', color = '#94a3b8' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #0f172a' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color }}>
        {value !== undefined && value !== null ? `${typeof value === 'number' ? value.toFixed(3) : value}${unit}` : '—'}
      </span>
    </div>
  );
}

export default function DigitalTwinView({ liveData, history }) {
  if (!liveData) return null;

  const source = liveData.data_source || 'UNKNOWN';
  const isSimulator = source === 'SIMULATOR';

  // Chart data
  const chartData = history.slice(-50).map((h, i) => ({
    i,
    'Voltage (V)': h.voltage_v,
    'Temp (°C)': h.temperature_c,
    'Current (A)': h.current_a,
  }));

  return (
    <section>
      <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em' }}>
        DIGITAL TWIN STATE
      </h2>

      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header: identity + source */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>
            {liveData.battery_id || 'BATTERY_01'}
          </span>
          <StatusBadge label={isSimulator ? 'SIMULATOR' : 'ESP32'} size="lg" />
          <span style={{ fontSize: '0.72rem', color: '#475569', marginLeft: 'auto' }}>
            Readings: {liveData.total_readings?.toLocaleString() || 0} |{' '}
            Uptime: {formatUptime(liveData.uptime_seconds)}
          </span>
        </div>

        {/* Twin field grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <TwinField label="Voltage" value={liveData.voltage_v} unit=" V" color="#60a5fa" />
          <TwinField label="Current" value={liveData.current_a} unit=" A" color="#34d399" />
          <TwinField label="Temperature" value={liveData.temperature_c} unit=" °C" color="#f97316" />
          <TwinField label="Power" value={liveData.power_w} unit=" W" color="#fbbf24" />
          <TwinField label="SOC" value={liveData.soc_percent} unit="%" color="#a78bfa" />
          <TwinField label="SOH" value={liveData.soh_percent} unit="%" color={liveData.soh_percent > 80 ? '#4ade80' : '#fbbf24'} />
          <TwinField label="RUL" value={liveData.rul_cycles} unit=" cycles" color="#a78bfa" />
          <TwinField label="Degradation Rate" value={liveData.degradation_rate} unit="/cycle" />
          <TwinField label="Cycle Count" value={liveData.cycle_count} unit="" />
          <TwinField label="Relay" value={liveData.relay_state ? 'ON' : 'OFF'} color={liveData.relay_state ? '#4ade80' : '#f87171'} />
        </div>

        {/* Last updated */}
        <div style={{ fontSize: '0.7rem', color: '#475569', textAlign: 'right' }}>
          Last updated: {liveData.last_updated ? new Date(liveData.last_updated).toLocaleTimeString() : '—'}
        </div>

        {/* Multi-metric chart */}
        {chartData.length > 2 && (
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8 }}>
              TWIN TELEMETRY (last {chartData.length} readings)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="i" hide />
                <YAxis yAxisId="v" domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis yAxisId="t" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line yAxisId="v" type="monotone" dataKey="Voltage (V)" stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line yAxisId="t" type="monotone" dataKey="Temp (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
                <Bar yAxisId="v" dataKey="Current (A)" fill="#34d39420" stroke="#34d399" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Simulator notice */}
        {isSimulator && (
          <div
            style={{
              background: '#1a1200',
              border: '1px solid #713f12',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: '0.72rem',
              color: '#a16207',
            }}
          >
            ⚠️ <strong>Simulator Mode:</strong> Data is synthetically generated.
            Set <code>USE_SIMULATOR=false</code> in backend <code>.env</code> when ESP32 is connected.
          </div>
        )}
      </div>
    </section>
  );
}

function formatUptime(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
