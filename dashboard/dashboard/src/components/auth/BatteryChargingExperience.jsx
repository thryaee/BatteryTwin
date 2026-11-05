/**
 * src/components/auth/BatteryChargingExperience.jsx
 * --------------------------------------------------
 * Full-screen High-Tech Cinematic Battery Charging Experience.
 *
 * Visual Stages:
 * 1. Cybernetic energy grid with pulsing radial beacon
 * 2. 6-cell horizontal battery pack with glowing emerald energy filling
 * 3. Dynamic real-time telemetry HUD during charging (Voltage ramping 11.8V -> 14.8V, Current +24.5A, Power W, Temp)
 * 4. Smooth percentage counter accelerating 0% -> 100%
 * 5. At 100%: Expanding energy shockwave ring, radiant emerald checkmark, and celebratory confetti burst
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Zap, CheckCircle2, Activity, Cpu } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export default function BatteryChargingExperience({
  userName = '',
  onComplete,
  durationMs = 3400,
  reducedMotion = false,
}) {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const startTimeRef = useRef(Date.now());
  const reqRef = useRef(null);

  useEffect(() => {
    try {
      soundEffects.playClick();
    } catch {}

    if (reducedMotion) {
      setPercent(100);
      setIsDone(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth ease-out cubic charging acceleration curve
      const currentPercent = Math.min(100, Math.floor(progress * 100));
      setPercent(currentPercent);

      if (progress < 1) {
        reqRef.current = requestAnimationFrame(animate);
      } else {
        setIsDone(true);
        try {
          soundEffects.playSuccess();
        } catch {}

        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.62 },
            colors: ['#10B981', '#34D399', '#2563EB', '#60A5FA', '#F59E0B'],
          });
        } catch {}

        const finishTimer = setTimeout(() => {
          if (onComplete) onComplete();
        }, 1150);
        return () => clearTimeout(finishTimer);
      }
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [durationMs, onComplete, reducedMotion]);

  const totalCells = 6;
  const activeCells = Math.floor((percent / 100) * totalCells);
  const currentCellFill = ((percent / 100) * totalCells) % 1;

  // Real-time telemetry calculations during the power-up sequence
  const currentVoltage = (11.80 + (percent / 100) * 3.00).toFixed(2);
  const currentAmps = (24.50 - (percent / 100) * 4.2).toFixed(1);
  const currentWatts = (currentVoltage * currentAmps).toFixed(1);
  const currentTemp = (28.2 + (percent / 100) * 1.2).toFixed(1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#070B14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* ── Background Cybernetic Grid & Radial Pulse Rings ─────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Expanding Ambient Shockwave Aura */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px',
          height: '720px',
          borderRadius: '50%',
          background: isDone
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, rgba(14, 165, 233, 0.10) 50%, transparent 70%)',
          filter: 'blur(60px)',
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Top Header Brand ────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
          }}
        >
          <Zap size={24} color="#FFFFFF" fill="#FFFFFF" />
        </div>
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}
        >
          Battery<span style={{ color: '#34D399' }}>Twin</span>
        </span>
      </div>

      {/* ── Center Stage: High-Voltage Battery Charging or Success ──── */}
      {!isDone ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            maxWidth: 620,
            width: '100%',
            zIndex: 10,
          }}
        >
          {/* Main Horizontal Battery Unit */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Outer Casing */}
            <div
              style={{
                width: 'clamp(320px, 48vw, 440px)',
                height: 'clamp(130px, 18vw, 160px)',
                borderRadius: 26,
                backgroundColor: 'rgba(15, 23, 42, 0.90)',
                border: '3.5px solid #34D399',
                boxShadow: `0 0 45px rgba(16, 185, 129, ${0.30 + (percent / 100) * 0.50}), inset 0 0 24px rgba(16, 185, 129, 0.20)`,
                padding: '14px 16px',
                display: 'flex',
                gap: 10,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Internal Cells (6 Segmented Lithium-Ion Blocks) */}
              {[...Array(totalCells)].map((_, idx) => {
                const isFull = idx < activeCells;
                const isCurrent = idx === activeCells;
                const fillHeight = isFull ? '100%' : isCurrent ? `${Math.floor(currentCellFill * 100)}%` : '0%';

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: 14,
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1.5px solid rgba(52, 211, 153, 0.35)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: fillHeight,
                        background: 'linear-gradient(180deg, #A7F3D0 0%, #34D399 30%, #10B981 70%, #059669 100%)',
                        boxShadow: isFull || isCurrent ? '0 0 24px rgba(16, 185, 129, 0.9)' : 'none',
                        transition: 'height 0.10s linear',
                        borderRadius: 12,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Positive Terminal Cap (+) */}
            <div
              style={{
                width: 18,
                height: 70,
                backgroundColor: '#34D399',
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.7)',
              }}
            />
          </div>

          {/* Live Percentage & Power Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                fontSize: 'clamp(3.0rem, 6.5vw, 4.2rem)',
                fontWeight: 900,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#34D399',
                textShadow: '0 0 32px rgba(16, 185, 129, 0.8)',
                lineHeight: 1,
              }}
            >
              {percent}%
            </div>

            {/* Dynamic Telemetry Readout Strip */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: 12,
                padding: '8px 18px',
                fontSize: '0.85rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#94A3B8',
              }}
            >
              <span style={{ color: '#60A5FA', fontWeight: 700 }}>{currentVoltage} V</span>
              <span>&bull;</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>+{currentAmps} A</span>
              <span>&bull;</span>
              <span style={{ color: '#FCD34D', fontWeight: 700 }}>{currentWatts} W</span>
              <span>&bull;</span>
              <span style={{ color: '#F472B6', fontWeight: 700 }}>{currentTemp}°C</span>
            </div>

            {/* Subtitle Status */}
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#E2E8F0',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Activity size={18} color="#34D399" />
              <span>Initializing Digital Twin &bull; Powering Up...</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Success Celebration Stage (100%) ─────────────────────── */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            textAlign: 'center',
            zIndex: 10,
            animation: 'scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Glowing Checkmark Circle */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              border: '3px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.7)',
            }}
          >
            <CheckCircle2 size={54} color="#34D399" strokeWidth={2.5} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.0vw, 3.0rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              BatteryTwin Activated!
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#94A3B8',
                margin: 0,
              }}
            >
              Welcome back{userName ? `, ${userName}` : ''}! Launching your command center...
            </p>
          </div>

          {/* Progress bar to redirect */}
          <div
            style={{
              width: 240,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              marginTop: 12,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #10B981, #2563EB)',
                animation: 'progress-drain 1.1s linear',
              }}
            />
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progress-drain {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
