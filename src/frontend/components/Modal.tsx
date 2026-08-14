import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E293B]/40 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-[0_20px_50px_rgba(37,99,235,0.12),0_10px_20px_rgba(100,116,139,0.15)] border border-[#DCE3EC] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#DCE3EC] bg-[#EEF2F7] shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#1E293B] tracking-tight truncate">{title}</h3>
            {subtitle && <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF2F7] border border-[#DCE3EC] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_2px_4px_rgba(100,116,139,0.08)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">{children}</div>
      </div>
    </div>
  );
};
