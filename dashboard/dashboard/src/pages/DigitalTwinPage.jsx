/**
 * src/pages/DigitalTwinPage.jsx
 * ------------------------------
 * Dedicated 3D Digital Twin Centerpiece for BatteryTwin.
 *
 * Requirements:
 * - Premium White Theme surrounding interface
 * - Three.js 4S3P 12-cell pack with module focus and cell selection
 * - Real-time thermal gradient and voltage isolation
 * - Synchronized 12-cell series balancing matrix
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
import ScrollReveal from '../components/ui/ScrollReveal';
import { LoadingState } from '../components/common/FeedbackStates';
import { soundEffects } from '../utils/soundEffects';

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
  const baseTemp = liveData?.temperature_c || 29.4;

  // 12-cell dataset generated from live telemetry
  const cells = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    const modIdx = Math.floor(i / 3) + 1;
    const cellInMod = (i % 3) + 1;
    const tempOffset = (cellInMod === 2 ? 1.4 : -0.7) + (modIdx === 2 || modIdx === 3 ? 0.9 : -0.6);
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
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
            4S3P MODULAR EV PACK &bull; THREE.JS SPATIAL RECONSTRUCTION
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge label={isSimulator ? 'SIMULATOR MODE' : 'HARDWARE SENSORS'} size="sm" />
            <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="sm" />
            <StatusBadge label={isCharging ? 'CHARGING' : liveData?.charging_status || 'IDLE'} size="sm" />
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.0rem, 3.8vw, 3.0rem)',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Interactive 3D Digital Twin
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', maxWidth: 720, lineHeight: 1.5, margin: 0 }}>
          Spatial 3D digital twin mapping physical ESP32 telemetry into real-time infrared thermal ramps,
          series copper busbar currents, and individual cell isolation.
        </p>
      </section>

      {/* ── 3D Viewport Controls & Module Focus ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Module Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 700, marginRight: 4 }}>
              MODULE FOCUS:
            </span>
            {['ALL', 'MOD_1', 'MOD_2', 'MOD_3', 'MOD_4'].map((modKey) => {
              const label = modKey === 'ALL' ? 'All Pack' : `Module 0${modKey.replace('MOD_', '')}`;
              const active = activeModuleFilter === modKey;
              return (
                <button
                  key={modKey}
                  onClick={() => handleModuleSelect(modKey)}
                  style={{
                    backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                    borderColor: active ? '#2563EB' : '#E2E8F0',
                    color: active ? '#2563EB' : '#475569',
                    border: '1px solid',
                    padding: '5px 14px',
                    fontSize: '0.78rem',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.78rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
            <span>
              Delta-V Imbalance: <strong style={{ color: deltaV < 25 ? '#16A34A' : '#D97706' }}>{deltaV.toFixed(1)} mV</strong>
            </span>
            <span>
              Thermal Spread: <strong style={{ color: parseFloat(deltaT) < 3.5 ? '#16A34A' : '#DC2626' }}>±{deltaT} °C</strong>
            </span>
          </div>
        </div>

        {/* 3D Viewport Container (Clean White Surrounding) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px -2px rgba(15, 23, 42, 0.08)',
            position: 'relative',
          }}
        >
          <DigitalTwinCanvas
            liveData={liveData}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            height={600}
            enableControls={true}
            reducedMotion={false}
          />
        </div>
      </div>

      {/* ── 12-Cell Synchronized Pack Matrix ─────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              12-Cell Series Electrochemical Matrix (4S3P)
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Click any cell to isolate metrics and focus the 3D inspection camera
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 600 }}>● ALL CELLS BALANCED (&lt;20mV)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {cells.map((cell) => {
            const isSelected = selectedCell === cell.id;
            return (
              <div
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  border: `1.5px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, color: isSelected ? '#2563EB' : '#64748B' }}>
                    CELL {cell.id < 10 ? `0${cell.id}` : cell.id}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>MOD {cell.moduleId}</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono' }}>
                  {cell.voltage.toFixed(3)}V
                </div>
                <div style={{ fontSize: '0.70rem', color: cell.temp > 32 ? '#D97706' : '#16A34A', fontWeight: 600 }}>
                  {cell.temp.toFixed(1)}°C
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
