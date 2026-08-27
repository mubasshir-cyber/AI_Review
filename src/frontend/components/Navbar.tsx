import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, ShieldCheck, Building2, Home, QrCode, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Modal } from './Modal';

export const Navbar: React.FC = () => {
  const { user, currentBusiness, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (<>
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-all">
      {/* Brand Logo & Context */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink">
        <button
          onClick={() => {
            if (user) {
              navigate(user.role === 'AGENCY_ADMIN' ? '/agency' : '/business');
            } else {
              navigate('/');
            }
          }}
          className="flex items-center space-x-2 group text-left cursor-pointer focus:outline-none shrink-0"
        >
          <img
            src="/logo-cropped.png"
            alt="ReviewScore AI"
            className="h-[17px] sm:h-[21px] w-auto object-contain transition-all group-hover:opacity-90 max-w-[130px] sm:max-w-none"
          />
          {user && (
            <span className="text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 flex items-center space-x-1 whitespace-nowrap">
              {user.role === 'AGENCY_ADMIN' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-blue-600 inline" />
                  <span className="sm:hidden">AA</span>
                  <span className="hidden sm:inline">Agency Admin</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3 h-3 text-blue-600 inline" />
                  <span className="sm:hidden">BO</span>
                  <span className="hidden sm:inline">Business Owner</span>
                </>
              )}
            </span>
          )}
        </button>
      </div>

      {/* Right Side: Navigation & User Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Navigation Links when unauthenticated (No Home button on mobile, clean 2-button layout) */}
        {!user && (
          <div className="flex items-center space-x-1.5 shrink-0">
            <Link
              to="/review"
              className={`px-2 sm:px-3 py-1.5 min-h-[36px] text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
                location.pathname === '/review'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Review Card</span>
              <span className="sm:hidden">Review Card</span>
            </Link>
          </div>
        )}

        {/* User Account / Sign In */}
        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200/80">
            {location.pathname === '/review' && (
              <button
                onClick={() => navigate(user.role === 'AGENCY_ADMIN' ? '/agency' : '/business')}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <span>Dashboard</span>
              </button>
            )}

            <div className="flex items-center bg-white border border-slate-200/80 rounded-full p-1 pr-1.5 transition-all hover:border-slate-300 hover:shadow-md shadow-sm">
              {currentBusiness?.logoUrl || user.avatarUrl ? (
                <img
                  src={currentBusiness?.logoUrl || user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-contain border border-slate-200 shadow-sm bg-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-inner ring-1 ring-black/10">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left ml-2.5 mr-3 max-w-[140px] lg:max-w-[180px]">
                <p className="text-[12px] font-bold text-slate-900 leading-tight truncate" title={user.name}>{user.name}</p>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight truncate mt-0.5" title={user.email}>{user.email}</p>
              </div>
              <div className="hidden md:block w-px h-6 bg-slate-200 mr-1.5" />
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                title="Sign Out"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors ml-auto md:ml-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 min-h-[36px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center justify-center space-x-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav><Modal
  isOpen={isLogoutModalOpen}
  onClose={() => setIsLogoutModalOpen(false)}
  title="Confirm Sign Out"
  subtitle="Are you sure you want to sign out of your account?"
  maxWidth="max-w-sm"
>
  <div className="space-y-4">
    <div className="flex space-x-3 pt-2">
      <button
        type="button"
        onClick={() => setIsLogoutModalOpen(false)}
        className="w-1/2 py-2.5 clay-btn-secondary text-xs cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
      >
        Yes, Sign Out
      </button>
    </div>
  </div>
</Modal>
    </>
  );
};
