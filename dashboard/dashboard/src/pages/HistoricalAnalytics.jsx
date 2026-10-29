import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  History,
  Download,
  Calendar,
  Filter,
  Table,
  Zap,
  Activity,
  Thermometer,
  BatteryCharging,
  ShieldCheck
} from 'lucide-react';
import { fetchReadingHistory, fetchTwinHistory } from '../services/api';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import { exportToCsv } from '../utils/exportCsv';
import { soundEffects } from '../utils/soundEffects';
import StatusBadge from '../components/common/StatusBadge';
import MagneticButton from '../components/ui/MagneticButton';
import ScrollReveal from '../components/ui/ScrollReveal';

const TIME_RANGES = [
  { label: '1 HOUR', hours: 1 },
  { label: '6 HOURS', hours: 6 },
  { label: '24 HOURS', hours: 24 },
  { label: '7 DAYS', hours: 168 },
];

export default function HistoricalAnalytics() {
  const { liveData, history: memoryHistory, selectedBattery } = useOutletContext();
  const [selectedRange, setSelectedRange] = useState(24);
  const [dbSnapshots, setDbSnapshots] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load historical snapshots from FastAPI backend
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetchTwinHistory(selectedBattery || 'BATTERY_01', selectedRange);
        if (isMounted && res.snapshots) {
          setDbSnapshots(res.snapshots);
        }
      } catch (err) {
        console.warn('Failed to fetch DB history, fallback to memory history:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [selectedRange, selectedBattery]);

  const handleExport = () => {
    soundEffects.playClick();
    const dataToExport = dbSnapshots.length ? dbSnapshots : memoryHistory;
    exportToCsv(`batterytwin_telemetry_${selectedBattery || 'BATTERY_01'}`, dataToExport);
  };

  const displayedData = dbSnapshots.length ? dbSnapshots : memoryHistory;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Editorial Monumental Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'linear-gradient(180deg, rgba(13, 13, 31, 0.7) 0%, rgba(8, 8, 18, 0.7) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 12,
        }}
      >
        {/* 1. Section Label */}
        <ScrollReveal delay={0.05} yOffset={30}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.68rem',
                color: '#e8ff47',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>09 / DATA LAKE</span>
              <span style={{ color: '#444466' }}>—</span>
              <span>SQLITE ARCHIVE & CSV EXPORT</span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'JetBrains Mono',
                color: '#9898b8',
                letterSpacing: '0.04em',
              }}
            >
              {selectedBattery || 'BATTERY_01'} ARCHIVE
            </span>
          </div>
        </ScrollReveal>

        {/* 2. Large Heading */}
        <ScrollReveal delay={0.12} yOffset={40}>
          <h1
            style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 'clamp(1.6rem, 3.2vw, 2.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#f0f0f8',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            HISTORICAL TELEMETRY ANALYTICS & DATABASE LOGS
          </h1>
        </ScrollReveal>

        {/* 3. Supporting Text */}
        <ScrollReveal delay={0.20} yOffset={35}>
          <p
            style={{
              fontFamily: 'Cabinet Grotesk, sans-serif',
              fontSize: '0.95rem',
              color: '#9898b8',
              margin: 0,
              maxWidth: 720,
              lineHeight: 1.5,
            }}
          >
            Inspect longitudinal cell cycling records, synchronous sensor time-series, and extract CSV dataset snapshots for external ML research.
          </p>
        </ScrollReveal>

        {/* 4. Metrics / Time Filter Buttons & Export */}
        <ScrollReveal delay={0.28} yOffset={40}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 4,
                background: 'rgba(8, 8, 18, 0.85)',
                padding: 4,
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {TIME_RANGES.map((r) => {
                const isActive = selectedRange === r.hours;
                return (
                  <button
                    key={r.hours}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedRange(r.hours);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.68rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      borderRadius: 6,
                      border: 'none',
                      background: isActive ? '#e8ff47' : 'transparent',
                      color: isActive ? '#04040a' : '#9898b8',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <MagneticButton strength={0.2}>
              <button
                onClick={handleExport}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  fontSize: '0.74rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: '#e8ff47',
                  color: '#04040a',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(232, 255, 71, 0.25)',
                }}
              >
                <Download size={14} /> EXPORT CSV
              </button>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>

      {/* 5. Main Visual: Historical Telemetry Multi-Chart & Data Table */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <RealtimeMultiChart
            history={displayedData}
            title={`HISTORICAL SENSOR TELEMETRY (${displayedData.length} RECORDED SNAPSHOTS)`}
          />

      {/* Data Table of Historical Readings */}
      <div
        className="glass-panel"
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'linear-gradient(180deg, rgba(13, 13, 31, 0.65) 0%, rgba(8, 8, 18, 0.75) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(232, 255, 71, 0.08)',
                border: '1px solid rgba(232, 255, 71, 0.25)',
              }}
            >
              <Table size={16} color="#e8ff47" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: '1.02rem',
                  color: '#f0f0f8',
                  letterSpacing: '0.02em',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                TELEMETRY SNAPSHOT DATASET
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                SHOWING MOST RECENT 50 CYCLES
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              color: '#9898b8',
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            TOTAL ROWS: {displayedData.length}
          </span>
        </div>

        {displayedData.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: 420 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', fontFamily: 'JetBrains Mono, monospace' }}>
              <thead>
                <tr
                  style={{
                    background: 'rgba(8, 8, 18, 0.95)',
                    color: '#9898b8',
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    letterSpacing: '0.06em',
                  }}
                >
                  <th style={{ padding: '12px 14px' }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 14px' }}>VOLTAGE (V)</th>
                  <th style={{ padding: '12px 14px' }}>CURRENT (A)</th>
                  <th style={{ padding: '12px 14px' }}>TEMP (°C)</th>
                  <th style={{ padding: '12px 14px' }}>SOC (%)</th>
                  <th style={{ padding: '12px 14px' }}>SOH (%)</th>
                  <th style={{ padding: '12px 14px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.slice(-50).reverse().map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      color: '#f0f0f8',
                      background: idx % 2 === 0 ? 'rgba(8, 8, 18, 0.4)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: '#9898b8' }}>
                      {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : `Row #${idx + 1}`}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#e8ff47', fontWeight: 600 }}>{row.voltage_v?.toFixed(3) || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#10b981' }}>{row.current_a?.toFixed(3) || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#f0f0f8' }}>{row.temperature_c?.toFixed(1) || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#f0f0f8' }}>{row.soc_percent?.toFixed(1) || '—'}%</td>
                    <td style={{ padding: '10px 14px', color: '#10b981' }}>{row.soh_percent?.toFixed(1) || '—'}%</td>
                    <td style={{ padding: '10px 14px' }}>
                      <StatusBadge label={row.battery_status || 'OK'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#9898b8', fontSize: '0.84rem', fontFamily: 'Cabinet Grotesk' }}>
            No historical records stored in database yet. Connecting to live ingestion pipeline...
          </div>
        )}
      </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
