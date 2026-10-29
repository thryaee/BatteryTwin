/**
 * src/pages/ForgotPasswordPage.jsx
 * ----------------------------------
 * Request a password reset link.
 * Always shows a neutral confirmation message regardless of whether
 * the email exists to prevent user enumeration.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      setError('Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridBg} aria-hidden="true" />
      <div style={styles.wrapper}>
        <header style={styles.brand}>
          <h1 style={styles.brandName}>BatteryTwin</h1>
          <p style={styles.brandSub}>Password Reset</p>
        </header>

        <div style={styles.card}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={styles.successIcon}>✉</div>
              <h2 style={styles.sentTitle}>Check your email</h2>
              <p style={styles.sentBody}>
                If an account with that address exists, we've sent a password
                reset link. Please check your inbox (and spam folder).
              </p>
              <Link to="/login" style={styles.backLink}>← Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 style={styles.cardTitle}>Forgot your password?</h2>
              <p style={styles.cardDesc}>
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div style={styles.errorBanner} role="alert">{error}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={styles.field}>
                  <label htmlFor="fp-email" style={styles.label}>Email Address</label>
                  <input
                    id="fp-email" type="email" autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" disabled={loading}
                    style={styles.input}
                  />
                </div>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p style={styles.backRow}>
                <Link to="/login" style={styles.backLink}>← Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--ink-950, #04040a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', fontFamily: 'var(--font-body, system-ui)',
    position: 'relative',
  },
  gridBg: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
  },
  brand: { textAlign: 'center' },
  brandName: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.6rem', color: 'var(--mist-100, #f0f0f8)', margin: 0,
  },
  brandSub: { fontSize: '0.8rem', color: 'var(--mist-900, #9898b8)', margin: '4px 0 0' },
  card: {
    width: '100%', background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: '32px 28px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  cardTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.25rem', color: 'var(--mist-100, #f0f0f8)',
    margin: '0 0 8px',
  },
  cardDesc: { fontSize: '0.85rem', color: 'var(--mist-700, #c4c4d8)', margin: '0 0 20px' },
  field: { marginBottom: 18 },
  label: {
    display: 'block', marginBottom: 6,
    fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--mist-500, #dcdcec)', letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: 'var(--mist-100, #f0f0f8)',
    fontFamily: 'var(--font-body, system-ui)', fontSize: '0.95rem',
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'var(--signal, #e8ff47)', color: 'var(--ink-950, #04040a)',
    border: 'none', borderRadius: 10,
    fontFamily: 'var(--font-body, system-ui)', fontWeight: 700,
    fontSize: '0.95rem', cursor: 'pointer',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
    color: 'var(--status-critical, #ef4444)', fontSize: '0.85rem',
  },
  successIcon: {
    fontSize: '2.5rem', marginBottom: 12,
    color: 'var(--signal, #e8ff47)',
  },
  sentTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.25rem', color: 'var(--mist-100, #f0f0f8)', margin: '0 0 10px',
  },
  sentBody: { fontSize: '0.875rem', color: 'var(--mist-700, #c4c4d8)', lineHeight: 1.6, margin: '0 0 24px' },
  backRow: { textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: '0.82rem' },
  backLink: { color: 'var(--signal, #e8ff47)', textDecoration: 'none', fontWeight: 600 },
};
