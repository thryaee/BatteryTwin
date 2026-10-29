/**
 * DigitalTwinView.jsx
 * --------------------
 * Interactive 3D Digital Twin Command Center.
 * Houses the Three.js 3D Battery Pack Canvas, HUD Controls, and Real-time Telemetry.
 */

import React, { useState } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Box, Layers, Activity, Sparkles, Shield, Cpu } from 'lucide-react';
import StatusBadge from './StatusBadge';
import DigitalTwinCanvas from './3d/DigitalTwinCanvas';

function TwinField({ label, value, unit = '', color = '#94a3b8' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'Rajdhani', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color, fontFamily: 'JetBrains Mono' }}>
        {value !== undefined && value !== null ? `${typeof value === 'number' ? value.toFixed(3) : value}${unit}` : '—'}
      </span>
    </div>
  );
}

export default function DigitalTwinView({ liveData, history }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewMode, setViewMode] = useState('thermal');
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('iso');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!liveData) return null;

  const source = liveData.data_source || 'UNKNOWN';
  const isSimulator = source === 'SIMULATOR';

  // Multi-metric telemetry chart
  const chartData = history.slice(-50).map((h, i) => ({
    i,
    'Voltage (V)': h.voltage_v ? parseFloat(h.voltage_v.toFixed(3)) : 0,
    'Temp (°C)': h.temperature_c ? parseFloat(h.temperature_c.toFixed(1)) : 0,
    'Current (A)': h.current_a ? parseFloat(h.current_a.toFixed(3)) : 0,
  }));

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h2 className="tech-title" style={{ fontSize: '0.85rem', color: '#64748b', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Box size={15} color="#00f0ff" />
          3D DIGITAL TWIN SPATIAL SIMULATION & TELEMETRY
        </h2>
        <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
          Interactive Three.js v0.160+
        </span>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header: Battery ID + Source + Uptime */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'Orbitron' }}>
            {liveData.battery_id || 'BATTERY_01'}
          </span>
          <StatusBadge label={isSimulator ? 'SIMULATOR' : 'ESP32'} size="lg" />
          <StatusBadge label={liveData.charging_status || 'IDLE'} size="lg" />

          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto', fontFamily: 'JetBrains Mono' }}>
            Telemetry Cycles: <strong>{liveData.total_readings?.toLocaleString() || 0}</strong> |{' '}
            Uptime: <strong>{formatUptime(liveData.uptime_seconds)}</strong>
          </span>
        </div>

        {/* 3D Interactive Canvas Container */}
        <div
          style={{
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            width: isFullscreen ? '100vw' : '100%',
            height: isFullscreen ? '100vh' : 440,
            zIndex: isFullscreen ? 9999 : 1,
            background: '#040814',
            borderRadius: isFullscreen ? 0 : 12,
            border: isFullscreen ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Unified High-Fidelity 3D Digital Twin Canvas */}
          <DigitalTwinCanvas
            liveData={liveData}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            height={460}
            enableControls={true}
          />

          {/* Quick Interaction Tip */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 12,
              fontSize: '0.68rem',
              color: 'rgba(148, 163, 184, 0.6)',
              fontFamily: 'JetBrains Mono',
              pointerEvents: 'none',
            }}
          >
            🖱️ Left-Click: Rotate | Scroll: Zoom | Right-Click: Pan | Click Cell: Inspect
          </div>
        </div>

        {/* Twin field grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 24px', background: 'rgba(3, 7, 18, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.3)' }}>
          <TwinField label="Terminal Voltage" value={liveData.voltage_v} unit=" V" color="#00f0ff" />
          <TwinField label="Pack Current" value={liveData.current_a} unit=" A" color="#10b981" />
          <TwinField label="Core Temperature" value={liveData.temperature_c} unit=" °C" color="#f97316" />
          <TwinField label="Net Power" value={liveData.power_w} unit=" W" color="#fbbf24" />
          <TwinField label="State of Charge" value={liveData.soc_percent} unit="%" color="#a855f7" />
          <TwinField label="State of Health" value={liveData.soh_percent} unit="%" color={liveData.soh_percent > 80 ? '#10b981' : '#f59e0b'} />
          <TwinField label="RUL Horizon" value={liveData.rul_cycles} unit=" cycles" color="#a855f7" />
          <TwinField label="Degradation Rate" value={liveData.degradation_rate} unit="/cyc" />
          <TwinField label="Completed Cycles" value={liveData.cycle_count} unit="" />
          <TwinField label="Safety Relay" value={liveData.relay_state ? 'CLOSED (ON)' : 'OPEN (OFF)'} color={liveData.relay_state ? '#10b981' : '#ef4444'} />
        </div>

        {/* Multi-metric chart */}
        {chartData.length > 2 && (
          <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8, fontFamily: 'Rajdhani', fontWeight: 700 }}>
              SYNCHRONIZED TWIN SENSOR TELEMETRY (LAST {chartData.length} READINGS)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="i" hide />
                <YAxis yAxisId="v" domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis yAxisId="t" orientation="right" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{ background: '#030712', border: '1px solid #334155', fontSize: 11, borderRadius: 6 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line yAxisId="v" type="monotone" dataKey="Voltage (V)" stroke="#00f0ff" strokeWidth={2} dot={false} />
                <Line yAxisId="t" type="monotone" dataKey="Temp (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
                <Bar yAxisId="v" dataKey="Current (A)" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" />
              </ComposedChart>
            </ResponsiveContainer>
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
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
