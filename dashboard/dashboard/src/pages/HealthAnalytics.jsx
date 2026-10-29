/**
 * src/pages/HealthAnalytics.jsx
 * ------------------------------
 * Page 4: Comprehensive Battery Health (SOH) and Degradation Analytics.
 *
 * Nexus Studio Editorial Health Experience:
 * - Monumental Title: "BATTERY / HEALTH."
 * - Large current health value hero readout
 * - SOH degradation curve and retirement threshold
 * - Electrochemical impedance & SEI layer diagnostics
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  HeartPulse,
  ShieldCheck,
  TrendingDown,
  Clock,
  Zap,
  Activity,
  AlertTriangle,
  FileText
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import DegradationTrendChart from '../components/charts/DegradationTrendChart';
import ScrollReveal from '../components/ui/ScrollReveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { LoadingState } from '../components/common/FeedbackStates';

export default function HealthAnalytics() {
  const { liveData, history, loading } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Analyzing Battery Health & Degradation..." />;
  }

  const soh = liveData?.soh_percent ?? 100.0;
  const soc = liveData?.soc_percent ?? 50.0;
  const rul = liveData?.rul_cycles ?? 500;
  const degRate = liveData?.degradation_rate ?? 0.002;
  const cycleCount = liveData?.cycle_count ?? 0.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── Section A: Editorial Headline & Hero SOH Value ─────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 1. Section Label */}
        <ScrollReveal delay={0.05} yOffset={30}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse-dot-emerald" />
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#9898b8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              ELECTROCHEMICAL IMPEDANCE FADE // CAPACITY ESTIMATION
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge label={liveData?.battery_status || 'HEALTHY'} size="sm" />
            </div>
          </div>
        </ScrollReveal>

        {/* 2. Large Heading */}
        <ScrollReveal delay={0.12} yOffset={40}>
          <h1
            style={{
              fontFamily: 'Clash Display',
              fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.035em',
              margin: '4px 0',
              color: '#f0f0f8',
            }}
            data-cursor="hover"
          >
            <div>BATTERY</div>
            <div className="text-stroke-signal" style={{ opacity: 0.95 }}>
              HEALTH.
            </div>
          </h1>
        </ScrollReveal>

        {/* 3. Supporting Text */}
        <ScrollReveal delay={0.20} yOffset={35}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <p
              style={{
                fontSize: '1.05rem',
                color: '#9898b8',
                maxWidth: 600,
                lineHeight: 1.5,
                margin: 0,
                fontFamily: 'Cabinet Grotesk',
              }}
            >
              Electrochemical impedance fade, solid electrolyte interphase (SEI) growth tracking,
              and cycle aging analysis for the 4S3P cell pack.
            </p>

            {/* Large Hero Health Metric Readout */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                background: 'rgba(13, 13, 31, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 24px',
                borderRadius: 14,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                CURRENT STATE OF HEALTH
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: soh > 80 ? '#10b981' : '#f59e0b', fontFamily: 'JetBrains Mono', lineHeight: 1.1 }}>
                <AnimatedCounter end={soh} decimals={1} />%
              </div>
              <span style={{ fontSize: '0.72rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', marginTop: 4 }}>
                {soh > 80 ? 'Optimal capacity retention (>80% EOL threshold)' : 'Capacity degradation detected'}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Section B: Health KPI Grid (4. Metrics/Data) ──────────────── */}
      <ScrollReveal delay={0.28} yOffset={40}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}
        >
          <MetricCard
            icon={ShieldCheck}
            label="State of Health (SOH)"
            value={soh}
            unit="%"
            color={soh > 80 ? '#10b981' : soh > 60 ? '#f59e0b' : '#ef4444'}
            decimals={1}
            history={history}
            historyKey="soh_percent"
            nominal="> 80.0% Nominal"
          />

          <MetricCard
            icon={TrendingDown}
            label="Degradation Rate"
            value={degRate}
            unit="/cyc"
            color="#e8ff47"
            decimals={4}
            nominal="< 0.0050/cyc"
          />

          <MetricCard
            icon={Clock}
            label="Remaining Useful Life"
            value={rul}
            unit="cyc"
            color="#f0f0f8"
            decimals={0}
            sub={`≈ ${(rul * 0.75).toFixed(0)} days at 1.3 cyc/day`}
          />

          <MetricCard
            icon={Activity}
            label="Completed Cycles"
            value={cycleCount}
            unit="cyc"
            color="#f0f0f8"
            decimals={1}
          />
        </div>
      </ScrollReveal>

      {/* ── Section C: Degradation Trend Curve & Electrochemical Diagnostics (5. Main Visual) ── */}
      <ScrollReveal delay={0.36} yOffset={45}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DegradationTrendChart
            currentSoh={soh}
            degradationRate={degRate}
            currentCycle={cycleCount}
          />

          {/* Section D: Electrochemical Diagnostics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {/* Card 1: Electrochemical Capacity Fade Analysis */}
            <div
              className="glass-panel"
              style={{
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: 'rgba(13, 13, 31, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="#e8ff47" />
                <h3
                  style={{
                    fontFamily: 'Clash Display',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#f0f0f8',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  ELECTROCHEMICAL HEALTH VERDICT
                </h3>
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#dcdcec',
                  lineHeight: 1.6,
                  background: 'rgba(4, 4, 10, 0.75)',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  fontFamily: 'Cabinet Grotesk',
                }}
              >
                {soh > 90 ? (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#10b981' }}>Optimal Condition:</strong> The battery pack exhibits minimal
                    Solid Electrolyte Interphase (SEI) layer growth and excellent active lithium inventory retention (SOH = {soh.toFixed(1)}%).
                    Internal resistance is nominal across all 12 series-parallel cells.
                  </p>
                ) : soh > 80 ? (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#f59e0b' }}>Moderate Aging:</strong> Expected linear capacity fade observed.
                    The battery remains within normal automotive operating specifications with sufficient capacity for vehicle propulsion.
                  </p>
                ) : (
                  <p style={{ margin: 0, color: '#ff9d7a' }}>
                    <strong>Degraded Capacity Alert:</strong> Battery health has fallen near or below the 80.0% automotive
                    retirement threshold. Secondary life repurposing (energy storage) is recommended.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', color: '#9898b8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                  <span>Capacity Retention:</span>
                  <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono' }}>{soh.toFixed(1)}% of 2.5Ah Baseline</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Impedance Growth (ΔRi):</span>
                  <strong style={{ color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>+4.2% from Factory Baseline</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Degradation Risk Factors */}
            <div
              className="glass-panel"
              style={{
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: 'rgba(13, 13, 31, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <h3
                  style={{
                    fontFamily: 'Clash Display',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#f0f0f8',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  DEGRADATION RISK FACTORS
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: 'rgba(8, 8, 18, 0.75)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#f0f0f8', fontWeight: 600 }}>
                    <span>Thermal Stress Impact:</span>
                    <span style={{ color: liveData?.temperature_c > 38 ? '#f59e0b' : '#10b981', fontFamily: 'JetBrains Mono' }}>
                      {liveData?.temperature_c > 38 ? 'MODERATE ACCELERATION' : 'LOW (NOMINAL)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9898b8', marginTop: 3, fontFamily: 'Cabinet Grotesk' }}>
                    Current core temp is {liveData?.temperature_c?.toFixed(1) || 25}°C. Maintaining &lt; 35°C extends cycle life by 2.1x.
                  </div>
                </div>

                <div style={{ background: 'rgba(8, 8, 18, 0.75)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#f0f0f8', fontWeight: 600 }}>
                    <span>High-C Fast Charging Stress:</span>
                    <span style={{ color: '#10b981', fontFamily: 'JetBrains Mono' }}>AGENT REGULATED</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9898b8', marginTop: 3, fontFamily: 'Cabinet Grotesk' }}>
                    The Adaptive Charging Agent throttles current above 80% SOC to prevent lithium plating and dendrite formation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
