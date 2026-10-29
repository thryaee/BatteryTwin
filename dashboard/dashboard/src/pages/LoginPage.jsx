/**
 * src/pages/LoginPage.jsx
 * -----------------------
 * BatteryTwin login page with User / Admin tab switcher.
 *
 * Features:
 *   - Tab switcher: User Login ↔ Admin Login (same card, distinct styling)
 *   - Show/hide password toggle
 *   - Remember me checkbox (user login only)
 *   - Forgot password link → /forgot-password
 *   - Create account link → /register (user mode only)
 *   - Inline validation errors
 *   - Loading state with disabled submit during request
 *   - Post-login redirect honours location.state.from
 *   - Accessible: labels, aria-live error region, keyboard nav
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Icon helpers (inline SVG – no extra dep) ───────────────────────

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <rect x="2" y="7" width="18" height="11" rx="2" />
    <path d="M22 11v3" />
    <path d="M7 11v3" strokeWidth="2.5" />
    <path d="M12 11v3" strokeWidth="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Validation ─────────────────────────────────────────────────────

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.';
}
function validatePassword(v) {
  return v.length >= 1 ? '' : 'Password is required.';
}

// ── Component ──────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Tab state
  const [mode, setMode] = useState('user'); // 'user' | 'admin'

  // Form fields
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [rememberMe, setRemember] = useState(false);
  const [showPw, setShowPw]       = useState(false);

  // UI state
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const emailRef = useRef(null);

  // Focus email when tab switches
  useEffect(() => {
    setEmail(''); setPassword(''); setFieldErrors({}); setServerError('');
    setTimeout(() => emailRef.current?.focus(), 60);
  }, [mode]);

  // ── Validation ──────────────────────────────────────────────────
  function validate() {
    const errs = {};
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr) errs.email = eErr;
    if (pErr) errs.password = pErr;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      let profile;
      if (mode === 'user') {
        profile = await login(email.trim(), password, rememberMe);
      } else {
        profile = await adminLogin(email.trim(), password);
      }

      setSuccess(true);
      const dest = from || (profile.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      setTimeout(() => navigate(dest, { replace: true }), 400);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setServerError(detail);
      } else if (err?.response?.status === 429) {
        setServerError('Too many login attempts. Please wait a moment and try again.');
      } else {
        setServerError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Styles (inline – matches project CSS token system) ──────────
  const isAdmin = mode === 'admin';

  const accentColor  = isAdmin ? '#c084fc' : 'var(--signal, #e8ff47)';
  const accentGlow   = isAdmin ? 'rgba(192,132,252,0.18)' : 'var(--signal-glow, rgba(232,255,71,0.16))';
  const accentBorder = isAdmin ? 'rgba(192,132,252,0.40)' : 'var(--signal-border, rgba(232,255,71,0.35))';

  return (
    <div style={styles.page}>
      {/* Background grid decoration */}
      <div style={styles.gridBg} aria-hidden="true" />
      <div style={{ ...styles.glowOrb, background: isAdmin ? 'rgba(192,132,252,0.07)' : 'rgba(232,255,71,0.06)' }} aria-hidden="true" />

      <div style={styles.wrapper}>

        {/* ── Brand header ──────────────────────────────────────── */}
        <header style={styles.brand}>
          <div style={{ ...styles.brandIcon, borderColor: accentBorder, boxShadow: `0 0 24px ${accentGlow}` }}>
            <span style={{ color: accentColor }}><BatteryIcon /></span>
          </div>
          <h1 style={styles.brandName}>BatteryTwin</h1>
          <p style={styles.brandSub}>Intelligent EV Battery Monitoring &amp; Optimization</p>
        </header>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div style={{ ...styles.card, borderColor: isAdmin ? 'rgba(192,132,252,0.20)' : 'rgba(255,255,255,0.08)' }}>

          {/* Tab switcher */}
          <div style={styles.tabs} role="tablist" aria-label="Login mode">
            {['user', 'admin'].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={mode === t}
                onClick={() => setMode(t)}
                style={{
                  ...styles.tab,
                  ...(mode === t ? {
                    color: t === 'admin' ? '#c084fc' : 'var(--signal, #e8ff47)',
                    borderBottomColor: t === 'admin' ? '#c084fc' : 'var(--signal, #e8ff47)',
                    background: 'transparent',
                  } : {}),
                }}
              >
                {t === 'admin' && (
                  <span style={{ marginRight: 6, opacity: 0.8 }}><ShieldIcon /></span>
                )}
                {t === 'user' ? 'User Login' : 'Admin Login'}
              </button>
            ))}
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div style={styles.adminBadge}>
              <ShieldIcon />
              <span>Administrator Portal — Restricted Access</span>
            </div>
          )}

          {/* Success flash */}
          {success && (
            <div style={styles.successBanner} role="status">
              ✓ Authenticated — redirecting…
            </div>
          )}

          {/* Server error */}
          {serverError && !success && (
            <div style={styles.errorBanner} role="alert" aria-live="assertive">
              {serverError}
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate aria-label={isAdmin ? 'Admin login form' : 'User login form'}>

            {/* Email */}
            <div style={styles.field}>
              <label htmlFor="bt-email" style={styles.label}>
                {isAdmin ? 'Admin Email' : 'Email Address'}
              </label>
              <input
                ref={emailRef}
                id="bt-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: '' })); }}
                placeholder={isAdmin ? 'admin@batterytwin.local' : 'you@example.com'}
                disabled={loading || success}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-err' : undefined}
                style={{
                  ...styles.input,
                  ...(fieldErrors.email ? styles.inputError : {}),
                  '--accent': accentColor,
                }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = fieldErrors.email ? 'var(--status-critical,#ef4444)' : 'rgba(255,255,255,0.12)'}
              />
              {fieldErrors.email && (
                <span id="email-err" style={styles.fieldError} role="alert">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={styles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="bt-password" style={styles.label}>Password</label>
                {!isAdmin && (
                  <Link to="/forgot-password" tabIndex={0} style={styles.forgotLink}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <div style={styles.pwWrapper}>
                <input
                  id="bt-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={mode === 'admin' ? 'current-password' : 'current-password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); }}
                  placeholder="••••••••"
                  disabled={loading || success}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'pw-err' : undefined}
                  style={{
                    ...styles.input,
                    paddingRight: 44,
                    ...(fieldErrors.password ? styles.inputError : {}),
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = fieldErrors.password ? 'var(--status-critical,#ef4444)' : 'rgba(255,255,255,0.12)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={styles.eyeBtn}
                  tabIndex={0}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="pw-err" style={styles.fieldError} role="alert">{fieldErrors.password}</span>
              )}
            </div>

            {/* Remember me (user only) */}
            {!isAdmin && (
              <div style={styles.checkRow}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRemember(e.target.checked)}
                    disabled={loading || success}
                    style={styles.checkbox}
                  />
                  <span>Remember me for {7} days</span>
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                ...styles.submitBtn,
                background: success
                  ? 'var(--status-healthy, #10b981)'
                  : isAdmin ? '#c084fc' : 'var(--signal, #e8ff47)',
                color: isAdmin ? '#0d0d1f' : 'var(--ink-950, #04040a)',
                opacity: (loading || success) ? 0.8 : 1,
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={styles.btnSpinner}>
                  <span style={styles.spinDot} />
                  Authenticating…
                </span>
              ) : success ? (
                '✓ Authenticated'
              ) : (
                isAdmin ? 'Sign In as Administrator' : 'Sign In'
              )}
            </button>
          </form>

          {/* Register link (user mode only) */}
          {!isAdmin && (
            <p style={styles.registerRow}>
              Don't have an account?{' '}
              <Link to="/register" style={{ ...styles.linkAccent, color: accentColor }}>
                Create account
              </Link>
            </p>
          )}

          {isAdmin && (
            <p style={styles.adminNote}>
              Admin accounts are provisioned by system administrators only.
            </p>
          )}
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          BatteryTwin &copy; {new Date().getFullYear()} &mdash; Agentic AI &amp; Digital Twin Platform
        </p>
      </div>

      <style>{inputFocusCSS}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const inputFocusCSS = `
  input[type="email"]:focus,
  input[type="password"]:focus,
  input[type="text"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(232,255,71,0.18);
  }
  @keyframes bt-spin { to { transform: rotate(360deg); } }
`;

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--ink-950, #04040a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'var(--font-body, system-ui, sans-serif)',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  glowOrb: {
    position: 'absolute', top: '-20%', left: '50%',
    transform: 'translateX(-50%)',
    width: 600, height: 400,
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 0, pointerEvents: 'none',
    transition: 'background 0.5s ease',
  },
  wrapper: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 440,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 24,
  },
  brand: {
    textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  brandIcon: {
    width: 56, height: 56, borderRadius: 14,
    border: '1.5px solid',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  brandName: {
    fontFamily: 'var(--font-display, system-ui)', fontWeight: 700,
    fontSize: '1.75rem', letterSpacing: '-0.02em',
    color: 'var(--mist-100, #f0f0f8)', margin: 0,
  },
  brandSub: {
    fontSize: '0.8rem', color: 'var(--mist-900, #9898b8)',
    margin: 0, letterSpacing: '0.02em',
  },
  card: {
    width: '100%',
    background: 'var(--ink-800, #0d0d1f)',
    border: '1px solid',
    borderRadius: 18,
    padding: '32px 28px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s ease',
  },
  tabs: {
    display: 'flex', marginBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  tab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '10px 0', background: 'none', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    fontFamily: 'var(--font-body, system-ui)', fontWeight: 600,
    fontSize: '0.85rem', color: 'var(--mist-900, #9898b8)',
    transition: 'color 0.2s, border-color 0.2s',
    letterSpacing: '0.02em',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(192,132,252,0.08)',
    border: '1px solid rgba(192,132,252,0.20)',
    borderRadius: 8, padding: '8px 12px',
    color: '#c084fc', fontSize: '0.75rem',
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.04em', marginBottom: 20,
  },
  field: { marginBottom: 18 },
  label: {
    display: 'block', marginBottom: 6,
    fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--mist-500, #dcdcec)',
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: 'var(--mist-100, #f0f0f8)',
    fontFamily: 'var(--font-body, system-ui)', fontSize: '0.95rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
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
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--mist-900, #9898b8)',
    display: 'flex', alignItems: 'center', padding: 2,
    transition: 'color 0.2s',
  },
  forgotLink: {
    fontSize: '0.75rem', color: 'var(--mist-900, #9898b8)',
    textDecoration: 'none', transition: 'color 0.2s',
  },
  checkRow: { marginBottom: 22, marginTop: -4 },
  checkLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.82rem', color: 'var(--mist-700, #c4c4d8)',
    cursor: 'pointer', userSelect: 'none',
  },
  checkbox: { accentColor: 'var(--signal, #e8ff47)', width: 15, height: 15, cursor: 'pointer' },
  submitBtn: {
    width: '100%', padding: '13px',
    border: 'none', borderRadius: 10,
    fontFamily: 'var(--font-body, system-ui)', fontWeight: 700,
    fontSize: '0.95rem', letterSpacing: '0.02em',
    transition: 'opacity 0.2s, transform 0.1s, background 0.3s',
    marginTop: 4,
  },
  btnSpinner: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
  spinDot: {
    width: 14, height: 14, borderRadius: '50%',
    border: '2px solid rgba(0,0,0,0.2)',
    borderTopColor: 'rgba(0,0,0,0.8)',
    animation: 'bt-spin 0.7s linear infinite',
    display: 'inline-block',
  },
  successBanner: {
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 18,
    color: 'var(--status-healthy, #10b981)',
    fontSize: '0.85rem', fontWeight: 600,
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 18,
    color: 'var(--status-critical, #ef4444)',
    fontSize: '0.85rem',
  },
  registerRow: {
    textAlign: 'center', marginTop: 22, marginBottom: 0,
    fontSize: '0.82rem', color: 'var(--mist-900, #9898b8)',
  },
  linkAccent: {
    textDecoration: 'none', fontWeight: 600,
    transition: 'opacity 0.2s',
  },
  adminNote: {
    textAlign: 'center', marginTop: 20, marginBottom: 0,
    fontSize: '0.75rem', color: 'var(--mist-900, #9898b8)',
    fontStyle: 'italic',
  },
  footer: {
    fontSize: '0.72rem', color: 'var(--mist-dim, rgba(255,255,255,0.25))',
    textAlign: 'center', margin: 0,
  },
};
