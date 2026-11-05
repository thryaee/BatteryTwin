/**
 * src/pages/RegisterPage.jsx
 * --------------------------
 * BatteryTwin User Registration Page.
 * Styled with matching split-screen layout, AuthBatteryHero,
 * interactive password strength meter, larger typography & boxes, and full responsiveness.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBatteryHero from '../components/auth/AuthBatteryHero';
import BatteryChargingExperience from '../components/auth/BatteryChargingExperience';

// ── Validation Helpers ──────────────────────────────────────────────
function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.';
}
function validateFullName(v) {
  return v && v.trim().length >= 2 ? '' : 'Full name is required (min 2 characters).';
}
function validatePassword(v) {
  if (!v || v.length < 8) return 'Password must be at least 8 characters long.';
  return '';
}

// ── Password Strength Calculator ───────────────────────────────────
function calcStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChargingAnim, setShowChargingAnim] = useState(false);

  const pwStrength = calcStrength(password);

  function validate() {
    const errs = {};
    const nErr = validateFullName(fullName);
    const eErr = validateEmail(email.trim());
    const pErr = validatePassword(password);

    if (nErr) errs.fullName = nErr;
    if (eErr) errs.email = eErr;
    if (pErr) errs.password = pErr;
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password, confirmPassword);
      setShowChargingAnim(true);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setServerError(typeof detail === 'string' ? detail : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

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

      {/* ── Right Side: Elevated Registration Panel ─────────────────── */}
      <div
        className="auth-form-pane"
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(28px, 4vw, 56px) clamp(20px, 3.5vw, 48px)',
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
            maxWidth: 490,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 'clamp(1.9rem, 2.6vw, 2.45rem)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 8px 0',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Create Your Account
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.92rem, 1.1vw, 1.02rem)',
                color: '#64748B',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Join BatteryTwin to deploy predictive AI &amp; 3D Digital Twin telemetry
            </p>
          </div>

          {/* Server Error Banner */}
          {serverError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#B91C1C',
                fontSize: '0.90rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 7 }}>
                Full Name
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.fullName ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 14,
                  padding: '14px 18px',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <User size={20} color="#94A3B8" style={{ marginRight: 12, flexShrink: 0 }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((f) => ({ ...f, fullName: '' }));
                  }}
                  placeholder="e.g. John Doe"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              {fieldErrors.fullName && (
                <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.fullName}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 7 }}>
                Email Address
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.email ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 14,
                  padding: '14px 18px',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Mail size={20} color="#94A3B8" style={{ marginRight: 12, flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: '' }));
                  }}
                  placeholder="you@company.com"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              {fieldErrors.email && (
                <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 7 }}>
                Password
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.password ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 14,
                  padding: '14px 18px',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Lock size={20} color="#94A3B8" style={{ marginRight: 12, flexShrink: 0 }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
                  }}
                  placeholder="Password (min 8 characters)"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div style={{ marginTop: 8, paddingLeft: 4 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: i <= pwStrength ? STRENGTH_COLORS[pwStrength] : '#E2E8F0',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: STRENGTH_COLORS[pwStrength], fontWeight: 700 }}>
                    Security Strength: {STRENGTH_LABELS[pwStrength]}
                  </span>
                </div>
              )}

              {fieldErrors.password && (
                <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 7 }}>
                Confirm Password
              </label>
              <div
                className="input-focus-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${fieldErrors.confirmPassword ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 14,
                  padding: '14px 18px',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Lock size={20} color="#94A3B8" style={{ marginRight: 12, flexShrink: 0 }} />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((f) => ({ ...f, confirmPassword: '' }));
                  }}
                  placeholder="Repeat your password"
                  disabled={isSubmitting}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                >
                  {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6, marginLeft: 4, fontWeight: 600 }}>
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-submit-btn"
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '1.08rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.40)',
                transition: 'all 0.22s ease',
                marginTop: 6,
              }}
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#2563EB',
                textDecoration: 'none',
                fontSize: '0.94rem',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={18} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Charging Animation on Successful Signup */}
      {showChargingAnim && (
        <BatteryChargingExperience
          userName={fullName}
          onComplete={() => navigate('/login', { replace: true })}
          durationMs={3000}
        />
      )}

      <style>{`
        .input-focus-wrapper:focus-within {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14) !important;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.04);
        }

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
            padding: 32px 20px 48px 20px !important;
          }
          .auth-form-card {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
