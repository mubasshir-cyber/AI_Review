import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  Building2, MapPin, QrCode, Sparkles, TrendingUp, ChevronRight, ChevronLeft, CheckCircle2, Star, ShieldCheck, ArrowRight
} from 'lucide-react';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo?: () => void;
}

export const ProductTourModal: React.FC<ProductTourModalProps> = ({ isOpen, onClose, onStartDemo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: Set Up Business Account',
      subtitle: 'Register your business profile, upload logo, and configure your plan in under 60 seconds.',
      icon: Building2,
      badge: 'Step 1 of 5',
      content: (
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#E8EDF5]">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-extrabold flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]">1</div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1E293B]">Smile Dental Care Center</h4>
              <p className="text-xs text-[#64748B]">Healthcare & Dental Services • Enterprise Plan</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#EEF2F7] p-3.5 rounded-2xl border border-[#DCE3EC]">
              <span className="text-[#64748B] block text-[10px]">Monthly Token Quota</span>
              <span className="text-[#2563EB] font-extrabold">500,000 AI Tokens</span>
            </div>
            <div className="bg-[#EEF2F7] p-3.5 rounded-2xl border border-[#DCE3EC]">
              <span className="text-[#64748B] block text-[10px]">Branch Quota</span>
              <span className="text-[#1E293B] font-extrabold">Up to 10 Locations</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Step 2: Add Branch Locations',
      subtitle: 'Link your Google Place ID and Google Review URL to each physical branch store or clinic.',
      icon: MapPin,
      badge: 'Step 2 of 5',
      content: (
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
          <div className="flex items-center justify-between bg-[#EEF2F7] p-3.5 rounded-2xl border border-[#DCE3EC]">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#2563EB]" />
              <div>
                <h5 className="text-xs font-extrabold text-[#1E293B]">Downtown Dental Main Branch</h5>
                <p className="text-[10px] text-[#64748B]">Google Place ID: ChIJ...9812a</p>
              </div>
            </div>
            <span className="px-3 py-1 clay-badge-primary text-[10px]">ACTIVE</span>
          </div>
          <div className="p-3 bg-[#EEF2F7] rounded-2xl border border-[#DCE3EC] text-xs text-[#64748B] font-mono text-[11px] truncate">
            https://search.google.com/local/writereview?placeid=ChIJ...
          </div>
        </div>
      )
    },
    {
      title: 'Step 3: Custom QR Code Designer',
      subtitle: 'Design custom table tents, standees, and stickers matching your brand colors with embedded logos.',
      icon: QrCode,
      badge: 'Step 3 of 5',
      content: (
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] flex items-center justify-around">
          <div className="text-center space-y-2">
            <div className="w-24 h-24 bg-[#EEF2F7] p-3 rounded-2xl border border-[#DCE3EC] flex items-center justify-center">
              <QrCode className="w-18 h-18 text-[#1E293B]" />
            </div>
            <span className="text-[10px] text-[#2563EB] font-extrabold block">Table Tent Acrylic Standee</span>
          </div>
          <div className="space-y-2.5 text-xs font-bold text-[#1E293B]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>300 DPI High Res PNG</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Vector SVG Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Google ★ 4.9 Badge</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Step 4: Customer Review & Gatekeeping',
      subtitle: 'Happy clients rate 5★ and get instant AI generated review text. Low ratings go privately to your portal.',
      icon: Star,
      badge: 'Step 4 of 5',
      content: (
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-3">
          <div className="flex items-center justify-between bg-[#EEF2F7] border border-[#2563EB] p-3.5 rounded-2xl text-xs">
            <span className="font-extrabold text-[#2563EB]">5-Star Customer Rating</span>
            <span className="text-[10px] text-[#64748B]">Redirected to Google Maps in 3s</span>
          </div>
          <div className="flex items-center justify-between bg-[#EEF2F7] border border-[#DCE3EC] p-3.5 rounded-2xl text-xs">
            <span className="font-extrabold text-[#1E293B]">1-3 Star Rating</span>
            <span className="text-[10px] text-[#64748B]">Private Owner Intercept Alert</span>
          </div>
        </div>
      )
    },
    {
      title: 'Step 5: Real-Time Analytics & Growth',
      subtitle: 'Track total QR scans, 5-star review conversion rate, AI token consumption, and monthly reputation trends.',
      icon: TrendingUp,
      badge: 'Step 5 of 5',
      content: (
        <div className="clay-card bg-white p-6 border border-[#DCE3EC] space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-[#EEF2F7] p-3 rounded-2xl border border-[#DCE3EC]">
              <span className="text-[#64748B] text-[10px] block">Total Scans</span>
              <span className="text-[#1E293B] font-extrabold text-sm">1,480</span>
            </div>
            <div className="bg-[#EEF2F7] p-3 rounded-2xl border border-[#DCE3EC]">
              <span className="text-[#64748B] text-[10px] block">Reviews Posted</span>
              <span className="text-[#2563EB] font-extrabold text-sm">94.2%</span>
            </div>
            <div className="bg-[#EEF2F7] p-3 rounded-2xl border border-[#DCE3EC]">
              <span className="text-[#64748B] text-[10px] block">Avg Rating</span>
              <span className="text-[#1E293B] font-extrabold text-sm">4.95 ★</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ReviewScore AI - Product Walkthrough Tour"
      subtitle="See how our platform turns customer visits into 5-star Google reviews automatically"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between space-x-2">
          {steps.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 flex-1 rounded-full cursor-pointer transition-all border ${
                idx === currentStep
                  ? 'bg-[#2563EB] border-[#1D4ED8]'
                  : idx < currentStep
                  ? 'bg-[#1E293B] border-[#1E293B]'
                  : 'bg-[#EEF2F7] border-[#DCE3EC]'
              }`}
            />
          ))}
        </div>

        {/* Step Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2F7] border border-[#DCE3EC] flex items-center justify-center shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <StepIcon className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div>
            <span className="px-3 py-1 bg-[#EEF2F7] text-[#2563EB] font-bold text-[10px] uppercase rounded-full border border-[#DCE3EC]">
              {current.badge}
            </span>
            <h3 className="text-lg font-extrabold text-[#1E293B] mt-1">{current.title}</h3>
            <p className="text-xs text-[#64748B]">{current.subtitle}</p>
          </div>
        </div>

        {/* Interactive Mockup Body */}
        {current.content}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EDF5]">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2.5 clay-btn-secondary text-xs disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#1E293B]" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-6 py-2.5 clay-btn-primary text-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onStartDemo) onStartDemo();
              }}
              className="px-6 py-2.5 clay-btn-primary text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Launch Agency Demo Flow</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
