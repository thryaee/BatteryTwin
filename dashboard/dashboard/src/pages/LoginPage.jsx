/**
 * src/pages/LoginPage.jsx
 * -----------------------
 * Clean, Commercial BatteryTwin Login Page.
 *
 * Upgrades:
 * - Significantly larger typography and input box dimensions for high legibility
 * - Removed temporary demo credentials and unnecessary text clutter
 * - Dynamic responsiveness for mobile phones, tablets, laptops, and desktop screens
 * - Seamless integration with the enhanced Cinematic Battery Charging Experience
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBatteryHero from '../components/auth/AuthBatteryHero';
import BatteryChargingExperience from '../components/auth/BatteryChargingExperience';

// ── Validation Helpers ──────────────────────────────────────────────
function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.';
}
function validatePassword(v) {
  return v && v.length >= 1 ? '' : 'Password is required.';
}

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Mode: 'user' | 'admin'
  const [mode, setMode] = useState('user');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // States
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Special Charging Experience State
  const [showChargingAnim, setShowChargingAnim] = useState(false);
  const [authenticatedProfile, setAuthenticatedProfile] = useState(null);

  const emailInputRef = useRef(null);

  // Auto-focus email input on tab switch
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFieldErrors({});
    setServerError('');
    setTimeout(() => emailInputRef.current?.focus(), 80);
  }, [mode]);

  function validate() {
    const errs = {};
    const eErr = validateEmail(email.trim());
    const pErr = validatePassword(password);
    if (eErr) errs.email = eErr;
    if (pErr) errs.password = pErr;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let profile;
      if (mode === 'user') {
        profile = await login(email.trim(), password, rememberMe);
      } else {
        profile = await adminLogin(email.trim(), password);
      }

      // Authentication succeeded: Trigger cinematic charging animation!
      setAuthenticatedProfile(profile);
      setShowChargingAnim(true);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setServerError(detail);
      } else if (err?.response?.status === 429) {
        setServerError('Too many login attempts. Please wait a moment.');
      } else {
        setServerError('Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Callback when charging animation completes
  const handleChargingComplete = () => {
    const dest = from || (authenticatedProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    navigate(dest, { replace: true });
  };

  const isAdmin = mode === 'admin';

  return (
    <div
      className="auth-screen-layout"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Left Side: 3D Battery Showcase & Branding ───────────────── */}
      <div className="auth-hero-pane" style={{ flex: 1.15, minHeight: '100vh', display: 'flex' }}>
        <AuthBatteryHero />
      </div>

      {/* ── Right Side: Clean White Authentication Panel ────────────── */}
      <div
        className="auth-form-pane"
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 64px) clamp(24px, 4vw, 56px)',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          className="auth-form-card"
          style={{
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: isAdmin ? '#7C3AED' : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isAdmin ? '0 8px 20px rgba(124, 58, 237, 0.35)' : '0 8px 20px rgba(37, 99, 235, 0.35)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isAdmin ? <Shield size={26} color="#FFFFFF" /> : <Lock size={24} color="#FFFFFF" />}
              </div>
              <span
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#0F172A',
                }}
              >
                Battery<span style={{ color: isAdmin ? '#7C3AED' : '#2563EB' }}>Twin</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 3.0vw, 2.7rem)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 10px 0',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              {isAdmin ? 'Administrator Portal' : 'Welcome Back'}
            </h1>
            <p
              style={{
                fontSize: 'clamp(1.0rem, 1.25vw, 1.12rem)',
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {isAdmin
                ? 'Sign in to access enterprise battery controls'
                : 'Enter your credentials to access the live dashboard'}
            </p>
          </div>

          {/* Mode Switcher: User vs Admin */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: 6,
              borderRadius: 16,
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setMode('user')}
              style={{
                flex: 1,
                padding: '13px 0',
                borderRadius: 12,
                border: 'none',
                backgroundColor: mode === 'user' ? '#FFFFFF' : 'transparent',
                color: mode === 'user' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.98rem',
                cursor: 'pointer',
                boxShadow: mode === 'user' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              style={{
                flex: 1,
                padding: '13px 0',
                borderRadius: 12,
                border: 'none',
                backgroundColor: mode === 'admin' ? '#FFFFFF' : 'transparent',
                color: mode === 'admin' ? '#7C3AED' : '#64748B',
                fontWeight: 700,
                fontSize: '0.98rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: mode === 'admin' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Shield size={18} color={mode === 'admin' ? '#7C3AED' : '#64748B'} />
              Admin Portal
            </button>
          </div>

          {/* Error Banner */}
          {serverError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                color: '#B91C1C',
                fontSize: '0.96rem',
                fontWeight: 600,
                animation: 'shake 0.35s ease-in-out',
              }}
            >
              <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* ── Login Form ─────────────────────────────────────────── */}
          <form onSubmit={handleLoginSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.96rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Email Address
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.email ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: '0 2px 5px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Mail size={22} color="#94A3B8" style={{ marginRight: 14, flexShrink: 0 }} />
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: '' }));
                  }}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.08rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              {fieldErrors.email && (
                <div style={{ color: '#DC2626', fontSize: '0.84rem', marginTop: 7, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.96rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Password
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.password ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: '0 2px 5px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Lock size={22} color="#94A3B8" style={{ marginRight: 14, flexShrink: 0 }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
                  }}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.08rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div style={{ color: '#DC2626', fontSize: '0.84rem', marginTop: 7, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.94rem' }}>
              {!isAdmin ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: 19,
                      height: 19,
                      borderRadius: 6,
                      accentColor: '#2563EB',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember me</span>
                </label>
              ) : (
                <span style={{ fontSize: '0.88rem', color: '#7C3AED', fontWeight: 700 }}>
                  Master System Access
                </span>
              )}

              {!isAdmin && (
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            {/* Login Button with Dynamic Shimmer Effect */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-submit-btn"
              style={{
                width: '100%',
                padding: '17px 26px',
                borderRadius: 16,
                border: 'none',
                background: isAdmin
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '1.14rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isAdmin
                  ? '0 8px 24px rgba(124, 58, 237, 0.40)'
                  : '0 8px 24px rgba(37, 99, 235, 0.40)',
                transition: 'all 0.22s ease',
                marginTop: 6,
              }}
            >
              {isSubmitting ? (
                <span>Validating...</span>
              ) : (
                <>
                  <span>{isAdmin ? 'Sign In as Administrator' : 'Sign In'}</span>
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          {/* Divider: "or" */}
          {!isAdmin && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  margin: '6px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                <span style={{ fontSize: '0.90rem', color: '#94A3B8', fontWeight: 600 }}>or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              </div>

              {/* Sign Up Link Button */}
              <Link
                to="/register"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: '2px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '1.06rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <UserPlus size={22} color="#2563EB" />
                <span>Create New Account</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Special Full-Screen Battery Charging Animation ──────────── */}
      {showChargingAnim && (
        <BatteryChargingExperience
          userName={authenticatedProfile?.full_name || email.split('@')[0]}
          onComplete={handleChargingComplete}
          targetSoc={authenticatedProfile?.role === 'admin' ? 100 : 96}
        />
      )}

      {/* Responsive & Animation Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .input-focus-wrapper:focus-within {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16) !important;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        /* ── Dynamic Screen Responsiveness ──────────────────────────── */
        @media (max-width: 960px) {
          .auth-screen-layout {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .auth-hero-pane {
            flex: none !important;
            min-height: auto !important;
            width: 100% !important;
          }
          .auth-form-pane {
            flex: none !important;
            min-height: auto !important;
            width: 100% !important;
            padding: 36px 20px 48px 20px !important;
          }
          .auth-form-card {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
