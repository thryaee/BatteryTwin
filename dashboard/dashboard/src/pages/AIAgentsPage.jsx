/**
 * src/pages/AIAgentsPage.jsx
 * ---------------------------
 * Page 7: LangGraph Multi-Agent Architecture & Decision Workflow Visualizer.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Cpu, Sparkles, Layers } from 'lucide-react';
import AgentGraphView from '../components/AgentGraphView';
import { LoadingState } from '../components/common/FeedbackStates';
import StatusBadge from '../components/common/StatusBadge';
import ScrollReveal from '../components/ui/ScrollReveal';

export default function AIAgentsPage() {
  const { liveData, loading } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Connecting to LangGraph AI Multi-Agent Network..." />;
  }

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
              <span>04 / AI AGENTS</span>
              <span style={{ color: '#444466' }}>—</span>
              <span>LANGGRAPH MULTI-AGENT SWARM</span>
            </div>
            <StatusBadge label="5 AGENTS OPERATIONAL" size="sm" />
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
            MULTI-AGENT COLLABORATIVE REASONING ENGINE
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
            Five specialized autonomous agents evaluating high-frequency physics telemetry, predicting degradation, resolving conflicting proposals, and enforcing hardware safety protocols.
          </p>
        </ScrollReveal>

        {/* 4. Metrics / Data: Mini Swarm Status Deck */}
        <ScrollReveal delay={0.28} yOffset={40}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {[
              { label: 'SOH AGENT', status: 'ACTIVE', color: '#10b981' },
              { label: 'RUL AGENT', status: 'ACTIVE', color: '#e8ff47' },
              { label: 'CHARGING AGENT', status: 'ACTIVE', color: '#e8ff47' },
              { label: 'MAINTENANCE AGENT', status: 'ACTIVE', color: '#f59e0b' },
              { label: 'COORDINATOR', status: 'ARBITRATING', color: '#10b981' },
            ].map((ag, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(5, 5, 12, 0.6)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.66rem', fontFamily: 'JetBrains Mono', color: '#9898b8' }}>
                  {ag.label}
                </span>
                <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: ag.color }}>
                  {ag.status}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* 5. Main Visual: Main Agent Graph Visualizer */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <AgentGraphView liveData={liveData} />
      </ScrollReveal>
    </div>
  );
}
