import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './portals/LandingPage';
import { CustomerPortal } from './portals/CustomerPortal';
import { BusinessPortal } from './portals/BusinessPortal';
import { AgencyPortal } from './portals/AgencyPortal';
import { LoginPage } from './portals/LoginPage';
import { ResetPasswordPage } from './portals/ResetPasswordPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'AGENCY_ADMIN' | 'BUSINESS_OWNER' }> = ({ children, allowedRole }) => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <div className="min-h-[80vh] flex items-center justify-center text-slate-500 text-sm">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'AGENCY_ADMIN' ? '/agency' : '/business'} replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
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
        path="/agency/dashboard"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/businesses"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/plans"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/ads"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/ai-engine"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/settings"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/profile"
        element={
          <ProtectedRoute allowedRole="AGENCY_ADMIN">
            <AgencyPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agency/demo"
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
      <Route
        path="/business/dashboard"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/profile"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/branches"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/highlights"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/reviews"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/feedback"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/analytics"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/subscription"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/settings"
        element={
          <ProtectedRoute allowedRole="BUSINESS_OWNER">
            <BusinessPortal />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
