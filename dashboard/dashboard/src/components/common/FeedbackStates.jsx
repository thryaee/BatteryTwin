/**
 * src/components/common/FeedbackStates.jsx
 * ----------------------------------------
 * Clean, modern light theme Loading, Error, Empty, and Confirmation Modal states.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Zap, ShieldAlert, X } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export function LoadingState({ message = 'Synchronizing with Digital Twin Backend...' }) {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #BFDBFE',
        }}
      >
        <Zap size={22} color="#2563EB" />
      </div>

      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.05rem',
          color: '#0F172A',
          fontWeight: 700,
        }}
      >
        {message}
      </div>

      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.74rem',
          color: '#64748B',
        }}
      >
        GATEWAY &bull; ws://localhost:8000/ws
      </div>
    </div>
  );
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        background: '#FFFFFF',
        border: '1px solid #FECACA',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #FCA5A5',
        }}
      >
        <AlertTriangle size={24} color="#DC2626" />
      </div>

      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.05rem',
          color: '#991B1B',
          fontWeight: 700,
        }}
      >
        Telemetry Connection Notice
      </div>

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.88rem',
          color: '#64748B',
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
          style={{
            marginTop: 8,
            padding: '9px 20px',
            fontSize: '0.82rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          }}
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No Data Available', message = 'No records found for the requested criteria.', icon: Icon = Info }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color="#64748B" />
      </div>
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          color: '#0F172A',
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.86rem',
          color: '#64748B',
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
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 460,
            width: '100%',
            padding: 24,
            background: '#FFFFFF',
            border: isDanger ? '1px solid #FECACA' : '1px solid #E2E8F0',
            borderRadius: 16,
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDanger ? '#FEF2F2' : '#EFF6FF',
                  border: isDanger ? '1px solid #FCA5A5' : '1px solid #BFDBFE',
                }}
              >
                <ShieldAlert size={18} color={isDanger ? '#DC2626' : '#2563EB'} />
              </div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.05rem',
                  color: '#0F172A',
                  margin: 0,
                  fontWeight: 700,
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
                color: '#64748B',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem',
              color: '#475569',
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
                padding: '9px 18px',
                fontSize: '0.82rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              style={{
                padding: '9px 20px',
                fontSize: '0.82rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                background: isDanger ? '#DC2626' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: isDanger ? '0 4px 12px rgba(220, 38, 38, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)',
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
