import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'No records found in database.',
}) => {
  return (
    <div className="w-full py-12 px-6 text-center clay-card bg-white border border-[#DCE3EC] flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#EEF2F7] text-[#2563EB] border border-[#DCE3EC] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_2px_6px_rgba(100,116,139,0.08)]">
        <Inbox className="w-6 h-6 text-[#2563EB]" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-[#64748B] font-medium">{message}</p>
      </div>
    </div>
  );
};
