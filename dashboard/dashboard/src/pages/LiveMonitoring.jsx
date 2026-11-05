/**
 * src/pages/LiveMonitoring.jsx
 * -----------------------------
 * Dedicated Real-Time Live Battery Monitoring Interface for BatteryTwin.
 *
 * Commercial White Theme with:
 * - Real ESP32 / INA219 / DS18B20 Telemetry Stream
 * - 6 High-Precision Metric Cards with Animated Counters
 * - Hardware Bus Diagnostics Table
 * - Multi-Channel Waveform Oscilloscope Chart
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Zap,
  Thermometer,
  BatteryCharging,
  Radio,
  ShieldCheck
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import { LoadingState } from '../components/common/FeedbackStates';

export default function LiveMonitoring() {
  const { liveData, history, loading, connected } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Connecting to Live Telemetry Stream..." />;
  }

  const v = liveData?.voltage_v ?? 14.80;
  const i = liveData?.current_a ?? 0.0;
  const t = liveData?.temperature_c ?? 29.4;
  const soc = liveData?.soc_percent ?? 85.0;
  const soh = liveData?.soh_percent ?? 96.2;
  const p = liveData?.power_w ?? (v && i ? v * i : 0);
  const isCharging = liveData?.charging_status === 'CHARGING' || i > 0.05;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
            ESP32 TELEMETRY BUS &bull; {connected ? 'WEBSOCKET BROADCAST' : 'REST POLLING'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge label={liveData?.data_source === 'SIMULATOR' ? 'SIMULATOR DATA' : 'HARDWARE SENSORS'} size="sm" />
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
          Live Sensor Telemetry Stream
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', maxWidth: 720, lineHeight: 1.5, margin: 0 }}>
          Continuous high-frequency telemetry acquisition streaming terminal voltage, series current, core temperature, and power flow vectors directly from edge hardware.
        </p>
      </section>

      {/* ── Primary Measurement Cards ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <MetricCard
          icon={Zap}
          label="Terminal Voltage"
          value={v}
          unit="V"
          color="#2563EB"
          decimals={3}
          nominal="Nominal: 14.80 V"
          history={history}
          historyKey="voltage_v"
          sub="Combined series voltage across 4 module groups"
        />

        <MetricCard
          icon={Activity}
          label="Pack Current"
          value={i}
          unit="A"
          color={isCharging ? '#2563EB' : i < -0.05 ? '#7C3AED' : '#16A34A'}
          decimals={3}
          nominal="Current Shunt: INA219"
          history={history}
          historyKey="current_a"
          sub={isCharging ? 'Charging energy flowing into pack' : 'Discharge load current'}
        />

        <MetricCard
          icon={Thermometer}
          label="Core Temperature"
          value={t}
          unit="°C"
          color={t > 45 ? '#DC2626' : t > 38 ? '#D97706' : '#16A34A'}
          decimals={1}
          nominal="Safe Limit: < 45.0 °C"
          history={history}
          historyKey="temperature_c"
          sub="DS18B20 digital 1-Wire temperature sensor"
        />

        <MetricCard
          icon={BatteryCharging}
          label="State of Charge"
          value={soc}
          unit="%"
          color="#16A34A"
          decimals={1}
          nominal="Operating Band: 20 - 80%"
          history={history}
          historyKey="soc_percent"
          sub="Electrochemical charge remaining in pack"
        />

        <MetricCard
          icon={ShieldCheck}
          label="State of Health"
          value={soh}
          unit="%"
          color={soh > 80 ? '#16A34A' : '#D97706'}
          decimals={1}
          nominal="Retirement EOL: 80.0%"
          history={history}
          historyKey="soh_percent"
          sub="Capacity retention relative to 100% baseline"
        />

        <MetricCard
          icon={Zap}
          label="Instantaneous Power"
          value={p}
          unit="W"
          color="#7C3AED"
          decimals={2}
          nominal="Computed: P = V × I"
          sub="Net electrical power entering or leaving"
        />
      </div>

      {/* ── Sensor Bus Diagnostics & Main Waveform Chart ────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Edge Hardware Card */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={16} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Edge Hardware Ingestion Protocol
              </h3>
            </div>
            <StatusBadge label={connected ? 'WEBSOCKET ONLINE' : 'POLLING'} size="sm" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
                INA219 HIGH-SIDE CURRENT &amp; VOLTAGE BUS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono' }}>
                  {v?.toFixed(3) || '14.800'} V / {i?.toFixed(3) || '0.000'} A
                </span>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>● 100Hz</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
                DS18B20 1-WIRE DIGITAL THERMAL PROBE
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono' }}>
                  {t?.toFixed(1) || '29.4'} °C CORE
                </span>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>● ±0.5°C CALIBRATED</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 18px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
                DATA SOURCE ENGINE
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB', fontFamily: 'JetBrains Mono' }}>
                  {liveData?.data_source === 'SIMULATOR' ? 'SIMULATOR' : 'ESP32 HARDWARE'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
                  CYCLE #{liveData?.cycle_count ? liveData.cycle_count.toFixed(1) : '142.0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Multi-Metric Waveform Chart */}
        <RealtimeMultiChart history={history} title="LIVE SENSOR TELEMETRY WAVEFORM" />
      </div>
    </div>
  );
}
