/**
 * src/pages/ChargingOptimization.jsx
 * -----------------------------------
 * Intelligent Charging Optimization & Safety Relay Controller.
 * Commercial white theme with CC-CV strategy governor and hardware relay manual override controls.
 */

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BatteryCharging,
  Zap,
  Power,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Cpu,
  Layers
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import { ConfirmationModal } from '../components/common/FeedbackStates';
import ScrollReveal from '../components/ui/ScrollReveal';
import { overrideRelay } from '../services/api';
import { soundEffects } from '../utils/soundEffects';

export default function ChargingOptimization() {
  const { liveData, history, loading } = useOutletContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRelayState, setTargetRelayState] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState('');

  const coordinator = liveData?.coordinator_output;
  const relayOn = liveData?.relay_state ?? true;
  const chargingStatus = liveData?.charging_status || 'IDLE';
  const relayReason = liveData?.relay_reason || '';

  const chargingSummary = coordinator?.charging_summary || {};
  const cRate = chargingSummary.c_rate ?? coordinator?.recommended_c_rate ?? 0.5;
  const strategy = chargingSummary.strategy || 'NORMAL_CHARGE';
  const targetSoc = coordinator?.target_soc || 80;
  const reasoning = chargingSummary.reasoning || '';

  const handleOpenRelayConfirm = (newState) => {
    setTargetRelayState(newState);
    setModalOpen(true);
  };

  const handleExecuteRelayOverride = async () => {
    setModalOpen(false);
    setIsOverriding(true);
    setOverrideMsg('');
    soundEffects.playRelayToggle(targetRelayState);

    try {
      await overrideRelay(targetRelayState, `Manual override by operator to ${targetRelayState ? 'ON' : 'OFF'}`);
      setOverrideMsg(`Relay successfully switched to ${targetRelayState ? 'ENGAGED' : 'DISENGAGED'}.`);
    } catch (err) {
      setOverrideMsg(`Override failed: ${err.message}`);
    } finally {
      setIsOverriding(false);
    }
  };

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
              CC-CV CHARGING OPTIMIZER &bull; HARDWARE CONTACTOR RELAY
            </span>
          </div>
          <StatusBadge label={chargingStatus} size="sm" />
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
          Adaptive CC-CV Charging &amp; Contactor Interlock
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', margin: 0, maxWidth: 740, lineHeight: 1.5 }}>
          Dynamic charge governor modulating current injection rates against core polarization impedance to prevent lithium plating and thermal overshoot.
        </p>
      </div>

      {/* Charging Parameter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <MetricCard
          icon={BatteryCharging}
          label="Optimal C-Rate"
          value={cRate}
          unit="C"
          color="#2563EB"
          decimals={2}
          nominal="Max: 1.0C"
          sub="Governor recommended current multiplier"
        />

        <MetricCard
          icon={Zap}
          label="Target Fast Charge SOC"
          value={targetSoc}
          unit="%"
          color="#16A34A"
          decimals={0}
          nominal="Preservation Boundary"
          sub="Automated cutoff to preserve active lithium"
        />

        <MetricCard
          icon={ShieldCheck}
          label="Charging Strategy"
          value={strategy.replace('_', ' ')}
          color="#7C3AED"
          sub="Multi-agent thermal-aware protocol"
        />

        <MetricCard
          icon={Power}
          label="Relay Contactor State"
          value={relayOn ? 'CLOSED (ON)' : 'OPEN (OFF)'}
          color={relayOn ? '#16A34A' : '#DC2626'}
          sub={relayReason || 'Contactor interlock engaged'}
        />
      </div>

      {/* Relay Hardware Manual Override Panel */}
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Physical Hardware Contactor Control
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Direct override command sent to the ESP32 GPIO isolation relay
            </span>
          </div>
          <StatusBadge label={relayOn ? 'ON' : 'OFF'} size="md" />
        </div>

        {overrideMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            {overrideMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenRelayConfirm(true)}
            disabled={relayOn || isOverriding}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: relayOn || isOverriding ? 'not-allowed' : 'pointer',
              opacity: relayOn || isOverriding ? 0.6 : 1,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
            }}
          >
            Engage Contactor (Turn ON)
          </button>

          <button
            onClick={() => handleOpenRelayConfirm(false)}
            disabled={!relayOn || isOverriding}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: !relayOn || isOverriding ? 'not-allowed' : 'pointer',
              opacity: !relayOn || isOverriding ? 0.6 : 1,
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)',
            }}
          >
            Cut Contactor (Turn OFF)
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <ConfirmationModal
          title={`Confirm Relay Contactor ${targetRelayState ? 'Engagement' : 'Cut'}`}
          message={`Are you sure you want to manually switch the hardware contactor relay to ${targetRelayState ? 'ON (CLOSED)' : 'OFF (OPEN)'}? This directly overrides autonomous LangGraph safety arbitration.`}
          onConfirm={handleExecuteRelayOverride}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
