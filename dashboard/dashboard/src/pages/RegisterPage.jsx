/**
 * src/pages/RegisterPage.jsx
 * --------------------------
 * User registration page for BatteryTwin.
 *
 * Features:
 *   - Full name, email, password, confirm password fields
 *   - Show/hide password toggles (both fields independently)
 *   - Password strength meter (visual)
 *   - Inline field validation (required, email format, policy, match)
 *   - Server error display (duplicate email, policy violations from API)
 *   - Loading + disabled state during request
 *   - On success: shows confirmation then redirects to /login
 *   - Role is NEVER sent in the request body (backend always assigns "user")
 *   - Keyboard accessible, labeled, aria-live error region
 */

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Icons ──────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Password strength ──────────────────────────────────────────────

function calcStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))    score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

function StrengthMeter({ password }) {
  const level = calcStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= level ? STRENGTH_COLORS[level] : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <span style={{
        fontSize: '0.72rem',
        color: STRENGTH_COLORS[level] || 'var(--mist-900)',
        fontFamily: 'var(--font-mono, monospace)',
      }}>
        {STRENGTH_LABELS[level]}
      </span>
    </div>
  );
}

// ── Validation ─────────────────────────────────────────────────────

const MIN_PW = 8;

function validateFields(fields) {
  const errs = {};
  if (!fields.fullName.trim() || fields.fullName.trim().length < 2)
    errs.fullName = 'Full name must be at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errs.email = 'Enter a valid email address.';
  if (fields.password.length < MIN_PW)
    errs.password = `Password must be at least ${MIN_PW} characters.`;
  else if (!/[A-Z]/.test(fields.password))
    errs.password = 'Password needs at least one uppercase letter.';
  else if (!/[a-z]/.test(fields.password))
    errs.password = 'Password needs at least one lowercase letter.';
  else if (!/\d/.test(fields.password))
    errs.password = 'Password needs at least one number.';
  if (!fields.confirmPassword)
    errs.confirmPassword = 'Please confirm your password.';
  else if (fields.password !== fields.confirmPassword)
    errs.confirmPassword = 'Passwords do not match.';
  return errs;
}

