import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './frontend/context/AuthContext';
import { ToastProvider } from './frontend/context/ToastContext';
import { Navbar } from './frontend/components/Navbar';
import { DatabaseStatusBanner } from './frontend/components/DatabaseStatusBanner';
import { LandingPage } from './frontend/portals/LandingPage';
import { CustomerPortal } from './frontend/portals/CustomerPortal';
import { BusinessPortal } from './frontend/portals/BusinessPortal';
import { AgencyPortal } from './frontend/portals/AgencyPortal';
import { LoginPage } from './frontend/portals/LoginPage';
import { ResetPasswordPage } from './frontend/portals/ResetPasswordPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'AGENCY_ADMIN' | 'BUSINESS_OWNER' }> = ({ children, allowedRole }) => {
  const { user, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) {
    return <div className="min-h-[80vh] flex items-center justify-center text-slate-500 text-sm">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'AGENCY_ADMIN' ? '/agency' : '/business'} replace />;
  }
  return <>{children}</>;
};

const MainContainer: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#1E293B] font-sans antialiased flex flex-col selection:bg-[#2563EB] selection:text-white">
      <DatabaseStatusBanner />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/review" element={<CustomerPortal />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ResetPasswordPage />} />
          <Route 
            path="/agency" 
            element={
              <ProtectedRoute allowedRole="AGENCY_ADMIN">
                <AgencyPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/business" 
            element={
              <ProtectedRoute allowedRole="BUSINESS_OWNER">
                <BusinessPortal />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-[#DCE3EC] py-6 px-6 text-center text-xs text-[#64748B]">
        <p>© 2026 Tap Review AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MainContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
