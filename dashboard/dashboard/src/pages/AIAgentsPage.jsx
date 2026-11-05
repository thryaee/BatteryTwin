/**
 * src/pages/AIAgentsPage.jsx
 * ---------------------------
 * LangGraph Multi-Agent Architecture & Decision Workflow Visualizer.
 * Commercial white theme with interactive agent diagnostic matrix.
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Cpu, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import AgentGraphView from '../components/AgentGraphView';
import AIRecommendations from '../components/AIRecommendations';
import { LoadingState } from '../components/common/FeedbackStates';
import StatusBadge from '../components/common/StatusBadge';
import ScrollReveal from '../components/ui/ScrollReveal';

export default function AIAgentsPage() {
  const { liveData, loading } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Connecting to LangGraph AI Multi-Agent Network..." />;
  }

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
              LANGGRAPH SWARM &bull; AUTONOMOUS REASONING
            </span>
          </div>
          <StatusBadge label="5 AGENTS OPERATIONAL" size="sm" />
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
          Multi-Agent Collaborative Reasoning Engine
        </h1>

        <p
          style={{
            fontSize: '1.0rem',
            color: '#64748B',
            margin: 0,
            maxWidth: 740,
            lineHeight: 1.5,
          }}
        >
          Five specialized autonomous agents evaluating high-frequency physics telemetry, predicting degradation, resolving conflicting proposals, and enforcing hardware safety protocols.
        </p>

        {/* Swarm Status Mini Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {[
            { label: 'SOH AGENT', status: 'ACTIVE', color: '#16A34A' },
            { label: 'RUL AGENT', status: 'ACTIVE', color: '#2563EB' },
            { label: 'CHARGING AGENT', status: 'ACTIVE', color: '#7C3AED' },
            { label: 'MAINTENANCE AGENT', status: 'ACTIVE', color: '#D97706' },
            { label: 'COORDINATOR', status: 'ARBITRATING', color: '#16A34A' },
          ].map((ag, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#F8FAFC',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                {ag.label}
              </span>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: ag.color, fontFamily: 'JetBrains Mono' }}>
                {ag.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Agent Graph Visualizer */}
      <AgentGraphView liveData={liveData} />

      {/* AI Coordinator Recommendations & Maintenance Actions */}
      <AIRecommendations liveData={liveData} />
    </div>
  );
}
