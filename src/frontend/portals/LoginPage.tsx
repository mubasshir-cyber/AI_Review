import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, UserCheck, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { encodePasswordPayload } from '../utils/security';

export const LoginPage: React.FC = () => {
  const { login, user, isLoadingAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string>('');
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);

  // Reset Password via Token State
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Auto-detect token in URL and switch to reset mode
  useEffect(() => {
    if (resetToken) {
      setIsResetMode(true);
    }
  }, [resetToken]);

  if (!isLoadingAuth && user) {
    return <Navigate to={user.role === 'AGENCY_ADMIN' ? '/agency' : '/business'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginId || !loginId.trim()) {
      setError('Please enter your Login ID.');
      return;
    }
    if (!password || !password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await login(loginId.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid Login ID or password. Please verify your credentials.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotPasswordSuccess('');

    if (!forgotPasswordEmail || !forgotPasswordEmail.trim()) {
      setError('Please enter your email.');
      return;
    }

    setIsSendingReset(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setForgotPasswordSuccess(data.message || 'If an account exists, a reset link has been sent.');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: encodePasswordPayload(newPassword) }),
      });
      const data = await res.json();

      if (res.ok) {
        setResetSuccess(data.message || 'Password reset successfully! You can now log in.');
        // Clear form
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const renderTitle = () => {
    if (isResetMode) return 'Set New Password';
    if (isForgotPassword) return 'Forgot Password';
    return 'Sign In to ReviewScore AI';
  };

  const renderSubtitle = () => {
    if (isResetMode) return 'Enter your new password below to complete the reset.';
    if (isForgotPassword) return 'Enter your email and we will send you a reset link.';
    return 'Unified authentication portal. Enter your Login ID to access your dashboard.';
  };

  return (
    <div className="min-h-[82vh] bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center pb-1">
          <img src="/logo-cropped.png" alt="ReviewScore AI" className="h-6 sm:h-[26px] w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
          {renderTitle()}
        </h2>
        <p className="text-xs text-[#64748B] max-w-xs mx-auto font-medium">
          {renderSubtitle()}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="clay-card bg-white py-8 px-6 border border-[#DCE3EC] sm:px-10 space-y-6">

          {error && (
            <div className="p-3.5 bg-[#EF4444] text-white rounded-2xl text-xs flex items-start space-x-2 shadow-[1px_1px_4px_rgba(239,68,68,0.3)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
              <div className="leading-relaxed font-bold">{error}</div>
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="p-3.5 bg-[#10B981] text-white rounded-2xl text-xs flex items-start space-x-2 shadow-[1px_1px_4px_rgba(16,185,129,0.3)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
              <div className="leading-relaxed font-bold">{forgotPasswordSuccess}</div>
            </div>
          )}

          {/* ===================== RESET PASSWORD VIA TOKEN FORM ===================== */}
          {isResetMode ? (
            resetSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="text-base font-bold text-[#1E293B]">Password Updated!</h3>
                <p className="text-xs text-[#64748B]">{resetSuccess}</p>
                <button
                  onClick={() => setIsResetMode(false)}
                  className="w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs clay-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-2.5 text-[#64748B] hover:text-[#1E293B] focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="mt-1 text-xs text-[#EF4444] font-medium">Password must be at least 6 characters.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 text-xs clay-input transition-colors ${
                        confirmPassword.length > 0
                          ? newPassword === confirmPassword
                            ? 'border-[#10B981] ring-1 ring-[#10B981]'
                            : 'border-[#EF4444] ring-1 ring-[#EF4444]'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-[#64748B] hover:text-[#1E293B] focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`mt-1 text-xs font-medium ${
                      newPassword === confirmPassword ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )
          ) : isForgotPassword ? (
            /* ===================== FORGOT PASSWORD FORM ===================== */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={e => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingReset}
                className="w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setForgotPasswordSuccess('');
                  }}
                  className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] cursor-pointer focus:outline-none"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* ===================== LOGIN FORM ===================== */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Login ID
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    placeholder="Enter your Login ID or email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs clay-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#64748B] hover:text-[#1E293B] focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setForgotPasswordSuccess('');
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-[#E8EDF5]">
            <Link
              to="/review"
              className="text-xs font-bold text-[#2563EB] hover:underline transition-colors cursor-pointer"
            >
              ← Back to Customer Review Page (No Login Required)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
