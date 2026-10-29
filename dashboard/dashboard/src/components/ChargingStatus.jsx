/**
 * ChargingStatus.jsx
 * ------------------
 * Real-time charging optimizer status, safety relay controller, and C-rate tuner.
 */

import React, { useState } from 'react';
import { BatteryCharging, ShieldAlert, Zap, AlertCircle, Power } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { overrideRelay } from '../services/api';
import { soundEffects } from '../utils/soundEffects';

export default function ChargingStatus({ liveData }) {
  const [overriding, setOverriding] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState('');

  const coordinator = liveData?.coordinator_output;
  const relayOn = liveData?.relay_state ?? true;
  const chargingStatus = liveData?.charging_status || 'IDLE';
  const relayReason = liveData?.relay_reason || '';

  const chargingSummary = coordinator?.charging_summary || {};
  const cRate = chargingSummary.c_rate ?? coordinator?.recommended_c_rate;
  const strategy = chargingSummary.strategy || 'NORMAL_CHARGE';
  const targetSoc = coordinator?.target_soc || 80;
  const reasoning = chargingSummary.reasoning || '';

  const handleRelayToggle = async () => {
    setOverriding(true);
    setOverrideMsg('');
    const targetState = !relayOn;
    soundEffects.playRelayToggle(targetState);

    try {
      await overrideRelay(targetState, 'Manual operator override via command station');
      setOverrideMsg(`Relay ${targetState ? 'CLOSED (ON)' : 'OPEN (OFF)'} command broadcasted.`);
    } catch (err) {
      setOverrideMsg(`Override error: ${err.message}`);
    } finally {
      setOverriding(false);
      setTimeout(() => setOverrideMsg(''), 4000);
    }
  };

  return (
    <section>
      <h2 className="tech-title" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <BatteryCharging size={15} color="#00f0ff" />
        ADAPTIVE CHARGING OPTIMIZER & RELAY INTERLOCK
      </h2>

      <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top row: status + relay */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge label={chargingStatus} size="lg" />
            <StatusBadge label={strategy.replace('_', ' ')} size="lg" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'Rajdhani', fontWeight: 600 }}>RELAY INTERLOCK:</span>
            <StatusBadge label={relayOn ? 'ON' : 'OFF'} size="lg" />
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cRate !== undefined && (
            <div style={{ background: 'rgba(3, 7, 18, 0.7)', border: '1px solid rgba(51, 65, 85, 0.4)', borderRadius: 8, padding: '10px 16px', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'Rajdhani', fontWeight: 700 }}>RECOMMENDED C-RATE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'JetBrains Mono' }}>
                {Number(cRate).toFixed(1)}
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>C</span>
              </div>
            </div>
          )}
          {targetSoc !== undefined && (
            <div style={{ background: 'rgba(3, 7, 18, 0.7)', border: '1px solid rgba(51, 65, 85, 0.4)', borderRadius: 8, padding: '10px 16px', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'Rajdhani', fontWeight: 700 }}>CHARGE TARGET (SOC)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', fontFamily: 'JetBrains Mono' }}>
                {Number(targetSoc).toFixed(0)}
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>%</span>
              </div>
            </div>
          )}
        </div>

        {/* Reasoning text */}
        {reasoning && (
          <div
            style={{
              background: 'rgba(3, 7, 18, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#94a3b8',
              lineHeight: 1.5,
              fontFamily: 'Inter',
            }}
          >
            {reasoning}
          </div>
        )}

        {/* Relay reason / alert */}
        {relayReason && !relayOn && (
          <div
            style={{
              background: 'rgba(69, 10, 10, 0.5)',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldAlert size={16} color="#ef4444" />
            <span>Safety Interlock Active: {relayReason}</span>
          </div>
        )}

        {/* Manual override button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button
            onClick={handleRelayToggle}
            disabled={overriding}
            className={`cyber-button ${relayOn ? 'cyber-button-danger' : 'cyber-button-success'}`}
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <Power size={14} />
            {overriding ? 'Transmitting...' : relayOn ? 'Cut Power (Emergency Trip)' : 'Engage Relay (Enable Power)'}
          </button>
          {overrideMsg && (
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>{overrideMsg}</span>
          )}
        </div>
      </div>
    </section>
  );
}
