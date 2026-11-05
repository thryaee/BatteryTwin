/**
 * src/pages/MaintenancePage.jsx
 * ------------------------------
 * Prescribed Maintenance & Cell Balancing Diagnostics.
 * Commercial white theme with 12-cell series balancing matrix and preventive maintenance scheduling.
 */

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import BatteryCellMatrix from '../components/BatteryCellMatrix';
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
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#D97706', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              PRESCRIBED MAINTENANCE &bull; 12-CELL BALANCING MATRIX
            </span>
          </div>
          <StatusBadge label={overallPriority} size="sm" />
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
          Preventive Maintenance &amp; Series Cell Diagnostics
        </h1>

        <p style={{ fontSize: '1.0rem', color: '#64748B', margin: 0, maxWidth: 740, lineHeight: 1.5 }}>
          Autonomous series differential tracking identifying lagging cells, triggering active balancing circuits, and scheduling preventive inspection intervals.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <MetricCard
          icon={Clock}
          label="Next Service In"
          value={nextService}
          unit="cycles"
          color="#2563EB"
          decimals={0}
          nominal="Preventive Horizon"
          sub="Target interval for physical terminal torque inspection"
        />

        <MetricCard
          icon={Layers}
          label="Series Cell Differential"
          value={12}
          unit="mV"
          color="#16A34A"
          decimals={0}
          nominal="Threshold: 30 mV"
          sub="Maximum delta-V across all 12 series cell groups"
        />

        <MetricCard
          icon={ShieldCheck}
          label="Balancing Circuit"
          value="PASSIVE READY"
          color="#16A34A"
          sub="Autonomous shunt resistors ready on charge completion"
        />

        <MetricCard
          icon={Wrench}
          label="Maintenance Actions"
          value={topActions.length}
          unit="tasks"
          color="#D97706"
          decimals={0}
          sub="Prescribed by LangGraph multi-agent swarm"
        />
      </div>

      {/* 12-Cell Matrix Visualizer */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}
      >
        <BatteryCellMatrix liveData={liveData} selectedCell={selectedCell} onSelectCell={setSelectedCell} />
      </div>
    </div>
  );
}
