import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const DatabaseStatusBanner: React.FC = () => {
  const { isDbConnected, checkHealth } = useAuth();

  if (isDbConnected === null) return null;

  if (!isDbConnected) {
    return (
      <div className="bg-[#EF4444] text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center space-x-2 border-b border-[#DC2626] shadow-sm">
        <AlertTriangle className="w-4 h-4 text-white shrink-0" />
        <span>Service temporarily offline</span>
        <button
          onClick={() => checkHealth()}
          className="ml-3 px-3 py-1 bg-white text-[#EF4444] hover:bg-[#EEF2F7] rounded-xl text-[11px] font-bold transition-colors border border-white flex items-center space-x-1 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return null;
};
