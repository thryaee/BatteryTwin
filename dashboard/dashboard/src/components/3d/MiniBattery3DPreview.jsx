/**
 * src/components/3d/MiniBattery3DPreview.jsx
 * ------------------------------------------
 * Nexus Studio Editorial 3D Digital Twin preview widget for Main Dashboard.
 * Embeds the real-time 3D battery pack with a link to the full 3D station.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, ArrowUpRight } from 'lucide-react';
import DigitalTwinCanvas from './DigitalTwinCanvas';
import StatusBadge from '../common/StatusBadge';

export default function MiniBattery3DPreview({ liveData }) {
  const isSimulator = liveData?.data_source === 'SIMULATOR';

  return (
    <div
      className="glass-panel"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        minHeight: 360,
        position: 'relative',
        borderRadius: 12,
        background: 'rgba(13, 13, 31, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box size={16} color="#e8ff47" />
          <span
            style={{
              fontFamily: 'Clash Display',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#f0f0f8',
              letterSpacing: '-0.02em',
            }}
          >
            SPATIAL DIGITAL TWIN
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge label={isSimulator ? 'SIMULATOR' : 'HARDWARE'} size="sm" />
          <Link
            to="/digital-twin"
            className="cyber-button"
            data-cursor="hover"
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              textDecoration: 'none',
              borderColor: 'rgba(232, 255, 71, 0.35)',
              color: '#e8ff47',
              gap: 4,
            }}
          >
            <span>Full 3D Station</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Mini 3D Canvas Viewport */}
      <div
        style={{
          flex: 1,
          minHeight: 230,
          borderRadius: 10,
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(4, 4, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <DigitalTwinCanvas
          liveData={liveData}
          height={230}
          enableControls={false}
          reducedMotion={false}
        />
      </div>

      {/* Real Telemetry Minimalist Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(8, 8, 18, 0.85)',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: '0.72rem',
          color: '#9898b8',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <span>
          SOC: <strong style={{ color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>{liveData?.soc_percent?.toFixed(1) || 50}%</strong>
        </span>
        <span>
          SOH: <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono' }}>{liveData?.soh_percent?.toFixed(1) || 100}%</strong>
        </span>
        <span>
          Core Temp: <strong style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{liveData?.temperature_c?.toFixed(1) || 25}°C</strong>
        </span>
      </div>
    </div>
  );
}
