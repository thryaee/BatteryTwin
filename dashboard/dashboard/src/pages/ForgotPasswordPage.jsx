/**
 * src/pages/ForgotPasswordPage.jsx
 * ----------------------------------
 * BatteryTwin Password Reset Page.
 * Styled with matching split-screen layout and crisp white card.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../services/api';
import AuthBatteryHero from '../components/auth/AuthBatteryHero';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

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
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Left Side: 3D Battery Showcase & Branding ───────────────── */}
      <div className="auth-hero-container" style={{ flex: 1.15, minHeight: '100vh', display: 'flex' }}>
        <AuthBatteryHero />
      </div>

      {/* ── Right Side: White Authentication Panel ─────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {sent ? (
            <div
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #86EFAC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={32} color="#16A34A" />
              </div>

              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                  Check your email
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  If an account exists for <strong>{email}</strong>, we have dispatched a password reset link.
                  Please inspect your inbox or spam folder.
                </p>
              </div>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginTop: 12,
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                  Forgot your password?
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                  Enter your registered email address and we will provide a secure recovery link.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#B91C1C',
                    fontSize: '0.85rem',
                  }}
                >
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 12,
                      padding: '12px 14px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <Mail size={18} color="#94A3B8" style={{ marginRight: 10, flexShrink: 0 }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={loading}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.92rem',
                        color: '#0F172A',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  {loading ? <span>Sending Reset Link...</span> : <><span>Send Reset Link</span><ArrowRight size={18} /></>}
                </button>
              </form>

              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .auth-hero-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
