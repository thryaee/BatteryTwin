/**
 * AIRecommendations.jsx
 * ----------------------
 * Displays the Coordinator Agent's final decision and maintenance action tasks.
 */

import React from 'react';
import { Cpu, Wrench, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import StatusBadge from './StatusBadge';

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
        background: 'rgba(3, 7, 18, 0.7)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusBadge label={action.priority} />
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{action.category}</span>
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
        {action.action}
      </div>
      {action.detail && (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{action.detail}</div>
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
  const nextService = maintSummary.next_service_cycles;
  const modelNotes = coordinator?.model_notes || [];

  const Icon = PRIORITY_ICONS[priority] || Info;

  return (
    <section>
      <h2 className="tech-title" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Cpu size={15} color="#a855f7" />
        AI AGENT COORDINATOR REASONING & ACTIONS
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Coordinator recommendation card */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={18} color="#a855f7" />
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f1f5f9', fontFamily: 'Orbitron' }}>
                COORDINATOR DECISION
              </span>
            </div>
            <StatusBadge label={priority} size="lg" />
          </div>

          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              fontFamily: 'JetBrains Mono',
              margin: 0,
              background: 'rgba(3, 7, 18, 0.6)',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid rgba(51, 65, 85, 0.4)',
            }}
          >
            {recommendation || 'Awaiting agent loop evaluation...'}
          </pre>
        </div>

        {/* Maintenance actions list */}
        {topActions.length > 0 && (
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Rajdhani' }}>
                <Wrench size={15} color="#f59e0b" />
                PRESCRIBED MAINTENANCE ACTIONS
              </span>
              {nextService !== undefined && (
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                  Next check in {nextService} cycles
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topActions.map((action, i) => (
                <ActionItem key={action.code || i} action={action} />
              ))}
            </div>
          </div>
        )}

        {/* Model notice */}
        {modelNotes.some(Boolean) && (
          <div
            style={{
              background: 'rgba(66, 32, 6, 0.4)',
              border: '1px solid #d97706',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.72rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} color="#f59e0b" />
            <span><strong>Model Notice:</strong> {modelNotes.find(Boolean)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
