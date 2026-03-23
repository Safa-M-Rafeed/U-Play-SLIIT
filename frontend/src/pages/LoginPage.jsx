import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon, ZapIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, verifyLoginOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      if (!otpStep) {
        const data = await login({ email, password }, rememberMe);
        setOtpStep(true);
        setOtpEmail(data.email || email.trim());
        setMessage(data.message || 'OTP sent to your email address.');
        return;
      }

      const data = await verifyLoginOtp({ email: otpEmail || email, otp }, rememberMe);
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" aria-hidden="true" />

      <div className="orb orb-1 -top-40 -left-40" aria-hidden="true" />
      <div className="orb orb-2 top-1/3 -right-32" aria-hidden="true" />
      <div className="orb orb-3 -bottom-32 left-1/4" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <GlassCard className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/25">
                {otpStep ? <ShieldCheckIcon className="w-7 h-7 text-white" /> : <ZapIcon className="w-7 h-7 text-white" />}
              </div>
              <h1 className="text-2xl font-bold text-gradient-animated">U-PLAY</h1>
              <p className="text-sm text-slate-400 mt-1">
                {otpStep ? 'Enter the verification code sent to your email' : 'University Sports Tournament Platform'}
              </p>
            </div>

            {!otpStep ? (
              <>
                <InputField
                  label="Email address"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<MailIcon className="w-4 h-4" />}
                  autoComplete="email"
                  required
                />

                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<LockIcon className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-white transition-colors focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  }
                  autoComplete="current-password"
                  required
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                  OTP sent to <span className="font-semibold text-white">{otpEmail}</span>
                </div>
                <InputField
                  label="One-Time Password"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  icon={<ShieldCheckIcon className="w-4 h-4" />}
                  autoComplete="one-time-code"
                  required
                />
              </>
            )}

            {message && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {!otpStep ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp('');
                    setMessage('');
                    setError('');
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError('');
                      const data = await login({ email, password }, rememberMe);
                      setOtpEmail(data.email || email.trim());
                      setMessage(data.message || 'A new OTP has been sent.');
                    } catch (authError) {
                      setError(authError.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Resend OTP
                </button>
              </div>
            )}

            <GradientButton type="submit" fullWidth variant="primary" loading={loading}>
              {otpStep ? 'Verify OTP' : 'Send OTP'}
            </GradientButton>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Create account
              </Link>
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
