import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, ShieldCheck, Building2, Home, QrCode, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, currentBusiness, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-all">
      {/* Brand Logo & Context */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={() => {
            if (user) {
              navigate(user.role === 'AGENCY_ADMIN' ? '/agency' : '/business');
            } else {
              navigate('/');
            }
          }}
          className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
        >
          <img
            src="/logo-cropped.png"
            alt="ReviewScore AI"
            className="h-[19px] sm:h-[21px] w-auto object-contain transition-all group-hover:opacity-90"
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
        {/* Navigation Links when unauthenticated */}
        {!user && (
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            <Link
              to="/"
              className={`px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                location.pathname === '/'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to="/review"
              className={`px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                location.pathname === '/review'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Customer Review Card</span>
              <span className="md:hidden">Review Card</span>
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

            <div className="flex items-center space-x-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center border border-slate-800">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="px-2 sm:px-2.5 py-1.5 min-h-[38px] hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 min-h-[38px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
