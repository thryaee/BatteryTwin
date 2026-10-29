/**
 * pages/Dashboard.jsx
 * --------------------
 * BatteryTwin OS — Advanced 3D Digital Twin Command & Control Station.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Layers,
  Sparkles,
  FlaskConical,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  Server
} from 'lucide-react';
import { useBatteryData } from '../hooks/useBatteryData';
import LiveMetrics from '../components/LiveMetrics';
import HealthPanel from '../components/HealthPanel';
import ChargingStatus from '../components/ChargingStatus';
import AIRecommendations from '../components/AIRecommendations';
import DigitalTwinView from '../components/DigitalTwinView';
import BatteryCellMatrix from '../components/BatteryCellMatrix';
import AgentGraphView from '../components/AgentGraphView';
import SimulationLab from '../components/SimulationLab';
import StatusBadge from '../components/StatusBadge';
import { soundEffects } from '../utils/soundEffects';

const TABS = [
  { id: 'twin', label: '3D Digital Twin & Live HUD', icon: Box },
  { id: 'matrix', label: '12-Cell Bank Matrix', icon: Layers },
  { id: 'agents', label: 'LangGraph Multi-Agent AI', icon: Sparkles },
  { id: 'sim', label: 'Simulation & Stress Lab', icon: FlaskConical },
];

function ConnectionBar({ connected, error, lastUpdated, isMuted, onToggleMute }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '10px 16px',
        fontSize: '0.78rem',
        color: '#94a3b8',
        background: 'rgba(3, 7, 18, 0.75)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          className={connected ? 'pulse-active' : ''}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? '#10b981' : '#f87171',
            display: 'inline-block',
            boxShadow: connected ? '0 0 8px #10b981' : '0 0 8px #f87171',
          }}
        />
        <span style={{ fontWeight: 600, color: connected ? '#10b981' : '#f87171', fontFamily: 'JetBrains Mono' }}>
          {connected ? 'LIVE (WebSocket Engine)' : 'POLLING (REST Fallback)'}
        </span>
        {error && <span style={{ color: '#f87171' }}>⚠ {error}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleMute}
          className="cyber-button"
          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
          title={isMuted ? 'Unmute Audio Telemetry' : 'Mute Audio Telemetry'}
        >
          {isMuted ? <VolumeX size={13} color="#94a3b8" /> : <Volume2 size={13} color="#00f0ff" />}
          <span>{isMuted ? 'MUTED' : 'AUDIO ACTIVE'}</span>
        </button>

        {/* Live Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
          <Clock size={13} color="#38bdf8" />
          <span>{timeStr}</span>
        </div>

        {lastUpdated && (
          <span style={{ color: '#64748b', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
            Sync: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { liveData, history, loading, connected, error, lastUpdated } = useBatteryData();
  const [activeTab, setActiveTab] = useState('twin');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleTabChange = (tabId) => {
    soundEffects.playClick();
    setActiveTab(tabId);
  };

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        maxWidth: 1560,
        margin: '0 auto',
        padding: '24px 24px 48px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Top Command Station Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(56, 189, 248, 0.05))',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
            }}
          >
            <Zap size={24} color="#00f0ff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: 0, fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              BATTERY<span style={{ color: '#00f0ff' }}>TWIN</span> OS
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3, fontFamily: 'Rajdhani', fontWeight: 600 }}>
              Autonomous Digital Twin, Multi-Agent Optimization & 3D Spatial Telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {liveData && (
            <>
              <StatusBadge label={liveData.battery_status || 'UNKNOWN'} size="lg" />
              <StatusBadge label={liveData.charging_status || 'IDLE'} size="lg" />
              <StatusBadge label={liveData.data_source === 'SIMULATOR' ? 'SIMULATOR' : 'ESP32 HARDWARE'} size="lg" />
            </>
          )}
        </div>
      </header>

      {/* Real-time Connection Bar */}
      <ConnectionBar
        connected={connected}
        error={error}
        lastUpdated={lastUpdated}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
          paddingBottom: 8,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`cyber-button ${isActive ? 'cyber-button-active' : ''}`}
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} color={isActive ? '#00f0ff' : '#94a3b8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading && !liveData ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: '#00f0ff', marginBottom: 6 }}>
            INITIALIZING BATTERYTWIN DIGITAL TWIN ENGINE...
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Connecting to WebSocket gateway on ws://localhost:8000/ws
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Tab 1: 3D Twin & Live HUD */}
            {activeTab === 'twin' && (
              <>
                {/* Row 1: Live Sensor Metric Cards */}
                <LiveMetrics liveData={liveData} history={history} />

                {/* Row 2: 3D Digital Twin Visualizer (Full Width Interactive) */}
                <DigitalTwinView liveData={liveData} history={history} />

                {/* Row 3: Health Panel & Charging Optimizer */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                  <HealthPanel liveData={liveData} history={history} />
                  <ChargingStatus liveData={liveData} />
                </div>

                {/* Row 4: AI Recommendations Console */}
                <AIRecommendations liveData={liveData} />
              </>
            )}

            {/* Tab 2: 12-Cell Matrix & Health */}
            {activeTab === 'matrix' && (
              <>
                <BatteryCellMatrix
                  liveData={liveData}
                  selectedCell={selectedCell}
                  onSelectCell={setSelectedCell}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                  <HealthPanel liveData={liveData} history={history} />
                  <ChargingStatus liveData={liveData} />
                </div>
              </>
            )}

            {/* Tab 3: LangGraph Multi-Agent Flow */}
            {activeTab === 'agents' && (
              <>
                <AgentGraphView liveData={liveData} />
                <AIRecommendations liveData={liveData} />
              </>
            )}

            {/* Tab 4: Simulation & Stress Lab */}
            {activeTab === 'sim' && (
              <>
                <SimulationLab liveData={liveData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                  <ChargingStatus liveData={liveData} />
                  <AIRecommendations liveData={liveData} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
