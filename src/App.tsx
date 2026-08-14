import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './frontend/context/AuthContext';
import { ToastProvider } from './frontend/context/ToastContext';
import { Navbar } from './frontend/components/Navbar';
import { DatabaseStatusBanner } from './frontend/components/DatabaseStatusBanner';
import { RootSmoothScroll } from './frontend/components/RootSmoothScroll';
import AppRoutes from './frontend/Routes';

const MainContainer: React.FC = () => {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith('/business') || location.pathname.startsWith('/agency');

  return (
    <RootSmoothScroll enabled={!isPortalRoute}>
      <div className={`${isPortalRoute ? 'h-screen' : 'min-h-screen'} bg-[#F5F7FB] text-[#1E293B] font-sans antialiased flex flex-col selection:bg-[#2563EB] selection:text-white ${isPortalRoute ? 'overflow-hidden' : ''}`}>
        <DatabaseStatusBanner />
        <Navbar />

        <main className={`flex-1 ${isPortalRoute ? 'min-h-0' : ''} flex flex-col ${isPortalRoute ? 'overflow-hidden' : ''}`}>
          <AppRoutes />
        </main>

        {!isPortalRoute && (
          <footer className="bg-white border-t border-[#DCE3EC] py-6 px-6 text-center text-xs text-[#64748B]">
            <p>© 2026 ReviewScore AI Platform. All rights reserved.</p>
          </footer>
        )}
      </div>
    </RootSmoothScroll>
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
