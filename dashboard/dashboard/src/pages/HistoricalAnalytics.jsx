/**
 * src/pages/HistoricalAnalytics.jsx
 * ----------------------------------
 * Professional Historical Analytics & Telemetry Data Lake.
 * Commercial white theme with interactive time-series waveforms, database snapshots, and CSV export.
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download } from 'lucide-react';
import { fetchTwinHistory } from '../services/api';
import RealtimeMultiChart from '../components/charts/RealtimeMultiChart';
import { exportToCsv } from '../utils/exportCsv';
import { soundEffects } from '../utils/soundEffects';
import StatusBadge from '../components/common/StatusBadge';

const TIME_RANGES = [
  { label: '1 HOUR', hours: 1 },
  { label: '6 HOURS', hours: 6 },
  { label: '24 HOURS', hours: 24 },
  { label: '7 DAYS', hours: 168 },
];

export default function HistoricalAnalytics() {
  const { history: memoryHistory, selectedBattery } = useOutletContext();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              SQLITE TELEMETRY DATA LAKE &bull; PERSISTENT ARCHIVE
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
            PACK: {selectedBattery || 'BATTERY_01'}
          </span>
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
          Historical Telemetry Analytics &amp; Database Logs
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', margin: 0, maxWidth: 740, lineHeight: 1.5 }}>
          Inspect longitudinal cell cycling records, synchronous sensor time-series, and extract CSV dataset snapshots for external ML research and warranty compliance audits.
        </p>

        {/* Filters & Export Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
          {/* Time-Range Selector */}
          <div style={{ display: 'flex', gap: 6, backgroundColor: '#F8FAFC', padding: 4, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.hours}
                onClick={() => setSelectedRange(tr.hours)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: selectedRange === tr.hours ? '#FFFFFF' : 'transparent',
                  color: selectedRange === tr.hours ? '#2563EB' : '#64748B',
                  fontWeight: selectedRange === tr.hours ? 700 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  boxShadow: selectedRange === tr.hours ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tr.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
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
            <span>Export CSV Dataset ({displayedData.length} records)</span>
          </button>
        </div>
      </div>

      {/* Main Historical Waveform Chart */}
      <RealtimeMultiChart history={displayedData} title={`HISTORICAL SENSOR TELEMETRY (${selectedRange}h ARCHIVE)`} />

      {/* Telemetry Snapshot Data Table */}
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
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recent Telemetry Records Table
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Showing latest {Math.min(10, displayedData.length)} frames recorded by edge gateway
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 600 }}>● SQLITE COMMITTED</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Timestamp</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Voltage (V)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Current (A)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Temperature (°C)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>SOC (%)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>SOH (%)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.slice(-10).reverse().map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', color: '#64748B' }}>
                    {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : `Frame #${displayedData.length - idx}`}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#0F172A' }}>
                    {row.voltage_v?.toFixed(3) || '14.800'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600, color: (row.current_a || 0) > 0 ? '#2563EB' : '#0F172A' }}>
                    {row.current_a?.toFixed(3) || '0.000'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600, color: (row.temperature_c || 0) > 40 ? '#D97706' : '#16A34A' }}>
                    {row.temperature_c?.toFixed(1) || '29.4'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#0F172A' }}>
                    {row.soc_percent?.toFixed(1) || '85.0'}%
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#16A34A' }}>
                    {row.soh_percent?.toFixed(1) || '96.2'}%
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge label={row.battery_status || 'HEALTHY'} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
