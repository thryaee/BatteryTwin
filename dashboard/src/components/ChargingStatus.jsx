/**
 * ChargingStatus.jsx
 * ------------------
 * Shows current charging strategy, relay state, C-rate recommendation,
 * and a manual relay override toggle.
 */

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { overrideRelay } from '../services/api';

export default function ChargingStatus({ liveData }) {
  const [overriding, setOverriding] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState('');

  const coordinator = liveData?.coordinator_output;
  const relayOn = liveData?.relay_state ?? true;
  const chargingStatus = liveData?.charging_status || 'IDLE';
  const relayReason = liveData?.relay_reason || '';

  const chargingSummary = coordinator?.charging_summary || {};
  const cRate = chargingSummary.c_rate ?? coordinator?.recommended_c_rate;
  const strategy = chargingSummary.strategy || 'UNKNOWN';
  const targetSoc = coordinator?.target_soc;
  const reasoning = chargingSummary.reasoning || '';

  const handleRelayToggle = async () => {
    setOverriding(true);
    setOverrideMsg('');
    try {
      const newState = !relayOn;
      await overrideRelay(newState, 'Manual override via dashboard');
      setOverrideMsg(`Relay ${newState ? 'ON' : 'OFF'} command sent.`);
    } catch (err) {
      setOverrideMsg(`Override failed: ${err.message}`);
    } finally {
      setOverriding(false);
      setTimeout(() => setOverrideMsg(''), 4000);
    }
  };

  return (
    <section>
      <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em' }}>
        CHARGING STATUS
      </h2>

      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Top row: status + relay */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatusBadge label={chargingStatus} size="lg" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Relay:</span>
            <StatusBadge label={relayOn ? 'ON' : 'OFF'} size="lg" />
          </div>
          {strategy && strategy !== 'UNKNOWN' && (
            <StatusBadge label={strategy.replace('_', ' ')} size="lg" />
          )}
        </div>

        {/* Metrics row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {cRate !== undefined && (
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>RECOMMENDED C-RATE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                {Number(cRate).toFixed(1)}
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>C</span>
              </div>
            </div>
          )}
          {targetSoc !== undefined && (
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CHARGE TARGET</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
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
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}
          >
            {reasoning}
          </div>
        )}

        {/* Relay reason */}
        {relayReason && !relayOn && (
          <div
            style={{
              background: '#450a0a',
              border: '1px solid #dc2626',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#f87171',
            }}
          >
            ⚠️ {relayReason}
          </div>
        )}

        {/* Manual override */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button
            onClick={handleRelayToggle}
            disabled={overriding}
            style={{
              background: relayOn ? '#450a0a' : '#052e16',
              border: `1px solid ${relayOn ? '#dc2626' : '#16a34a'}`,
              color: relayOn ? '#f87171' : '#4ade80',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: overriding ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              opacity: overriding ? 0.6 : 1,
            }}
          >
            {overriding ? 'Sending...' : relayOn ? '🔴 Cut Charging' : '🟢 Enable Charging'}
          </button>
          {overrideMsg && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{overrideMsg}</span>
          )}
        </div>
      </div>
    </section>
  );
}
