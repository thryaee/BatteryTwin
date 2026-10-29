/**
 * src/pages/LiveMonitoring.jsx
 * -----------------------------
 * Page 2: Dedicated Real-time Live Battery Monitoring Interface.
 *
 * Nexus Studio Editorial Live Telemetry Experience:
 * - Monumental typography statement ("LIVE / SENSOR STREAM.")
 * - High-precision monospace telemetry KPIs with AnimatedCounter
 * - Physical INA219 / DS18B20 sensor acquisition diagnostics table
 * - Synchronized real-time multi-metric waveform chart
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Zap,
  Thermometer,
  BatteryCharging,
  Radio,
  Clock,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import ScrollReveal from '../components/ui/ScrollReveal';
import { LoadingState } from '../components/common/FeedbackStates';

export default function LiveMonitoring() {
  const { liveData, history, loading, connected } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Connecting to Live Telemetry Stream..." />;
  }

  const v = liveData?.voltage_v;
  const i = liveData?.current_a;
  const t = liveData?.temperature_c;
  const soc = liveData?.soc_percent;
  const soh = liveData?.soh_percent;
  const p = liveData?.power_w ?? (v && i ? v * i : 0);
  const isCharging = liveData?.charging_status === 'CHARGING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── Section A: Editorial Headline ───────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 1. Section Label */}
        <ScrollReveal delay={0.05} yOffset={30}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className={connected ? 'pulse-dot-signal' : 'pulse-dot-ember'} />
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
              INA219 & DS18B20 HARDWARE BUS // {connected ? 'WEBSOCKET BROADCAST' : 'REST POLLING'}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="sm" />
              <StatusBadge label={liveData?.charging_status || 'IDLE'} size="sm" />
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
            <div>LIVE SENSOR</div>
            <div className="text-stroke-signal" style={{ opacity: 0.95 }}>
              TELEMETRY STREAM.
            </div>
          </h1>
        </ScrollReveal>

        {/* 3. Supporting Text */}
        <ScrollReveal delay={0.20} yOffset={35}>
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
            High-frequency physical telemetry acquisition streaming continuous voltage, current,
            temperature, and power flow vectors directly from ESP32 edge sensors.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Section B: Primary Live Measurement Cards (4. Metrics/Data) ───────────────── */}
      <ScrollReveal delay={0.28} yOffset={40}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}
        >
          <MetricCard
            icon={Zap}
            label="Terminal Voltage"
            value={v}
            unit="V"
            color="#f0f0f8"
            decimals={3}
            history={history}
            historyKey="voltage_v"
          />

          <MetricCard
            icon={Activity}
            label="Pack Current"
            value={i}
            unit="A"
            color={isCharging ? '#e8ff47' : i < -0.05 ? '#c4c4d8' : '#10b981'}
            decimals={3}
            history={history}
            historyKey="current_a"
          />

          <MetricCard
            icon={Thermometer}
            label="Core Temperature"
            value={t}
            unit="°C"
            color={t > 45 ? '#ef4444' : t > 38 ? '#f59e0b' : '#10b981'}
            decimals={1}
            history={history}
            historyKey="temperature_c"
          />

          <MetricCard
            icon={BatteryCharging}
            label="State of Charge"
            value={soc}
            unit="%"
            color="#e8ff47"
            decimals={1}
            history={history}
            historyKey="soc_percent"
          />

          <MetricCard
            icon={ShieldCheck}
            label="State of Health"
            value={soh}
            unit="%"
            color={soh > 80 ? '#10b981' : '#f59e0b'}
            decimals={1}
            history={history}
            historyKey="soh_percent"
          />

          <MetricCard
            icon={Zap}
            label="Instantaneous Power"
            value={p}
            unit="W"
            color="#e8ff47"
            decimals={2}
          />
        </div>
      </ScrollReveal>

      {/* ── Section C: Physical Sensor Bus Diagnostics & Main Waveform Visual (5. Main Visual) ── */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={16} color="#e8ff47" />
                <h3
                  style={{
                    fontFamily: 'Clash Display',
                    fontSize: '1.02rem',
                    fontWeight: 600,
                    color: '#f0f0f8',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  EDGE HARDWARE INGESTION PROTOCOL
                </h3>
              </div>
              <StatusBadge label={connected ? 'WEBSOCKET ONLINE' : 'POLLING'} size="sm" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(8, 8, 18, 0.75)', padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                  INA219 HIGH-SIDE CURRENT/VOLTAGE
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                    {v?.toFixed(3) || '14.800'} V / {i?.toFixed(3) || '0.000'} A
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'JetBrains Mono' }}>● 100Hz</span>
                </div>
              </div>

              <div style={{ background: 'rgba(8, 8, 18, 0.75)', padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                  DS18B20 1-WIRE DIGITAL THERMAL PROBE
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
                    {t?.toFixed(1) || '25.0'} °C CORE
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'JetBrains Mono' }}>● ±0.5°C ACCURACY</span>
                </div>
              </div>

              <div style={{ background: 'rgba(8, 8, 18, 0.75)', padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                  DATA SOURCE ENGINE
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
                    {liveData?.data_source === 'SIMULATOR' ? 'SYNTHETIC' : 'HARDWARE'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>
                    CYCLE #{liveData?.cycle_count?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <RealtimeMultiChart history={history} title="LIVE SENSOR TELEMETRY WAVEFORM" />
        </div>
      </ScrollReveal>
    </div>
  );
}
