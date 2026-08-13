import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { Branch } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

export const DevPortalSwitcher: React.FC = () => {
  const { setRole, currentBranch, setCurrentBranch, setCurrentBusiness } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setBranches(json.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleBranchSelect = async (branchId: string) => {
    const selected = branches.find(b => b.id === branchId);
    if (selected) {
      setCurrentBranch(selected);
      try {
        const res = await fetch(`/api/businesses/${selected.businessId}`);
        const json = await res.json();
        if (json.success) {
          setCurrentBusiness(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="bg-[#EEF2F7] border-b border-[#DCE3EC] text-[#1E293B] px-4 py-2 flex flex-wrap items-center justify-between text-xs font-bold z-50 sticky top-0 shadow-[0_2px_10px_rgba(37,99,235,0.05)]">
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-1 px-2.5 py-1 bg-[#2563EB] text-white font-extrabold tracking-wide uppercase text-[10px] rounded-full shadow-[1px_1px_4px_rgba(37,99,235,0.3)]">
          <Sparkles className="w-3 h-3 text-white" />
          <span>Tap Review AI</span>
        </span>
        <span className="hidden sm:inline text-[#64748B]">|</span>
        <span className="text-[#64748B] hidden md:inline">Portal Switcher:</span>
      </div>

      <div className="flex items-center space-x-1.5 my-1 sm:my-0">
        <button
          onClick={() => {
            navigate('/review');
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all border ${
            location.pathname === '/review'
              ? 'clay-btn-primary'
              : 'clay-btn-secondary'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>1. Customer Review (Public)</span>
        </button>

        <button
          onClick={() => {
            setRole('BUSINESS_OWNER');
            navigate('/business');
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all border ${
            location.pathname === '/business'
              ? 'clay-btn-primary'
              : 'clay-btn-secondary'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>2. Business Owner Portal</span>
        </button>

        <button
          onClick={() => {
            setRole('AGENCY_ADMIN');
            navigate('/agency');
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all border ${
            location.pathname === '/agency'
              ? 'clay-btn-primary'
              : 'clay-btn-secondary'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>3. Agency Admin Portal</span>
        </button>
      </div>

      {location.pathname === '/review' && branches.length > 0 && (
        <div className="flex items-center space-x-2 text-[11px] bg-white px-3 py-1 rounded-xl border border-[#DCE3EC] shadow-[inset_1px_1px_3px_rgba(220,227,236,0.6)]">
          <span className="text-[#64748B] hidden lg:inline font-bold">Active Branch QR:</span>
          <select
            value={currentBranch?.id || ''}
            onChange={e => handleBranchSelect(e.target.value)}
            className="bg-transparent text-[#1E293B] border-none focus:outline-none font-bold cursor-pointer"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
