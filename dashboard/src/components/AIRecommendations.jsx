/**
 * AIRecommendations.jsx
 * ----------------------
 * Displays the Coordinator Agent's final recommendation and the
 * maintenance action list from the Maintenance Agent.
 */

import StatusBadge from './StatusBadge';

const PRIORITY_ICON = {
  CRITICAL: '🚨',
  HIGH: '⚡',
  NORMAL: 'ℹ️',
  LOW: '📋',
  INFO: '✅',
};

function ActionItem({ action }) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusBadge label={action.priority} />
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{action.category}</span>
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

  const priorityIcon = PRIORITY_ICON[priority] || 'ℹ️';

  return (
    <section>
      <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em' }}>
        AI RECOMMENDATIONS
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Coordinator recommendation */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.2rem' }}>{priorityIcon}</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
              Coordinator Decision
            </span>
            <StatusBadge label={priority} size="lg" />
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              fontFamily: 'inherit',
              margin: 0,
            }}
          >
            {recommendation || 'Awaiting first data cycle...'}
          </pre>
        </div>

        {/* Maintenance actions list */}
        {topActions.length > 0 && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
                Maintenance Actions
              </span>
              {nextService !== undefined && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
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
              background: '#1a1200',
              border: '1px solid #713f12',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.72rem',
              color: '#a16207',
            }}
          >
            ⚠️ <strong>Model Notice:</strong>{' '}
            {modelNotes.find(Boolean)}
          </div>
        )}
      </div>
    </section>
  );
}
