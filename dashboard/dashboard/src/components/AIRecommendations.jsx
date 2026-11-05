/**
 * src/components/AIRecommendations.jsx
 * ------------------------------------
 * Coordinator Agent Recommendations & Maintenance Action Items.
 * Commercial white theme with high-legibility priority alerts.
 */

import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import StatusBadge from './common/StatusBadge';

const PRIORITY_ICONS = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  NORMAL: Info,
  LOW: Info,
  INFO: CheckCircle2,
};

function ActionItem({ action }) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusBadge label={action.priority} />
        <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>{action.category}</span>
      </div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
        {action.action}
      </div>
      {action.detail && (
        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>{action.detail}</div>
      )}
    </div>
  );
}

export default function AIRecommendations({ liveData }) {
  const coordinator = liveData?.coordinator_output;
  const recommendation = liveData?.recommendation || coordinator?.recommendation || '';
  const priority = liveData?.recommendation_priority || coordinator?.priority || 'INFO';
  const maintSummary = coordinator?.maintenance_summary || {};
  const topActions = maintSummary.top_actions || [];

  const Icon = PRIORITY_ICONS[priority] || Info;

  return (
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} color="#2563EB" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              AI Coordinator Arbitration Decision
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Multi-agent consensus resolving battery health, safety contactor, and charging rate
            </span>
          </div>
        </div>
        <StatusBadge label={priority} size="md" />
      </div>

      {/* Decision Box */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '16px 18px',
          fontSize: '0.88rem',
          color: '#1E293B',
          lineHeight: 1.6,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {recommendation || 'Autonomous arbitration active: battery operating within safe electrochemical envelope. No emergency contactor cut required.'}
      </div>

      {/* Prescribed Action Items */}
      {topActions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Recommended Preventive Actions:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {topActions.map((act, i) => (
              <ActionItem key={i} action={act} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
