/**
 * src/components/auth/AuthBatteryHero.jsx
 * --------------------------------------
 * Left-side interactive visual showcase for BatteryTwin Auth Screen.
 * Enhanced with:
 * - Dynamic responsiveness for mobile, tablet, laptop, and desktop screens
 * - Larger, clearer typography and comfortable box sizing
 * - Lively animations (ambient energy orbs, sequential cell charging wave, rotating pedestal orbit, floating HUD)
 * - 4 interactive capability pills with hover effects
 */

import React, { useEffect, useState } from 'react';
import {
  Wifi,
  Cpu,
  Box,
  BarChart3,
  BatteryCharging,
  Heart,
  Thermometer,
  RotateCw,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AuthBatteryHero() {
  const [activeCellIndex, setActiveCellIndex] = useState(0);

  // Sequential cell charging energy wave animation
  useEffect(() => {
    const cellTimer = setInterval(() => {
      setActiveCellIndex((prev) => (prev + 1) % 6);
    }, 450);
    return () => clearInterval(cellTimer);
  }, []);

  return (
    <div
      className="auth-battery-hero-root"
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(28px, 4.5vw, 56px)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #F0F6FF 0%, #FAF5FF 45%, #F0FDF9 100%)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Dynamic Ambient Energy Orbs ────────────────────────────── */}
      <div
        className="ambient-orb-1"
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-8%',
          width: 'clamp(380px, 45vw, 650px)',
          height: 'clamp(380px, 45vw, 650px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'orb-drift 12s ease-in-out infinite alternate',
        }}
      />
      <div
        className="ambient-orb-2"
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: 'clamp(320px, 40vw, 580px)',
          height: 'clamp(320px, 40vw, 580px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.14) 0%, rgba(168, 85, 247, 0.06) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'orb-drift-reverse 15s ease-in-out infinite alternate',
        }}
      />

      {/* Floating Sparkle Particles */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '18%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#38BDF8',
          boxShadow: '0 0 12px #38BDF8',
          animation: 'particle-blink 3s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '12%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#A855F7',
          boxShadow: '0 0 10px #A855F7',
          animation: 'particle-blink 4s ease-in-out infinite 1.5s',
        }}
      />

      {/* ── Top Header & Branding ──────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.40)',
            }}
          >
            <Zap size={26} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(1.8rem, 3.2vw, 2.3rem)',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Battery<span style={{ color: '#2563EB' }}>Twin</span>
            </div>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.85rem, 1.2vw, 0.98rem)',
                fontWeight: 500,
                color: '#64748B',
                marginTop: 2,
              }}
            >
              Smart Battery Monitoring &amp; AI-Powered Digital Twin
            </div>
          </div>
        </div>

        {/* ── 4 Feature Capability Pills (Larger & Interactive) ───────── */}
        <div
          className="hero-capability-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            marginTop: 24,
            maxWidth: 620,
          }}
        >
          {[
            { label: 'Real-time Monitoring', icon: Wifi, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'AI Predictions', icon: Cpu, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
            { label: 'Digital Twin', icon: Box, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
            { label: 'Battery Analytics', icon: BarChart3, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="hero-pill-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  border: `1.5px solid ${item.border}`,
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                  cursor: 'default',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={item.color} />
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.25,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Center Stage: 3D Pedestal & Battery Visualization ──────── */}
      <div
        className="hero-stage-container"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'clamp(24px, 4vw, 42px) 0',
          minHeight: 'clamp(280px, 35vw, 360px)',
          zIndex: 2,
        }}
      >
        {/* Glowing Pedestal Platform */}
        <div
          style={{
            position: 'absolute',
            bottom: 15,
            width: 'clamp(320px, 42vw, 440px)',
            height: 'clamp(80px, 10vw, 110px)',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #FFFFFF 0%, #E0F2FE 55%, #BAE6FD 85%, transparent 100%)',
            border: '2.5px solid rgba(56, 189, 248, 0.55)',
            boxShadow: '0 0 60px rgba(14, 165, 233, 0.40), inset 0 0 30px rgba(255, 255, 255, 0.9)',
            transform: 'rotateX(60deg)',
          }}
        />
        {/* Rotating Dashed Orbit Ring */}
        <div
          style={{
            position: 'absolute',
            bottom: 25,
            width: 'clamp(270px, 36vw, 370px)',
            height: 'clamp(70px, 9vw, 90px)',
            borderRadius: '50%',
            border: '2px dashed rgba(37, 99, 235, 0.6)',
            transform: 'rotateX(60deg)',
            animation: 'bt-spin 22s linear infinite',
          }}
        />

        {/* Floating Holographic Telemetry HUD Card (Left Side) */}
        <div
          className="hero-hud-card"
          style={{
            position: 'absolute',
            left: 'clamp(0px, 2vw, 20px)',
            top: 'clamp(10px, 2vw, 30px)',
            padding: '18px 20px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(56, 189, 248, 0.55)',
            boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
            minWidth: 165,
            zIndex: 10,
            animation: 'hud-float 4.5s ease-in-out infinite alternate',
          }}
        >
          {/* Header pill inside HUD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 4, borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#16A34A', boxShadow: '0 0 6px #16A34A' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
              TELEMETRY BUS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BatteryCharging size={15} color="#16A34A" />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>SOC</span>
            </div>
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#16A34A', fontFamily: 'JetBrains Mono, monospace' }}>85.4%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={15} color="#2563EB" />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>SOH</span>
            </div>
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#2563EB', fontFamily: 'JetBrains Mono, monospace' }}>96.2%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={15} color="#0284C7" />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Temp</span>
            </div>
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0284C7', fontFamily: 'JetBrains Mono, monospace' }}>29.4°C</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCw size={15} color="#7C3AED" />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>RUL</span>
            </div>
            <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>850 cyc</span>
          </div>
        </div>

        {/* 3D Realistic Battery Pack Enclosure (Larger & More Dynamic) */}
        <div
          className="hero-battery-enclosure"
          style={{
            position: 'relative',
            zIndex: 5,
            width: 'clamp(290px, 34vw, 360px)',
            height: 'clamp(170px, 20vw, 200px)',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0F172A 100%)',
            border: '2.5px solid #38BDF8',
            boxShadow: '0 24px 48px -10px rgba(15, 23, 42, 0.50), 0 0 35px rgba(56, 189, 248, 0.40)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '18px 22px',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Top Enclosure Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                4S3P PACK // BALANCED
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3].map((b) => (
                <div key={b} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: b <= 2 ? '#38BDF8' : '#475569' }} />
              ))}
            </div>
          </div>

          {/* 6 High-Voltage Glowing Cylindrical Cells with Wave Fill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 9, margin: '8px 0' }}>
            {[0, 1, 2, 3, 4, 5].map((cellIdx) => {
              const isEnergized = cellIdx <= activeCellIndex;
              const isWavePeak = cellIdx === activeCellIndex;

              return (
                <div
                  key={cellIdx}
                  style={{
                    flex: 1,
                    height: 'clamp(85px, 11vw, 105px)',
                    borderRadius: 12,
                    background: isEnergized
                      ? 'linear-gradient(180deg, #38BDF8 0%, #0284C7 35%, #0369A1 75%, #0F172A 100%)'
                      : 'linear-gradient(180deg, #075985 0%, #0C4A6E 50%, #082F49 100%)',
                    boxShadow: isWavePeak
                      ? '0 0 20px rgba(56, 189, 248, 0.9), 0 0 35px rgba(16, 185, 129, 0.4)'
                      : isEnergized
                      ? '0 0 12px rgba(56, 189, 248, 0.5)'
                      : 'none',
                    border: isWavePeak ? '1.5px solid #67E8F9' : '1px solid rgba(56, 189, 248, 0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '5px 3px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Metallic terminal cap */}
                  <div style={{ width: '100%', height: 5, borderRadius: 2, backgroundColor: isWavePeak ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }} />

                  {/* Emerald energy fill level */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '78%',
                      background: isEnergized
                        ? 'linear-gradient(0deg, rgba(16, 185, 129, 0.65) 0%, rgba(56, 189, 248, 0.25) 100%)'
                        : 'transparent',
                      transition: 'height 0.4s ease',
                    }}
                  />

                  {/* Cell Label */}
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#E0F2FE', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', position: 'relative', zIndex: 2 }}>
                    C{cellIdx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pack Lower Telemetry Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(56, 189, 248, 0.30)', paddingTop: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="#38BDF8" fill="#38BDF8" />
              <span style={{ fontSize: '0.72rem', color: '#E2E8F0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                14.80 V &bull; 12.40 A
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34D399', fontFamily: 'JetBrains Mono, monospace' }}>
              THERMAL: 29.4°C
            </span>
          </div>
        </div>

        {/* Background Holographic Screen with Waveform & AI Chip (Right Side) */}
        <div
          className="hero-waveform-card"
          style={{
            position: 'absolute',
            right: 'clamp(0px, 2vw, 15px)',
            top: 'clamp(10px, 2vw, 20px)',
            width: 'clamp(160px, 18vw, 190px)',
            padding: '14px 16px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(124, 58, 237, 0.40)',
            boxShadow: '0 12px 28px -4px rgba(124, 58, 237, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 4,
            animation: 'hud-float-reverse 5s ease-in-out infinite alternate',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={16} color="#7C3AED" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E293B' }}>AI Neural Core</span>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#7C3AED', boxShadow: '0 0 6px #7C3AED' }} />
          </div>

          {/* Real-time wave oscillation */}
          <svg width="100%" height={36} viewBox="0 0 140 36">
            <path
              d="M 0 18 Q 18 6 35 18 T 70 18 T 105 18 T 140 18"
              fill="none"
              stroke="#7C3AED"
              strokeWidth={2.5}
            />
            <path
              d="M 0 22 Q 22 30 45 22 T 90 22 T 135 22"
              fill="none"
              stroke="#0284C7"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>RUL: 850 cyc</span>
            <span style={{ color: '#16A34A', fontWeight: 800 }}>CONF: 98.4%</span>
          </div>
        </div>

        {/* Ambient AI Ground Chip (Bottom Right) */}
        <div
          className="hero-ai-chip"
          style={{
            position: 'absolute',
            right: 'clamp(20px, 4vw, 50px)',
            bottom: 8,
            padding: '8px 16px',
            borderRadius: 20,
            backgroundColor: '#0F172A',
            border: '2px solid #7C3AED',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            zIndex: 10,
          }}
        >
          <Sparkles size={14} color="#C4B5FD" />
          <span>AI AGENT ACTIVE</span>
        </div>
      </div>

      {/* ── Bottom Section: Project Description & Engineering Badges ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p
          style={{
            fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            color: '#475569',
            lineHeight: 1.55,
            margin: '0 0 14px 0',
            fontFamily: 'Inter, sans-serif',
            maxWidth: 540,
          }}
        >
          Hardware-in-the-loop battery intelligence platform unifying real ESP32 sensor telemetry,
          electrochemical digital twin state tracking, and autonomous LangGraph multi-agent health optimization.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.74rem',
            color: '#64748B',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
          }}
        >
          <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>ESP32-WROOM</span>
          <span>&bull;</span>
          <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>INA219 HIGH-SIDE</span>
          <span>&bull;</span>
          <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>DS18B20 1-WIRE</span>
          <span>&bull;</span>
          <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>FASTAPI ENGINE</span>
        </div>
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes hud-float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        @keyframes hud-float-reverse {
          0% { transform: translateY(0px); }
          100% { transform: translateY(8px); }
        }
        @keyframes bt-spin {
          from { transform: rotateX(60deg) rotateZ(0deg); }
          to { transform: rotateX(60deg) rotateZ(360deg); }
        }
        @keyframes orb-drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }
        @keyframes orb-drift-reverse {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-25px, -20px) scale(1.05); }
        }
        @keyframes particle-blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        .hero-pill-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08) !important;
          border-color: #2563EB !important;
        }

        /* Mobile & Tablet Responsiveness */
        @media (max-width: 900px) {
          .auth-battery-hero-root {
            padding: 24px 20px !important;
            min-height: auto !important;
          }
          .hero-capability-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hero-hud-card {
            display: none !important;
          }
          .hero-waveform-card {
            display: none !important;
          }
          .hero-stage-container {
            min-height: 220px !important;
            margin: 16px 0 !important;
          }
          .hero-battery-enclosure {
            width: 290px !important;
            height: 160px !important;
          }
        }
      `}</style>
    </div>
  );
}
