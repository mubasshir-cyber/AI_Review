import React from 'react';
import { Modal } from './Modal';
import { Sparkles, ShieldCheck, Cpu, Database, HeartHandshake } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About ReviewScore AI Platform"
      subtitle="Next-Generation AI Reputation Management & Google Review Optimization SaaS"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-xs text-[#1E293B] leading-relaxed">
        {/* Mission Statement */}
        <div className="p-6 clay-card bg-white border border-[#DCE3EC] space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#EEF2F7] text-[#2563EB] font-bold text-xs rounded-full border border-[#DCE3EC]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Our Core Mission</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#1E293B]">Empowering Local Businesses with Authentic Customer Reputation</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            We believe happy customers want to support local businesses, but reviewer fatigue and writer's block get in the way.
            ReviewScore AI removes every barrier, delivering a 10-second review experience powered while safeguarding businesses from damaging unfair ratings.
          </p>
        </div>

        {/* Tech Stack Cards */}
        <div>
          <h4 className="font-extrabold text-[#1E293B] text-sm mb-3">Enterprise-Grade SaaS Technology Architecture</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 clay-card bg-white border border-[#DCE3EC] space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2F7] border border-[#DCE3EC] flex items-center justify-center font-bold text-[#2563EB]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-extrabold text-[#1E293B] text-xs">ReviewScore AI</h5>
              <p className="text-[11px] text-[#64748B]">
                Ultra-fast server-side AI model generating authentic 5-star reviews matching business voice in seconds.
              </p>
            </div>

            <div className="p-5 clay-card bg-white border border-[#DCE3EC] space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2F7] border border-[#DCE3EC] flex items-center justify-center font-bold text-[#2563EB]">
                <Cpu className="w-5 h-5" />
              </div>
              <h5 className="font-extrabold text-[#1E293B] text-xs">Node / Express API</h5>
              <p className="text-[11px] text-[#64748B]">
                Robust TypeScript backend with token usage meters, rate limiters, and DTO validations.
              </p>
            </div>

            <div className="p-5 clay-card bg-white border border-[#DCE3EC] space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2F7] border border-[#DCE3EC] flex items-center justify-center font-bold text-[#2563EB]">
                <Database className="w-5 h-5" />
              </div>
              <h5 className="font-extrabold text-[#1E293B] text-xs">PostgreSQL Storage</h5>
              <p className="text-[11px] text-[#64748B]">
                ACID compliant multi-tenant database storing businesses, branches, reviews, and scan tracking events safely.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="p-5 clay-card bg-white border border-[#DCE3EC] space-y-2">
          <h4 className="font-extrabold text-[#1E293B] text-sm flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Ethical Reputation Gatekeeping</span>
          </h4>
          <p className="text-[#64748B] text-xs leading-relaxed">
            Our private gatekeeper feedback system ensures that unhappy customers get immediate, direct resolution from business owners before posting public negative reviews.
          </p>
        </div>
      </div>
    </Modal>
  );
};
