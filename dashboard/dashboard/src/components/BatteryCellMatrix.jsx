/**
 * src/components/BatteryCellMatrix.jsx
 * ------------------------------------
 * 12-Cell Bank Matrix with real-time balancing, variance calculation, and 3D sync.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Thermometer, CheckCircle, AlertTriangle, ArrowUpDown, Layers } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export default function BatteryCellMatrix({ liveData, selectedCell, onSelectCell }) {
  const baseVoltage = (liveData?.voltage_v || 14.8) / 4;
  const baseTemp = liveData?.temperature_c || 25.0;

  // Generate 12-cell dataset synchronized with 3D model
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
      bank: modIdx,
      series: cellInMod,
      voltage: v,
      temp: t,
      isBalancing: Math.abs(voltOffset) > 0.008,
    };
  });

  const voltages = cells.map((c) => c.voltage);
  const temps = cells.map((c) => c.temp);
  const minV = Math.min(...voltages);
  const maxV = Math.max(...voltages);
  const deltaV = (maxV - minV) * 1000; // in mV
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const deltaT = (maxT - minT).toFixed(1);

  const handleCellClick = (id) => {
    soundEffects.playCellSelect();
    if (onSelectCell) onSelectCell(id === selectedCell ? null : id);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: 'linear-gradient(180deg, rgba(13, 13, 31, 0.65) 0%, rgba(8, 8, 18, 0.75) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12,
      }}
    >
      {/* Header & Delta Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.66rem',
              color: '#9898b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            4S3P PACK TOPOLOGY // 12 SERIES-PARALLEL CELLS
          </div>
          <h2
            style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: '1.15rem',
              color: '#f0f0f8',
              letterSpacing: '-0.01em',
              margin: 0,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            PACK VOLTAGE & THERMAL BALANCE MATRIX
          </h2>
        </div>

        {/* Delta Badges */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(8, 8, 18, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 14px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.66rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>CELL ΔV:</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: deltaV < 30 ? '#10b981' : '#f59e0b',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {deltaV.toFixed(1)} mV
            </span>
          </div>

          <div
            style={{
              background: 'rgba(8, 8, 18, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 14px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.66rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>SPREAD ΔT:</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: deltaT < 4 ? '#10b981' : '#f97316',
                fontFamily: 'JetBrains Mono',
              }}
            >
              ±{deltaT} °C
            </span>
          </div>
        </div>
      </div>

      {/* 4x3 Interactive Cell Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12,
        }}
      >
        {cells.map((cell) => {
          const isSelected = selectedCell === cell.id;
          const isWarm = cell.temp > 38;
          const isHot = cell.temp > 45;
          const tempBadgeColor = isHot ? '#ef4444' : isWarm ? '#f59e0b' : '#10b981';

          return (
            <motion.div
              key={cell.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCellClick(cell.id)}
              style={{
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(24, 24, 46, 0.95) 0%, rgba(13, 13, 31, 0.98) 100%)'
                  : 'rgba(8, 8, 18, 0.75)',
                border: isSelected ? '1px solid #e8ff47' : '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 8,
                padding: '12px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                boxShadow: isSelected ? '0 0 20px rgba(232, 255, 71, 0.15)' : 'none',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: isSelected ? '#e8ff47' : '#f0f0f8',
                  }}
                >
                  C#{cell.id.toString().padStart(2, '0')}
                </span>
                {cell.isBalancing && (
                  <span
                    style={{
                      fontSize: '0.58rem',
                      color: '#f59e0b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono',
                    }}
                  >
                    BAL
                  </span>
                )}
              </div>

              {/* Voltage Readout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9898b8', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>V</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#f0f0f8' }}>
                  {cell.voltage.toFixed(3)}
                </span>
              </div>

              {/* Temperature Readout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9898b8', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>T</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: tempBadgeColor }}>
                  {cell.temp.toFixed(1)}°
                </span>
              </div>

              {/* Micro-bar Gauge */}
              <div style={{ width: '100%', height: 3, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, ((cell.voltage - 3.2) / 1.0) * 100))}%`,
                    height: '100%',
                    background: '#e8ff47',
                    borderRadius: 2,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
