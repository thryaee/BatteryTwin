/**
 * src/components/layout/Topbar.jsx
 * --------------------------------
 * Nexus Studio Editorial Topbar for BatteryTwin.
 *
 * Characteristics:
 * - Ultra-refined 72px sticky header with 24px backdrop blur
 * - Clash Display typography for route headings with technical breadcrumbs
 * - Restrained status pills with electric lime live indicators
 * - MagneticButton for the primary "Run AI Cycle" action
 * - Preserves battery pack switching, audio mute toggle, and live clock
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Clock,
  Volume2,
  VolumeX,
  Menu,
  Sparkles,
  Radio,
  Layers
} from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import { triggerAgentRun } from '../../services/api';
import { soundEffects } from '../../utils/soundEffects';

import { useActiveSection } from '../../utils/scrollNavigation';

const SECTION_CONFIG = {
  'overview': { title: 'System Overview', category: '01 / DASHBOARD' },
  'digital-twin': { title: '3D Digital Twin Viewport', category: '01 / SPATIAL TWIN' },
  'live': { title: 'Live Sensor Telemetry', category: '01 / SENSOR STREAM' },
  'agents': { title: 'Multi-Agent Network', category: '02 / LANGGRAPH' },
  'health': { title: 'Battery Health & SOH', category: '02 / DEGRADATION' },
  'predictions': { title: 'Predictive Forecasting', category: '02 / RUL MODELS' },
  'charging': { title: 'Charging Optimizer', category: '02 / CC-CV CONTROL' },
  'maintenance': { title: 'Prescribed Maintenance', category: '03 / HARDWARE' },
  'analytics': { title: 'Historical Telemetry', category: '03 / DATA EXPLORER' },
  'settings': { title: 'Platform Settings', category: '03 / PREFERENCES' },
};

export default function Topbar({
  liveData,
  connected,
  error,
  lastUpdated,
  selectedBattery,
  setSelectedBattery,
  isMuted,
  setIsMuted,
  setMobileOpen,
}) {
  const activeSection = useActiveSection();
  const routeMeta = SECTION_CONFIG[activeSection] || SECTION_CONFIG.overview;

  const [timeStr, setTimeStr] = useState('');
  const [runningAgent, setRunningAgent] = useState(false);

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString());
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handleQuickRun = async () => {
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

  const isSimulator = liveData?.data_source === 'SIMULATOR';

  return (
    <header
      style={{
        height: 72,
        padding: '0 24px',
        background: 'rgba(4, 4, 10, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 80,
      }}
    >
      {/* ── Left: Mobile Menu Button & Editorial Header ───────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => {
            soundEffects.playClick();
            setMobileOpen(true);
          }}
          className="mobile-nav-toggle cyber-button"
          style={{
            padding: 8,
            borderRadius: '50%',
            width: 38,
            height: 38,
            justifyContent: 'center',
          }}
          aria-label="Open mobile navigation"
          data-cursor="hover"
        >
          <Menu size={18} />
        </button>

        <div>
          <div
            style={{
              fontSize: '0.62rem',
              color: 'rgba(152, 152, 184, 0.7)',
              fontFamily: 'JetBrains Mono',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 1,
            }}
          >
            {routeMeta.category}
          </div>
          <h1
            style={{
              fontFamily: 'Clash Display',
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#f0f0f8',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {routeMeta.title}
          </h1>
        </div>
      </div>

      {/* ── Right: Telemetry Status, Battery Picker, Actions ─────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Hardware / Simulator Capsule */}
        <div
          className="glass-pill-badge"
          style={{
            fontSize: '0.68rem',
            padding: '4px 10px',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.04em',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <span className={isSimulator ? 'pulse-dot-amber' : 'pulse-dot-signal'} style={{ width: 5, height: 5 }} />
          <span>{isSimulator ? 'SIMULATOR' : 'HARDWARE'}</span>
        </div>

        {/* Live Broadcast Indicator */}
        <div
          className="glass-pill-badge"
          style={{
            fontSize: '0.68rem',
            padding: '4px 10px',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.04em',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <span className={connected ? 'pulse-dot-signal' : 'pulse-dot-ember'} style={{ width: 5, height: 5 }} />
          <span>{connected ? 'WS LIVE' : 'REST'}</span>
        </div>

        {/* Battery Selector Dropdown */}
        <select
          value={selectedBattery}
          onChange={(e) => setSelectedBattery(e.target.value)}
          data-cursor="hover"
          style={{
            background: 'rgba(13, 13, 31, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f0f0f8',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.72rem',
            padding: '6px 12px',
            borderRadius: 9999,
            cursor: 'pointer',
            outline: 'none',
            letterSpacing: '0.02em',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#e8ff47')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <option value="BATTERY_01">BATTERY_01 [4S3P PACK]</option>
          <option value="BATTERY_02">BATTERY_02 [AUXILIARY]</option>
        </select>

        {/* Primary Action: Run AI Cycle (Magnetic CTA) */}
        <MagneticButton
          onClick={handleQuickRun}
          disabled={runningAgent}
          className="cyber-button cyber-button-active"
          style={{
            padding: '6px 14px',
            fontSize: '0.75rem',
            fontFamily: 'Cabinet Grotesk',
            fontWeight: 600,
          }}
          title="Trigger LangGraph Agent Analysis Run"
        >
          <Sparkles size={13} color="#e8ff47" />
          <span>{runningAgent ? 'Analyzing...' : 'Run AI Cycle'}</span>
        </MagneticButton>

        {/* Audio Telemetry Toggle */}
        <button
          onClick={handleToggleMute}
          className="cyber-button"
          style={{
            padding: 8,
            borderRadius: '50%',
            width: 34,
            height: 34,
            justifyContent: 'center',
          }}
          title={isMuted ? 'Unmute Audio Telemetry' : 'Mute Audio Telemetry'}
          data-cursor="hover"
        >
          {isMuted ? <VolumeX size={14} color="#9898b8" /> : <Volume2 size={14} color="#e8ff47" />}
        </button>

        {/* Real-time Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'rgba(240, 240, 248, 0.85)',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.72rem',
            padding: '4px 8px',
          }}
        >
          <Clock size={12} color="#9898b8" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
