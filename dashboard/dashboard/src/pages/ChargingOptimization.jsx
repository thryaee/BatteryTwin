/**
 * src/pages/ChargingOptimization.jsx
 * -----------------------------------
 * Page 6: Intelligent Charging Optimization & Safety Relay Controller.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
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
import MagneticButton from '../components/ui/MagneticButton';
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
      setOverrideMsg(`Relay state successfully switched to ${targetRelayState ? 'CLOSED (ON)' : 'OPEN (OFF)'}.`);
    } catch (err) {
      setOverrideMsg(`Override failed: ${err.message}`);
    } finally {
      setIsOverriding(false);
      setTimeout(() => setOverrideMsg(''), 5000);
    }
  };

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
              <span>07 / CHARGING OPTIMIZER</span>
              <span style={{ color: '#444466' }}>—</span>
              <span>MULTI-AGENT CC-CV ARBITER</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge label={chargingStatus} size="sm" />
              <StatusBadge label={strategy.replace('_', ' ')} size="sm" />
            </div>
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
            CHARGING OPTIMIZATION & SAFETY RELAY
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
            Adaptive CC-CV multi-agent governor optimizing electrochemical longevity, cell balancing, and hardware emergency contactor interlocking.
          </p>
        </ScrollReveal>
      </div>

      {/* Charging Parameter Metrics Deck (4. Metrics/Data) */}
      <ScrollReveal delay={0.28} yOffset={40}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
        <MetricCard
          icon={Zap}
          label="Recommended C-Rate"
          value={Number(cRate)}
          unit="C"
          color="#e8ff47"
          decimals={1}
          nominal="Max continuous: 1.0C"
          sub="Governor restricted"
        />

        <MetricCard
          icon={BatteryCharging}
          label="Target Charge Limit"
          value={Number(targetSoc)}
          unit="%"
          color="#f0f0f8"
          decimals={0}
          nominal="Longevity Cap: 80%"
          sub="Minimizes SEI stress"
        />

        <MetricCard
          icon={Power}
          label="Safety Relay Contactor"
          value={relayOn ? 'CLOSED (ON)' : 'OPEN (OFF)'}
          color={relayOn ? '#10b981' : '#ef4444'}
          nominal={relayOn ? 'Power Allowed' : 'Circuit Cut'}
          sub="Hardware interlock"
        />

        <MetricCard
          icon={Sliders}
          label="Bus Voltage"
          value={liveData?.voltage_v}
          unit="V"
          color="#e8ff47"
          decimals={3}
          nominal="4S Nominal: 14.800V"
          sub="Live pack telemetry"
        />
        </div>
      </ScrollReveal>

      {/* Strategy & Reasoning Dual Console (5. Main Visual) */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Card 1: Adaptive CC-CV Strategy Rationale */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Cpu size={16} color="#e8ff47" />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontSize: '0.98rem',
                    color: '#f0f0f8',
                    letterSpacing: '0.02em',
                    margin: 0,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  CC-CV ALGORITHM POLICY & REASONING
                </h3>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.66rem', color: '#9898b8', marginTop: 1 }}>
                  AGENT // CHARGING_OPTIMIZER_V2
                </div>
              </div>
            </div>
            <StatusBadge label={strategy} size="sm" />
          </div>

          <div
            style={{
              background: 'rgba(4, 4, 10, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 8,
              padding: 16,
              fontSize: '0.84rem',
              color: '#d0d0e2',
              lineHeight: 1.6,
              fontFamily: 'Cabinet Grotesk, sans-serif',
            }}
          >
            {reasoning || 'The Charging Agent continuously evaluates pack temperature, cycle count, and internal resistance growth to dynamically throttle CC-CV setpoints, ensuring zero lithium plating.'}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontFamily: 'Cabinet Grotesk, sans-serif',
              fontSize: '0.82rem',
              color: '#9898b8',
              lineHeight: 1.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#e8ff47', flexShrink: 0 }}>01.</span>
              <span><strong>Constant Current (CC) Stage:</strong> Regulated bulk charging at {cRate}C until individual cell threshold touches 4.20V.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#e8ff47', flexShrink: 0 }}>02.</span>
              <span><strong>Constant Voltage (CV) Stage:</strong> Total pack voltage clamped at 14.80V while current exponentially tapers below 0.05C.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#e8ff47', flexShrink: 0 }}>03.</span>
              <span><strong>Thermal Throttling:</strong> Pack temperatures exceeding 38.0°C instantly trigger a 50% C-rate back-off to arrest degradation.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Manual Safety Relay Controller */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: relayOn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: relayOn ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <ShieldAlert size={16} color={relayOn ? '#10b981' : '#ef4444'} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontSize: '0.98rem',
                    color: '#f0f0f8',
                    letterSpacing: '0.02em',
                    margin: 0,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  HARDWARE CONTACTOR OVERRIDE
                </h3>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.66rem', color: '#9898b8', marginTop: 1 }}>
                  CIRCUIT BREAKER // SOLID STATE RELAY
                </div>
              </div>
            </div>

            <StatusBadge label={relayOn ? 'ON' : 'OFF'} size="sm" />
          </div>

          <p
            style={{
              fontFamily: 'Cabinet Grotesk, sans-serif',
              fontSize: '0.84rem',
              color: '#9898b8',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            The physical solid-state relay acts as the main hardware circuit breaker. In the event of high thermal anomalies or battery faults, the automated Coordinator cuts current immediately.
          </p>

          {relayReason && (
            <div
              style={{
                background: relayOn ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${relayOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.78rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: relayOn ? '#6ee7b7' : '#fca5a5',
              }}
            >
              <strong style={{ color: '#f0f0f8' }}>LOG //</strong> {relayReason}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto', paddingTop: 8 }}>
            <button
              onClick={() => handleOpenRelayConfirm(false)}
              disabled={!relayOn || isOverriding}
              style={{
                padding: '12px 14px',
                fontSize: '0.76rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: !relayOn || isOverriding ? 'rgba(255, 255, 255, 0.03)' : 'rgba(239, 68, 68, 0.12)',
                color: !relayOn || isOverriding ? '#55556a' : '#ff8585',
                border: !relayOn || isOverriding ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
                cursor: !relayOn || isOverriding ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              EMERGENCY CUT-OFF
            </button>

            <button
              onClick={() => handleOpenRelayConfirm(true)}
              disabled={relayOn || isOverriding}
              style={{
                padding: '12px 14px',
                fontSize: '0.76rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: relayOn || isOverriding ? 'rgba(255, 255, 255, 0.03)' : '#e8ff47',
                color: relayOn || isOverriding ? '#55556a' : '#04040a',
                border: relayOn || isOverriding ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                borderRadius: 8,
                cursor: relayOn || isOverriding ? 'not-allowed' : 'pointer',
                boxShadow: !relayOn && !isOverriding ? '0 0 16px rgba(232, 255, 71, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              RESTORE RELAY (ON)
            </button>
          </div>

          {overrideMsg && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#e8ff47',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.02em',
                marginTop: 6,
              }}
            >
              &gt; {overrideMsg}
            </div>
          )}
        </div>
      </div>
      </ScrollReveal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={targetRelayState ? 'Enable Charging Power' : 'Emergency Power Cut-Off'}
        message={
          targetRelayState
            ? 'Are you sure you want to close the safety relay and allow high-voltage charging current to flow into the battery pack?'
            : 'WARNING: This will immediately cut the charging relay circuit breaker. Use this during thermal runaway or high-current anomalies.'
        }
        confirmLabel={targetRelayState ? 'Enable Charging Power' : 'Execute Emergency Cut-Off'}
        confirmVariant={targetRelayState ? 'success' : 'danger'}
        onConfirm={handleExecuteRelayOverride}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
