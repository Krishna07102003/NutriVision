import { useState, useEffect } from 'react';
import { Activity, Mail, Phone, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ThemeToggle from './ThemeToggle';
import { isValidEmail, isValidPhone, isValidOTP, sanitizeText } from '../utils/validation';
import { checkLimit, resetRateLimit, cleanupRateLimits } from '../utils/rateLimit';

type AuthMethod = 'choose' | 'email' | 'phone' | 'otp';

export default function AuthScreen() {
  const [method, setMethod] = useState<AuthMethod>('choose');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cleanupRateLimits(); }, []);

  const handleGoogleLogin = async () => {
    const limit = checkLimit('LOGIN');
    if (!limit.allowed) {
      setError(`Too many attempts. Please wait ${limit.retryAfter} seconds.`);
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const resendLimit = checkLimit('RESEND');
    if (!resendLimit.allowed) {
      setError(`Too many resend attempts. Please wait ${resendLimit.retryAfter} seconds.`);
      return;
    }
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setMethod('otp');
    }
    setLoading(false);
  };

  const handleSendPhoneOtp = async () => {
    const resendLimit = checkLimit('RESEND');
    if (!resendLimit.allowed) {
      setError(`Too many resend attempts. Please wait ${resendLimit.retryAfter} seconds.`);
      return;
    }
    const cleaned = phone.replace(/[\s\-().]/g, '');
    if (!isValidPhone(cleaned)) { setError('Please enter a valid phone number with country code (e.g. +91...).'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setMethod('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const otpLimit = checkLimit('OTP');
    if (!otpLimit.allowed) {
      setError(`Too many failed attempts. Please wait ${otpLimit.retryAfter} seconds.`);
      return;
    }
    if (!isValidOTP(otp)) { setError('Please enter the 6-digit verification code.'); return; }
    setLoading(true);
    setError('');
    const params = email
      ? { email, token: otp, type: 'email' as const }
      : { phone, token: otp, type: 'sms' as const };
    const { error } = await supabase.auth.verifyOtp(params);
    if (error) {
      setError(error.message);
    } else {
      // Success — reset all auth rate limits
      resetRateLimit('OTP');
      resetRateLimit('LOGIN');
      resetRateLimit('RESEND');
    }
    setLoading(false);
  };

  const goBack = () => { setMethod('choose'); setOtpSent(false); setOtp(''); setError(''); };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
        <Activity className="w-6 h-6" />
      </div>
      <h2 className="text-3xl mb-3 font-serif font-bold tracking-tight text-[var(--text-primary)]">
        Welcome to NutriVision
      </h2>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-8 text-center leading-relaxed">
        Log your gym macros, generate customized 3-day meal plans, and scan food plate pictures instantly using cloud AI analytics.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 max-w-sm w-full">
          {error}
        </div>
      )}

      <div className="max-w-sm w-full space-y-4">
        {/* CHOOSE METHOD */}
        {method === 'choose' && (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-[var(--bg-hover)] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{loading ? 'Redirecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-color)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[var(--bg-base)] text-[var(--text-muted)]">or continue with</span>
              </div>
            </div>

            <button
              onClick={() => setMethod('email')}
              className="w-full flex items-center gap-3 bg-accent text-white px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-accent-dim transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={() => setMethod('phone')}
              className="w-full flex items-center gap-3 bg-accent text-white px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-accent-dim transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </>
        )}

        {/* EMAIL INPUT */}
        {method === 'email' && (
          <>
            <button onClick={() => { setMethod('choose'); setError(''); }} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <label className="text-xs text-[var(--text-muted)] mb-2 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmailOtp()}
              className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
            />
            <button
              onClick={handleSendEmailOtp}
              disabled={loading || !email.trim()}
              className="w-full bg-accent text-white py-3.5 rounded-lg font-bold text-sm hover:bg-accent-dim disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] transition-colors mt-6">{loading ? 'Sending...' : 'Send verification code'}</button>
          </>
        )}

        {/* PHONE INPUT */}
        {method === 'phone' && (
          <>
            <button onClick={() => { setMethod('choose'); setError(''); }} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <label className="text-xs text-[var(--text-muted)] mb-2 block">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              onKeyDown={(e) => e.key === 'Enter' && handleSendPhoneOtp()}
              className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
            />
            <button
              onClick={handleSendPhoneOtp}
              disabled={loading || !phone.trim()}
              className="w-full bg-accent text-white py-3.5 rounded-lg font-bold text-sm hover:bg-accent-dim disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] transition-colors mt-6"
            >{loading ? 'Sending...' : 'Send verification code'}</button>
          </>
        )}
        {method === 'otp' && (
          <>
            <button onClick={goBack} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Enter the 6-digit code sent to <span className="font-bold text-[var(--text-primary)]">{email || phone}</span></p>
            <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()} placeholder="000000" className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-2xl tracking-[0.3em] text-center text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors" />
            <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="w-full bg-accent text-white py-3.5 rounded-lg font-bold text-sm hover:bg-accent-dim disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] transition-colors mt-6">{loading ? 'Verifying...' : 'Verify & Sign In'}</button>
            <button onClick={() => { setOtp(''); if (email) handleSendEmailOtp(); else handleSendPhoneOtp(); }} disabled={loading} className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mt-3">Resend code</button>
          </>
        )}
      </div>
    </div>
  );
}
