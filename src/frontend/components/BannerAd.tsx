import React from 'react';
import { Advertisement } from '../../types';
import { Sparkles, ArrowRight, X, Info } from 'lucide-react';

interface BannerAdProps {
  ad: Advertisement;
  onClose?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({ ad, onClose }) => {
  const removeEmojis = (text: string) => {
    return text.replace(/\p{Extended_Pictographic}/gu, "");
  };

  const message = `Hi! I'd like to inquire about your announcement: ${removeEmojis(ad.title || '')}`;
  const whatsappUrl = `https://wa.me/919930952947?text=${encodeURIComponent(message)}`;

  // Check if WhatsApp is enabled via our ctaLink marker
  const showWhatsApp = ad.ctaLink !== 'internal://whatsapp-disabled';

  return (
    <div className="relative p-6 clay-card bg-white border border-[#DCE3EC] transition-all">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#EEF2F7] hover:bg-[#DCE3EC] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer border border-[#DCE3EC]"
          aria-label="Close banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className={`flex flex-col ${showWhatsApp ? 'md:flex-row md:items-center justify-between gap-4' : 'max-w-3xl'}`}>
        <div className="space-y-1.5 pr-6">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider">
            {showWhatsApp ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[#2563EB]">AGENCY ANNOUNCEMENT</span>
              </>
            ) : (
              <>
                <Info className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="text-[#D97706]">SYSTEM NOTICE</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-[#1E293B] tracking-tight">{ad.title}</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">{ad.description}</p>
        </div>

        {showWhatsApp && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 clay-btn-primary text-xs shrink-0 cursor-pointer"
          >
            <span>Inquire on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};