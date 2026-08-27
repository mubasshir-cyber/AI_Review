import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { encodePasswordPayload } from '../utils/security';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: encodePasswordPayload(newPassword) }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(data.message || 'Password reset successfully.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[82vh] bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#E8EDF5]">
            <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-3" />
            <h2 className="text-xl font-black text-[#1E293B]">Invalid Link</h2>
            <p className="text-sm text-[#64748B] mt-2">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3 clay-btn-primary text-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#E8EDF5] mb-2 relative overflow-hidden group cursor-pointer transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Lock className="w-8 h-8 text-[#2563EB] relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">Set New Password</h2>
        <p className="text-sm text-[#64748B] font-medium px-4">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-blue-900/5 rounded-[2rem] border border-[#E8EDF5]">
          {error && (
            <div className="mb-4 p-3.5 bg-[#EF4444] text-white rounded-2xl text-xs flex items-start space-x-2 shadow-[1px_1px_4px_rgba(239,68,68,0.3)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
              <div className="leading-relaxed font-bold">{error}</div>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
              <h3 className="text-lg font-bold text-[#1E293B]">Password Reset!</h3>
              <p className="text-sm text-[#64748B]">{success}</p>
              <p className="text-xs text-[#64748B]">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs clay-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs clay-input"
                  />
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
          )}
        </div>
      </div>
    </div>
  );
};
