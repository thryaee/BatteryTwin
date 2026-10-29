/**
 * src/pages/MaintenancePage.jsx
 * ------------------------------
 * Page 8: Prescribed Maintenance & Hardware Diagnostics.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
 */

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Zap
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import BatteryCellMatrix from '../components/BatteryCellMatrix';
import ScrollReveal from '../components/ui/ScrollReveal';
import { LoadingState } from '../components/common/FeedbackStates';

export default function MaintenancePage() {
  const { liveData, loading } = useOutletContext();
  const [selectedCell, setSelectedCell] = useState(null);

  if (loading && !liveData) {
    return <LoadingState message="Fetching Maintenance Diagnostics..." />;
  }

  const coordinator = liveData?.coordinator_output;
  const maintSummary = coordinator?.maintenance_summary || {};
  const topActions = maintSummary.top_actions || [];
  const nextService = maintSummary.next_service_cycles || 250;
  const overallPriority = maintSummary.overall_priority || 'INFO';

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
              <span>08 / DIAGNOSTICS & SAFETY</span>
              <span style={{ color: '#444466' }}>—</span>
              <span>HARDWARE SERVICE SCHEDULE</span>
            </div>
            <StatusBadge label={overallPriority} size="sm" />
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
            PRESCRIBED MAINTENANCE & HARDWARE SAFETY
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
            Automated anomaly detection, passive balancing tracking, thermal hotspot alerts, and scheduled preventive maintenance procedures.
          </p>
        </ScrollReveal>
      </div>

      {/* Maintenance Summary Metrics (4. Metrics/Data) */}
      <ScrollReveal delay={0.28} yOffset={40}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          <MetricCard
            icon={Clock}
            label="Next Service Window"
            value={nextService}
            unit="cycles"
            color="#e8ff47"
            decimals={0}
            nominal="Every 250 cycles"
            sub={`≈ ${(nextService * 0.75).toFixed(0)} days estimated`}
          />

          <MetricCard
            icon={ShieldCheck}
            label="Hardware Risk Status"
            value={overallPriority === 'CRITICAL' ? 'HIGH RISK' : overallPriority === 'HIGH' ? 'MODERATE' : 'NOMINAL'}
            color={overallPriority === 'CRITICAL' ? '#ef4444' : overallPriority === 'HIGH' ? '#f59e0b' : '#10b981'}
            nominal="Active safety interlock"
            sub="Safety precedence logic"
          />

          <MetricCard
            icon={Zap}
            label="Pending Service Actions"
            value={topActions.length}
            unit="items"
            color={topActions.length > 0 ? '#f59e0b' : '#10b981'}
            decimals={0}
            nominal="Automated diagnosis"
            sub="Maintenance agent"
          />
        </div>
      </ScrollReveal>

      {/* 5. Main Visual: 12-Cell Pack Matrix & Actions List */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <BatteryCellMatrix
            liveData={liveData}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
          />

      {/* Maintenance Actions List */}
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
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <Wrench size={16} color="#f59e0b" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: '1.02rem',
                  color: '#f0f0f8',
                  letterSpacing: '0.02em',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                PRESCRIBED PREVENTIVE ACTIONS
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                GENERATED BY MAINTENANCE AI AGENT // REAL-TIME EVALUATION
              </div>
            </div>
          </div>
        </div>

        {topActions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topActions.map((act, i) => (
              <div
                key={act.code || i}
                style={{
                  background: 'rgba(8, 8, 18, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <StatusBadge label={act.priority || 'NORMAL'} />
                  <div>
                    <div
                      style={{
                        fontFamily: 'Clash Display, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        color: '#f0f0f8',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {act.action}
                    </div>
                    {act.detail && (
                      <div
                        style={{
                          fontFamily: 'Cabinet Grotesk, sans-serif',
                          fontSize: '0.8rem',
                          color: '#9898b8',
                          marginTop: 2,
                        }}
                      >
                        {act.detail}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#9898b8',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  CATEGORY // {act.category || 'GENERAL'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 8,
              color: '#6ee7b7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={24} color="#10b981" />
            <div
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontWeight: 600,
                fontSize: '0.96rem',
                color: '#f0f0f8',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              PACK INTEGRITY NOMINAL
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: '#9898b8',
                fontFamily: 'Cabinet Grotesk, sans-serif',
                maxWidth: 480,
              }}
            >
              All 12 cells in the 4S3P module are balanced within ±15mV. No thermal hotspots or urgent service tasks detected.
            </div>
          </div>
        )}
      </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
