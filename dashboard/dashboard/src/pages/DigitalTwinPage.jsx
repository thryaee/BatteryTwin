/**
 * src/pages/DigitalTwinPage.jsx
 * ------------------------------
 * Page 3: Master Interactive 3D Digital Twin Centerpiece.
 *
 * Nexus Studio Editorial Spatial Experience:
 * - Monumental hero statement: "DIGITAL TWIN / See your battery as a living system."
 * - Full-bleed cinematic 3D viewport (hero of the page, 640px height)
 * - Minimalist floating control bar (Thermal, Health, Solid PBR, CAD, Exploded, Reset)
 * - Bidirectional 12-cell matrix synchronization
 * - High-precision operating parameters and telemetry waveforms
 */

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Layers,
  Zap,
  Activity,
  Thermometer,
  ShieldCheck,
  BatteryCharging,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import DigitalTwinCanvas from '../components/3d/DigitalTwinCanvas';
import StatusBadge from '../components/common/StatusBadge';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import ScrollReveal from '../components/ui/ScrollReveal';
import { LoadingState } from '../components/common/FeedbackStates';
import { soundEffects } from '../utils/soundEffects';

function formatUptime(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function DigitalTwinPage() {
  const { liveData, history, loading, connected } = useOutletContext();
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeModuleFilter, setActiveModuleFilter] = useState('ALL');

  if (loading && !liveData) {
    return <LoadingState message="Initializing 3D Digital Twin Simulation Engine..." />;
  }

  const isSimulator = liveData?.data_source === 'SIMULATOR';
  const isCharging = liveData?.charging_status === 'CHARGING';
  const baseVoltage = (liveData?.voltage_v || 14.8) / 4;
  const baseTemp = liveData?.temperature_c || 25.0;

  // 12-cell dataset generated from live telemetry
  const cells = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    const modIdx = Math.floor(i / 3) + 1;
    const cellInMod = (i % 3) + 1;
    const tempOffset = (cellInMod === 2 ? 1.8 : -0.9) + (modIdx === 2 || modIdx === 3 ? 1.2 : -0.8);
    const voltOffset = Math.sin(id * 1.7) * 0.012;
    const v = baseVoltage + voltOffset;
    const t = baseTemp + tempOffset;
    return {
      id,
      moduleId: modIdx,
      cellInMod,
      voltage: v,
      temp: t,
      isBalancing: Math.abs(voltOffset) > 0.008,
    };
  });

  const voltages = cells.map((c) => c.voltage);
  const temps = cells.map((c) => c.temp);
  const minV = Math.min(...voltages);
  const maxV = Math.max(...voltages);
  const deltaV = (maxV - minV) * 1000;
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const deltaT = (maxT - minT).toFixed(1);

  const handleCellClick = (id) => {
    soundEffects.playCellSelect();
    setSelectedCell((prev) => (prev === id ? null : id));
  };

  const handleModuleSelect = (modKey) => {
    soundEffects.playClick();
    setActiveModuleFilter(modKey);
    if (modKey === 'ALL') {
      setSelectedCell(null);
    } else {
      const modNum = parseInt(modKey.replace('MOD_', ''), 10);
      setSelectedCell((modNum - 1) * 3 + 2);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── Section A: Monumental Editorial Header ─────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 1. Section Label */}
        <ScrollReveal delay={0.05} yOffset={30}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse-dot-signal" />
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#9898b8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              4S3P MODULAR EV PACK // SPATIAL RECONSTRUCTION
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge label={isSimulator ? 'SIMULATOR MODE' : 'HARDWARE SENSORS'} size="sm" />
              <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="sm" />
              <StatusBadge label={isCharging ? 'CHARGING' : liveData?.charging_status || 'IDLE'} size="sm" />
            </div>
          </div>
        </ScrollReveal>

        {/* 2. Large Heading */}
        <ScrollReveal delay={0.12} yOffset={40}>
          <h1
            style={{
              fontFamily: 'Clash Display',
              fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.035em',
              margin: '4px 0',
              color: '#f0f0f8',
            }}
            data-cursor="hover"
          >
            <div>DIGITAL TWIN</div>
            <div className="text-stroke-signal" style={{ opacity: 0.95 }}>
              LIVING SYSTEM.
            </div>
          </h1>
        </ScrollReveal>

        {/* 3. Supporting Text */}
        <ScrollReveal delay={0.2} yOffset={35}>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#9898b8',
              maxWidth: 640,
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'Cabinet Grotesk',
            }}
          >
            Physical-digital spatial reconstruction with continuous multi-sensor infrared thermal mapping,
            electrochemical cell impedance modeling, and live disassembly views.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Section B: The 3D Digital Twin Viewport (HERO) ──────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 4. Metrics / Focus Controls */}
        <ScrollReveal delay={0.28} yOffset={35}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              padding: '2px 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#9898b8',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginRight: 4,
                  textTransform: 'uppercase',
                }}
              >
                MODULE FOCUS:
              </span>

              {['ALL', 'MOD_1', 'MOD_2', 'MOD_3', 'MOD_4'].map((modKey) => {
                const label = modKey === 'ALL' ? 'All Pack' : `Module 0${modKey.replace('MOD_', '')}`;
                const active = activeModuleFilter === modKey;
                return (
                  <button
                    key={modKey}
                    onClick={() => handleModuleSelect(modKey)}
                    data-cursor="hover"
                    style={{
                      background: active ? 'rgba(232, 255, 71, 0.12)' : 'rgba(13, 13, 31, 0.8)',
                      borderColor: active ? '#e8ff47' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#e8ff47' : '#9898b8',
                      border: '1px solid',
                      padding: '4px 12px',
                      fontSize: '0.72rem',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      fontFamily: 'Cabinet Grotesk',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: '0.72rem',
                color: '#9898b8',
                fontFamily: 'JetBrains Mono',
              }}
            >
              <span>
                Delta-V: <strong style={{ color: deltaV < 25 ? '#10b981' : '#f59e0b' }}>{deltaV.toFixed(1)} mV</strong>
              </span>
              <span>
                Thermal Spread: <strong style={{ color: parseFloat(deltaT) < 3.5 ? '#10b981' : '#ff9d7a' }}>±{deltaT} °C</strong>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* 5. Main Visual: Cinematic 3D Viewport Hero Frame */}
        <ScrollReveal delay={0.36} yOffset={45}>
          <div
            style={{
              position: 'relative',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 24px rgba(232, 255, 71, 0.04)',
              background: 'radial-gradient(circle at 50% 30%, #0d0d22 0%, #04040a 80%)',
            }}
          >
            <DigitalTwinCanvas
              liveData={liveData}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
              height={640}
              enableControls={true}
              reducedMotion={false}
            />
          </div>
        </ScrollReveal>
      </div>

      {/* ── Section C: 12-Cell Synchronized Matrix ─────────────────── */}
      <ScrollReveal delay={0.15}>
        <div
          className="glass-panel"
          style={{
            padding: 24,
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Layers size={16} color="#e8ff47" />
                12-CELL VOLTAGE & THERMAL SYNCHRONIZATION MATRIX
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#9898b8', margin: '3px 0 0 0', fontFamily: 'Cabinet Grotesk' }}>
                Bidirectional synchronization: Click any cell card to focus in 3D; click in 3D to inspect telemetry
              </p>
            </div>

            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="cyber-button"
                data-cursor="hover"
                style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: 'rgba(232, 255, 71, 0.35)', color: '#e8ff47' }}
              >
                Clear Selection (Cell #{selectedCell.toString().padStart(2, '0')}) ✕
              </button>
            )}
          </div>

          {/* 4 Modules Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {[1, 2, 3, 4].map((modId) => {
              const modCells = cells.filter((c) => c.moduleId === modId);
              return (
                <div
                  key={modId}
                  style={{
                    background: 'rgba(8, 8, 18, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
                    <span style={{ fontFamily: 'Clash Display', fontWeight: 600, fontSize: '0.82rem', color: '#f0f0f8', letterSpacing: '-0.01em' }}>
                      MODULE 0{modId}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
                      3x 21700
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {modCells.map((c) => {
                      const isSelected = selectedCell === c.id;
                      const isHot = c.temp > 40;
                      const isWarm = c.temp > 32;
                      const tempColor = isHot ? '#ef4444' : isWarm ? '#f59e0b' : '#10b981';

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleCellClick(c.id)}
                          data-cursor="hover"
                          style={{
                            background: isSelected
                              ? 'rgba(232, 255, 71, 0.12)'
                              : 'rgba(4, 4, 10, 0.85)',
                            border: `1px solid ${isSelected ? '#e8ff47' : 'rgba(255, 255, 255, 0.06)'}`,
                            borderRadius: 8,
                            padding: '9px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            boxShadow: isSelected ? '0 0 16px rgba(232, 255, 71, 0.2)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 700, color: isSelected ? '#e8ff47' : '#f0f0f8' }}>
                              C#{c.id.toString().padStart(2, '0')}
                            </span>
                            {c.isBalancing && (
                              <span
                                style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8ff47', boxShadow: '0 0 6px #e8ff47' }}
                                title="Balancing Active"
                              />
                            )}
                          </div>

                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                            {c.voltage.toFixed(3)}V
                          </div>

                          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: tempColor, fontFamily: 'JetBrains Mono' }}>
                            {c.temp.toFixed(1)}°C
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* ── Section D: Pack Engineering Telemetry Grid ──────────────── */}
      <ScrollReveal delay={0.2}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Operating Parameters */}
          <div
            className="glass-panel"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'rgba(13, 13, 31, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              PACK OPERATING PARAMETERS
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Terminal Voltage:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                {liveData?.voltage_v?.toFixed(3) || 14.8} V
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Pack Current:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isCharging ? '#e8ff47' : '#10b981', fontFamily: 'JetBrains Mono' }}>
                {liveData?.current_a?.toFixed(3) || 0.0} A
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Core Temperature:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                {liveData?.temperature_c?.toFixed(1) || 25.0} °C
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Net Power:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
                {liveData?.power_w?.toFixed(1) || 0.0} W
              </span>
            </div>
          </div>

          {/* Life & Degradation */}
          <div
            className="glass-panel"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'rgba(13, 13, 31, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              LIFE & DEGRADATION
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>State of Health (SOH):</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                {liveData?.soh_percent?.toFixed(1) || 100}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>State of Charge (SOC):</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
                {liveData?.soc_percent?.toFixed(1) || 50}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Remaining Useful Life:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                {liveData?.rul_cycles || 1420} cycles
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Degradation Rate:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
                {liveData?.degradation_rate || '0.00012/cyc'}
              </span>
            </div>
          </div>

          {/* Hardware & BMS Safety */}
          <div
            className="glass-panel"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'rgba(13, 13, 31, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              HARDWARE & BMS SAFETY
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Safety Contactor Relay:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: liveData?.relay_state ? '#10b981' : '#ff9d7a', fontFamily: 'JetBrains Mono' }}>
                {liveData?.relay_state ? '● CLOSED (ENGAGED)' : '○ OPEN (DISENGAGED)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Cooling Circulation:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
                ● ACTIVE (3.2 L/min)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Sensor Telemetry Cycles:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                {liveData?.total_readings?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#9898b8' }}>Engine Uptime:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                {formatUptime(liveData?.uptime_seconds)}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Section E: Synchronized Sensor Telemetry Multi-Chart ───── */}
      <ScrollReveal delay={0.25}>
        <RealtimeMultiChart history={history} title="SYNCHRONIZED DIGITAL TWIN SENSOR TELEMETRY" />
      </ScrollReveal>
    </div>
  );
}
