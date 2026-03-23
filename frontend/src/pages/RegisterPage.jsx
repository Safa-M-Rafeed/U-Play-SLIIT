import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  ZapIcon,
  CheckIcon,
  XIcon,
  ShieldCheckIcon
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../lib/auth';

function getPasswordStrength(password) {
  const criteria = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) }
  ];

  return {
    score: criteria.filter((item) => item.met).length,
    criteria
  };
}

function getStrengthColor(score, index) {
  if (index >= score) return 'bg-white/10';
  if (score <= 1) return 'bg-red-500';
  if (score <= 2) return 'bg-orange-500';
  if (score <= 3) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { score, criteria } = useMemo(() => getPasswordStrength(password), [password]);

  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (score < 3) newErrors.password = 'Password is too weak';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      const data = await register({ fullName, email, password, role });
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (registerError) {
      setSubmitError(registerError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }));
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" aria-hidden="true" />

      <div className="orb orb-1 -top-40 -right-40" aria-hidden="true" />
      <div className="orb orb-2 bottom-1/4 -left-32" aria-hidden="true" />
      <div className="orb orb-3 top-1/4 right-1/3" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <GlassCard className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="text-center mb-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/25">
                <ZapIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient-animated">U-PLAY</h1>
              <p className="text-sm text-slate-400 mt-1">Create your account</p>
            </div>

            <InputField
              label="Full name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              icon={<UserIcon className="w-4 h-4" />}
              error={touched.fullName ? errors.fullName : undefined}
              autoComplete="name"
              required
            />

            <InputField
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              icon={<MailIcon className="w-4 h-4" />}
              error={touched.email ? errors.email : undefined}
              autoComplete="email"
              required
            />

            <div className="space-y-2">
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
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
                error={touched.password ? errors.password : undefined}
                autoComplete="new-password"
                required
              />

              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2.5"
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${getStrengthColor(score, index)}`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {criteria.map((criterion) => (
                      <div key={criterion.label} className="flex items-center gap-1.5">
                        {criterion.met ? (
                          <CheckIcon className="w-3 h-3 text-green-400 flex-shrink-0" />
                        ) : (
                          <XIcon className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs ${criterion.met ? 'text-green-400' : 'text-slate-500'}`}
                        >
                          {criterion.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <InputField
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              icon={<LockIcon className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-white transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              }
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              autoComplete="new-password"
              required
            />

            {submitError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {submitError}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">I am a</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                    border transition-all duration-200
                    ${role === 'student' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white'}
                  `}
                  aria-pressed={role === 'student'}
                >
                  <UserIcon className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('captain')}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                    border transition-all duration-200
                    ${role === 'captain' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white'}
                  `}
                  aria-pressed={role === 'captain'}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Captain
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                    border transition-all duration-200
                    ${role === 'admin' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white'}
                  `}
                  aria-pressed={role === 'admin'}
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>

            <GradientButton type="submit" fullWidth variant="primary" loading={loading}>
              Create account
            </GradientButton>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
