import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './frontend/context/AuthContext';
import { ToastProvider } from './frontend/context/ToastContext';
import { Navbar } from './frontend/components/Navbar';
import { DatabaseStatusBanner } from './frontend/components/DatabaseStatusBanner';
import AppRoutes from './frontend/Routes';

const MainContainer: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#1E293B] font-sans antialiased flex flex-col selection:bg-[#2563EB] selection:text-white">
      <DatabaseStatusBanner />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <AppRoutes />
      </main>

      <footer className="bg-white border-t border-[#DCE3EC] py-6 px-6 text-center text-xs text-[#64748B]">
        <p>© 2026 ReviewScore AI Platform. All rights reserved.</p>
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
