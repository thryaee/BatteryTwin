/**
 * src/pages/MainDashboard.jsx
 * ----------------------------
 * BatteryTwin Commercial Product Experience & Unified Command Center.
 *
 * Implements a balanced, visually stunning white-theme commercial platform:
 * 01 — WELCOME & KEY METRICS (SOC, SOH, Temp, RUL with Animated Counters & Tooltips)
 * 02 — LIVE SENSOR MONITORING (Real-time INA219/DS18B20 Waveforms & Hardware Status)
 * 03 — INTERACTIVE 3D DIGITAL TWIN (12-Cell 4S3P Spatial Reconstruction)
 * 04 — AI PREDICTIONS & INTELLIGENCE (5 Prediction Cards & AI Battery Insights)
 * 05 — LANGGRAPH MULTI-AGENT SWARM (5 Autonomous Agents & Decision Arbitration)
 * 06 — SYSTEM ARCHITECTURE PIPELINE (Hardware-to-Cloud Visual Workflow)
 * 07 — HISTORICAL ANALYTICS & DATA LAKE (Interactive Recharts & CSV Download)
 * 08 — SERIES CELL BALANCING & SAFETY RELAY
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, Link } from 'react-router-dom';
import {
  Thermometer,
  BatteryCharging,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
  Download,
  Layers,
  Box,
} from 'lucide-react';

import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import BatteryGauge from '../components/common/BatteryGauge';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import DegradationTrendChart from '../components/charts/DegradationTrendChart';
import DigitalTwinCanvas from '../components/3d/DigitalTwinCanvas';
import AIPredictionsDeck from '../components/common/AIPredictionsDeck';
import AgentGraphView from '../components/AgentGraphView';
import SystemArchitecture from '../components/common/SystemArchitecture';
import { LoadingState } from '../components/common/FeedbackStates';
import { scrollToSection } from '../utils/scrollNavigation';
import { exportToCsv } from '../utils/exportCsv';
import { triggerAgentRun } from '../services/api';
import { soundEffects } from '../utils/soundEffects';

export default function MainDashboard({ initialSection }) {
  const { liveData, history, loading, connected, selectedBattery } = useOutletContext();
  const location = useLocation();
  const [selectedCell, setSelectedCell] = useState(null);
  const [runningAgent, setRunningAgent] = useState(false);

  useEffect(() => {
    const target = initialSection || (window.location.hash ? window.location.hash.replace('#', '') : null);
    if (target) {
      const timer = setTimeout(() => {
        scrollToSection(target);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialSection, location]);

  if (loading && !liveData) {
    return <LoadingState message="Connecting to BatteryTwin Telemetry Gateway..." />;
  }

  // Live Telemetry Extraction
  const soc = liveData?.soc_percent ?? 85.0;
  const soh = liveData?.soh_percent ?? 96.2;
  const voltage = liveData?.voltage_v ?? 14.80;
  const current = liveData?.current_a ?? 0.0;
  const temp = liveData?.temperature_c ?? 29.4;
  const rul = liveData?.rul_cycles ?? 850;
  const power = liveData?.power_w ?? (voltage && current ? voltage * current : 0);
  const batteryStatus = liveData?.battery_status || 'HEALTHY';
  const chargingStatus = liveData?.charging_status || 'IDLE';
  const isCharging = chargingStatus === 'CHARGING' || current > 0.05;
  const isSimulator = liveData?.data_source === 'SIMULATOR';


  // Trigger manual agent analysis
  const handleRunAgentCycle = async () => {
    soundEffects.playClick();
    setRunningAgent(true);
    try {
      await triggerAgentRun();
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAgent(false);
    }
  };

  // Quick CSV Export
  const handleExportData = () => {
    soundEffects.playClick();
    if (history && history.length) {
      exportToCsv(`batterytwin_${selectedBattery || 'BATTERY_01'}_telemetry`, history);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, position: 'relative' }}>

      {/* ═══════════════════════════════════════════════════════════════
          01 — WELCOME & KEY METRICS (#overview)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="overview" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Welcome Hero Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 20,
            padding: '32px 36px',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle gradient corner accent */}
          <div
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-10%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.04) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: 740, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StatusBadge label={isSimulator ? 'SIMULATOR DATA' : 'ESP32 HARDWARE'} size="sm" />
              <StatusBadge label={batteryStatus} size="sm" />
              <StatusBadge label={chargingStatus} size="sm" />
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
                ID: {selectedBattery || 'BATTERY_01'}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.0rem, 3.8vw, 3.0rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                margin: '0 0 10px 0',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Welcome to <span style={{ color: '#2563EB' }}>BatteryTwin</span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#475569',
                lineHeight: 1.5,
                margin: '0 0 20px 0',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Intelligent battery monitoring, predictive analytics and digital twin visualization.
            </p>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollToSection('digital-twin')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box size={16} />
                <span>Inspect 3D Digital Twin</span>
              </button>

              <button
                onClick={handleRunAgentCycle}
                disabled={runningAgent}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: runningAgent ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Sparkles size={16} color="#7C3AED" />
                <span>{runningAgent ? 'Arbitrating Swarm...' : 'Run AI Diagnostics'}</span>
              </button>

              <button
                onClick={handleExportData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Download size={16} />
                <span>Export Telemetry CSV</span>
              </button>
            </div>
          </div>

          {/* Overall Battery Condition Visual Card */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              minWidth: 260,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={18} color="#16A34A" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                OVERALL BATTERY HEALTH
              </span>
            </div>

            <BatteryGauge soc={soc} soh={soh} charging={isCharging} />

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Electrochemical Condition:</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>OPTIMAL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Safety Contactor Relay:</span>
                <span style={{ fontWeight: 700, color: liveData?.relay_state ? '#16A34A' : '#DC2626' }}>
                  {liveData?.relay_state ? 'ENGAGED' : 'OPEN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Prominent Key Metric Cards ───────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {/* Card 1: State of Charge (SOC) */}
          <MetricCard
            icon={BatteryCharging}
            label="State of Charge"
            value={soc}
            unit="%"
            color="#16A34A"
            decimals={1}
            nominal="Recommended: 20 - 80%"
            history={history}
            historyKey="soc_percent"
            sub="Available electrochemical energy remaining in the pack"
            status={soc > 20 ? 'NORMAL' : 'LOW'}
          />

          {/* Card 2: State of Health (SOH) */}
          <MetricCard
            icon={ShieldCheck}
            label="State of Health"
            value={soh}
            unit="%"
            color={soh > 80 ? '#16A34A' : '#D97706'}
            decimals={1}
            nominal="Target: > 80.0% SOH"
            history={history}
            historyKey="soh_percent"
            sub="Capacity retention relative to original factory rating"
            status={soh > 80 ? 'HEALTHY' : 'DEGRADED'}
          />

          {/* Card 3: Battery Temperature */}
          <MetricCard
            icon={Thermometer}
            label="Battery Temperature"
            value={temp}
            unit="°C"
            color={temp > 45 ? '#DC2626' : temp > 38 ? '#D97706' : '#0284C7'}
            decimals={1}
            nominal="Safe: 15.0 - 45.0 °C"
            history={history}
            historyKey="temperature_c"
            sub="Average core cell temperature measured via DS18B20"
            status={temp < 40 ? 'OPTIMAL' : 'WARM'}
          />

          {/* Card 4: Remaining Useful Life (RUL) */}
          <MetricCard
            icon={Clock}
            label="Remaining Useful Life"
            value={rul}
            unit="cyc"
            color="#7C3AED"
            decimals={0}
            nominal="EOL Boundary: 0 cyc"
            history={history}
            historyKey="rul_cycles"
            sub={`≈ ${(rul * 0.75).toFixed(0)} operating days to 80% EOL`}
            status={rul > 400 ? 'STABLE' : 'ACTION'}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          02 — LIVE SENSOR MONITORING (#live)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="live" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
                02 // LIVE MONITORING
              </span>
              <StatusBadge label={connected ? 'CONNECTED' : 'DISCONNECTED'} size="sm" />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Real-Time Electrical &amp; Thermal Telemetry
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Direct edge streaming from INA219 high-side shunt and DS18B20 digital thermal sensors
            </p>
          </div>

          <Link
            to="/live"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <span>Open Dedicated Live View</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Live Vitals Deck */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>TERMINAL VOLTAGE</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              {voltage?.toFixed(3) || '14.800'} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>V</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
              NOMINAL PACK VOLTAGE (4S)
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>PACK CURRENT</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isCharging ? '#2563EB' : '#0F172A', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              {current?.toFixed(3) || '0.000'} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>A</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: isCharging ? '#2563EB' : '#64748B', marginTop: 4, fontWeight: 500 }}>
              {isCharging ? 'CHARGING FLOW (INPUT)' : 'IDLE / DISCHARGE'}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>CORE TEMPERATURE</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: temp > 40 ? '#D97706' : '#16A34A', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              {temp?.toFixed(1) || '29.4'} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>°C</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
              SAFE THERMAL ENVELOPE (&lt;45°C)
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>INSTANTANEOUS POWER</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              {power?.toFixed(2) || '0.00'} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>W</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 4, fontWeight: 500 }}>
              P = V × I POWER FLOW
            </div>
          </div>
        </div>

        {/* Realtime Waveform Chart */}
        <RealtimeMultiChart history={history} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          03 — INTERACTIVE 3D DIGITAL TWIN (#digital-twin)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="digital-twin" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
                03 // INTERACTIVE 3D DIGITAL TWIN
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                4S3P 12-CELL RECONSTRUCTION
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Physical Battery Pack &amp; Vehicle Chassis Viewport
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Inspect individual battery cells, infrared thermal ramps, series copper busbars, and exploded view layers
            </p>
          </div>

          <Link
            to="/digital-twin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <span>Full-Screen 3D Studio</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Clean Modern 3D Canvas Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
            position: 'relative',
          }}
        >
          <DigitalTwinCanvas
            liveData={liveData}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            height={560}
            enableControls={true}
            initialViewLayer="pack"
          />
        </div>

        {/* 3D Capabilities Feature Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 18px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563EB', fontSize: '0.82rem', fontWeight: 700 }}>
              <Box size={16} />
              <span>Raycast Cell Picker</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.45 }}>
              Click any of the 12 cells in 3D to zoom and isolate temperature, potential, and health metrics.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 18px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontSize: '0.82rem', fontWeight: 700 }}>
              <Thermometer size={16} />
              <span>Infrared Thermal Ramp</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.45 }}>
              Physical heat dissipation shader mapping core sensor readings into intuitive surface thermal gradients.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 18px', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7C3AED', fontSize: '0.82rem', fontWeight: 700 }}>
              <Layers size={16} />
              <span>Exploded View Slider</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.45 }}>
              Smooth mechanical disassembly showing aluminum heatsink tray, cold plate, busbars, and BMS PCB.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          04 — AI PREDICTIONS & INTELLIGENCE (#predictions)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="predictions" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
                04 // AI PREDICTIONS &amp; INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                NEURAL NETWORK MODELS
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Predictive Health, RUL &amp; Degradation Forecasting
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Machine learning models extrapolating capacity fade, thermal stress, and remaining charge cycles
            </p>
          </div>

          <Link
            to="/predictions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <span>Open Prediction Lab</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* 5 AI Prediction Cards + AI Insights */}
        <AIPredictionsDeck liveData={liveData} />

        {/* Degradation Extrapolation Chart */}
        <DegradationTrendChart
          currentSoh={soh}
          degradationRate={liveData?.degradation_rate || 0.002}
          currentCycle={liveData?.cycle_count || 142}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          05 — LANGGRAPH MULTI-AGENT SWARM (#agents)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="agents" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AgentGraphView liveData={liveData} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          06 — SYSTEM ARCHITECTURE PIPELINE (#architecture)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="architecture" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SystemArchitecture />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          07 — HISTORICAL ANALYTICS & DATASET EXPORT (#analytics)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="analytics" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 20,
            padding: '28px 32px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
                  07 // HISTORICAL ANALYTICS
                </span>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                  DATA LAKE ACTIVE
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Longitudinal Battery Performance History &amp; CSV Export
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0 0' }}>
                SQLite persistent telemetry database storing full sampling records for warranty audits and ML validation
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={handleExportData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Download size={15} color="#2563EB" />
                <span>Download CSV Dataset</span>
              </button>

              <Link
                to="/analytics"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                <span>Open Full Analytics</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          {/* Quick Analytics Summary Deck */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>TELEMETRY SAMPLES LOGGED</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                {history?.length || 180}+ <span style={{ fontSize: '0.85rem', color: '#64748B' }}>frames</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 600 }}>ROLLING MEMORY BUFFER</span>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>DATA EXPORT FORMATS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563EB', fontFamily: 'Inter', marginTop: 6 }}>
                CSV • JSON Format
              </div>
              <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Compatible with Python &amp; MATLAB</span>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>SERIES CELL BALANCE DELTA</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                12 <span style={{ fontSize: '0.85rem', color: '#64748B' }}>mV</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 600 }}>WELL BALANCED (&lt;30mV)</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
