/**
 * src/components/BatteryCellMatrix.jsx
 * ------------------------------------
 * 12-Cell Bank Matrix with real-time balancing, variance calculation, and 3D sync.
 * Clean, modern light theme styling.
 */

import React from 'react';
import { motion } from 'framer-motion';
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
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 25px -5px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header & Delta Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            4S3P Pack Architecture &bull; 12 Series-Parallel Cells
          </div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.2rem',
              color: '#0F172A',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Cell Voltage &amp; Thermal Balancing Matrix
          </h2>
        </div>

        {/* Delta Badges */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '6px 14px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>CELL &Delta;V:</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: deltaV < 30 ? '#16A34A' : '#F59E0B',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {deltaV.toFixed(1)} mV
            </span>
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '6px 14px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>SPREAD &Delta;T:</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: deltaT < 4 ? '#16A34A' : '#EA580C',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              &plusmn;{deltaT} &deg;C
            </span>
          </div>
        </div>
      </div>

      {/* 4x3 Interactive Cell Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: 12,
        }}
      >
        {cells.map((cell) => {
          const isSelected = selectedCell === cell.id;
          const isWarm = cell.temp > 38;
          const isHot = cell.temp > 45;
          const tempBadgeColor = isHot ? '#DC2626' : isWarm ? '#D97706' : '#16A34A';

          return (
            <motion.div
              key={cell.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCellClick(cell.id)}
              style={{
                background: isSelected ? '#EFF6FF' : '#F8FAFC',
                border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: isSelected ? '#2563EB' : '#0F172A',
                  }}
                >
                  C#{cell.id.toString().padStart(2, '0')}
                </span>
                {cell.isBalancing && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: '#B45309',
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    BAL
                  </span>
                )}
              </div>

              {/* Voltage Readout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748B', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>V</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#0F172A' }}>
                  {cell.voltage.toFixed(3)}
                </span>
              </div>

              {/* Temperature Readout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748B', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>T</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: tempBadgeColor }}>
                  {cell.temp.toFixed(1)}&deg;
                </span>
              </div>

              {/* Micro-bar Gauge */}
              <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, ((cell.voltage - 3.2) / 1.0) * 100))}%`,
                    height: '100%',
                    background: isSelected ? '#2563EB' : '#16A34A',
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
