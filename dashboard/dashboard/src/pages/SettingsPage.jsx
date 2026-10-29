/**
 * src/pages/SettingsPage.jsx
 * ---------------------------
 * Page 10: Platform Preferences, 3D Performance, & Diagnostics.
 * Redesigned in Nexus Studio Dark Luxury Editorial aesthetics.
 */

import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Server,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { fetchHealth } from '../services/api';
import { soundEffects } from '../utils/soundEffects';
import MagneticButton from '../components/ui/MagneticButton';
import StatusBadge from '../components/common/StatusBadge';
import ScrollReveal from '../components/ui/ScrollReveal';

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
      setBackendStatus({ success: true, message: `FastAPI Gateway Nominal (status: ${res.status || 'ok'})` });
    } catch (err) {
      setBackendStatus({ success: false, message: `Connection test failed: ${err.message}` });
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
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
              <span>10 / SYSTEM CONTROLS</span>
              <span style={{ color: '#444466' }}>—</span>
              <span>PLATFORM ENVIRONMENT</span>
            </div>
            <StatusBadge label="SETTINGS READY" size="sm" />
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
            PLATFORM PREFERENCES & RUNTIME DIAGNOSTICS
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
            Configure 3D hardware acceleration parameters, Web Audio tactile feedback synthesizer, and query backend REST/WebSocket microservices.
          </p>
        </ScrollReveal>
      </div>

      {/* Settings Cards List (4. Metrics/Config & 5. Diagnostics) */}
      <ScrollReveal delay={0.28} yOffset={40}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 3D Graphics Fidelity */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(232, 255, 71, 0.08)',
                border: '1px solid rgba(232, 255, 71, 0.25)',
              }}
            >
              <Sparkles size={16} color="#e8ff47" />
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
                3D DIGITAL TWIN GRAPHICS & ACCELERATION
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                WEBGL RENDER PIPELINE // THREE.JS ENGINE
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(8, 8, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '16px 20px',
              borderRadius: 8,
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#f0f0f8' }}>
                Reduced Motion / High-Performance 3D Mode
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', marginTop: 3 }}>
                Disables idle rotation and particle vortex for lower-end GPUs while preserving full 3D cell interactivity.
              </div>
            </div>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              style={{
                padding: '8px 16px',
                fontSize: '0.72rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: reducedMotion ? '#e8ff47' : 'rgba(255, 255, 255, 0.04)',
                color: reducedMotion ? '#04040a' : '#9898b8',
                border: reducedMotion ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {reducedMotion ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Audio Telemetry */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(232, 255, 71, 0.08)',
                border: '1px solid rgba(232, 255, 71, 0.25)',
              }}
            >
              <Volume2 size={16} color="#e8ff47" />
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
                AUDIO TELEMETRY FEEDBACK
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                PROCEDURAL WEB AUDIO OSCILLATORS
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(8, 8, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '16px 20px',
              borderRadius: 8,
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#f0f0f8' }}>
                Tactile Audio Feedback Synthesizer
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9898b8', fontFamily: 'Cabinet Grotesk', marginTop: 3 }}>
                Generative acoustic feedback for physical relay toggles, 3D cell selection blips, and safety alert tones.
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              style={{
                padding: '8px 16px',
                fontSize: '0.72rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: soundEnabled ? '#e8ff47' : 'rgba(255, 255, 255, 0.04)',
                color: soundEnabled ? '#04040a' : '#9898b8',
                border: soundEnabled ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {soundEnabled ? 'AUDIO ON' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Backend Connectivity Test */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Server size={16} color="#10b981" />
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
                FASTAPI BACKEND GATEWAY DIAGNOSTICS
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.64rem', color: '#9898b8' }}>
                REST / HEALTH PING TEST
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(8, 8, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '16px 20px',
              borderRadius: 8,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#f0f0f8' }}>
                REST & WebSocket Gateway Ping
              </div>
              <div style={{ fontSize: '0.76rem', color: '#9898b8', fontFamily: 'JetBrains Mono', marginTop: 3 }}>
                HOST: <code>http://localhost:8000</code> | WS: <code>ws://localhost:8000/ws</code>
              </div>
            </div>

            <MagneticButton strength={0.2}>
              <button
                onClick={handleTestBackend}
                disabled={testingPing}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: '#e8ff47',
                  color: '#04040a',
                  border: 'none',
                  borderRadius: 6,
                  cursor: testingPing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(232, 255, 71, 0.25)',
                }}
              >
                {testingPing ? 'TESTING...' : 'PING GATEWAY'}
              </button>
            </MagneticButton>
          </div>

          {backendStatus && (
            <div
              style={{
                background: backendStatus.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${backendStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: '0.78rem',
                color: backendStatus.success ? '#6ee7b7' : '#fca5a5',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              &gt; {backendStatus.message}
            </div>
          )}
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
