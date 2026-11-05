/**
 * src/components/AgentGraphView.jsx
 * ---------------------------------
 * Interactive LangGraph Multi-Agent Orchestration Flowchart & Telemetry Inspector.
 * Clean, commercial white theme with high-clarity cards and live status indicators.
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
    name: 'Battery Health Agent',
    title: 'State of Health Estimator',
    icon: BatteryCharging,
    accent: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    description: 'Computes internal capacity loss, active lithium inventory, and impedance growth per charge cycle.',
    dataKey: 'soh_agent_output',
  },
  {
    id: 'rul',
    num: '02',
    name: 'Battery Prediction Agent',
    title: 'Remaining Useful Life Predictor',
    icon: Clock,
    accent: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description: 'Extrapolates non-linear degradation curves to End-of-Life (EOL 80%) using gradient-boosted regression.',
    dataKey: 'rul_agent_output',
  },
  {
    id: 'charging',
    num: '03',
    name: 'Charging Optimization Agent',
    title: 'CC-CV Adaptive Optimizer',
    icon: Cpu,
    accent: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    description: 'Selects optimal C-rate and thermal back-off to maximize cycle longevity and prevent lithium plating.',
    dataKey: 'charging_agent_output',
  },
  {
    id: 'maintenance',
    num: '04',
    name: 'Safety Monitoring Agent',
    title: 'Diagnostic & Thermal Safety',
    icon: Wrench,
    accent: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description: 'Monitors cell-to-cell delta-V imbalances, thermal gradient spikes, and prescribes safety interventions.',
    dataKey: 'maintenance_agent_output',
  },
  {
    id: 'coordinator',
    num: '00',
    name: 'Coordinator Agent',
    title: 'LangGraph Master Arbiter',
    icon: ShieldAlert,
    accent: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description: 'Enforces safety precedence, arbitrates conflicting specialist proposals, and commands the hardware relay.',
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
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Subheader Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.70rem',
              color: '#2563EB',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            LANGGRAPH MULTI-AGENT SWARM
          </div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.25rem',
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
              fontWeight: 700,
            }}
          >
            Autonomous Agent Orchestration Graph
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'Inter' }}>SWARM STATUS:</span>
          <StatusBadge label="ACTIVE" size="sm" />
        </div>
      </div>

      {/* 5-Agent Interactive Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12,
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
                backgroundColor: isSelected ? agent.bg : '#F8FAFC',
                border: `1.5px solid ${isSelected ? agent.border : '#E2E8F0'}`,
                borderLeft: isSelected ? `4px solid ${agent.accent}` : undefined,
                borderRadius: 12,
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
                boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? agent.accent : '#64748B',
                  }}
                >
                  AGENT {agent.num}
                </span>

                {isMaster && (
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      fontFamily: 'Inter',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    ARBITER
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: agent.bg,
                    border: `1px solid ${agent.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={agent.accent} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#0F172A',
                    }}
                  >
                    {agent.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B' }}>
                    {agent.title}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#475569',
                  lineHeight: 1.4,
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
                  borderTop: '1px solid #E2E8F0',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  color: isSelected ? agent.accent : '#64748B',
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
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderTop: `3px solid ${activeAgentData.accent}`,
            borderRadius: 12,
            padding: '20px 24px',
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
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: activeAgentData.bg,
                  border: `1px solid ${activeAgentData.border}`,
                }}
              >
                <activeAgentData.icon size={16} color={activeAgentData.accent} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.98rem',
                    color: '#0F172A',
                    fontWeight: 700,
                  }}
                >
                  {activeAgentData.name} — Telemetry &amp; Decision Matrix
                </span>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#64748B' }}>
                  NODE STATUS: RESOLVED // LAST UPDATED: JUST NOW
                </div>
              </div>
            </div>

            <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="md" />
          </div>

          {/* Coordinator Output View */}
          {activeAgentData.id === 'coordinator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: '#2563EB',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Consolidated LangGraph Arbitration Decision:
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: 16,
                  fontSize: '0.86rem',
                  color: '#1E293B',
                  lineHeight: 1.6,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {liveData?.recommendation || coordinator?.recommendation || 'Autonomous arbitration active: battery operating within safe electrochemical envelope.'}
              </div>
            </div>
          )}

          {/* SOH Output View */}
          {activeAgentData.id === 'soh' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>SOH ESTIMATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16A34A', marginTop: 4 }}>
                  <AnimatedCounter end={liveData?.soh_percent || 96.2} decimals={1} />%
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>DEGRADATION RATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                  {liveData?.degradation_rate ? (liveData.degradation_rate * 100).toFixed(4) : '0.0020'}%/cyc
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>TOTAL EQUIVALENT CYCLES</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB', marginTop: 4 }}>
                  <AnimatedCounter end={liveData?.cycle_count || 142} decimals={1} />
                </div>
              </div>
            </div>
          )}

          {/* Charging Output View */}
          {activeAgentData.id === 'charging' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>RECOMMENDED C-RATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7C3AED', marginTop: 4 }}>
                  {coordinator?.charging_summary?.c_rate || coordinator?.recommended_c_rate || 0.5}C
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>TARGET FAST-CHARGE SOC</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  <AnimatedCounter end={coordinator?.target_soc || 80} decimals={0} />%
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>HARDWARE RELAY COMMAND</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: liveData?.relay_state ? '#16A34A' : '#DC2626', marginTop: 4 }}>
                  {liveData?.relay_state ? 'ENGAGED (PASS)' : 'ISOLATED (CUT)'}
                </div>
              </div>
            </div>
          )}

          {/* RUL Output View */}
          {activeAgentData.id === 'rul' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>PREDICTED CYCLES TO 80% EOL</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB', marginTop: 4 }}>
                  <AnimatedCounter end={liveData?.rul_cycles || 850} decimals={0} /> cyc
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>OPERATING TIME ESTIMATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  ≈ {((liveData?.rul_cycles || 850) * 0.75).toFixed(0)} days
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>PREDICTION CONFIDENCE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16A34A', marginTop: 4 }}>
                  98.4%
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Output View */}
          {activeAgentData.id === 'maintenance' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>CELL IMBALANCE (DELTA-V)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16A34A', marginTop: 4 }}>
                  12 mV
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>THERMAL GRADIENT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  1.4°C Delta
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>NEXT SERVICE INTERVAL</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706', marginTop: 4 }}>
                  {coordinator?.maintenance_summary?.next_service_cycles || 350} cyc
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
