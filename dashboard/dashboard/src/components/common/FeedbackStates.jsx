/**
 * src/components/common/FeedbackStates.jsx
 * ----------------------------------------
 * Dark Luxury Editorial Loading, Error, Empty, and Confirmation Modal states.
 * Replaces cyberpunk neon glows with restrained architectural surfaces and electric lime accents.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Zap, ShieldAlert, X } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export function LoadingState({ message = 'Synchronizing with Digital Twin Backend...' }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(8, 8, 18, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(232, 255, 71, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(232, 255, 71, 0.3)',
          boxShadow: '0 0 20px rgba(232, 255, 71, 0.15)',
        }}
      >
        <Zap size={20} color="#e8ff47" />
      </div>

      <div
        style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: '1.05rem',
          letterSpacing: '0.04em',
          color: '#f0f0f8',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {message}
      </div>

      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.74rem',
          color: '#9898b8',
          letterSpacing: '0.04em',
        }}
      >
        GATEWAY // ws://localhost:8000/ws
      </div>
    </div>
  );
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        background: 'rgba(8, 8, 18, 0.8)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <AlertTriangle size={22} color="#ef4444" />
      </div>

      <div
        style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: '1.05rem',
          letterSpacing: '0.04em',
          color: '#f0f0f8',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        SYSTEM TELEMETRY DISRUPTION
      </div>

      <p
        style={{
          fontFamily: 'Cabinet Grotesk, sans-serif',
          fontSize: '0.84rem',
          color: '#fca5a5',
          maxWidth: 460,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
          style={{
            marginTop: 8,
            padding: '8px 18px',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 700,
            background: '#e8ff47',
            color: '#04040a',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          RETRY TELEMETRY LINK
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No Data Available', message = 'No records found for the requested criteria.', icon: Icon = Info }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(8, 8, 18, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
      }}
    >
      <Icon size={28} color="#9898b8" />
      <div
        style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: '0.98rem',
          letterSpacing: '0.04em',
          color: '#f0f0f8',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: 'Cabinet Grotesk, sans-serif',
          fontSize: '0.82rem',
          color: '#9898b8',
          maxWidth: 420,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </div>
  );
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    soundEffects.playClick();
    onConfirm();
  };

  const handleCancel = () => {
    soundEffects.playClick();
    onCancel();
  };

  const isDanger = confirmVariant === 'danger';

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 4, 10, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 460,
            width: '100%',
            padding: 24,
            background: 'linear-gradient(180deg, rgba(13, 13, 31, 0.96) 0%, rgba(8, 8, 18, 0.98) 100%)',
            border: isDanger ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(232, 255, 71, 0.35)',
            borderRadius: 12,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(232, 255, 71, 0.12)',
                  border: isDanger ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(232, 255, 71, 0.3)',
                }}
              >
                <ShieldAlert size={16} color={isDanger ? '#ef4444' : '#e8ff47'} />
              </div>
              <h3
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: '1.02rem',
                  color: '#f0f0f8',
                  letterSpacing: '0.04em',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {title}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9898b8',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p
            style={{
              fontFamily: 'Cabinet Grotesk, sans-serif',
              fontSize: '0.86rem',
              color: '#9898b8',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {message}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 16px',
                fontSize: '0.76rem',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#9898b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>

            <button
              onClick={handleConfirm}
              style={{
                padding: '8px 18px',
                fontSize: '0.76rem',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 700,
                background: isDanger ? '#ef4444' : '#e8ff47',
                color: isDanger ? '#ffffff' : '#04040a',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: isDanger ? '0 0 16px rgba(239, 68, 68, 0.3)' : '0 0 16px rgba(232, 255, 71, 0.25)',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
