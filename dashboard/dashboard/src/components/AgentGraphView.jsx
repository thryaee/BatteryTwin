/**
 * src/components/AgentGraphView.jsx
 * ---------------------------------
 * Interactive LangGraph Multi-Agent Orchestration Flowchart & Telemetry Inspector.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  ShieldAlert,
  BatteryCharging,
  Clock,
  Wrench,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import StatusBadge from './common/StatusBadge';
import AnimatedCounter from './ui/AnimatedCounter';
import { soundEffects } from '../utils/soundEffects';

const AGENTS = [
  {
    id: 'soh',
    num: '01',
    name: 'SOH Agent',
    title: 'State of Health Estimator',
    icon: BatteryCharging,
    accent: '#10b981',
    description: 'Computes internal capacity loss and impedance growth per charge cycle.',
    dataKey: 'soh_agent_output',
  },
  {
    id: 'rul',
    num: '02',
    name: 'RUL Agent',
    title: 'Useful Life Predictor',
    icon: Clock,
    accent: '#e8ff47',
    description: 'Extrapolates non-linear degradation curves to End-of-Life (EOL 80%).',
    dataKey: 'rul_agent_output',
  },
  {
    id: 'charging',
    num: '03',
    name: 'Charging Agent',
    title: 'CC-CV Adaptive Optimizer',
    icon: Cpu,
    accent: '#e8ff47',
    description: 'Selects optimal C-rate & thermal back-off to maximize cycle longevity.',
    dataKey: 'charging_agent_output',
  },
  {
    id: 'maintenance',
    num: '04',
    name: 'Maintenance Agent',
    title: 'Diagnostic & Cell Safety',
    icon: Wrench,
    accent: '#f59e0b',
    description: 'Diagnoses cell imbalances, thermal hotspots, and prescribes preventive actions.',
    dataKey: 'maintenance_agent_output',
  },
  {
    id: 'coordinator',
    num: '00',
    name: 'Coordinator Agent',
    title: 'LangGraph Master Arbiter',
    icon: ShieldAlert,
    accent: '#e8ff47',
    description: 'Enforces safety precedence, arbitrates conflicting proposals, and commands the charging relay.',
    dataKey: 'coordinator_output',
    isMaster: true,
  },
];

export default function AgentGraphView({ liveData }) {
  const [selectedAgent, setSelectedAgent] = useState('coordinator');
  const coordinator = liveData?.coordinator_output || {};

  const handleSelectAgent = (agentId) => {
    soundEffects.playClick();
    setSelectedAgent(agentId);
  };

  const activeAgentData = AGENTS.find((a) => a.id === selectedAgent);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        background: 'linear-gradient(180deg, rgba(13, 13, 31, 0.65) 0%, rgba(8, 8, 18, 0.75) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12,
      }}
    >
      {/* Subheader Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.66rem',
              color: '#9898b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            ARCHITECTURE // LANGGRAPH PIPELINE
          </div>
          <h2
            style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: '1.15rem',
              color: '#f0f0f8',
              letterSpacing: '-0.01em',
              margin: 0,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            AUTONOMOUS AGENT ORCHESTRATION GRAPH
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>PIPELINE:</span>
          <StatusBadge label="OPTIMAL" size="sm" />
        </div>
      </div>

      {/* 5-Agent Interactive Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12,
          position: 'relative',
        }}
      >
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;
          const isMaster = agent.isMaster;

          return (
            <motion.div
              key={agent.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectAgent(agent.id)}
              style={{
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(24, 24, 46, 0.95) 0%, rgba(13, 13, 31, 0.98) 100%)'
                  : 'rgba(10, 10, 22, 0.7)',
                border: isSelected ? '1px solid #e8ff47' : '1px solid rgba(255, 255, 255, 0.07)',
                borderLeft: isSelected ? '3px solid #e8ff47' : undefined,
                borderRadius: 10,
                padding: '18px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
                boxShadow: isSelected ? '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(232, 255, 71, 0.12)' : 'none',
                transition: 'border-color 0.25s ease, background 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.64rem',
                    color: isSelected ? '#e8ff47' : '#9898b8',
                    letterSpacing: '0.08em',
                  }}
                >
                  {agent.num} // {isMaster ? 'ARBITER' : 'SPECIALIST'}
                </span>

                {isMaster && (
                  <span
                    style={{
                      background: 'rgba(232, 255, 71, 0.12)',
                      color: '#e8ff47',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono',
                      padding: '2px 6px',
                      borderRadius: 9999,
                      letterSpacing: '0.06em',
                      border: '1px solid rgba(232, 255, 71, 0.3)',
                    }}
                  >
                    MASTER
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: isSelected ? 'rgba(232, 255, 71, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid rgba(232, 255, 71, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={17} color={isSelected ? '#e8ff47' : '#d0d0e2'} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Clash Display, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      color: isSelected ? '#f0f0f8' : '#e0e0f0',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {agent.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk' }}>
                    {agent.title}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'Cabinet Grotesk, sans-serif',
                  fontSize: '0.76rem',
                  color: '#9898b8',
                  lineHeight: 1.45,
                  marginTop: 2,
                }}
              >
                {agent.description}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.68rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isSelected ? '#e8ff47' : '#9898b8',
                  letterSpacing: '0.04em',
                }}
              >
                <span>{isSelected ? '● ACTIVE INSPECTION' : 'CLICK TO INSPECT'}</span>
                <ChevronRight size={13} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Agent Deep Diagnostic Console */}
      {activeAgentData && (
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(8, 8, 18, 0.9) 0%, rgba(4, 4, 10, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '2px solid #e8ff47',
            borderRadius: 10,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
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
                <activeAgentData.icon size={16} color="#e8ff47" />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontSize: '1.02rem',
                    color: '#f0f0f8',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {activeAgentData.name} // TELEMETRY & DECISION MATRIX
                </span>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                  NODE STATUS: ACTIVE // CYCLE RESOLVED
                </div>
              </div>
            </div>

            <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="md" />
          </div>

          {/* Quick Metrics / Outputs */}
          {activeAgentData.id === 'coordinator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  color: '#e8ff47',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                CONSOLIDATED ARBITRATION RECOMMENDATION:
              </div>
              <div
                style={{
                  background: 'rgba(4, 4, 10, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: '0.84rem',
                  color: '#d0d0e2',
                  lineHeight: 1.6,
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {liveData?.recommendation || coordinator?.recommendation || 'Awaiting agent loop cycle...'}
              </div>
            </div>
          )}

          {activeAgentData.id === 'soh' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>SOH ESTIMATE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#10b981', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  <AnimatedCounter value={liveData?.soh_percent || 100.0} decimals={1} />%
                </div>
              </div>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>DEGRADATION RATE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  {liveData?.degradation_rate?.toFixed(4) || '0.0020'}/cyc
                </div>
              </div>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>CYCLE COUNT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  <AnimatedCounter value={liveData?.cycle_count || 0} decimals={1} />
                </div>
              </div>
            </div>
          )}

          {activeAgentData.id === 'charging' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>RECOMMENDED C-RATE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  {coordinator?.charging_summary?.c_rate || coordinator?.recommended_c_rate || 0.5}C
                </div>
              </div>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>TARGET SOC</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  <AnimatedCounter value={coordinator?.target_soc || 80} decimals={0} />%
                </div>
              </div>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>RELAY COMMAND</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: liveData?.relay_state ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  {liveData?.relay_state ? 'ALLOW (ON)' : 'INTERRUPT (OFF)'}
                </div>
              </div>
            </div>
          )}

          {activeAgentData.id === 'rul' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>REMAINING CYCLES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  <AnimatedCounter value={liveData?.rul_cycles || 500} decimals={0} />
                </div>
              </div>
              <div style={{ background: 'rgba(13, 13, 31, 0.7)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono' }}>ESTIMATED TIME TO EOL</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                  ≈ {((liveData?.rul_cycles || 500) * 0.75).toFixed(0)} Days
                </div>
              </div>
            </div>
          )}

          {activeAgentData.id === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  color: '#f59e0b',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                SCHEDULED PREVENTIVE ACTIONS:
              </div>
              {coordinator?.maintenance_summary?.top_actions?.length > 0 ? (
                coordinator.maintenance_summary.top_actions.map((act, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(13, 13, 31, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <AlertTriangle size={15} color="#f59e0b" />
                    <span style={{ color: '#f0f0f8', fontWeight: 600, fontFamily: 'Cabinet Grotesk' }}>{act.action}</span>
                    <span style={{ color: '#9898b8', marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>{act.detail}</span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'Cabinet Grotesk',
                    background: 'rgba(16, 185, 129, 0.06)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" /> No urgent hardware faults detected. Pack cell balancing nominal.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
