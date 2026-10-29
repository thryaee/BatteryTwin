/**
 * src/components/CellInspectorOverlay.jsx
 * ---------------------------------------
 * Nexus Studio Editorial Floating HUD telemetry panel displayed when an individual cell is selected in 3D.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Thermometer, ShieldCheck, Activity, X } from 'lucide-react';

export default function CellInspectorOverlay({ selectedCell, liveData, onClose }) {
  if (!selectedCell) return null;

  const baseVoltage = (liveData?.voltage_v || 14.8) / 4;
  const baseTemp = liveData?.temperature_c || 25.0;
  const packSoh = liveData?.soh_percent || 100.0;

  // Calculate realistic per-cell variations
  const cellId = selectedCell;
  const col = Math.floor((cellId - 1) / 3);
  const row = (cellId - 1) % 3;
  const cellVoltage = (baseVoltage + Math.cos(col * 2 + row) * 0.015).toFixed(3);
  const cellTemp = (baseTemp + Math.sin(col * 1.5 + row * 2.1) * 2.2).toFixed(1);
  const cellResistance = (16.2 + (col + row * 0.8) * 0.7).toFixed(1);
  const cellSoh = (packSoh - (col * 0.2 + row * 0.1)).toFixed(1);

  const isHot = parseFloat(cellTemp) > 40;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 320,
          background: 'rgba(8, 8, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(232, 255, 71, 0.08)',
          zIndex: 30,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isHot ? '#ef4444' : '#e8ff47',
                boxShadow: isHot ? '0 0 8px #ef4444' : '0 0 8px #e8ff47',
              }}
            />
            <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '1.15rem', color: '#f0f0f8', letterSpacing: '-0.02em' }}>
              CELL #{cellId.toString().padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
              [B{col + 1}-S{row + 1}]
            </span>
          </div>

          <button
            onClick={onClose}
            data-cursor="hover"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#9898b8',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 2x2 Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {/* Voltage */}
          <div style={{ background: 'rgba(4, 4, 10, 0.65)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.62rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', textTransform: 'uppercase' }}>
              <Zap size={12} color="#e8ff47" />
              <span>VOLTAGE</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8ff47', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
              {cellVoltage} <span style={{ fontSize: '0.72rem', color: '#9898b8' }}>V</span>
            </div>
          </div>

          {/* Temperature */}
          <div style={{ background: 'rgba(4, 4, 10, 0.65)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.62rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', textTransform: 'uppercase' }}>
              <Thermometer size={12} color={isHot ? '#ef4444' : '#f59e0b'} />
              <span>TEMP</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isHot ? '#ef4444' : '#f59e0b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
              {cellTemp} <span style={{ fontSize: '0.72rem', color: '#9898b8' }}>°C</span>
            </div>
          </div>

          {/* Impedance / IR */}
          <div style={{ background: 'rgba(4, 4, 10, 0.65)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.62rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', textTransform: 'uppercase' }}>
              <Activity size={12} color="#c4c4d8" />
              <span>IMPEDANCE</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f0f8', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
              {cellResistance} <span style={{ fontSize: '0.72rem', color: '#9898b8' }}>mΩ</span>
            </div>
          </div>

          {/* Health SOH */}
          <div style={{ background: 'rgba(4, 4, 10, 0.65)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.62rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', textTransform: 'uppercase' }}>
              <ShieldCheck size={12} color="#10b981" />
              <span>HEALTH</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
              {cellSoh} <span style={{ fontSize: '0.72rem', color: '#9898b8' }}>%</span>
            </div>
          </div>
        </div>

        {/* Balancing Status Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.68rem',
            color: '#9898b8',
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontFamily: 'JetBrains Mono',
          }}
        >
          <span>Passive Balancing:</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            ● IN SYNC (ΔV &lt; 20mV)
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
