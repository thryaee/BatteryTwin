/**
 * src/pages/SettingsPage.jsx
 * ---------------------------
 * Platform Preferences, 3D Performance, & Diagnostics.
 * Redesigned in clean, professional light theme.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchHealth } from '../services/api';
import { soundEffects } from '../utils/soundEffects';
import StatusBadge from '../components/common/StatusBadge';

export default function SettingsPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backendStatus, setBackendStatus] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setSoundEnabled(!muted);
  };

  const handleTestBackend = async () => {
    soundEffects.playClick();
    setTestingPing(true);
    try {
      const res = await fetchHealth();
      setBackendStatus({ success: true, message: `FastAPI Gateway Online (status: ${res.status || 'ok'})` });
    } catch (err) {
      setBackendStatus({ success: false, message: `Connection test failed: ${err.message}` });
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              System Preferences
            </span>
            <span style={{ color: '#94A3B8' }}>&bull;</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Runtime Environment</span>
          </div>
          <StatusBadge label="CONFIG READY" status="HEALTHY" size="sm" />
        </div>

        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Platform Settings &amp; Diagnostics
        </h1>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.92rem',
            color: '#64748B',
            margin: 0,
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Manage 3D hardware acceleration parameters, Web Audio feedback synthesizer, and query backend REST &amp; WebSocket microservice health.
        </p>
      </div>

      {/* Settings Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 3D Graphics Fidelity */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
              }}
            >
              <Sparkles size={20} color="#2563EB" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.05rem',
                  color: '#0F172A',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                3D Digital Twin Graphics Acceleration
              </h3>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                WebGL Render Pipeline &bull; Three.js Engine
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              borderRadius: 12,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#0F172A' }}>
                Reduced Motion / High-Performance 3D Mode
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 3 }}>
                Disables idle rotation and extra particles for low-end GPUs while preserving full 3D pack and cell interactivity.
              </div>
            </div>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              style={{
                padding: '8px 18px',
                fontSize: '0.78rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: reducedMotion ? '#2563EB' : '#FFFFFF',
                color: reducedMotion ? '#FFFFFF' : '#475569',
                border: reducedMotion ? 'none' : '1px solid #CBD5E1',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: reducedMotion ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
              }}
            >
              {reducedMotion ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Audio Telemetry */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
              }}
            >
              <Volume2 size={20} color="#7C3AED" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.05rem',
                  color: '#0F172A',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Acoustic &amp; Haptic Telemetry Feedback
              </h3>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                Procedural Web Audio Synthesizer
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              borderRadius: 12,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#0F172A' }}>
                Tactile Audio Feedback
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 3 }}>
                Plays subtle audio cues for physical relay toggles, 3D cell selection blips, and safety alert chimes.
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              style={{
                padding: '8px 18px',
                fontSize: '0.78rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: soundEnabled ? '#7C3AED' : '#FFFFFF',
                color: soundEnabled ? '#FFFFFF' : '#475569',
                border: soundEnabled ? 'none' : '1px solid #CBD5E1',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: soundEnabled ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
              }}
            >
              {soundEnabled ? 'AUDIO ON' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Backend Connectivity Test */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
              }}
            >
              <Server size={20} color="#16A34A" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.05rem',
                  color: '#0F172A',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                FastAPI Backend Gateway Diagnostics
              </h3>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                REST / Health Ping Diagnostics
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              borderRadius: 12,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#0F172A' }}>
                REST &amp; WebSocket Gateway Ping
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                HOST: <code style={{ color: '#2563EB', fontWeight: 600 }}>http://localhost:8000</code> &bull; WS: <code style={{ color: '#7C3AED', fontWeight: 600 }}>ws://localhost:8000/ws</code>
              </div>
            </div>

            <button
              onClick={handleTestBackend}
              disabled={testingPing}
              style={{
                padding: '9px 20px',
                fontSize: '0.82rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                cursor: testingPing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Activity size={16} />
              {testingPing ? 'Testing...' : 'Ping Gateway'}
            </button>
          </div>

          {backendStatus && (
            <div
              style={{
                background: backendStatus.success ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${backendStatus.success ? '#BBF7D0' : '#FECACA'}`,
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: '0.84rem',
                color: backendStatus.success ? '#166534' : '#991B1B',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {backendStatus.success ? <CheckCircle2 size={16} color="#16A34A" /> : <AlertCircle size={16} color="#DC2626" />}
              <span>{backendStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
