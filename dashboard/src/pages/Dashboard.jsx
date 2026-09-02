/**
 * pages/Dashboard.jsx
 * --------------------
 * Main dashboard page. Composes all components into a single-page layout.
 */

import { useBatteryData } from '../hooks/useBatteryData';
import LiveMetrics from '../components/LiveMetrics';
import HealthPanel from '../components/HealthPanel';
import ChargingStatus from '../components/ChargingStatus';
import AIRecommendations from '../components/AIRecommendations';
import DigitalTwinView from '../components/DigitalTwinView';
import StatusBadge from '../components/StatusBadge';

function ConnectionBar({ connected, error, lastUpdated }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
        fontSize: '0.75rem',
        color: '#64748b',
        borderBottom: '1px solid #1e293b',
        marginBottom: 24,
      }}
    >
      <span
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#4ade80' : '#f87171',
          display: 'inline-block',
          boxShadow: connected ? '0 0 6px #4ade80' : 'none',
        }}
      />
      <span>{connected ? 'Live (WebSocket)' : 'Polling (REST)'}</span>
      {error && <span style={{ color: '#f87171' }}>⚠ {error}</span>}
      {lastUpdated && (
        <span style={{ marginLeft: 'auto' }}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { liveData, history, loading, connected, error, lastUpdated } = useBatteryData();

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
            ⚡ BatteryTwin Dashboard
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
            Digital Twin-Enabled Battery Health & Charging Optimization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {liveData && (
            <>
              <StatusBadge label={liveData.battery_status || 'UNKNOWN'} size="lg" />
              <StatusBadge label={liveData.charging_status || 'IDLE'} size="lg" />
              <StatusBadge label={liveData.data_source === 'SIMULATOR' ? 'SIMULATOR' : 'ESP32'} size="lg" />
            </>
          )}
        </div>
      </header>

      <ConnectionBar connected={connected} error={error} lastUpdated={lastUpdated} />

      {loading && !liveData ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          <div>Connecting to BatteryTwin backend...</div>
          <div style={{ fontSize: '0.75rem', marginTop: 8 }}>Make sure the backend is running on localhost:8000</div>
        </div>
      ) : (
        <>
          {/* Row 1: Live sensor metrics */}
          <LiveMetrics liveData={liveData} history={history} />

          {/* Row 2: Health + Charging side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <HealthPanel liveData={liveData} history={history} />
            <ChargingStatus liveData={liveData} />
          </div>

          {/* Row 3: AI Recommendations + Digital Twin View */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <AIRecommendations liveData={liveData} />
            <DigitalTwinView liveData={liveData} history={history} />
          </div>
        </>
      )}
    </div>
  );
}
