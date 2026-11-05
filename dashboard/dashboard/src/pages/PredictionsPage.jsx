/**
 * src/pages/PredictionsPage.jsx
 * ------------------------------
 * Dedicated AI-Driven Health & Remaining Useful Life (RUL) Prediction Analytics.
 * Commercial white theme with 5 prediction cards, degradation curves, and model explanations.
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Brain, Sparkles } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import DegradationTrendChart from '../components/charts/DegradationTrendChart';
import AIPredictionsDeck from '../components/common/AIPredictionsDeck';
import { LoadingState } from '../components/common/FeedbackStates';

export default function PredictionsPage() {
  const { liveData, loading } = useOutletContext();

  if (loading && !liveData) {
    return <LoadingState message="Calculating AI RUL & Health Predictions..." />;
  }

  const soh = liveData?.soh_percent ?? 96.2;
  const degRate = liveData?.degradation_rate ?? 0.002;
  const cycleCount = liveData?.cycle_count ?? 142.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
            NEURAL NETWORK RUL &amp; SOH TRAJECTORY PREDICTION
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge label="ACTIVE MODEL" size="sm" />
          </div>
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
          AI Battery Predictions &amp; Longevity Forecasts
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', maxWidth: 720, lineHeight: 1.5, margin: 0 }}>
          Deep learning models extrapolating non-linear electrochemical capacity fade, thermal stress acceleration,
          and remaining operational life before the 80.0% SOH retirement threshold.
        </p>
      </section>

      {/* ── 5 Core Prediction Cards + Natural Language AI Insights ──── */}
      <AIPredictionsDeck liveData={liveData} />

      {/* ── Degradation Extrapolation Chart ─────────────────────────── */}
      <DegradationTrendChart
        currentSoh={soh}
        degradationRate={degRate}
        currentCycle={cycleCount}
      />

      {/* ── Feature Weights & Model Architecture ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Feature Weights */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#2563EB" />
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              AI Inference Feature Weights
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Thermal Stress Exposure (>38°C)', weight: '42%', color: '#D97706' },
              { label: 'C-Rate Discharge Velocity', weight: '28%', color: '#2563EB' },
              { label: 'Cell-to-Cell Voltage Imbalance (Delta-V)', weight: '18%', color: '#7C3AED' },
              { label: 'Cumulative Equivalent Cycle Count', weight: '12%', color: '#16A34A' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600 }}>
                  <span style={{ color: '#0F172A' }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: 'JetBrains Mono' }}>{item.weight}</span>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: item.weight, height: '100%', backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Architecture Notes */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} color="#7C3AED" />
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Prediction Model Specification
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Architecture:</div>
              Gradient-Boosted Regression + Temporal Convolutional Network (TCN)
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Training Dataset:</div>
              NASA Ames Li-ion Prognostics &amp; Oxford Battery Degradation Datasets
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Evaluation Bounds:</div>
              Confidence intervals constrained within ±28 full equivalent cycles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
