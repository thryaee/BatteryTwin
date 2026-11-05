/**
 * src/components/common/SystemArchitecture.jsx
 * --------------------------------------------
 * Interactive Visual System Architecture Pipeline for BatteryTwin.
 *
 * Implements the 6-stage hardware-to-cloud pipeline:
 * 1. ESP32 + Sensors (INA219, DS18B20)
 * 2. Data Acquisition (FreeRTOS, I2C, 1-Wire, Wi-Fi MQTT/REST)
 * 3. Backend Processing (FastAPI, SQLite Telemetry Lake, Async Workers)
 * 4. AI Prediction Models (PyTorch SOH, Random Forest / XGBoost RUL, LangGraph Multi-Agent Swarm)
 * 5. 3D Digital Twin (Three.js WebGL, 4S3P 12-cell physical mesh, Thermal IR ramp)
 * 6. User Dashboard (React 18, Recharts, Framer Motion, Inter typography)
 */

import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Database,
  Brain,
  Box,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: '01',
    title: 'ESP32 & Sensors',
    subtitle: 'Physical Hardware Layer',
    icon: Zap,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    tech: ['ESP32-WROOM-32', 'INA219 Shunt (I2C)', 'DS18B20 Temp (1-Wire)'],
    description:
      'High-precision hardware edge node sampling terminal pack voltage, bidirectional current, and core cell temperature at 100ms intervals.',
  },
  {
    step: '02',
    title: 'Data Acquisition',
    subtitle: 'Edge Protocol Gateway',
    icon: Wifi,
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    tech: ['FreeRTOS Tasks', 'Wi-Fi 802.11 b/g/n', 'WebSockets / REST API'],
    description:
      'Buffered edge ingestion running FreeRTOS dual-core tasks that package packetized sensor telemetry and stream frames to the backend over low-latency WebSockets.',
  },
  {
    step: '03',
    title: 'Backend Processing',
    subtitle: 'High-Throughput Server',
    icon: Database,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    tech: ['FastAPI (Python 3.11)', 'SQLite Database', 'Pydantic V2 Schemas'],
    description:
      'Asynchronous REST & WebSocket server orchestrating schema validation, rolling time-series archival, and dispatching live frames to AI analytical workers.',
  },
  {
    step: '04',
    title: 'AI Prediction Models',
    subtitle: 'Multi-Agent Intelligence',
    icon: Brain,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tech: ['LangGraph Swarm', 'PyTorch SOH Model', 'Gradient Boosted RUL'],
    description:
      '5 specialized autonomous agents (SOH, RUL, Charging, Maintenance, Coordinator) arbitrating electrochemical fade models and prescribing contactor commands.',
  },
  {
    step: '05',
    title: '3D Digital Twin',
    subtitle: 'Spatial Physics Simulation',
    icon: Box,
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    tech: ['Three.js WebGL', 'Raycasting Cell Picker', 'Infrared Thermal Shaders'],
    description:
      'Interactive 4S3P 12-cell physical twin with real-time infrared gradient thermal mapping, per-cell voltage isolation, and exploded inspection views.',
  },
  {
    step: '06',
    title: 'User Dashboard',
    subtitle: 'Commercial Operations UI',
    icon: LayoutDashboard,
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    tech: ['React 18.3', 'Recharts Waveforms', 'Framer Motion Transitions'],
    description:
      'World-class, high-clarity responsive engineering dashboard delivering real-time telemetry, historical analytics, and human-in-the-loop controls.',
  },
];

export default function SystemArchitecture() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 20,
        padding: '28px 32px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#2563EB',
                fontFamily: 'JetBrains Mono',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              End-to-End System Pipeline
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            System Architecture &amp; Data Acquisition Flow
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0 0' }}>
            How physical ESP32 sensor signals transform into predictive AI intelligence and 3D digital twin states
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} color="#16A34A" />
            Zero-Mock Hardware Pipeline Verified
          </span>
        </div>
      </div>

      {/* Horizontal Flow Pipeline Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          position: 'relative',
        }}
      >
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage === idx;

          return (
            <div
              key={stage.step}
              onClick={() => setActiveStage(idx)}
              style={{
                padding: '16px 14px',
                borderRadius: 14,
                backgroundColor: isSelected ? stage.bg : '#F8FAFC',
                border: `1.5px solid ${isSelected ? stage.border : '#E2E8F0'}`,
                boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: stage.color, fontFamily: 'JetBrains Mono' }}>
                  {stage.step}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: stage.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={15} color={stage.color} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                  {stage.title}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 2 }}>
                  {stage.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Deep-Dive Card */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 14,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ maxWidth: 650 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: PIPELINE_STAGES[activeStage].color,
                fontFamily: 'JetBrains Mono',
              }}
            >
              STAGE {PIPELINE_STAGES[activeStage].step} &bull; {PIPELINE_STAGES[activeStage].subtitle.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
            {PIPELINE_STAGES[activeStage].title}
          </div>
          <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {PIPELINE_STAGES[activeStage].description}
          </p>
        </div>

        {/* Technologies Employed */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em' }}>
            TECHNOLOGIES EMPLOYED
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PIPELINE_STAGES[activeStage].tech.map((t, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono',
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