// ── Component ──────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  function update(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    setFieldErrors(e => ({ ...e, [key]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validateFields(fields);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      await register(fields.fullName, fields.email, fields.password, fields.confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2200);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setServerError(detail.join(' '));
      } else if (typeof detail === 'string') {
        setServerError(detail);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridBg} aria-hidden="true" />
      <div style={styles.glowOrb} aria-hidden="true" />

      <div style={styles.wrapper}>
        {/* Brand */}
        <header style={styles.brand}>
          <h1 style={styles.brandName}>BatteryTwin</h1>
          <p style={styles.brandSub}>Create your account</p>
        </header>

        {/* Card */}
        <div style={styles.card}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.successTitle}>Account Created!</h2>
              <p style={styles.successBody}>
                Your BatteryTwin account has been created successfully.
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <>
              <h2 style={styles.cardTitle}>Create Account</h2>

              {serverError && (
                <div style={styles.errorBanner} role="alert" aria-live="assertive">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="Registration form">

                {/* Full name */}
                <div style={styles.field}>
                  <label htmlFor="rg-name" style={styles.label}>Full Name</label>
                  <input
                    id="rg-name" type="text" autoComplete="name"
                    value={fields.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    placeholder="Jane Smith"
                    disabled={loading}
                    aria-invalid={!!fieldErrors.fullName}
                    aria-describedby={fieldErrors.fullName ? 'name-err' : undefined}
                    style={{
                      ...styles.input,
                      ...(fieldErrors.fullName ? styles.inputError : {}),
                    }}
                  />
                  {fieldErrors.fullName && (
                    <span id="name-err" style={styles.fieldError} role="alert">
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div style={styles.field}>
                  <label htmlFor="rg-email" style={styles.label}>Email Address</label>
                  <input
                    id="rg-email" type="email" autoComplete="email"
                    value={fields.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-err' : undefined}
                    style={{
                      ...styles.input,
                      ...(fieldErrors.email ? styles.inputError : {}),
                    }}
                  />
                  {fieldErrors.email && (
                    <span id="email-err" style={styles.fieldError} role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div style={styles.field}>
                  <label htmlFor="rg-password" style={styles.label}>Password</label>
                  <div style={styles.pwWrapper}>
                    <input
                      id="rg-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={fields.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      disabled={loading}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'pw-err' : 'pw-hint'}
                      style={{
                        ...styles.input,
                        paddingRight: 44,
                        ...(fieldErrors.password ? styles.inputError : {}),
                      }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      style={styles.eyeBtn}>
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <span id="pw-hint" style={{ display: 'none' }}>
                    At least 8 characters with uppercase, lowercase, and a number.
                  </span>
                  {fieldErrors.password ? (
                    <span id="pw-err" style={styles.fieldError} role="alert">
                      {fieldErrors.password}
                    </span>
                  ) : (
                    <StrengthMeter password={fields.password} />
                  )}
                </div>

                {/* Confirm password */}
                <div style={styles.field}>
                  <label htmlFor="rg-confirm" style={styles.label}>Confirm Password</label>
                  <div style={styles.pwWrapper}>
                    <input
                      id="rg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={fields.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      disabled={loading}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'conf-err' : undefined}
                      style={{
                        ...styles.input,
                        paddingRight: 44,
                        ...(fieldErrors.confirmPassword ? styles.inputError : {}),
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      style={styles.eyeBtn}>
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span id="conf-err" style={styles.fieldError} role="alert">
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                  {/* Match indicator */}
                  {!fieldErrors.confirmPassword && fields.confirmPassword && fields.password && (
                    <span style={{
                      fontSize: '0.72rem', marginTop: 5, display: 'block',
                      color: fields.password === fields.confirmPassword
                        ? 'var(--status-healthy, #10b981)' : 'var(--status-critical, #ef4444)',
                    }}>
                      {fields.password === fields.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>

                {/* Policy note */}
                <p style={styles.policyNote}>
                  Password must be at least 8 characters and include uppercase,
                  lowercase, and a number.
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.submitBtn,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <span style={styles.btnSpinner}>
                      <span style={styles.spinDot} />
                      Creating account…
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>

              <p style={styles.loginRow}>
                Already have an account?{' '}
                <Link to="/login" style={styles.loginLink}>Sign in</Link>
              </p>
            </>
          )}
        </div>

        <p style={styles.footer}>
          BatteryTwin &copy; {new Date().getFullYear()}
        </p>
      </div>

      <style>{`@keyframes bt-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--ink-950, #04040a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', fontFamily: 'var(--font-body, system-ui, sans-serif)',
    position: 'relative', overflow: 'hidden',
  },
  gridBg: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none',
  },
  glowOrb: {
    position: 'absolute', top: '-20%', left: '50%',
    transform: 'translateX(-50%)',
    width: 500, height: 350, borderRadius: '50%',
    background: 'rgba(232,255,71,0.05)', filter: 'blur(80px)',
    zIndex: 0, pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 440,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  },
  brand: { textAlign: 'center' },
  brandName: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.7rem', color: 'var(--mist-100, #f0f0f8)',
    margin: 0, letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: '0.8rem', color: 'var(--mist-900, #9898b8)',
    margin: '4px 0 0', letterSpacing: '0.02em',
  },
  card: {
    width: '100%', background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: '28px 28px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  cardTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.3rem', color: 'var(--mist-100, #f0f0f8)',
    margin: '0 0 20px',
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--mist-500, #dcdcec)', letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: 'var(--mist-100, #f0f0f8)',
    fontFamily: 'var(--font-body, system-ui)', fontSize: '0.95rem',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: 'var(--status-critical, #ef4444)',
    background: 'rgba(239,68,68,0.06)',
  },
  fieldError: {
    display: 'block', marginTop: 5,
    fontSize: '0.75rem', color: 'var(--status-critical, #ef4444)',
  },
  pwWrapper: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--mist-900, #9898b8)', display: 'flex', alignItems: 'center', padding: 2,
  },
  policyNote: {
    fontSize: '0.73rem', color: 'var(--mist-900, #9898b8)',
    margin: '-6px 0 16px', lineHeight: 1.5,
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'var(--signal, #e8ff47)', color: 'var(--ink-950, #04040a)',
    border: 'none', borderRadius: 10,
    fontFamily: 'var(--font-body, system-ui)', fontWeight: 700,
    fontSize: '0.95rem', letterSpacing: '0.01em',
    transition: 'opacity 0.2s',
  },
  btnSpinner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinDot: {
    width: 14, height: 14, borderRadius: '50%',
    border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)',
    animation: 'bt-spin 0.7s linear infinite', display: 'inline-block',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
    color: 'var(--status-critical, #ef4444)', fontSize: '0.85rem',
  },
  loginRow: {
    textAlign: 'center', marginTop: 20, marginBottom: 0,
    fontSize: '0.82rem', color: 'var(--mist-900, #9898b8)',
  },
  loginLink: {
    color: 'var(--signal, #e8ff47)', textDecoration: 'none', fontWeight: 600,
  },
  successIcon: {
    fontSize: '3rem', color: 'var(--status-healthy, #10b981)', marginBottom: 12,
  },
  successTitle: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.3rem', color: 'var(--mist-100, #f0f0f8)', margin: '0 0 10px',
  },
  successBody: {
    fontSize: '0.875rem', color: 'var(--mist-700, #c4c4d8)',
    lineHeight: 1.6, margin: 0,
  },
  footer: {
    fontSize: '0.72rem', color: 'var(--mist-dim, rgba(255,255,255,0.25))',
    textAlign: 'center', margin: 0,
  },
};
